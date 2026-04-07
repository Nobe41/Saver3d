var NavigationEvents = (function () {
    function bind(el, handler) {
        if (!el || !handler) return;
        el.addEventListener('click', handler);
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler();
            }
        });
    }

    return {
        bind: bind
    };
})();
