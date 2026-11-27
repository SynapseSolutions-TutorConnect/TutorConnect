/* TC-46: iconos decorativos; las etiquetas y permisos siguen en el HTML/sesion.js. */
document.addEventListener('DOMContentLoaded', () => {
  const rutas = {
    'panel.html': 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
    'buscar.html': 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    'solicitudes.html': 'M8 3h8v4H8zM8 5H5v16h14V5h-3M8 11h8M8 16h5',
    'postulacion.html': 'm2 8 10-5 10 5-10 5zM6 10v7c4 3 8 3 12 0v-7M22 8v8',
    'agenda.html': 'M4 5h16v16H4zM8 3v4M16 3v4M4 10h16M8 14h2M14 14h2M8 17h2',
    'admin.html': 'M4 21V11h4v10M10 21V3h4v18M16 21V7h4v14',
    'perfil.html': 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2'
  };
  const actual = location.pathname.split('/').pop();
  document.querySelectorAll('header nav, .t24-inferior, .navegacion-movil, .navegacion-movil-panel').forEach(nav => {
    nav.classList.add('t28-navegacion');
    if (!nav.hasAttribute('aria-label')) nav.setAttribute('aria-label', 'Navegación principal');
    nav.querySelectorAll('a[href]').forEach(enlace => {
      const destino = new URL(enlace.href, location.href).pathname.split('/').pop();
      if (!rutas[destino]) return;
      enlace.classList.add('t28-enlace');
      if (destino === actual) enlace.setAttribute('aria-current', 'page');
      else enlace.removeAttribute('aria-current');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.classList.add('t28-icono');
      const path = document.createElementNS(svg.namespaceURI, 'path');
      path.setAttribute('d', rutas[destino]);
      svg.append(path);
      const texto = document.createElement('span');
      texto.textContent = enlace.textContent.trim();
      enlace.replaceChildren(svg, texto);
    });
  });
});
