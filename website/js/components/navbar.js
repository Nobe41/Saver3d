(function () {
    var rawPath = window.location.pathname || "";
    var path = rawPath.toLowerCase();
    var decodedPath = path;
    try {
        decodedPath = decodeURIComponent(rawPath).toLowerCase();
    } catch (e) {
        decodedPath = path;
    }
    var file = path.split("/").pop() || "";

    var page = "accueil";
    var featurePages = [
        "conception-3d.html",
        "plan-2d.html",
        "gravure.html",
        "calcule.html",
        "analyse.html",
        "exportation.html",
        "mode-rendu.html"
    ];

    if (featurePages.indexOf(file) !== -1) page = "fonctionnalites";
    else if (file.indexOf("galerie") !== -1) page = "galerie";
    else if (file.indexOf("licence") !== -1) page = "licence";
    else if (file.indexOf("avis") !== -1) page = "avis";
    else if (!file || file === "index.html" || path.endsWith("/website/") || path.endsWith("/website")) {
        page = "accueil";
    }

    document.querySelectorAll(".panel-nav a[data-nav]").forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("data-nav") === page);
    });

    var trigger = document.querySelector('.panel-nav a[data-nav="fonctionnalites"]');
    var panel = document.querySelector(".panel");
    if (!trigger || !panel) return;

    var featureDir = "fonctionnalité/";
    var inFeatureFolder =
        decodedPath.indexOf("/pages/fonctionnalité/") !== -1 ||
        path.indexOf("/pages/fonctionnalit%c3%a9/") !== -1;
    var inPagesFolder = path.indexOf("/pages/") !== -1;
    var featureBasePath;
    if (inFeatureFolder) featureBasePath = "";
    else if (inPagesFolder) featureBasePath = featureDir;
    else featureBasePath = "pages/" + featureDir;
    var menu = document.createElement("div");
    menu.className = "panel-features-menu";
    menu.innerHTML = [
        '<div class="panel-features-inner">',
        '  <div class="panel-features-col">',
        '    <a href="' + featureBasePath + 'conception-3d.html">Conception 3D</a>',
        '    <a href="' + featureBasePath + 'plan-2d.html">Plan 2D</a>',
        "  </div>",
        '  <div class="panel-features-col">',
        '    <a href="' + featureBasePath + 'gravure.html">Gravure</a>',
        '    <a href="' + featureBasePath + 'calcule.html">Calcule</a>',
        "  </div>",
        '  <div class="panel-features-col">',
        '    <a href="' + featureBasePath + 'analyse.html">Analyse</a>',
        '    <a href="' + featureBasePath + 'exportation.html">Exportation</a>',
        "  </div>",
        '  <div class="panel-features-col">',
        '    <a href="' + featureBasePath + 'mode-rendu.html">Mode rendu</a>',
        '    <span class="panel-features-placeholder" aria-hidden="true"></span>',
        "  </div>",
        "</div>"
    ].join("");

    panel.insertAdjacentElement("afterend", menu);
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "true");

    function updateMenuOffset() {
        menu.style.top = panel.getBoundingClientRect().height + "px";
    }

    function closeMenu() {
        menu.classList.remove("is-open");
        trigger.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
        updateMenuOffset();
        menu.classList.add("is-open");
        trigger.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
    }

    var closeTimer = null;

    function clearCloseTimer() {
        if (!closeTimer) return;
        clearTimeout(closeTimer);
        closeTimer = null;
    }

    function scheduleClose() {
        clearCloseTimer();
        closeTimer = setTimeout(closeMenu, 120);
    }

    trigger.addEventListener("mouseenter", function () {
        clearCloseTimer();
        openMenu();
    });

    trigger.addEventListener("mouseleave", scheduleClose);
    menu.addEventListener("mouseenter", clearCloseTimer);
    menu.addEventListener("mouseleave", scheduleClose);

    trigger.addEventListener("focus", function () {
        clearCloseTimer();
        openMenu();
    });

    trigger.addEventListener("click", function (event) {
        // Keep touch devices usable where hover does not exist.
        if (window.matchMedia("(hover: none)").matches) {
            event.preventDefault();
            if (menu.classList.contains("is-open")) closeMenu();
            else openMenu();
            return;
        }

        event.preventDefault();
    });

    document.addEventListener("click", function (event) {
        if (!menu.classList.contains("is-open")) return;
        if (menu.contains(event.target) || trigger.contains(event.target)) return;
        closeMenu();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", updateMenuOffset);
    window.addEventListener("scroll", updateMenuOffset, { passive: true });
    updateMenuOffset();
})();
