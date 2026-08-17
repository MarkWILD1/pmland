(function () {
  var KEY = 'pm_cookie_consent_v1';
  try {
    if (localStorage.getItem(KEY)) return;
  } catch (e) {}

  var css = document.createElement('style');
  css.textContent =
    '.pm-cookie-banner{position:fixed;left:1.15rem;bottom:1.15rem;z-index:10050;max-width:400px;background:#1e1b4b;color:rgba(255,255,255,.94);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:1rem 1.1rem .95rem;box-shadow:0 16px 40px rgba(15,23,42,.35);font-family:Inter,Poppins,system-ui,sans-serif;font-size:.82rem;line-height:1.45}' +
    '.pm-cookie-banner p{margin:0 0 .85rem}' +
    '.pm-cookie-banner a{color:#fbbf24;font-weight:600}' +
    '.pm-cookie-actions{display:flex;gap:.5rem;flex-wrap:wrap}' +
    '.pm-cookie-btn{border:0;border-radius:999px;padding:.45rem .95rem;font-weight:700;font-size:.8rem;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}' +
    '.pm-cookie-btn-accept{background:#fbbf24;color:#1e1b4b}' +
    '.pm-cookie-btn-link{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35)}' +
    '@media (max-width:640px){.pm-cookie-banner{left:.75rem;right:.75rem;bottom:5.5rem;max-width:none}}';
  document.head.appendChild(css);

  var banner = document.createElement('div');
  banner.className = 'pm-cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Aviso de cookies');
  banner.innerHTML =
    '<p>Usamos cookies y píxeles propios y de terceros (Google Analytics, Google Ads y Meta) para medir visitas y mostrar anuncios. Al continuar, aceptás su uso.</p>' +
    '<div class="pm-cookie-actions">' +
    '<button type="button" class="pm-cookie-btn pm-cookie-btn-accept" data-pm-cookie-accept>Entendido</button>' +
    '<a class="pm-cookie-btn pm-cookie-btn-link" href="privacidad.html#cookies">Más info</a>' +
    '</div>';

  banner.querySelector('[data-pm-cookie-accept]').addEventListener('click', function () {
    try { localStorage.setItem(KEY, 'accepted'); } catch (e) {}
    banner.remove();
  });
  document.body.appendChild(banner);
})();
