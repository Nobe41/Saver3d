var TopbarShared = (function () {
    function init() {
        var btnFichierMenu = document.getElementById('btn-fichier-menu');
        var fichierDropdown = document.getElementById('fichier-dropdown');
        var btnAffichageMenu = document.getElementById('btn-affichage-menu');
        var affichageDropdown = document.getElementById('affichage-dropdown');
        var menuHoverCloseTimer = null;

        if (btnFichierMenu && fichierDropdown) {
            btnFichierMenu.addEventListener('click', function (e) {
                e.stopPropagation();
                if (affichageDropdown) affichageDropdown.classList.add('hidden');
                fichierDropdown.classList.toggle('hidden');
            });

            document.addEventListener('click', function (e) {
                if (!fichierDropdown.contains(e.target) && e.target !== btnFichierMenu) {
                    fichierDropdown.classList.add('hidden');
                }
                if (affichageDropdown && btnAffichageMenu && !affichageDropdown.contains(e.target) && e.target !== btnAffichageMenu) {
                    affichageDropdown.classList.add('hidden');
                }
            });
        }

        if (btnAffichageMenu && affichageDropdown) {
            btnAffichageMenu.addEventListener('click', function (e) {
                e.stopPropagation();
                if (fichierDropdown) fichierDropdown.classList.add('hidden');
                affichageDropdown.classList.toggle('hidden');
            });
        }

        function openTopbarMenu(kind) {
            if (menuHoverCloseTimer) {
                clearTimeout(menuHoverCloseTimer);
                menuHoverCloseTimer = null;
            }
            if (kind === 'fichier') {
                if (affichageDropdown) affichageDropdown.classList.add('hidden');
                if (fichierDropdown) fichierDropdown.classList.remove('hidden');
            } else if (kind === 'affichage') {
                if (fichierDropdown) fichierDropdown.classList.add('hidden');
                if (affichageDropdown) affichageDropdown.classList.remove('hidden');
            }
        }

        function scheduleCloseTopbarMenus() {
            if (menuHoverCloseTimer) clearTimeout(menuHoverCloseTimer);
            menuHoverCloseTimer = setTimeout(function () {
                if (fichierDropdown) fichierDropdown.classList.add('hidden');
                if (affichageDropdown) affichageDropdown.classList.add('hidden');
            }, 120);
        }

        if (btnFichierMenu && fichierDropdown) {
            btnFichierMenu.addEventListener('mouseenter', function () { openTopbarMenu('fichier'); });
            fichierDropdown.addEventListener('mouseenter', function () {
                if (menuHoverCloseTimer) {
                    clearTimeout(menuHoverCloseTimer);
                    menuHoverCloseTimer = null;
                }
            });
            btnFichierMenu.addEventListener('mouseleave', scheduleCloseTopbarMenus);
            fichierDropdown.addEventListener('mouseleave', scheduleCloseTopbarMenus);
        }

        if (btnAffichageMenu && affichageDropdown) {
            btnAffichageMenu.addEventListener('mouseenter', function () { openTopbarMenu('affichage'); });
            affichageDropdown.addEventListener('mouseenter', function () {
                if (menuHoverCloseTimer) {
                    clearTimeout(menuHoverCloseTimer);
                    menuHoverCloseTimer = null;
                }
            });
            btnAffichageMenu.addEventListener('mouseleave', scheduleCloseTopbarMenus);
            affichageDropdown.addEventListener('mouseleave', scheduleCloseTopbarMenus);
        }
    }

    return {
        init: init
    };
})();
