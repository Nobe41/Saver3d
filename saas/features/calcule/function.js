// Affichage du volume total dans la vue 3D (coin bas-gauche).
var CalculeVolumeFeature = (function () {
    var OVERLAY_ID = 'volume-total-overlay';

    function formatVolume(volumeMm3) {
        var ml = volumeMm3 / 1000;
        return ml.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function ensureOverlay() {
        if (typeof document === 'undefined') return null;
        var viewport = document.getElementById('viewport-3d');
        if (!viewport) return null;
        var el = document.getElementById(OVERLAY_ID);
        if (!el) {
            el = document.createElement('div');
            el.id = OVERLAY_ID;
            el.className = 'volume-total-overlay';
            viewport.appendChild(el);
        }
        return el;
    }

    function updateFromSectionsData(sectionsData) {
        var el = ensureOverlay();
        if (!el) return;
        if (typeof CalculeVolumeMath === 'undefined' || !CalculeVolumeMath.computeTotalInteriorVolumeMm3) {
            el.textContent = 'Volume total: calcul indisponible';
            return;
        }
        var volumeMm3 = CalculeVolumeMath.computeTotalInteriorVolumeMm3(sectionsData || {});
        el.textContent = 'Volume total interieur (bague fermee): ' + formatVolume(volumeMm3) + ' mL';
    }

    return {
        updateFromSectionsData: updateFromSectionsData
    };
})();
