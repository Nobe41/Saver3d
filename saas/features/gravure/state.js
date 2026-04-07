var GravureState = (function () {
    var counter = 0;
    var images = {};

    function nextId() {
        counter += 1;
        return Date.now();
    }

    function getCounter() {
        return counter;
    }

    function getImages() {
        return images;
    }

    function setImage(id, img) {
        images[id] = img;
    }

    function removeImage(id) {
        delete images[id];
    }

    return {
        nextId: nextId,
        getCounter: getCounter,
        getImages: getImages,
        setImage: setImage,
        removeImage: removeImage
    };
})();
