var ExportState = (function () {
    var refs = {};

    function initRefs(ids) {
        refs.btn3D = document.getElementById(ids.export3D);
        refs.btn2D = document.getElementById(ids.export2D);
        refs.dropdown = document.getElementById(ids.dropdown);
        refs.canvas2D = document.getElementById(ids.canvas2D);
        refs.paperFormat = document.getElementById(ids.paperFormat);
        refs.projectTitle = document.getElementById(ids.projectTitle);
        return refs;
    }

    function getRefs() {
        return refs;
    }

    return {
        initRefs: initRefs,
        getRefs: getRefs
    };
})();
