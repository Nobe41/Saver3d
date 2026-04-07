// Helpers purs du mode rendu.
var RenderMath = (function () {
    var RULES = (typeof RenderRules !== 'undefined') ? RenderRules : {};
    var MODE_BASE = RULES.MODE_BASE || 'base';
    var MODE_GLASS = RULES.MODE_GLASS || 'glass';
    var SCENE_NONE = RULES.SCENE_NONE || 'none';
    var SCENE_0 = RULES.SCENE_0 || 'scene0';
    var SCENE_1 = RULES.SCENE_1 || 'scene1';
    var SCENE_2 = RULES.SCENE_2 || 'scene2';

    function materialModeFromToggle(enabled) {
        return enabled ? MODE_GLASS : MODE_BASE;
    }

    function sceneFromInputs(renderEnabled, scene1Checked, scene2Checked) {
        if (!renderEnabled) return SCENE_NONE;
        if (scene1Checked) return SCENE_1;
        if (scene2Checked) return SCENE_2;
        return SCENE_0;
    }

    return {
        materialModeFromToggle: materialModeFromToggle,
        sceneFromInputs: sceneFromInputs
    };
})();
