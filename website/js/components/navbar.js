(function () {
    var path = (window.location.pathname || "").toLowerCase();
    var file = path.split("/").pop() || "";

    var page = "accueil";
    if (file.indexOf("fonctionnalites") !== -1) page = "fonctionnalites";
    else if (file.indexOf("galerie") !== -1) page = "galerie";
    else if (file.indexOf("licence") !== -1) page = "licence";
    else if (file.indexOf("avis") !== -1) page = "avis";
    else if (!file || file === "index.html" || path.endsWith("/website/") || path.endsWith("/website")) {
        page = "accueil";
    }

    document.querySelectorAll(".panel-nav a[data-nav]").forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("data-nav") === page);
    });
})();
