// Orchestration du feature rattachement + compatibilité API globale existante.
var RattachementsFeature = (function () {
    function normalizeInput(profilePoints, data) {
        var points = Array.isArray(profilePoints) ? profilePoints : [];
        var payload = data || {};
        if (!Array.isArray(payload.edgeTypes)) payload.edgeTypes = [];
        if (!Array.isArray(payload.rhos)) payload.rhos = [];
        return { points: points, payload: payload };
    }

    function buildProfileCurves(profilePoints, data) {
        if (typeof RattachementMath === 'undefined' || !RattachementMath.buildProfileCurves) return [];
        var normalized = normalizeInput(profilePoints, data);
        return RattachementMath.buildProfileCurves(normalized.points, normalized.payload);
    }

    function buildRattachementCard(id, num, rhoObj) {
        if (typeof RattachementBloc === 'undefined' || !RattachementBloc.buildCard) return '';
        return RattachementBloc.buildCard(id, num, rhoObj);
    }

    function bindRhoSync(inputId, sliderId, onChange) {
        if (typeof RattachementEvents === 'undefined' || !RattachementEvents.bindRhoSync) return;
        RattachementEvents.bindRhoSync(inputId, sliderId, onChange);
    }

    return {
        buildProfileCurves: buildProfileCurves,
        buildRattachementCard: buildRattachementCard,
        bindRhoSync: bindRhoSync
    };
})();

// Alias métier neutre pour éviter de propager le vocabulaire technique.
var LiaisonsFeature = RattachementsFeature;

// Compatibilité avec l'ancien nom global utilisé ailleurs dans l'application.
var RattachementsMaths = (function () {
    return {
        buildProfileCurves: function (profilePoints, data) {
            return RattachementsFeature.buildProfileCurves(profilePoints, data);
        }
    };
})();

