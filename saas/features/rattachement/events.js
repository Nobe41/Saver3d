// Evénements dédiés aux contrôles de rattachement.
var RattachementEvents = (function () {
    function bindRhoSync(inputId, sliderId, onChange) {
        var input = document.getElementById(inputId);
        var slider = document.getElementById(sliderId);
        if (!input || !slider) return;

        function syncFromInput() {
            slider.value = input.value;
            if (typeof onChange === 'function') onChange(parseFloat(input.value));
        }
        function syncFromSlider() {
            input.value = slider.value;
            if (typeof onChange === 'function') onChange(parseFloat(slider.value));
        }

        if (!input.dataset.bound) {
            input.dataset.bound = '1';
            input.addEventListener('input', syncFromInput);
            input.addEventListener('change', syncFromInput);
        }
        if (!slider.dataset.bound) {
            slider.dataset.bound = '1';
            slider.addEventListener('input', syncFromSlider);
            slider.addEventListener('change', syncFromSlider);
        }
    }

    return {
        bindRhoSync: bindRhoSync
    };
})();
