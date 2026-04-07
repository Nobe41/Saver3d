var Plans2DCotation = (function () {
    function formatValue(v) {
        if (typeof Plans2DMath !== 'undefined' && Plans2DMath.formatText) return Plans2DMath.formatText(v);
        return Number.isInteger(v) ? v : v.toFixed(1);
    }

    function getRattachementLabel(rattId) {
        var typeEl = document.getElementById(rattId + '-type');
        var rhoEl = document.getElementById(rattId + '-rho');
        var type = typeEl ? String(typeEl.value || '').trim() : '';
        var rho = rhoEl ? parseFloat(rhoEl.value) : NaN;
        var hasRho = Number.isFinite(rho) && rho > 0;

        if (type === 'ligne') return null;
        if (type === 'rayon') return hasRho ? ('R ' + formatValue(rho)) : null;
        if (type === 'courbeS') return hasRho ? ('Courbe S R ' + formatValue(rho)) : 'Courbe S';
        if (type === 'spline') return hasRho ? ('Spline R ' + formatValue(Math.abs(rho))) : 'Spline';
        return hasRho ? ('R ' + formatValue(rho)) : 'Raccord';
    }

    return {
        formatValue: formatValue,
        getRattachementLabel: getRattachementLabel
    };
})();
