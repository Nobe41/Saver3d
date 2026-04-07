var ExportEvents = (function () {
    function bind(refs, handlers) {
        if (refs.btn3D && !refs.btn3D.dataset.bound) {
            refs.btn3D.dataset.bound = '1';
            refs.btn3D.addEventListener('click', handlers.onExport3D);
        }
        if (refs.btn2D && !refs.btn2D.dataset.bound) {
            refs.btn2D.dataset.bound = '1';
            refs.btn2D.addEventListener('click', handlers.onExport2D);
        }
    }

    return {
        bind: bind
    };
})();
