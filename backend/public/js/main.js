// ============================================
// main.js — lógica del frontend
// ============================================

// Cerrar modal al hacer clic fuera de él
document.addEventListener('click', (e) => {
  const modal = document.getElementById('modal-agregar');
  if (modal && e.target === modal) {
    modal.classList.remove('open');
  }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('modal-agregar');
    if (modal) modal.classList.remove('open');
  }
});

// Mostrar mensaje de error si viene en la URL (?error=...)
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const error  = params.get('error');

  if (error) {
    const mensajes = {
      sin_stock: 'Este producto no tiene stock disponible.',
      campos:    'Por favor completa todos los campos requeridos.',
      servidor:  'Ocurrió un error en el servidor. Intenta de nuevo.'
    };
    const texto = mensajes[error] || 'Ocurrió un error inesperado.';
    mostrarToast(texto, 'error');

    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url);
  }
});

// Toast de notificación
function mostrarToast(mensaje, tipo = 'error') {
  const anterior = document.getElementById('toast');
  if (anterior) anterior.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = mensaje;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 32px;
    background: ${tipo === 'error' ? '#c0392b' : '#2e9e6b'};
    color: #fff;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-family: Arial, sans-serif;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    max-width: 300px;
    animation: fadeIn 0.3s ease;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Confirmación antes de comprar
document.addEventListener('DOMContentLoaded', () => {
  const formComprar = document.querySelector('form[action="/carrito/comprar"]');
  if (formComprar) {
    formComprar.addEventListener('submit', (e) => {
      const ok = confirm('¿Confirmas la compra?');
      if (!ok) e.preventDefault();
    });
  }
});