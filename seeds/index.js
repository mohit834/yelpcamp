const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

main()
    .then(() => console.log("MONGOOSE CONNECTED SUCCESSFULLY"))
    .catch((err) => {
        console.log(err);
        console.log("MONGOOSE CONNECTION ERROR");
    });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
}

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randomImage = Math.floor(Math.random() * 1000) + 1;
        const camp = new Campground({
            author: "669cb97a52c36b20a479aaea",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:
                "Lorem ipsum dolor sit, amet consectetur adipisicing elit.",
            price: Math.floor(Math.random() * 20) + 10,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ],
            },
            images: [
                {
                    url: "https://res.cloudinary.com/ddtuwuenf/image/upload/v1721751378/YelpCamp/lvefmavssrnxulxz6jmp.png",
                    filename: "YelpCamp/lvefmavssrnxulxz6jmp",
                },
                {
                    url: "https://res.cloudinary.com/ddtuwuenf/image/upload/v1721751381/YelpCamp/nbatdvlsyzq7bs3ljmxf.png",
                    filename: "YelpCamp/nbatdvlsyzq7bs3ljmxf",
                },
                {
                    url: "https://res.cloudinary.com/ddtuwuenf/image/upload/v1721751382/YelpCamp/jezf0wchocnshzzfmya2.png",
                    filename: "YelpCamp/jezf0wchocnshzzfmya2",
                },
            ],
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
