// Règles et constantes partagées pour les rattachements.
var RattachementRules = (function () {
    return {
        PROFILE_OPTIONS_HTML: ''
            + '<option value="ligne">Ligne</option>'
            + '<option value="courbeS">Courbe S</option>'
            + '<option value="rayon">Rayon</option>'
            + '<option value="spline">Spline</option>',
        DEFAULT_EDGE_TYPE: 'ligne',
        DEFAULT_RHO: 0,
        ALLOWED_EDGE_TYPES: ['ligne', 'rayon', 'courbeS', 'spline'],
        RHO_MIN: 0,
        RHO_MAX: 400,
        QUARTER_ARC_TOLERANCE_MM: 0.5,
        SPLINE_STEPS: 48,
        MIN_SAFE_X: 1
    };
})();
