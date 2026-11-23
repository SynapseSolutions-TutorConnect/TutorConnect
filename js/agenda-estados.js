// Solo Agenda: reemplaza listarMiAgenda después de cargar franjas.js.
let agendaPeticion = 0;
async function listarMiAgenda() {
  const tbody = document.getElementById('tabla-agenda-body');
  if (!tbody) return;
  const turno = ++agendaPeticion;
  const filtro = filtroActual;
  const tabla = tbody.closest('[role="region"]');
  const vacio = document.getElementById('agenda-vacia');
  const carga = document.getElementById('agenda-carga');
  const aviso = document.getElementById('agenda-error');
  const boton = document.getElementById('agenda-reintentar');
  const recuperarFoco = document.activeElement === boton;
  tabla.classList.add('hidden');
  vacio.classList.add('hidden');
  aviso.classList.add('hidden');
  carga.classList.remove('hidden');
  boton.disabled = true;
  try {
    let query = db.from('v_mi_agenda').select('*').order('fecha').order('hora_inicio');
    if (filtro === 'PROXIMAS') {
      const partes = new Intl.DateTimeFormat('en-US', {timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
      const valor = tipo => partes.find(p => p.type === tipo).value;
      query = query.gte('fecha', valor('year') + '-' + valor('month') + '-' + valor('day'));
    }
    const respuesta = await query;
    if (turno !== agendaPeticion) return;
    if (respuesta.error) throw respuesta.error;
    const data = respuesta.data || [];
    tbody.innerHTML = '';
    if (!data.length) {
      vacio.querySelector('h3').textContent = filtro === 'PROXIMAS'
        ? 'No tienes horarios próximos publicados' : 'Aún no tienes horarios publicados';
      vacio.classList.remove('hidden');
    } else {
  data.forEach(franja => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition';

    const hrInicio = franja.hora_inicio.substring(0, 5);
    const hrFin = String(Number(hrInicio.split(':')[0]) + 1).padStart(2, '0') + ':' + hrInicio.split(':')[1];

    const [y, m, d] = franja.fecha.split('-');
    const fechaFormat = `${d}/${m}/${y}`;

    let badgeClass = '';
    const iconModalidad = franja.modalidad === 'Virtual' ? '💻' : '📍';
    const ubTexto = franja.modalidad === 'Virtual' ? 'Virtual' : franja.ubicacion_presencial;

    switch (franja.estado_franja) {
      case 'Libre': badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'; break;
      case 'Congelado': badgeClass = 'bg-amber-100 text-amber-800 border-amber-200'; break;
      case 'Ocupado': badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'; break;
      case 'Vencido': badgeClass = 'bg-slate-100 text-slate-600 border-slate-200'; break;
    }

    const btnRetirar = franja.estado_franja === 'Libre'
      ? `<button onclick="retirarFranja(${franja.id_disponibilidad})" class="text-rose-600 hover:text-rose-800 font-semibold text-xs transition">Retirar</button>`
      : `<span class="text-slate-400 text-xs cursor-not-allowed">Retirar</span>`;

    tr.innerHTML = `
      <td class="px-5 py-4 font-medium text-slate-900">${fechaFormat}</td>
      <td class="px-5 py-4">${hrInicio} - ${hrFin}</td>
      <td class="px-5 py-4 font-bold text-slate-900">${seguro(franja.nombre_materia)}</td>
      <td class="px-5 py-4">${iconModalidad} <span class="ml-1 truncate max-w-[150px] inline-block align-bottom" title="${seguro(ubTexto)}">${seguro(ubTexto)}</span></td>
      <td class="px-5 py-4">
        <span class="${badgeClass} border px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap">${seguro(franja.estado_franja)}</span>
      </td>
      <td class="px-5 py-4 text-right">${btnRetirar}</td>
    `;
    tbody.appendChild(tr);
  });

      tabla.classList.remove('hidden');
    }
    if (recuperarFoco) {
      const titulo = document.querySelector('main h1');
      titulo.setAttribute('tabindex','-1');
      titulo.focus();
    }
  } catch (error) {
    if (turno !== agendaPeticion) return;
    const detalle = error?.message || 'No se pudo cargar la agenda.';
    const conexion = !navigator.onLine || /failed to fetch|networkerror|network request failed|load failed|fetch failed/i.test(detalle);
    document.getElementById('agenda-error-mensaje').textContent = conexion
      ? 'Error de conexión. Revisa tu conexión y pulsa Reintentar.' : detalle;
    aviso.classList.remove('hidden');
  } finally {
    if (turno === agendaPeticion) {
      carga.classList.add('hidden');
      boton.disabled = false;
      if (recuperarFoco && !aviso.classList.contains('hidden')) boton.focus();
    }
  }
}
