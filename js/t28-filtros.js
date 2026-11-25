// =====================================================================
// js/t28-filtros.js · T28 · TC-48 · Tarjetas menos saturadas y filtro
// Observación del profesor (revisión 24/11/2026): «las tarjetas están muy
// saturadas» y «se puede implementar un filtro».
//
// 1. Tarjetas del estudiante (tarjetaCita): solo lo esencial a la vista
//    (estado, materia, asesor/estudiante, fecha y hora, acción). La
//    ubicación o el enlace pasan a «Ver detalle».
// 2. Filtro por mes, estado y materia (la materia se escribe y se
//    busca por coincidencia, sin importar mayúsculas ni acentos) en:
//      - Estudiante: Completadas e Historial (más reciente primero).
//      - Asesor: Completadas.
//    Por defecto muestra el mes más reciente, para no cargar todo el
//    historial de golpe. Filtra en el navegador; no consulta la BD.
//
// Se carga después de js/solicitudes.js, js/t24-cuatro.js y
// js/t24-integracion-qa.js, y envuelve lo que ellos dejaron en
// tarjetaCita y pintarCompletadas, sin modificarlos.
// =====================================================================
(function () {
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const TODOS = '';

  // "2026-11" → "Noviembre 2026"
  function nombreMes(clave) {
    const [anio, mes] = clave.split('-');
    const texto = MESES[Number(mes) - 1] || clave;
    return `${texto.charAt(0).toUpperCase()}${texto.slice(1)} ${anio}`;
  }

  // Guarda en la tarjeta los datos que usa el filtro
  function marcar(tarjeta, c, persona) {
    tarjeta.dataset.t28Mes = String(c.fecha || '').slice(0, 7);
    tarjeta.dataset.t28Estado = c.estado_mostrado || c.estado || '';
    tarjeta.dataset.t28Materia = c.nombre_materia || '';
    tarjeta.dataset.t28Orden = `${c.fecha || ''}T${c.hora_inicio || ''}`;
    if (persona) tarjeta.dataset.t28Persona = persona;
    return tarjeta;
  }

  // -------------------------------------------------------------------
  // Aviso de plazo como etiqueta: corto, con color y tiempo restante.
  // Ámbar = en plazo · Rojo = quedan menos de 24 h.
  // -------------------------------------------------------------------
  const HORA = 60 * 60 * 1000;
  const DIA = 24 * HORA;

  function limiteDe(c) {
    const inicio = new Date(`${c.fecha}T${c.hora_inicio}`).getTime();
    if (c.estado === 'Pendiente') return { ms: inicio - DIA, para: 'para que el asesor responda' };
    if (c.puede_calificar) {
      const ms = c.fecha_limite_calificacion
        ? new Date(c.fecha_limite_calificacion).getTime()
        : inicio + HORA + 7 * DIA;
      return { ms, para: 'para calificar' };
    }
    return null;
  }

  // "Quedan 2 días" · "Quedan 19 h 26 min" · "Quedan 40 min"
  function restante(ms) {
    const dif = ms - Date.now();
    if (dif <= 0) return null;
    if (dif >= DIA) {
      const d = Math.floor(dif / DIA);
      return `Quedan ${d} ${d === 1 ? 'día' : 'días'}`;
    }
    const h = Math.floor(dif / HORA);
    const m = Math.floor((dif % HORA) / 60000);
    return h ? `Quedan ${h} h ${m} min` : `Quedan ${m} min`;
  }

  // Etiqueta de dos líneas: lo importante (cuánto queda) en negritas y la fecha exacta debajo
  function chipPlazo(aviso, c) {
    const lim = limiteDe(c);
    const urgente = lim ? lim.ms - Date.now() < DIA : false;
    const chip = document.createElement('div');
    chip.dataset.campo = 'aviso';
    chip.setAttribute('role', 'note');
    chip.className = `flex items-start gap-2 w-fit max-w-full mt-1.5 rounded-lg border px-2.5 py-1.5 ${
      urgente ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-800'}`;
    chip.innerHTML = `
      <span aria-hidden="true" class="text-sm leading-5"></span>
      <div class="min-w-0 leading-tight">
        <p class="text-xs font-bold" data-campo="plazo-resto"></p>
        <p class="text-[11px] opacity-80" data-campo="plazo-fecha"></p>
      </div>`;
    chip.firstElementChild.textContent = urgente ? '⚠️' : '⏳';
    const resto = chip.querySelector('[data-campo="plazo-resto"]');
    const fecha = chip.querySelector('[data-campo="plazo-fecha"]');
    const queda = lim && restante(lim.ms);
    if (queda) {
      resto.textContent = `${queda} ${lim.para}`;
      fecha.textContent = `Hasta el ${new Date(lim.ms).toLocaleString('es-MX', {
        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })}`;
    } else {
      resto.textContent = aviso.textContent.trim();
      fecha.remove();
    }
    return chip;
  }

  // -------------------------------------------------------------------
  // 1. Tarjeta compacta del estudiante
  // -------------------------------------------------------------------
  function tarjetaCompacta(original, c, papel) {
    const estado = c.estado_mostrado || c.estado;
    const esVirtual = c.modalidad === 'Virtual';
    const persona = papel === 'Estudiante' ? c.asesor : c.estudiante;

    // Se reutilizan los nodos con lógica (botones, aviso, enlace) de la tarjeta original
    const acciones = original.querySelector('[data-campo="acciones"]');
    const aviso = original.querySelector('[data-campo="aviso"]');
    const lugar = original.querySelector('[data-campo="lugar"]');

    const tarjeta = document.createElement('div');
    tarjeta.className = 'bg-white px-4 py-3 sm:px-5 sm:py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3';
    tarjeta.innerHTML = `
      <div class="min-w-0 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <span data-campo="estado" class="px-2 py-0.5 rounded-full text-[11px] font-bold"></span>
          <span data-campo="modalidad" class="text-[11px] text-slate-500"></span>
        </div>
        <h3 class="text-sm font-bold text-slate-900 break-words" data-campo="materia"></h3>
        <p class="text-xs text-slate-600"><span data-campo="papel"></span> <span data-campo="persona" class="font-medium text-slate-700"></span></p>
        <p class="text-xs font-medium text-slate-700" data-campo="fecha"></p>
      </div>`;

    const badge = tarjeta.querySelector('[data-campo="estado"]');
    badge.textContent = estado;
    badge.className += ` ${COLORES_ESTADO[estado] || COLORES_ESTADO[c.estado] || 'bg-gray-100 text-gray-600'}`;
    tarjeta.querySelector('[data-campo="modalidad"]').textContent = esVirtual ? '💻 Virtual' : '📍 Presencial';
    tarjeta.querySelector('[data-campo="materia"]').textContent = c.nombre_materia || '';
    tarjeta.querySelector('[data-campo="papel"]').textContent = papel === 'Estudiante' ? 'Asesor:' : 'Estudiante:';
    tarjeta.querySelector('[data-campo="persona"]').textContent = persona || '';
    const f = formatearFecha(c.fecha);
    tarjeta.querySelector('[data-campo="fecha"]').textContent =
      `${f.charAt(0).toUpperCase()}${f.slice(1)} · ${formatearHora(c.hora_inicio)} – ${horaFin(c.hora_inicio)}`;

    const datos = tarjeta.firstElementChild;
    if (aviso && aviso.textContent.trim()) {
      datos.append(chipPlazo(aviso, c));
    }
    if (lugar && lugar.textContent.trim()) {
      const detalle = document.createElement('details');
      detalle.className = 'text-xs text-slate-500';
      const resumen = document.createElement('summary');
      resumen.className = 'cursor-pointer select-none font-semibold text-[#1B396A] w-fit';
      resumen.textContent = 'Ver detalle';
      lugar.className = 'mt-1 text-xs text-slate-500 break-words';
      detalle.append(resumen, lugar);
      datos.append(detalle);
    }
    if (acciones && acciones.childElementCount) {
      acciones.className = 'flex gap-2 w-full sm:w-auto shrink-0';
      tarjeta.append(acciones);
    }
    return marcar(tarjeta, c, persona);
  }

  if (typeof tarjetaCita === 'function') {
    const tarjetaAnterior = tarjetaCita;
    tarjetaCita = function (c, papel, tipo) {
      const original = tarjetaAnterior(c, papel, tipo);
      try {
        return tarjetaCompacta(original, c, papel);
      } catch (e) {
        console.warn('[T28] tarjeta original por error:', e);
        return marcar(original, c);
      }
    };
  }

  // Tarjetas del historial del asesor: solo se marcan para el filtro
  if (typeof pintarCompletadas === 'function') {
    const pintarAnterior = pintarCompletadas;
    pintarCompletadas = function () {
      pintarAnterior();
      const lista = document.getElementById('lista-completadas');
      if (!lista) return;
      [...lista.children].forEach((t, i) => {
        if (completadas[i]) marcar(t, completadas[i], completadas[i].estudiante);
      });
      aplicarFiltro('lista-completadas');
    };
  }

  // -------------------------------------------------------------------
  // 2. Filtro por mes, estado y materia
  // -------------------------------------------------------------------
  const filtros = {}; // idLista → { barra, vacio, resumen, selects, ordenar, sigueA }

  function crearSelect(etiqueta, nombre) {
    const caja = document.createElement('label');
    caja.className = 'flex flex-col gap-1 text-xs font-semibold text-slate-600 min-w-0';
    caja.textContent = etiqueta;
    const select = document.createElement('select');
    select.name = nombre;
    select.className = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B396A]';
    caja.append(select);
    return { caja, select };
  }

  // Campo de texto con sugerencias (datalist) para buscar la materia escribiendo
  function crearBuscador(etiqueta, nombre, idLista) {
    const caja = document.createElement('label');
    caja.className = 'flex flex-col gap-1 text-xs font-semibold text-slate-600 min-w-0';
    caja.textContent = etiqueta;
    const input = document.createElement('input');
    input.type = 'search';
    input.name = nombre;
    input.placeholder = 'Escribe una materia…';
    input.autocomplete = 'off';
    input.setAttribute('list', `t28-${nombre}-${idLista}`);
    input.className = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B396A]';
    const sugerencias = document.createElement('datalist');
    sugerencias.id = `t28-${nombre}-${idLista}`;
    caja.append(input, sugerencias);
    return { caja, input, sugerencias };
  }

  // "Cálculo" → "calculo": sin acentos ni mayúsculas
  function normalizar(texto) {
    return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function llenar(select, valores, textoTodos, formato, preferido) {
    const actual = select.dataset.elegido ?? preferido;
    select.innerHTML = '';
    const todos = new Option(textoTodos, TODOS);
    select.append(todos);
    valores.forEach((v) => select.append(new Option(formato ? formato(v) : v, v)));
    select.value = valores.includes(actual) || actual === TODOS ? actual : (preferido ?? TODOS);
  }

  function tarjetasDe(lista) {
    return [...lista.children].filter((t) => t.dataset && t.dataset.t28Mes !== undefined);
  }

  function aplicarFiltro(idLista) {
    const f = filtros[idLista];
    const lista = document.getElementById(idLista);
    if (!f || !lista) return;
    f.observador.disconnect();

    const tarjetas = tarjetasDe(lista);
    if (f.ordenar) {
      tarjetas.sort((a, b) => b.dataset.t28Orden.localeCompare(a.dataset.t28Orden))
        .forEach((t) => lista.append(t));
    }

    const unicos = (campo) => [...new Set(tarjetas.map((t) => t.dataset[campo]).filter(Boolean))];
    const meses = unicos('t28Mes').sort().reverse();
    // Por defecto: el mes más reciente (si hay más de un mes)
    // Por defecto: el mes actual si tiene citas; si no, el más reciente
    const mesActual = new Date().toLocaleDateString('en-CA').slice(0, 7);
    llenar(f.selects.mes, meses, 'Todos los meses', nombreMes,
      meses.length > 1 ? (meses.includes(mesActual) ? mesActual : meses[0]) : TODOS);
    llenar(f.selects.estado, unicos('t28Estado').sort(), 'Todos los estados');
    f.materia.sugerencias.replaceChildren(
      ...unicos('t28Materia').sort((a, b) => a.localeCompare(b, 'es')).map((m) => new Option(m)));

    const mes = f.selects.mes.value;
    const estado = f.selects.estado.value;
    const materia = normalizar(f.materia.input.value);
    let visibles = 0;
    tarjetas.forEach((t) => {
      const ok = (!mes || t.dataset.t28Mes === mes)
        && (!estado || t.dataset.t28Estado === estado)
        && (!materia || normalizar(t.dataset.t28Materia).includes(materia));
      t.classList.toggle('hidden', !ok);
      if (ok) visibles += 1;
    });

    const hay = tarjetas.length > 0;
    f.barra.classList.toggle('hidden', !hay || f.oculta());
    f.vacio.classList.toggle('hidden', !hay || visibles > 0 || f.oculta());
    f.resumen.textContent = `Mostrando ${visibles} de ${tarjetas.length}`;
    f.limpiar.classList.toggle('invisible', !mes && !estado && !materia);

    f.observador.observe(lista, { childList: true });
  }

  // idLista: contenedor de tarjetas · panel: elemento que se oculta con la pestaña
  function montarFiltro(idLista, idPanel, ordenar) {
    const lista = document.getElementById(idLista);
    const panel = document.getElementById(idPanel);
    if (!lista || !panel || filtros[idLista]) return;

    const barra = document.createElement('div');
    barra.className = 'hidden mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm';
    barra.setAttribute('role', 'search');
    barra.setAttribute('aria-label', 'Filtrar citas');
    const rejilla = document.createElement('div');
    rejilla.className = 'grid grid-cols-1 sm:grid-cols-3 gap-3';
    const mes = crearSelect('Mes', 'mes');
    const estado = crearSelect('Estado', 'estado');
    const materia = crearBuscador('Materia', 'materia', idLista);
    rejilla.append(mes.caja, estado.caja, materia.caja);

    const pie = document.createElement('div');
    pie.className = 'mt-3 flex items-center justify-between gap-3 text-xs text-slate-500';
    const resumen = document.createElement('span');
    resumen.setAttribute('aria-live', 'polite');
    const limpiar = document.createElement('button');
    limpiar.type = 'button';
    limpiar.className = 'font-semibold text-[#1B396A] hover:underline';
    limpiar.textContent = 'Ver todo';
    pie.append(resumen, limpiar);
    barra.append(rejilla, pie);

    const vacio = document.createElement('div');
    vacio.className = 'hidden mb-4 bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-sm text-slate-500';
    vacio.textContent = 'No hay citas con estos filtros.';

    // Estudiante: la lista es el panel (se oculta con la pestaña) → la barra va antes.
    // Asesor: la lista está dentro de la sección → la barra va dentro, antes de la lista.
    lista.before(barra, vacio);

    const selects = { mes: mes.select, estado: estado.select };
    const f = {
      barra, vacio, resumen, limpiar, selects, materia, ordenar,
      // Asesor: la sección ya oculta la barra; solo se revisa en el estudiante
      oculta: () => panel === lista && panel.classList.contains('hidden'),
      observador: new MutationObserver(() => aplicarFiltro(idLista)),
    };
    filtros[idLista] = f;

    Object.values(selects).forEach((s) => s.addEventListener('change', () => {
      s.dataset.elegido = s.value;
      aplicarFiltro(idLista);
    }));
    materia.input.addEventListener('input', () => aplicarFiltro(idLista));
    limpiar.addEventListener('click', () => {
      Object.values(selects).forEach((s) => { s.dataset.elegido = TODOS; });
      materia.input.value = '';
      aplicarFiltro(idLista);
    });

    // La barra sigue a la pestaña: si el panel se oculta, ella también
    if (panel === lista) {
      new MutationObserver(() => aplicarFiltro(idLista))
        .observe(panel, { attributes: true, attributeFilter: ['class'] });
    }
    aplicarFiltro(idLista);
  }

  function iniciar() {
    montarFiltro('est-completadas', 'est-completadas', true);
    montarFiltro('est-historial', 'est-historial', true);
    montarFiltro('lista-completadas', 'seccion-completadas', false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
}());
