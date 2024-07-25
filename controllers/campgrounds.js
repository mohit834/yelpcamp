const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

// to get the map we need to imprt our client and use it get the co ordinates
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    // here enter the data for getting the location and the same is to be done in update campground
    const geoData = await maptilerClient.geocoding.forward(
        req.body.campground.location,
        { limit: 1 }
    );
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "successfully created a new campground");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    // I used try catch here because if on the client side if some one enters/ alters the id of the post we get an ugly error we are not redirecting or flashing so i did this.
    try {
        const campgroundDetail = await Campground.findById(id)
            .populate({
                path: "reviews",
                populate: {
                    path: "author",
                },
            })
            .populate("author");
        if (!campgroundDetail) {
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        }
        res.render("campgrounds/show", { campgroundDetail });
    } catch (e) {
        req.flash("error", "something went wrong");
        res.redirect("/campgrounds");
    }
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campgroundDetail = await Campground.findById(id);
    if (!campgroundDetail) {
        req.flash("error", "Campground not found");
        res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campgroundDetail });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    const geoData = await maptilerClient.geocoding.forward(
        req.body.campground.location,
        { limit: 1 }
    );
    campground.geometry = geoData.features[0].geometry;
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        await cloudinary.api
            .delete_resources(req.body.deleteImages)
            .then((result) => console.log(result));
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }

    req.flash("success", "Campground updated successfully");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "successfully deleted the campground");
    res.redirect("/campgrounds");
};
