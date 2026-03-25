(function () {
    var sections = ['accueil', 'fonctionnalites', 'galerie', 'licence'];
    var links = {};
    sections.forEach(function (id) {
        var a = document.querySelector('.panel-nav a[href="#' + id + '"]');
        if (a) links[id] = a;
    });

    function setActive() {
        var top = window.scrollY + 120;
        var current = sections[0];
        sections.forEach(function (id) {
            var el = document.getElementById(id);
            if (el && el.offsetTop <= top) current = id;
        });
        sections.forEach(function (id) {
            if (links[id]) links[id].classList.toggle('active', id === current);
        });
    }

    setActive();
    window.addEventListener('scroll', setActive);
})();
