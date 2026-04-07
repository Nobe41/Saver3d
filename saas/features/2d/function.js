var Plans2DFeature = (function () {
    function getPaperFormats() {
        if (typeof Plans2DRules !== 'undefined' && Plans2DRules.PAPER_FORMATS) return Plans2DRules.PAPER_FORMATS;
        return { A4_P: { w: 210, h: 297 } };
    }

    function getPaperFormatValue() {
        var id = (Plans2DRules && Plans2DRules.IDS && Plans2DRules.IDS.paperFormat) || 'paper-format-select';
        var el = document.getElementById(id);
        return el ? el.value : ((Plans2DRules && Plans2DRules.DEFAULT_PAPER_FORMAT) || 'A4_P');
    }

    function getPaperInfo() {
        var formats = getPaperFormats();
        var fmt = getPaperFormatValue();
        return formats[fmt] || formats[(Plans2DRules && Plans2DRules.DEFAULT_PAPER_FORMAT) || 'A4_P'];
    }

    function init() {
        window.paperFormats = getPaperFormats();
    }

    return {
        init: init,
        getPaperFormats: getPaperFormats,
        getPaperFormatValue: getPaperFormatValue,
        getPaperInfo: getPaperInfo
    };
})();

(function () {
    if (typeof Plans2DFeature !== 'undefined' && Plans2DFeature.init) Plans2DFeature.init();
})();
