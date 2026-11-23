/* =========================================================
   TutorConnect — js/sesion.js
   Protección de páginas por sesión y por rol.
   Requiere cargar antes js/supabase.js (usa db y ejecutar).

   Uso en cada página protegida (al final del <body>):
     <script>iniciarPaginaProtegida();</script>
   Solo para el coordinador (admin.html):
     <script>iniciarPaginaProtegida('Coordinador');</script>

   Elementos que la página puede tener en su cabecera:
     <span id="nombre-usuario"></span>
     <span id="rol-usuario"></span>
     <button id="btn-cerrar-sesion">Cerrar sesión</button>
   Opciones del menú:
     data-rol="Coordinador"   → solo se ve para ese rol (o varios separados por coma)
     data-asesor              → solo se ve si es asesor aprobado
                                (Publicar disponibilidad, Mi agenda)
   ========================================================= */

// Perfil del usuario con sesión (rol, nombre, correo, matrícula, etc.).
let usuarioActual = null;

/* ---------------------------------------------------------
   obtenerUsuario()
   Revisa la sesión. Sin sesión → manda a index.html.
   Con sesión → lee su perfil de la tabla usuario y lo
   guarda en usuarioActual.
   --------------------------------------------------------- */
async function obtenerUsuario(opciones = {}) {
  const respuestaSesion = await db.auth.getSession();
  if (respuestaSesion.error) throw respuestaSesion.error;
  const session = respuestaSesion.data?.session;

  if (!session) {
    window.location.replace('index.html');
    return null;
  }

  const user = session.user;
  const { data, error } = await db
    .from('usuario')
    .select('*')
    .eq('id_usuario', user.id)
    .single();

  if (error || !data) {
    if (opciones.conservarSesionEnError) {
      usuarioActual = null;
      throw error || new Error('No se encontró el perfil del usuario.');
    }
    // Hay sesión pero no hay perfil: se cierra para evitar estados raros.
    mostrarError(error ? error.message : 'No se encontró el perfil del usuario.');
    await db.auth.signOut();
    window.location.replace('index.html');
    return null;
  }

  usuarioActual = data;
  return usuarioActual;
}

/* ---------------------------------------------------------
   exigirRol(...roles)
   Si el rol del usuario no está en la lista → manda a panel.html.
   Regresa true si sí tiene permiso.
   Ej.: exigirRol('Coordinador')
   --------------------------------------------------------- */
function exigirRol(...roles) {
  if (!usuarioActual || !roles.includes(usuarioActual.rol)) {
    window.location.replace('panel.html');
    return false;
  }
  return true;
}

// Devuelve true si el usuario tiene al menos una materia aprobada como asesor.
// La vista v_postulaciones ya filtra por el usuario con sesión
// (el Coordinador ve todas, por eso a él se le regresa false).
async function esAsesorAprobado(opciones = {}) {
  if (!usuarioActual || usuarioActual.rol === 'Coordinador') return false;
  const { data, error } = await db
    .from('v_postulaciones')
    .select('estado_autorizacion')
    .eq('estado_autorizacion', 'Aprobada')
    .limit(1);

  if (error) { if (opciones.conservarSesionEnError) throw error; mostrarError(error.message); return false; }
  return data.length > 0;
}

/* ---------------------------------------------------------
   pintarCabecera()
   Escribe nombre y rol en la cabecera.
   --------------------------------------------------------- */
function pintarCabecera() {
  const nombre = document.getElementById('nombre-usuario');
  const rol = document.getElementById('rol-usuario');
  if (nombre) nombre.textContent = usuarioActual.nombre_completo;
  if (rol) rol.textContent = usuarioActual.rol;
}

/* ---------------------------------------------------------
   configurarMenu()
   Muestra u oculta opciones según el rol y si es asesor aprobado.
   --------------------------------------------------------- */
async function configurarMenu(opciones = {}) {
  // Opciones limitadas por rol
  document.querySelectorAll('[data-rol]').forEach((el) => {
    const permitidos = el.dataset.rol.split(',').map((r) => r.trim());
    el.classList.toggle('hidden', !permitidos.includes(usuarioActual.rol));
  });

  // Opciones solo para asesores aprobados
  const opcionesAsesor = document.querySelectorAll('[data-asesor]');
  if (opcionesAsesor.length > 0) {
    const aprobado = await esAsesorAprobado(opciones);
    opcionesAsesor.forEach((el) => el.classList.toggle('hidden', !aprobado));
  }
}

/* ---------------------------------------------------------
   cerrarSesion()
   Cierra la sesión y regresa a index.html.
   --------------------------------------------------------- */
async function cerrarSesion() {
  await db.auth.signOut();
  window.location.replace('index.html');
}

/* ---------------------------------------------------------
   iniciarPaginaProtegida(...roles)
   Hace todo en orden al cargar una página protegida:
   sesión → rol → vencimientos → cabecera → menú → cerrar sesión.
   Sin roles = cualquier usuario con sesión puede entrar.
   --------------------------------------------------------- */
async function iniciarPaginaProtegida(...roles) {
  return iniciarPaginaProtegidaConOpciones({}, ...roles);
}

// Perfil utiliza este modo para mostrar Reintentar sin cerrar sesión.
async function iniciarPaginaProtegidaConOpciones(opciones, ...roles) {
  const usuario = await obtenerUsuario(opciones);
  if (!usuario) return null;

  if (roles.length > 0 && !exigirRol(...roles)) return null;

  // T23 · TC-24 · RF-007 / RN-05 / RN-09: vencimientos automáticos.
  // Se ejecuta ANTES de que la página consulte cualquier vista, para que los
  // estados mostrados estén al día: Pendiente a 24 h o menos -> Caducada (libera
  // la franja y notifica a ambos) y Aceptada sin cerrar 48 h después -> Sin registro.
  // Lo usan panel.html, buscar.html, agenda.html y solicitudes.html (todas llaman
  // a iniciarPaginaProtegida() antes de sus consultas). Las operaciones
  // solicitar_asesoria, resolver_solicitud, cancelar_asesoria y marcar_resultado
  // también ejecutan PERFORM procesar_vencimientos() al inicio (sql/esquema.sql).
  // Permiso: GRANT EXECUTE ON FUNCTION procesar_vencimientos() TO authenticated.
  await ejecutar('procesar_vencimientos');

  pintarCabecera();
  await configurarMenu(opciones);

  // T21: avisos reales de qa, después del procesamiento de vencimientos.
  if (typeof iniciarCampana === 'function') await iniciarCampana();

  const btnSalir = document.getElementById('btn-cerrar-sesion');
  if (btnSalir) btnSalir.addEventListener('click', cerrarSesion);

  return usuarioActual;
}
