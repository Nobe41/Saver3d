var GravureEvents = (function () {
    function triggerUpdate() {
        if (typeof updateBouteille === 'function') updateBouteille();
    }

    function removeEngraving(id) {
        var card = document.getElementById('gravure-' + id);
        if (card) {
            card.remove();
            GravureBloc.updateTitles();
        }
        GravureState.removeImage(id);
        triggerUpdate();
    }

    function getEngravingsData() {
        var items = document.querySelectorAll('.gravure-item');
        var data = [];
        items.forEach(function (item) { data.push(GravureMath.parseItemData(item)); });
        return data;
    }

    function bindNumericSlider(numId, sliderId) {
        var num = document.getElementById(numId);
        var slider = document.getElementById(sliderId);
        if (!num || !slider) return;
        num.addEventListener('input', function () { slider.value = num.value; triggerUpdate(); });
        slider.addEventListener('input', function () { num.value = slider.value; triggerUpdate(); });
    }

    function bindFileCard(card, id) {
        var fileInput = card.querySelector('.gravure-file');
        var fileBtn = card.querySelector('.gravure-file-btn');
        var fileRow = card.querySelector('.gravure-file-row');
        var fileNameDisplay = card.querySelector('#gravure-filename-' + id);
        if (!fileInput || !fileBtn || !fileRow || !fileNameDisplay) return;

        fileBtn.addEventListener('click', function () { fileInput.click(); });

        function handleSelectedFile(file) {
            if (!file) { fileNameDisplay.textContent = ''; return; }
            var lowerName = (file.name || '').toLowerCase();
            var isPngMime = file.type === 'image/png';
            var isPngExt = lowerName.endsWith('.png');
            if (!isPngMime && !isPngExt) {
                fileNameDisplay.textContent = 'Fichier non PNG';
                fileInput.value = '';
                return;
            }
            fileNameDisplay.textContent = file.name;
            var reader = new FileReader();
            reader.onload = function (event) {
                var img = new Image();
                img.onload = function () { GravureState.setImage(id, img); triggerUpdate(); };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }

        fileInput.addEventListener('change', function (e) { handleSelectedFile(e.target.files[0]); });
        fileRow.addEventListener('dragover', function (e) { e.preventDefault(); fileRow.classList.add('drag-over'); });
        fileRow.addEventListener('dragleave', function () { fileRow.classList.remove('drag-over'); });
        fileRow.addEventListener('drop', function (e) {
            e.preventDefault();
            fileRow.classList.remove('drag-over');
            var file = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files[0] : null;
            handleSelectedFile(file);
        });
    }

    function bindCard(card, id) {
        var accBtn = card.querySelector('.accordion');
        accBtn.onclick = function () {
            this.classList.toggle('active');
            var panel = this.nextElementSibling;
            panel.style.maxHeight = (panel.style.maxHeight && panel.style.maxHeight !== '0px') ? '0px' : (panel.scrollHeight + 'px');
        };
        bindFileCard(card, id);
        bindNumericSlider('gravure-y-num-' + id, 'gravure-y-slider-' + id);
        bindNumericSlider('gravure-angle-num-' + id, 'gravure-angle-slider-' + id);
        bindNumericSlider('gravure-largeur-num-' + id, 'gravure-largeur-slider-' + id);
        bindNumericSlider('gravure-profondeur-num-' + id, 'gravure-profondeur-slider-' + id);
        var flipCheckbox = document.getElementById('gravure-flip-' + id);
        var invertCheckbox = document.getElementById('gravure-invert-' + id);
        if (flipCheckbox) flipCheckbox.addEventListener('change', triggerUpdate);
        if (invertCheckbox) invertCheckbox.addEventListener('change', triggerUpdate);
        var removeBtn = card.querySelector('.btn-remove-gravure');
        if (removeBtn) removeBtn.addEventListener('click', function () { removeEngraving(id); });
    }

    function addEngravingCard() {
        var ids = GravureRules.IDS;
        var container = document.getElementById(ids.container);
        if (!container) return;
        var id = GravureState.nextId();
        var card = document.createElement('div');
        card.className = 'setting-card setting-card--liaison gravure-item';
        card.id = 'gravure-' + id;
        card.dataset.id = id;
        card.innerHTML = GravureBloc.buildCardHtml(id, GravureState.getCounter());
        container.appendChild(card);
        GravureBloc.updateTitles();
        bindCard(card, id);
    }

    function init() {
        var btn = document.getElementById(GravureRules.IDS.addButton);
        if (btn && !btn.dataset.bound) {
            btn.dataset.bound = '1';
            btn.addEventListener('click', addEngravingCard);
        }
        window.removeEngraving = removeEngraving;
        window.getEngravingsData = getEngravingsData;
        window.engravingImages = GravureState.getImages();
    }

    return {
        init: init,
        addEngravingCard: addEngravingCard
    };
})();
