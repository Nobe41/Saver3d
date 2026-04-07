var Plans2DViews = (function () {
    function getScaleValue() {
        var id = (Plans2DRules && Plans2DRules.IDS && Plans2DRules.IDS.drawingScale) || 'drawing-scale-select';
        var el = document.getElementById(id);
        return el ? el.value : '1:1';
    }

    function getScaleLabel() {
        var id = (Plans2DRules && Plans2DRules.IDS && Plans2DRules.IDS.drawingScale) || 'drawing-scale-select';
        var el = document.getElementById(id);
        if (!el || !el.options || el.selectedIndex < 0) return '1:1';
        return el.options[el.selectedIndex].text || el.value || '1:1';
    }

    function getDrawingScale() {
        var scaleValue = getScaleValue();
        if (scaleValue === '1:2') return 0.5;
        if (scaleValue === '1:5') return 0.2;
        if (scaleValue === '2:1') return 2;
        return 1;
    }

    function getShowBottomView() {
        var id = (Plans2DRules && Plans2DRules.IDS && Plans2DRules.IDS.showBottom) || 'cb-vue-dessous';
        var el = document.getElementById(id);
        return !!(el && el.checked);
    }

    return {
        getScaleValue: getScaleValue,
        getScaleLabel: getScaleLabel,
        getDrawingScale: getDrawingScale,
        getShowBottomView: getShowBottomView
    };
})();
