// Comandi della pagina: menu delle lingue, comparsa delle sezioni.
(function () {
  var html = document.documentElement;

  // la lingua scelta dal menu viene ricordata per le visite successive
  document.querySelectorAll('[data-lingua]').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('lingua-libri', a.getAttribute('data-lingua')); } catch (e) {}
    });
  });
  // il menu delle lingue si chiude toccando fuori
  var menu = document.querySelector('.lingue');
  if (menu) document.addEventListener('click', function (e) { if (!menu.contains(e.target)) menu.removeAttribute('open'); });

  // i libri compaiono mentre si scorre
  if ('IntersectionObserver' in window) {
    var els = document.querySelectorAll('.romanzo, .giallo, .editori-in, .autore-in, .sezione-testa');
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (!v.isIntersecting) return;
        var el = v.target;
        el.classList.add('vista');
        io.unobserve(el);
        setTimeout(function () { el.classList.remove('appare', 'vista'); el.style.transitionDelay = ''; }, 1200);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el, i) {
      el.classList.add('appare');
      if (el.classList.contains('giallo')) el.style.transitionDelay = (i % 4) * 90 + 'ms';
      io.observe(el);
    });
    html.classList.add('js-pronto');
  }

  // newsletter: controlla che l'indirizzo sia scritto bene e lo manda a FormSubmit senza lasciare la pagina.
  // Senza JavaScript il modulo va a FormSubmit nel modo normale (il browser controlla da solo l'indirizzo).
  var nl = document.querySelector('.newsletter-modulo');
  if (nl && window.fetch) {
    nl.noValidate = true;
    var campo = nl.querySelector('#nl-email'), msg = nl.querySelector('.newsletter-msg'), btn = nl.querySelector('button');
    var giusto = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;
    var avvisa = function (testo, tipo) { msg.textContent = testo; msg.className = 'newsletter-msg' + (tipo ? ' ' + tipo : ''); };
    campo.addEventListener('input', function () {
      campo.removeAttribute('aria-invalid');
      if (msg.classList.contains('errore')) avvisa('', '');
    });
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = campo.value.trim();
      if (!giusto.test(email)) { campo.setAttribute('aria-invalid', 'true'); avvisa(nl.dataset.errore, 'errore'); campo.focus(); return; }
      if (nl.elements._honey.value) return; // l'ha riempito un programma, non una persona
      btn.disabled = true; avvisa(nl.dataset.invio, '');
      var dati = {};
      ['_subject', 'lingua', '_template'].forEach(function (n) { dati[n] = nl.elements[n].value; });
      dati.email = email;
      fetch(nl.dataset.ajax, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(dati) })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (String(j.success) !== 'true') throw new Error(j.message || 'errore'); campo.value = ''; avvisa(nl.dataset.grazie, 'ok'); })
        .catch(function () { avvisa(nl.dataset.problema, 'errore'); })
        .then(function () { btn.disabled = false; });
    });
  }
})();
