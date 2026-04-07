var NavigationState = (function () {
    var state = {
        activeLeftTab: 'sections',
        activeBarTab: 'sections',
        activeView: '3d'
    };

    function getState() { return state; }
    function patch(next) {
        if (!next) return state;
        for (var k in next) if (Object.prototype.hasOwnProperty.call(next, k)) state[k] = next[k];
        return state;
    }

    return {
        getState: getState,
        patch: patch
    };
})();
