// Etat runtime des sections (source unique pour le feature).
var SectionsState = (function () {
    function fallbackState() {
        return {
            sectionsMain: [],
            liaisonsMain: [],
            piqureSections: [],
            piqureLiaisons: [],
            bagueSections: [],
            bagueLiaisons: []
        };
    }

    var state = (typeof SectionsRules !== 'undefined' && SectionsRules.createInitialState)
        ? SectionsRules.createInitialState()
        : fallbackState();

    function getState() {
        return state;
    }

    function resetState() {
        state = (typeof SectionsRules !== 'undefined' && SectionsRules.createInitialState)
            ? SectionsRules.createInitialState()
            : fallbackState();
        return state;
    }

    return {
        getState: getState,
        resetState: resetState
    };
})();
