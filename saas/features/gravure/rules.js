var GravureRules = (function () {
    return {
        IDS: {
            addButton: 'btn-add-engraving',
            container: 'engravings-container'
        },
        DEFAULTS: {
            y: 150,
            angleDeg: 0,
            width: 50,
            depth: 1.5,
            flip: false,
            invert: false
        },
        LIMITS: {
            y: { min: 10, max: 350, step: 1 },
            angleDeg: { min: 0, max: 360, step: 1 },
            width: { min: 10, max: 150, step: 1 },
            depth: { min: 0.1, max: 5, step: 0.1 }
        }
    };
})();
