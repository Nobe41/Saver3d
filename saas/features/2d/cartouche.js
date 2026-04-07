var Plans2DCartouche = (function () {
    function getFieldValue(id, fallback) {
        var el = document.getElementById(id);
        if (!el) return fallback || '';
        return el.value || fallback || '';
    }

    function getData() {
        var ids = (typeof Plans2DRules !== 'undefined' && Plans2DRules.IDS) ? Plans2DRules.IDS : {};
        return {
            title: getFieldValue(ids.projectTitle || 'cartouche-title', ''),
            drafter: getFieldValue(ids.drafter || 'cartouche-drafter', ''),
            checker: getFieldValue(ids.checker || 'cartouche-checker', ''),
            capacity: getFieldValue(ids.capacity || 'cartouche-capacity', '')
        };
    }

    return {
        getData: getData
    };
})();
