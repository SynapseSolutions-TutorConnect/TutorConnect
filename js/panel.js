// =====================================================================
// js/panel.js · Panel principal según el rol (T11 · TC-14 · SCR-002)
// Requiere: js/supabase.js (db, mostrarError) y js/sesion.js
// (iniciarPaginaProtegida, usuarioActual, cerrarSesion).
// La revisión de sesión, el rol, los vencimientos, el menú y el botón
// «Cerrar sesión» los hace sesion.js; aquí solo se pinta el panel.
// =====================================================================

// Accesos que ve cada tipo de usuario (cap. 13.2 y 13.7)
const ACCESOS = {
  Estudiante: [
    { titulo: 'Agendar nueva asesoría', url: 'buscar.html' },
    { titulo: 'Mis citas', url: 'solicitudes.html' },
    { titulo: 'Postularme como tutor', url: 'postulacion.html' },
  ],
  Profesor: [
    { titulo: 'Postular materia', url: 'postulacion.html' },
  ],
  Asesor: [ // se agrega a Estudiante o Profesor con al menos una materia Aprobada
    { titulo: 'Mi agenda', url: 'agenda.html' },
    { titulo: 'Solicitudes recibidas', url: 'solicitudes.html' },
  ],
  Coordinador: [
    { titulo: 'Catálogo de materias', url: 'admin.html' },
    { titulo: 'Postulaciones de asesores', url: 'admin.html' },
    { titulo: 'Reporte del servicio', url: 'admin.html' },
  ],
};

// Estilos del diseño de Carlos: el primer acceso es el principal
const CLASE_PRINCIPAL = 'w-full bg-[#1B396A] hover:bg-[#13274A] text-white text-center font-semibold py-2.5 rounded-lg shadow-sm transition text-sm';
const CLASE_SECUNDARIA = 'w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-center font-semibold py-2.5 rounded-lg shadow-sm transition text-sm';

