// Etat local des rattachements (config et mode actif).
var RattachementState = (function () {
    var RULES = (typeof RattachementRules !== 'undefined') ? RattachementRules : {};
    var ALLOWED_EDGE_TYPES = RULES.ALLOWED_EDGE_TYPES || ['ligne', 'rayon', 'courbeS', 'spline'];
    var RHO_MIN = typeof RULES.RHO_MIN === 'number' ? RULES.RHO_MIN : 0;
    var RHO_MAX = typeof RULES.RHO_MAX === 'number' ? RULES.RHO_MAX : 400;

    function sanitizeType(type) {
        return ALLOWED_EDGE_TYPES.indexOf(type) >= 0 ? type : (RULES.DEFAULT_EDGE_TYPE || 'ligne');
    }

    function sanitizeRho(rho) {
        var n = typeof rho === 'number' && isFinite(rho) ? rho : (RULES.DEFAULT_RHO || 0);
        if (n < RHO_MIN) n = RHO_MIN;
        if (n > RHO_MAX) n = RHO_MAX;
        return n;
    }

    var state = {
        selectedType: sanitizeType(RULES.DEFAULT_EDGE_TYPE || 'ligne'),
        rho: sanitizeRho(RULES.DEFAULT_RHO || 0)
    };

    function getState() {
        return state;
    }

    function patchState(next) {
        if (!next) return state;
        for (var k in next) {
            if (!Object.prototype.hasOwnProperty.call(next, k)) continue;
            if (k === 'selectedType') state.selectedType = sanitizeType(next.selectedType);
            else if (k === 'rho') state.rho = sanitizeRho(next.rho);
            else state[k] = next[k];
        }
        return state;
    }

    return {
        getState: getState,
        patchState: patchState
    };
})();
