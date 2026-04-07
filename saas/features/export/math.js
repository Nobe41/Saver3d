var ExportMath = (function () {
    function safeFileName(name, fallback) {
        var base = (name || '').trim();
        if (!base) return fallback;
        return base.replace(/[\\/:*?"<>|]/g, '_');
    }

    function resolvePaperInfo(formatVal, paperFormats, rules) {
        var selected = formatVal || rules.DEFAULTS.paperFormat;
        var dims = (paperFormats && paperFormats[selected]) ? paperFormats[selected] : { w: 210, h: 297 };
        var map = (rules.PAPER_MAP && rules.PAPER_MAP[selected]) ? rules.PAPER_MAP[selected] : { orientation: 'p', format: 'a4' };
        return { w: dims.w, h: dims.h, orientation: map.orientation, format: map.format };
    }

    return {
        safeFileName: safeFileName,
        resolvePaperInfo: resolvePaperInfo
    };
})();