// Escapa texto que viene de la base de datos antes de meterlo en HTML
function seguro(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

// Iniciales para el círculo de la cabecera («Laura Gómez» → «LG»)
function iniciales(nombre) {
  return nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// ¿Tiene al menos una materia aprobada para asesorar? (RN-02)
// La vista v_postulaciones ya devuelve solo las postulaciones del usuario.
async function tieneMateriaAprobada() {
  const { data, error } = await db
    .from('v_postulaciones')
    .select('id_asesor_materia')
    .eq('estado_autorizacion', 'Aprobada')
    .limit(1);
  return !error && data.length > 0;
}

// Los bloques duran siempre 1 hora (RN-03): «15:00:00» → «16:00»
function horaFin(horaInicio) {
  const [h, m] = horaInicio.split(':').map(Number);
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function pintarAccesos(lista) {
  document.getElementById('accesos').innerHTML = lista.map((a, i) =>
    `<a href="${a.url}" class="${i === 0 ? CLASE_PRINCIPAL : CLASE_SECUNDARIA}">${a.titulo}</a>`
  ).join('');
}

// Citas aceptadas de las próximas 24 h (vista v_mis_citas, columna es_proxima)
let cargandoProximas = false;

async function pintarProximasCitas() {
  const contenedor = document.getElementById('proximas');
  if (!contenedor || cargandoProximas) return;

  cargandoProximas = true;
  contenedor.setAttribute('aria-busy', 'true');

  const skeleton = `
    <div aria-hidden="true"
         class="bg-white p-6 rounded-xl border border-slate-200
                shadow-sm animate-pulse space-y-4">
      <div class="h-4 w-24 rounded bg-slate-200"></div>
      <div class="h-5 w-3/4 rounded bg-slate-200"></div>
      <div class="h-4 w-full rounded bg-slate-200"></div>
      <div class="h-11 w-full rounded-lg bg-slate-200"></div>
    </div>
  `;

  contenedor.innerHTML = `
    <p role="status" class="text-sm text-slate-600">
      Cargando próximas citas…
    </p>
    ${skeleton.repeat(3)}
  `;

  try {
    const { data, error } = await db
      .from('v_mis_citas')
      .select(
        'nombre_materia, fecha, hora_inicio, modalidad, ' +
        'ubicacion_presencial, url_videollamada, estudiante, asesor, mi_papel'
      )
      .eq('es_proxima', true)
      .order('fecha')
      .order('hora_inicio');

    if (error) throw error;

    const citas = data ?? [];

    if (citas.length === 0) {
      contenedor.innerHTML = `
        <div class="bg-white p-6 rounded-xl border
                    border-slate-200 shadow-sm">
          <p role="status" class="text-sm text-slate-600">
            No tienes citas en las próximas 24 horas.
          </p>
        </div>
      `;
      return;
    }

    // Construye las tarjetas antes de reemplazar el contenido.
    const tarjetas = document.createDocumentFragment();

    citas.forEach(cita => {
      const tarjeta = document.createElement('article');
      tarjeta.className =
        'bg-white p-6 rounded-xl border border-slate-200 ' +
        'border-l-4 border-l-emerald-500 shadow-sm space-y-3';

      const estado = document.createElement('span');
      estado.className =
        'inline-block bg-emerald-100 text-emerald-800 ' +
        'text-xs font-bold px-2 py-1 rounded';
      estado.textContent = 'Confirmada';

      const titulo = document.createElement('h3');
      titulo.className = 'text-base font-bold text-slate-900';
      titulo.textContent = cita.nombre_materia;

      const persona = document.createElement('p');
      persona.className = 'text-sm text-slate-600';
      persona.textContent = cita.mi_papel === 'Estudiante'
        ? `Asesor: ${cita.asesor}`
        : `Estudiante: ${cita.estudiante}`;

      const horario = document.createElement('p');
      horario.className = 'text-sm text-slate-600';
      horario.textContent =
        `${cita.fecha} · ${cita.hora_inicio.slice(0, 5)} - ` +
        `${horaFin(cita.hora_inicio)} · ${cita.modalidad}`;

      tarjeta.append(estado, titulo, persona, horario);

      if (cita.modalidad === 'Virtual') {
        let urlValida = null;

        try {
          const url = new URL(cita.url_videollamada);
          if (['https:', 'http:'].includes(url.protocol)) {
            urlValida = url.href;
          }
        } catch {
          // La tarjeta mostrará que el enlace no está disponible.
        }

        if (urlValida) {
          const enlace = document.createElement('a');
          enlace.href = urlValida;
          enlace.target = '_blank';
          enlace.rel = 'noopener noreferrer';
          enlace.className =
            'inline-flex items-center justify-center w-full min-h-11 ' +
            'px-4 py-3 bg-[#1B396A] text-white text-sm font-semibold ' +
            'rounded-lg hover:bg-[#13274A]';
          enlace.textContent = 'Unirse a la videollamada';
          tarjeta.appendChild(enlace);
        } else {
          const aviso = document.createElement('p');
          aviso.className = 'text-sm text-slate-600';
          aviso.textContent = 'Enlace de videollamada no disponible.';
          tarjeta.appendChild(aviso);
        }
      } else {
        const ubicacion = document.createElement('p');
        ubicacion.className = 'text-sm text-slate-600';
        ubicacion.textContent =
          cita.ubicacion_presencial || 'Ubicación no registrada.';
        tarjeta.appendChild(ubicacion);
      }

      tarjetas.appendChild(tarjeta);
    });

    contenedor.replaceChildren(tarjetas);
  } catch (error) {
    const detalle = error?.message || 'Error desconocido';
    const falloDeRed =
      !navigator.onLine ||
      /failed to fetch|networkerror|network request failed|load failed/i.test(detalle);

    contenedor.innerHTML = `
      <div class="rounded-xl border border-red-300 bg-red-50 p-5">
        <div role="alert">
          <h3 class="font-semibold text-red-800">
            No se pudieron cargar las próximas citas
          </h3>
          <p id="error-proximas-mensaje"
             class="mt-2 text-sm text-red-700"></p>
        </div>
        <button id="reintentar-proximas" type="button"
                class="mt-4 min-h-11 rounded-lg bg-[#1B396A]
                       px-5 py-3 font-semibold text-white">
          Reintentar
        </button>
      </div>
    `;

    document.getElementById('error-proximas-mensaje').textContent =
      falloDeRed
        ? 'No pudimos conectar con el servidor. Revisa tu conexión y pulsa Reintentar.'
        : detalle;

    document.getElementById('reintentar-proximas')
      .addEventListener('click', pintarProximasCitas);
  } finally {
    cargandoProximas = false;
    contenedor.setAttribute('aria-busy', 'false');
  }
}

async function cargarPanel() {
  // Sesión, rol, vencimientos, menú y botón «Cerrar sesión» (sesion.js)
  const perfil = await iniciarPaginaProtegida();
  if (!perfil) return;

  const nombre = perfil.nombre_completo;
  document.getElementById('saludo').textContent = `Hola, ${nombre.split(' ')[0]}.`;
  const avatar = document.getElementById('avatar-iniciales');
  avatar.textContent = iniciales(nombre);
  avatar.title = nombre;

  let accesos = [...ACCESOS[perfil.rol]];
  let rolMostrado = perfil.rol;

  if (perfil.rol !== 'Coordinador' && await tieneMateriaAprobada()) {
    accesos = accesos.concat(ACCESOS.Asesor);
    rolMostrado += ' • Asesor autorizado';
  }

  document.getElementById('rol-texto').textContent = rolMostrado;
  pintarAccesos(accesos);

  // El coordinador no reserva ni imparte asesorías (cap. 13.2)
  if (perfil.rol === 'Coordinador') {
    document.getElementById('seccion-proximas').classList.add('hidden');
  } else {
    await pintarProximasCitas();
  }
}

document.addEventListener('DOMContentLoaded', cargarPanel);

document.addEventListener('DOMContentLoaded', () => {
  const campana = document.getElementById('btn-campana');
  const titulo = document.getElementById('titulo-notificaciones');
  const botonMenu = document.getElementById('btn-menu-panel');
  const menu = document.getElementById('menu-panel-movil');

  if (typeof iniciarCampana !== 'function') campana?.addEventListener('click', () => {
    titulo?.scrollIntoView({ block: 'center' });
    titulo?.focus({ preventScroll: true });
  });

  if (!botonMenu || !menu) return;

  function cerrarMenu(devolverFoco = false) {
    menu.classList.add('hidden');
    botonMenu.setAttribute('aria-expanded', 'false');
    botonMenu.setAttribute('aria-label', 'Abrir menú');
    if (devolverFoco) botonMenu.focus();
  }

  botonMenu.addEventListener('click', () => {
    const abrir = botonMenu.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('hidden', !abrir);
    botonMenu.setAttribute('aria-expanded', String(abrir));
    botonMenu.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
  });

  document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' &&
        botonMenu.getAttribute('aria-expanded') === 'true') {
      cerrarMenu(true);
    }
  });

  window.matchMedia('(min-width: 768px)')
    .addEventListener('change', evento => {
      if (evento.matches) cerrarMenu();
    });
});
