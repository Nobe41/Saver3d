// Règles et valeurs par défaut des sections (sans logique d'affichage).
var SectionsRules = (function () {
    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    var selectProfilOptions = ''
        + '<option value="ligne">Ligne</option>'
        + '<option value="courbeS">Courbe S</option>'
        + '<option value="rayon">Rayon</option>'
        + '<option value="spline">Spline</option>';

    var selectFormeOptions = '<option value="rond">Rond (actuel)</option><option value="carre">Carré</option>';

    var mainSections = [
        { label: 'Pied', h: 0, hMin: 0, hMax: 80, L: 71, P: 71, LMin: 40, LMax: 120, step: 0.5, hStep: 0.5 },
        { label: 'Corps', h: 10, hMin: 0, hMax: 350, L: 85, P: 85, LMin: 40, LMax: 120, step: 0.5, hStep: 1 },
        { label: 'Épaule', h: 120, hMin: 0, hMax: 350, L: 85, P: 85, LMin: 20, LMax: 120, step: 0.5, hStep: 0.5 },
        { label: 'Col', h: 200, hMin: 20, hMax: 250, L: 32, P: 32, LMin: 20, LMax: 70, step: 0.5, hStep: 1 },
        { label: 'Bas col', h: 280, hMin: 0, hMax: 350, L: 32, P: 32, LMin: 20, LMax: 50, step: 0.1, hStep: 0.5 }
    ];

    var mainLiaisons = [
        { rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 },
        { rho: 40, rhoMin: 5, rhoMax: 400, rhoStep: 1 },
        { rho: 0, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 },
        { rho: 20, rhoMin: 5, rhoMax: 400, rhoStep: 1 }
    ];

    var piqureSections = [
        { key: 'sp', label: 'Piqûre', hasHeight: false, L: 58, P: 58, LMin: 10, LMax: 71, step: 0.5 },
        { key: 'sp2', label: 'Bas piqûre', hasHeight: true, h: 4, hMin: 0, hMax: 80, hStep: 0.5, L: 48, P: 48, LMin: 10, LMax: 120, step: 0.5 },
        { key: 'sp3', label: 'Haut piqûre', hasHeight: true, h: 20, hMin: 0, hMax: 80, hStep: 0.5, L: 35, P: 35, LMin: 10, LMax: 120, step: 0.5 }
    ];

    var piqureLiaisons = [
        { id: 'rp1', rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 },
        { id: 'rp2', rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 }
    ];

    var bagueSections = [
        { key: 'sb1', label: 'Bas bague', h: 282, hMin: 0, hMax: 400, hStep: 0.5, L: 35, P: 35, LMin: 10, LMax: 120, step: 0.5 },
        { key: 'sb2', label: 'Haut bague', h: 297, hMin: 0, hMax: 400, hStep: 0.5, L: 35, P: 35, LMin: 10, LMax: 120, step: 0.5 },
        { key: 'sb3', label: 'Haut bague', h: 299, hMin: 0, hMax: 400, hStep: 0.5, L: 33, P: 33, LMin: 10, LMax: 120, step: 0.5 }
    ];

    var bagueLiaisons = [
        { id: 'rb1', rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 },
        { id: 'rb2', rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 }
    ];

    return {
        selectProfilOptions: selectProfilOptions,
        selectFormeOptions: selectFormeOptions,
        createInitialState: function () {
            return {
                sectionsMain: clone(mainSections),
                liaisonsMain: clone(mainLiaisons),
                piqureSections: clone(piqureSections),
                piqureLiaisons: clone(piqureLiaisons),
                bagueSections: clone(bagueSections),
                bagueLiaisons: clone(bagueLiaisons)
            };
        }
    };
})();
