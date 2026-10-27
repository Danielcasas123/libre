const form = document.getElementById('searchForm');
const input = document.getElementById('query');
const toast = document.getElementById('toast');
const statusText = document.getElementById('statusText');
const statusDot = document.querySelector('.status-dot');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) { input.focus(); return; }
  await window.inova.search(value);
});
document.querySelectorAll('[data-url]').forEach(button => {
  button.addEventListener('click', () => window.inova.openUrl(button.dataset.url));
});
document.getElementById('homeBtn').addEventListener('click', () => {
  input.value = '';
  input.focus();
});
document.getElementById('searchBtn').addEventListener('click', () => input.focus());
window.inova.browserStatus().then(ready => {
  if (ready) {
    statusText.textContent = 'LibreWolf incluido';
    statusDot.classList.add('ready');
  } else {
    statusText.textContent = 'Navegador no preparado';
    showToast('Para incluir LibreWolf, genera el instalador con el flujo de GitHub Actions.');
  }
});
window.inova.onBrowserMissing(() => showToast('No se encontró LibreWolf. Vuelve a generar el instalador desde GitHub Actions.'));
window.inova.onBrowserError(() => showToast('No se pudo iniciar LibreWolf. Comprueba el paquete del navegador.'));
