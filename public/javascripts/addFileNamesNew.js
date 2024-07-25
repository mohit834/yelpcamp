function previewMultiple(event) {
    var images = document.getElementById("image");
    console.log("accessing");
    var number = images.files.length;
    for (let i = 0; i < number; i++) {
        var urls = URL.createObjectURL(event.target.files[i]);
        document.getElementById("form-images-display").innerHTML +=
            '<img src="' + urls + '">';
    }
}
