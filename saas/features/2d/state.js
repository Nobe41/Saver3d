var Plans2DState = (function () {
    var camera = { x: 0, y: 0, zoom: 0 };

    function getCamera() {
        return camera;
    }

    function setCamera(next) {
        if (!next) return camera;
        if (typeof next.x === 'number' && isFinite(next.x)) camera.x = next.x;
        if (typeof next.y === 'number' && isFinite(next.y)) camera.y = next.y;
        if (typeof next.zoom === 'number' && isFinite(next.zoom)) camera.zoom = next.zoom;
        return camera;
    }

    return {
        getCamera: getCamera,
        setCamera: setCamera
    };
})();
