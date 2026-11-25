// T24: perfil con carga, error recuperable y datos opcionales explícitos.
let perfilCargando = false;

function iniciales(nombre) {
  return String(nombre || '').trim().split(/\s+/).filter(Boolean)
    .slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function escribir(id, valor) {
  document.getElementById(id).textContent = valor == null || valor === ''
    ? 'No registrado' : valor;
}

function mostrarBloque(id, visible) {
  document.getElementById(id).classList.toggle('hidden', !visible);
}

function estrellas(promedio) {
  const llenas = Math.max(0, Math.min(5, Math.round(Number(promedio) || 0)));
  return '★'.repeat(llenas) + '☆'.repeat(5 - llenas);
}

async function cargarPerfil() {
  if (perfilCargando) return;
  perfilCargando = true;
  const main = document.querySelector('main');
  const contenido = document.getElementById('perfil-contenido');
  const carga = document.getElementById('perfil-carga');
  const errorPanel = document.getElementById('perfil-error');
  const reintentar = document.getElementById('perfil-reintentar');
  const devolverFoco = document.activeElement === reintentar;
  main.setAttribute('aria-busy', 'true');
  contenido.classList.add('hidden');
  errorPanel.classList.add('hidden');
  carga.classList.remove('hidden');
  reintentar.disabled = true;
  let exito = false;

  try {
    const perfil = await iniciarPaginaProtegidaConOpciones({ conservarSesionEnError: true });
    if (!perfil) return; // La sesión ausente redirige al login.

    let carrera = null;
    if (perfil.rol === 'Estudiante' && perfil.id_carrera) {
      const respuesta = await db.from('carrera').select('nombre_carrera')
        .eq('id_carrera', perfil.id_carrera).maybeSingle();
      if (respuesta.error) throw respuesta.error;
      carrera = respuesta.data?.nombre_carrera;
    }

    let promedio = null;
    if (perfil.rol !== 'Coordinador') {
      const respuesta = await db.from('v_promedio_asesor')
        .select('promedio, num_evaluaciones')
        .eq('id_asesor', perfil.id_usuario).maybeSingle();
      if (respuesta.error) throw respuesta.error;
      promedio = respuesta.data;
    }

    const nombre = perfil.nombre_completo;
    escribir('perfil-nombre', nombre);
    escribir('perfil-iniciales', iniciales(nombre));
    escribir('avatar-iniciales', iniciales(nombre));
    escribir('perfil-rol', perfil.rol);
    escribir('perfil-correo', perfil.correo_institucional);
    escribir('perfil-matricula', perfil.matricula_num_empleado);

    const estudiante = perfil.rol === 'Estudiante';
    escribir('etiqueta-matricula', estudiante ? 'Matrícula / No. Control' : 'Número de empleado');
    mostrarBloque('bloque-carrera', estudiante);
    mostrarBloque('bloque-semestre', estudiante);
    mostrarBloque('bloque-departamento', !estudiante);
    if (estudiante) {
      escribir('perfil-carrera', carrera);
      escribir('perfil-semestre', perfil.semestre ? `${perfil.semestre}° Semestre` : null);
    } else {
      escribir('perfil-departamento', perfil.departamento);
    }

    mostrarBloque('perfil-promedio', perfil.rol !== 'Coordinador');
    escribir('perfil-promedio', promedio && promedio.num_evaluaciones > 0
      ? `${estrellas(promedio.promedio)} ${promedio.promedio} como asesor (${promedio.num_evaluaciones} evaluaciones)`
      : 'Sin evaluaciones como asesor.');
    contenido.classList.remove('hidden');
    exito = true;
  } catch (error) {
    const detalle = error?.message || 'Error desconocido';
    const sinConexion = !navigator.onLine ||
      /failed to fetch|networkerror|network request failed|load failed|fetch failed/i.test(detalle);
    document.getElementById('perfil-error-mensaje').textContent = sinConexion
      ? 'No pudimos conectar con el servidor. Revisa tu conexión y pulsa Reintentar.'
      : detalle;
    errorPanel.classList.remove('hidden');
  } finally {
    perfilCargando = false;
    carga.classList.add('hidden');
    reintentar.disabled = false;
    main.setAttribute('aria-busy', 'false');
    if (devolverFoco) {
      const destino = exito ? document.getElementById('perfil-nombre') : reintentar;
      if (exito) destino.setAttribute('tabindex', '-1');
      destino.focus();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('perfil-reintentar').addEventListener('click', cargarPerfil);
  cargarPerfil();
});
