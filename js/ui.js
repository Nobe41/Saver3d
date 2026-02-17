function initUI() {
    const pwd = document.getElementById('password-input');
    pwd.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && pwd.value.trim().toLowerCase() === 'axel') {
            document.getElementById('Page-login').classList.add('hidden');
            document.getElementById('Page-menu').classList.remove('hidden');
        }
    });

    document.getElementById('btn-new-project').addEventListener('click', () => {
        document.getElementById('Page-menu').classList.add('hidden');
        document.getElementById('Page-Bouteille').classList.remove('hidden');
    });

    const mappings = [
        { id: 'height', p: 'height' },
        { id: 'diameter', p: 'diameter' },
        { id: 'neck-height', p: 'neckHeight' },
        { id: 'body-height', p: 'bodyHeight' }
    ];

    mappings.forEach(m => {
        const s = document.getElementById(m.id + '-slider');
        const i = document.getElementById(m.id + '-input');
        if (s && i) {
            s.addEventListener('input', () => { i.value = s.value; params[m.p] = parseFloat(s.value); updateGeometry(); });
            i.addEventListener('input', () => { s.value = i.value; params[m.p] = parseFloat(i.value); updateGeometry(); });
        }
    });

    const acc = document.getElementsByClassName("accordion");
    for (let a of acc) {
        a.onclick = function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            panel.style.maxHeight = panel.style.maxHeight && panel.style.maxHeight !== "0px" ? "0px" : "1000px";
        }
    }
}
