// Blocs UI réutilisables pour un rattachement.
var RattachementBloc = (function () {
    function profilOptions() {
        if (typeof RattachementRules !== 'undefined' && RattachementRules.PROFILE_OPTIONS_HTML) return RattachementRules.PROFILE_OPTIONS_HTML;
        return '<option value="ligne">Ligne</option>';
    }

    function buildCard(id, num, rhoObj) {
        var r = rhoObj || { rho: 0, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 };
        return '<div class="setting-card setting-card--rattachement">' +
            '<button class="accordion sub-accordion">Rattachement ' + num + '</button>' +
            '<div class="panel-controls">' +
            '<div class="control-group"><div class="label-row"><label>Profil</label><div class="input-wrapper"><select id="' + id + '-type">' + profilOptions() + '</select></div></div></div>' +
            '<div class="control-group js-rho-group"><div class="label-row"><label>Rayon</label><div class="input-wrapper"><input type="number" id="' + id + '-rho" value="' + r.rho + '" min="' + r.rhoMin + '" max="' + r.rhoMax + '"><span class="unit">mm</span></div></div>' +
            '<input type="range" id="' + id + '-rho-slider" min="' + r.rhoMin + '" max="' + r.rhoMax + '" step="' + r.rhoStep + '" value="' + r.rho + '"></div>' +
            '</div></div>';
    }

    return {
        buildCard: buildCard
    };
})();
