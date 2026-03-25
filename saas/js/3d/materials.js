// js/3d/materials.js
// Matériaux 3D (verre bouteille). Une seule « recette », couleur optionnelle.

var BottleMaterials = (function () {
    var DEFAULT_GLASS_COLOR = 0x99bbdd;
    var RENDER_MATERIAL_MODE = 'base';

    function getBaseMaterial(color) {
        var c = (color !== undefined && color !== null) ? color : DEFAULT_GLASS_COLOR;
        return new THREE.MeshPhongMaterial({
            color: c,
            side: THREE.DoubleSide
        });
    }

    function getRealisticGlassMaterial(color) {
        var c = (color !== undefined && color !== null) ? color : DEFAULT_GLASS_COLOR;
        return new THREE.MeshPhysicalMaterial({
            color: c,
            metalness: 0,
            roughness: 0.015,
            transmission: 0.99,
            thickness: 4.0,
            ior: 1.52,
            transparent: true,
            opacity: 0.35,
            attenuationDistance: 2.2,
            attenuationColor: new THREE.Color(0xbfd8ef),
            clearcoat: 0.15,
            clearcoatRoughness: 0.05,
            side: THREE.DoubleSide
        });
    }

    function getInnerGlassMaterial(color) {
        var c = (color !== undefined && color !== null) ? color : DEFAULT_GLASS_COLOR;
        return new THREE.MeshPhysicalMaterial({
            color: c,
            metalness: 0,
            roughness: 0.03,
            transmission: 0.95,
            thickness: 2.5,
            ior: 1.5,
            transparent: true,
            opacity: 0.28,
            attenuationDistance: 1.8,
            attenuationColor: new THREE.Color(0xc7ddf2),
            side: THREE.BackSide
        });
    }

    function getGlassMaterial(color) {
        if (RENDER_MATERIAL_MODE === 'glass') return getRealisticGlassMaterial(color);
        return getBaseMaterial(color);
    }

    function setRenderMaterialMode(mode) {
        if (mode === 'glass') RENDER_MATERIAL_MODE = 'glass';
        else RENDER_MATERIAL_MODE = 'base';
    }

    function getRenderMaterialMode() {
        return RENDER_MATERIAL_MODE;
    }

    function getBottleBodyMaterial() {
        return getGlassMaterial(DEFAULT_GLASS_COLOR);
    }

    return {
        getGlassMaterial: getGlassMaterial,
        getRealisticGlassMaterial: getRealisticGlassMaterial,
        getInnerGlassMaterial: getInnerGlassMaterial,
        setRenderMaterialMode: setRenderMaterialMode,
        getRenderMaterialMode: getRenderMaterialMode,
        getBottleBodyMaterial: getBottleBodyMaterial,
        DEFAULT_GLASS_COLOR: DEFAULT_GLASS_COLOR
    };
})();
