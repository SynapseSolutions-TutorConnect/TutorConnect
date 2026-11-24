/* T24: utilidades de interfaz, cargadas solamente por el lote de cuatro páginas. */
window.T24 = (() => {
  const estados = new Map();
  const botones = new WeakMap();
  const porId = id => document.getElementById(id);
  const red = e => !navigator.onLine || /fetch|network|connection|conectar/i.test(e?.message || String(e));
  const skeleton = '<div class="t24-skeleton" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';
  function crearEstado(key, selector) {
    if (estados.has(key)) return estados.get(key);
    const destino = document.querySelector(selector);
    if (!destino) throw new Error('No existe el contenedor ' + selector);
    const caja = document.createElement('section');
    caja.className = 't24-estado';
    caja.innerHTML = '<div data-carga role="status" hidden><p>Cargando…</p><div class="t24-skeletons">' + skeleton.repeat(3) + '</div></div><div data-error hidden class="t24-aviso"><p role="alert"></p><button type="button">Reintentar</button></div>';
    destino.before(caja);
    const estado = { caja, carga:caja.querySelector('[data-carga]'), error:caja.querySelector('[data-error]'), turno:0 };
    estados.set(key,estado);
    return estado;
  }
  async function lectura(key, selector, targets, tarea, reintentar) {
    const e = crearEstado(key, selector);
    const turno = ++e.turno;
    const boton = e.error.querySelector('button');
    const teniaFoco = document.activeElement === boton;
    boton.onclick = reintentar;
    const elementos = targets.flatMap(s => [...document.querySelectorAll(s)]);
    elementos.forEach(n => n.classList.add('t24-oculto-estado'));
    e.carga.hidden = false; e.error.hidden = true; boton.disabled = true;
    try {
      await tarea({actual:()=>turno === e.turno});
      if (turno !== e.turno) return false;
      elementos.forEach(n => n.classList.remove('t24-oculto-estado'));
      if (teniaFoco) { e.caja.tabIndex=-1; e.caja.focus(); }
      return true;
    } catch (err) {
      if (turno !== e.turno) return false;
      e.error.querySelector('p').textContent = red(err)
        ? 'Error de conexión. Revisa tu conexión y pulsa Reintentar.'
        : (err?.message || 'No se pudo completar la consulta.');
      e.error.hidden = false;
      return false;
    } finally {
      if (turno === e.turno) {
        e.carga.hidden = true; boton.disabled = false;
        if (teniaFoco && !e.error.hidden) boton.focus();
      }
    }
  }
  function cargando(boton, activo) {
    if (!boton) return;
    if (activo) {
      if (!botones.has(boton)) botones.set(boton,{html:boton.innerHTML,disabled:boton.disabled});
      boton.disabled=true; boton.setAttribute('aria-busy','true');
      boton.innerHTML='<span class="t24-spinner" aria-hidden="true"></span> Procesando…';
    } else {
      const previo=botones.get(boton);
      if (previo) { boton.innerHTML=previo.html; boton.disabled=previo.disabled; botones.delete(boton); }
      boton.removeAttribute('aria-busy');
    }
  }
  let temporizador;
  function exito(mensaje) {
    let toast=porId('t24-toast');
    if (!toast) {toast=document.createElement('div');toast.id='t24-toast';toast.setAttribute('role','status');document.body.append(toast);}
    clearTimeout(temporizador);toast.textContent=mensaje;toast.hidden=false;
    temporizador=setTimeout(()=>{toast.hidden=true},3000);
  }
  // Los errores de escrituras no se reenvían automáticamente: Reintentar solo consulta.
  function error(mensaje) {
    let aviso=porId('t24-error-accion');
    if (!aviso) {
      aviso=document.createElement('section');aviso.id='t24-error-accion';aviso.className='t24-aviso';
      aviso.innerHTML='<p role="alert"></p><button type="button">Reintentar conexión</button>';
    }
    const modal=[...document.querySelectorAll('[id^="modal-"]')].find(n=>!n.classList.contains('hidden') && n.classList.contains('fixed'));
    const destino=modal?.firstElementChild || document.querySelector('main') || porId('seccion-login').parentElement;
    destino.prepend(aviso);
    aviso.querySelector('p').textContent=String(mensaje || 'No se pudo completar la operación.');
    aviso.hidden=false;
    const boton=aviso.querySelector('button');
    boton.hidden=!red({message:mensaje});
    boton.onclick=async()=>{
      cargando(boton,true);
      try {
        const r=await db.from('carrera').select('id_carrera').limit(1);
        if(r.error) throw r.error;
        aviso.querySelector('p').textContent='Conexión recuperada. Comprueba el estado de la operación antes de volver a enviarla.';
        boton.hidden=true;
      } catch(e) {aviso.querySelector('p').textContent=red(e)?'No se pudo recuperar la conexión. Vuelve a intentarlo.':e.message;}
      finally{cargando(boton,false);}
    };
  }
  // Accesibilidad de los modales existentes: foco, Escape, Tab y fondo inerte.
  function modales() {
    let ultimoExterior=document.activeElement;
    document.addEventListener('focusin',event=>{
      if(!event.target.closest('[id^="modal-"].fixed')) ultimoExterior=event.target;
    });
    document.querySelectorAll('[id^="modal-"].fixed').forEach(modal=>{
      const titulo=modal.querySelector('h2,h3');
      if(titulo){if(!titulo.id) titulo.id=modal.id+'-titulo-a11y';modal.setAttribute('aria-labelledby',titulo.id);}
      modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.tabIndex=-1;
      let abierto=false, origen=null, fondo=[];
      const controles=()=>[...modal.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')].filter(n=>!n.disabled && n.tabIndex>=0 && n.getClientRects().length);
      const seguro=()=>modal.querySelector('[id*="cancelar"],[id^="btn-no-"]');
      function sincronizar(){
        const visible=!modal.classList.contains('hidden');
        if(visible===abierto) return;
        abierto=visible;
        if(visible){
          origen=modal.contains(document.activeElement)?ultimoExterior:document.activeElement;
          fondo=[...document.body.children].filter(n=>n!==modal && !n.contains(modal) && n.tagName!=='SCRIPT').map(n=>[n,n.inert]);
          fondo.forEach(([n])=>n.inert=true);
          (seguro() || controles()[0] || modal).focus();
        } else {
          fondo.forEach(([n,valor])=>n.inert=valor);fondo=[];
          if(origen?.isConnected) origen.focus();
        }
      }
      new MutationObserver(sincronizar).observe(modal,{attributes:true,attributeFilter:['class']});
      modal.addEventListener('keydown',event=>{
        if(event.key==='Escape') {
          event.preventDefault();
          if(!modal.querySelector('[aria-busy="true"]')) seguro()?.click();
        }
        if(event.key==='Tab') {
          const c=controles();
          if(!c.length){event.preventDefault();modal.focus();return;}
          if(event.shiftKey && (document.activeElement===c[0] || !c.includes(document.activeElement))){event.preventDefault();c.at(-1).focus();}
          else if(!event.shiftKey && (document.activeElement===c.at(-1) || !c.includes(document.activeElement))){event.preventDefault();c[0].focus();}
        }
      });
    });
    const campana=porId('btn-campana');
    if(campana && typeof iniciarCampana !== 'function') campana.addEventListener('click',()=>location.assign('panel.html'));
  }
  document.addEventListener('DOMContentLoaded',modales);
  return {lectura,cargando,error,exito,red};
})();
mostrarCargando=T24.cargando;
mostrarError=T24.error;
mostrarExito=T24.exito;

if(document.body.classList.contains("t24-index")){
cargarCarreras = async function cargarCarreras() {
 return T24.lectura('cargarCarreras', "#reg-carrera", [], async op => {
  const select = document.getElementById('reg-carrera');
  const { data, error } = await db
    .from('carrera')
    .select('id_carrera, nombre_carrera')
    .order('nombre_carrera');

  if (!op.actual()) return;
  if (error) throw error;
  const anterior = select.value;
  select.innerHTML = '';
  select.add(new Option(data.length ? 'Selecciona tu carrera' : 'No hay carreras disponibles', ''));
  data.forEach((c) => {
    const opcion = document.createElement('option');
    opcion.value = c.id_carrera;
    opcion.textContent = c.nombre_carrera;
    select.appendChild(opcion);
  });
  if ([...select.options].some(o=>o.value===anterior)) select.value=anterior;
 }, () => cargarCarreras());
};
iniciarSesion=async function iniciarSesion(evento){
  evento.preventDefault();
  mostrarErrorLogin('');

  const correo = document.getElementById('login-correo').value.trim();
  const password = document.getElementById('login-password').value;
  const boton = document.getElementById('btn-login');

  if (!correo || !password) {
    mostrarErrorLogin('Escribe tu correo y tu contraseña.');
    return;
  }
  if (!esCorreoInstitucional(correo)) {
    mostrarErrorLogin(MSG_DOMINIO);
    return;
  }

  T24.cargando(boton, true);
  try {
    const { error } = await db.auth.signInWithPassword({ email: correo, password });
    if (error) {
      if (T24.red(error)) throw error;
      // Credenciales sin revelar si existe la cuenta.
      mostrarErrorLogin(MSG_CREDENCIALES);
      return;
    }
    window.location.href = 'panel.html';
  } catch (e) {
    mostrarErrorLogin('No se pudo conectar. Revisa tu internet.');
    T24.error('No se pudo conectar. Revisa tu internet.');
  } finally {
    T24.cargando(boton, false);
  }
};
}
if(document.body.classList.contains("t24-admin") || document.body.classList.contains("t24-postulacion")){
cargarCarrerasCatalogo = async function cargarCarrerasCatalogo() {
 return T24.lectura('cargarCarrerasCatalogo', "#filtro-carrera", [], async op => {
  const { data, error } = await db
    .from('carrera')
    .select('id_carrera, nombre_carrera')
    .order('nombre_carrera');

  if (!op.actual()) return;
  if (error) throw error;

  const filtro = document.getElementById('filtro-carrera');
  const modal = document.getElementById('materia-carrera');
  const anterior = filtro.value;
  filtro.innerHTML = '<option value="">Todas las carreras</option>';
  modal.innerHTML = '<option value="">Selecciona una carrera</option>';

  data.forEach((c) => {
    filtro.add(new Option(c.nombre_carrera, c.id_carrera));
    modal.add(new Option(c.nombre_carrera, c.id_carrera));
  });
  if ([...filtro.options].some(o=>o.value===anterior)) filtro.value=anterior;
 }, () => cargarCarrerasCatalogo());
};
listarMaterias = async function listarMaterias() {
 return T24.lectura('listarMaterias', "#tabla-materias-region", ["#tabla-materias-region","#catalogo-vacio","#catalogo-sin-resultados"], async op => {
  const { data, error } = await db
    .from('materia')
    .select('id_materia, nombre_materia, estado_activo, id_carrera, carrera(nombre_carrera)')
    .order('nombre_materia');

  if (!op.actual()) return;
  if (error) throw error;
  materias = data;
  pintarTabla();
 }, () => listarMaterias());
};
listarPostulacionesPendientes = async function listarPostulacionesPendientes() {
 return T24.lectura('listarPostulacionesPendientes', "#tabla-postulaciones-admin-region", ["#tabla-postulaciones-admin-region","#postulaciones-admin-vacio"], async op => {
  const { data, error } = await db
    .from('v_postulaciones')
    .select('*')
    .order('fecha_solicitud', { ascending: false });

  if (!op.actual()) return;
  if (error) throw error;
  postulacionesAdmin = data || [];

  const totalPendientes = postulacionesAdmin.filter((p) => p.estado_autorizacion === 'Pendiente').length;
  const contador = document.getElementById('contador-pendientes');
  if (contador) contador.textContent = totalPendientes;

  pintarTablaPostulacionesAdmin();
 }, () => listarPostulacionesPendientes());
};
listarMisPostulaciones = async function listarMisPostulaciones() {
 return T24.lectura('listarMisPostulaciones', "#tabla-mis-postulaciones-region", ["#tabla-mis-postulaciones-region","#postulaciones-vacio"], async op => {
  const { data, error } = await db
    .from('v_postulaciones')
    .select('*')
    .order('fecha_solicitud', { ascending: false });

  if (!op.actual()) return;
  if (error) throw error;
  misPostulaciones = data || [];

  const tbody = document.getElementById('tabla-mis-postulaciones');
  const vacio = document.getElementById('postulaciones-vacio');
  if (!tbody) return;

  tbody.innerHTML = '';
  vacio.classList.toggle('hidden', misPostulaciones.length > 0);

  misPostulaciones.forEach((p) => {
    const fila = document.createElement('tr');
    fila.className = 'hover:bg-slate-50 transition';

    const dictamenTexto = p.fecha_dictamen
      ? formatearFecha(p.fecha_dictamen)
      : '<span class="text-slate-400 italic">En revisión</span>';

    fila.innerHTML = `
      <td class="px-5 py-4 font-semibold text-slate-900"></td>
      <td class="px-5 py-4 text-slate-500">${formatearFecha(p.fecha_solicitud)}</td>
      <td class="px-5 py-4">${badgeEstadoPostulacion(p.estado_autorizacion)}</td>
      <td class="px-5 py-4 text-slate-500">${dictamenTexto}</td>`;
    fila.children[0].textContent = p.nombre_materia;

    tbody.appendChild(fila);
  });
 }, () => listarMisPostulaciones());
};
cargarSelectMateriasPostulacion = async function cargarSelectMateriasPostulacion() {
 return T24.lectura('cargarSelectMateriasPostulacion', "#select-materia", [], async op => {
  const select = document.getElementById('select-materia');
  if (!select) return;

  const { data, error } = await db
    .from('materia')
    .select('id_materia, nombre_materia, carrera(nombre_carrera)')
    .eq('estado_activo', true)
    .order('nombre_materia');

  if (!op.actual()) return;
  if (error) throw error;

  const yaPostuladas = new Set(misPostulaciones.map((p) => Number(p.id_materia)));
  const anterior = select.value;
  select.innerHTML = '<option value="" disabled selected>-- Elige una materia activa --</option>';

  data.forEach((m) => {
    const carreraTexto = m.carrera ? ` (${m.carrera.nombre_carrera})` : '';
    const postulada = yaPostuladas.has(Number(m.id_materia));
    const etiqueta = `${m.nombre_materia}${carreraTexto}${postulada ? ' — Ya postulada' : ''}`;
    const opcion = new Option(etiqueta, m.id_materia);
    opcion.disabled = postulada;
    select.add(opcion);
  });
  if ([...select.options].some(o=>o.value===anterior && !o.disabled)) select.value=anterior;
  if(![...select.options].some(o=>o.value && !o.disabled)) {
    select.options[0].textContent='No hay materias disponibles para postularte';
    select.value='';
  }
 }, () => cargarSelectMateriasPostulacion());
};
}
if(document.body.classList.contains("t24-solicitudes")){
listarMisCitas = async function listarMisCitas() {
 return T24.lectura('listarMisCitas', "#est-resultados", ["#est-resultados"], async op => {
  const { data, error } = await db
    .from('v_mis_citas')
    .select('*')
    .eq('mi_papel', 'Estudiante')
    .order('fecha')
    .order('hora_inicio');

  if (!op.actual()) return;
  if (error) throw error;

  const grupos = {
    pendiente: data.filter((c) => c.estado === 'Pendiente'),
    proxima: data.filter((c) => c.estado === 'Aceptada' && esFutura(c)),
  };
  grupos.historial = data.filter((c) => !grupos.pendiente.includes(c) && !grupos.proxima.includes(c));

  const paneles = { pendiente: 'est-pendientes', proxima: 'est-proximas', historial: 'est-historial' };
  const vacios = {
    pendiente: 'No tienes solicitudes pendientes',
    proxima: 'No tienes citas próximas',
    historial: 'Tu historial está vacío',
  };

  Object.keys(paneles).forEach((tipo) => {
    const panel = document.getElementById(paneles[tipo]);
    panel.innerHTML = '';
    if (!grupos[tipo].length) panel.appendChild(pestanaVacia(vacios[tipo]));
    grupos[tipo].forEach((c) => panel.appendChild(tarjetaCita(c, 'Estudiante', tipo)));
    document.getElementById(`contador-${paneles[tipo]}`).textContent = grupos[tipo].length;
  });

  // Estado vacío general: sin ninguna asesoría
  document.getElementById('est-vacio').classList.toggle('hidden', data.length > 0);
 }, () => listarMisCitas());
};
listarPendientesAsesor = async function listarPendientesAsesor() {
 return T24.lectura('listarPendientesAsesor', "#lista-pendientes", ["#lista-pendientes","#pendientes-vacio"], async op => {
  const lista = document.getElementById('lista-pendientes');

  const { data, error } = await db
    .from('v_mis_citas')
    .select('*')
    .eq('mi_papel', 'Asesor')
    .eq('estado', 'Pendiente')
    .order('fecha')
    .order('hora_inicio');

  if (!op.actual()) return;
  if (error) throw error;

  pendientes = data;
  document.getElementById('contador-pendientes').textContent = data.length;
  pintarPendientes();
 }, () => listarPendientesAsesor());
};
listarProximasAsesor = async function listarProximasAsesor() {
 return T24.lectura('listarProximasAsesor', "#lista-proximas-asesor", ["#lista-proximas-asesor"], async op => {
  const lista = document.getElementById('lista-proximas-asesor');
  const { data, error } = await db
    .from('v_mis_citas')
    .select('*')
    .eq('mi_papel', 'Asesor')
    .eq('estado', 'Aceptada')
    .order('fecha')
    .order('hora_inicio');

  if (!op.actual()) return;
  if (error) throw error;

  const proximas = data.filter(esFutura);
  lista.innerHTML = '';
  if (!proximas.length) lista.appendChild(pestanaVacia('No tienes citas próximas'));
  proximas.forEach((c) => lista.appendChild(tarjetaCita(c, 'Asesor', 'proxima')));
  document.getElementById('contador-proximas-asesor').textContent = proximas.length;
 }, () => listarProximasAsesor());
};
const tarjetaOriginal=tarjetaCita;
function plegar(tarjeta){
  const datos=tarjeta.firstElementChild;
  if(!datos || datos.querySelector('details')) return tarjeta;
  const detalle=document.createElement('details');
  detalle.open=matchMedia('(min-width:768px)').matches;
  const resumen=document.createElement('summary');resumen.textContent='Horario y detalles';detalle.append(resumen);
  [...datos.children].slice(1).forEach(n=>detalle.append(n));datos.append(detalle);
  return tarjeta;
}
tarjetaCita=function(...args){return plegar(tarjetaOriginal(...args));};
const pendientesOriginal=pintarPendientes;
pintarPendientes=function(){pendientesOriginal();document.querySelectorAll('#lista-pendientes > div').forEach(plegar);};
}
const t24Operaciones = new Set();
function t24Proteger(nombre){
  const original=window[nombre];if(typeof original!=='function') return;
  window[nombre]=async function(...args){
    args[0]?.preventDefault?.();
    if(t24Operaciones.has(nombre))return;
    t24Operaciones.add(nombre);
    try{return await original(...args);}catch(e){T24.error(e?.message || 'No se pudo conectar.');}
    finally{t24Operaciones.delete(nombre);}
  };
}
if(document.body.classList.contains('t24-index')) ['iniciarSesion','registrarUsuario'].forEach(t24Proteger);
if(document.body.classList.contains('t24-admin') || document.body.classList.contains('t24-postulacion')) ['guardarMateria','cambiarEstadoMateria','postular','dictaminar'].forEach(t24Proteger);
if(document.body.classList.contains('t24-solicitudes')) ['aceptarSolicitud','rechazarSolicitud','cancelarCita','retirarSolicitud'].forEach(t24Proteger);
window.t24Recargar = async function(){
  if(document.body.classList.contains('t24-index'))return cargarCarreras();
  if(document.body.classList.contains('t24-postulacion')){await listarMisPostulaciones();return cargarSelectMateriasPostulacion();}
  if(document.body.classList.contains('t24-admin')){await cargarCarrerasCatalogo();await listarMaterias();return listarPostulacionesPendientes();}
  return recargarCitas();
};
window.t24Arrancar = async function(roles, iniciar){
  const selector='main > :first-child';
  return T24.lectura('sesion',selector,[],async()=>{
    const usuario=await iniciarPaginaProtegidaConOpciones({conservarSesionEnError:true},...roles);
    if(usuario) await iniciar(usuario);
  },()=>t24Arrancar(roles,iniciar));
};
