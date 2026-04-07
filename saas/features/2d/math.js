var Plans2DMath = (function () {
    function getNumericValue(id, fallback) {
        var el = document.getElementById(id);
        if (!el) return fallback;
        var v = parseFloat(el.value);
        return Number.isFinite(v) ? v : fallback;
    }

    function getIndexedHeights(prefix) {
        var inputs = document.querySelectorAll('input[id^="' + prefix + '"][id$="-h"]');
        var out = [];
        inputs.forEach(function (el) {
            var m = (el.id || '').match(new RegExp('^' + prefix + '(\\d+)-h$'));
            if (!m) return;
            var idx = parseInt(m[1], 10);
            if (Number.isFinite(idx)) out.push(idx);
        });
        out.sort(function (a, b) { return a - b; });
        return out.filter(function (v, i) { return i === 0 || v !== out[i - 1]; });
    }

    function formatText(v) {
        return Number.isInteger(v) ? v : v.toFixed(1);
    }

    return {
        getNumericValue: getNumericValue,
        getIndexedHeights: getIndexedHeights,
        formatText: formatText
    };
})();
