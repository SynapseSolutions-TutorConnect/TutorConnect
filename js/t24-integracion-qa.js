// Integra las consultas T24 con las pestañas y operaciones T20/T20b de qa.
if (document.body.classList.contains('t24-solicitudes')) {
  cargarCitasAsesor = async function cargarCitasAsesor() {
    return T24.lectura('citas-asesor-qa', '#seccion-pendientes',
      ['#lista-pendientes','#pendientes-vacio','#lista-por-cerrar','#por-cerrar-vacio','#lista-completadas','#completadas-vacio'],
      async op => {
        const {data,error}=await db.from('v_mis_citas').select('*').eq('mi_papel','Asesor')
          .order('fecha',{ascending:false}).order('hora_inicio',{ascending:false});
        if(!op.actual()) return;
        if(error) throw error;
        const citas=data || [];
        const ordenar=(a,b)=>`${a.fecha}T${a.hora_inicio}`.localeCompare(`${b.fecha}T${b.hora_inicio}`);
        pendientes=citas.filter(c=>c.estado==='Pendiente').sort(ordenar);
        porCerrar=citas.filter(c=>c.puede_marcar===true).sort(ordenar);
        completadas=citas.filter(c=>['Realizada','No realizada','Sin registro','Rechazada','Cancelada','Caducada'].includes(c.estado));
        for(const [id,lista] of [['contador-pendientes',pendientes],['contador-por-cerrar',porCerrar],['contador-completadas',completadas]]){
          const contador=document.getElementById(id);if(contador) contador.textContent=lista.length;
        }
        pintarPendientes();pintarPorCerrar();pintarCompletadas();
      },()=>cargarCitasAsesor());
  };
  // No recuperar el antiguo listado que solo consultaba Pendientes.
  listarPendientesAsesor=async function(){return cargarCitasAsesor();};
  listarMisCitas=async function listarMisCitas(){
    return T24.lectura('listarMisCitas','#est-resultados',['#est-resultados'],async op=>{
      const {data,error}=await db.from('v_mis_citas').select('*').eq('mi_papel','Estudiante').order('fecha').order('hora_inicio');
      if(!op.actual())return;
      if(error)throw error;
      const citas=data || [];
      const grupos={
        pendiente:citas.filter(c=>c.estado==='Pendiente'),
        proxima:citas.filter(c=>c.estado==='Aceptada' && esFutura(c)),
        completada:citas.filter(c=>c.estado==='Realizada' || c.estado==='No realizada')
      };
      grupos.historial=citas.filter(c=>!grupos.pendiente.includes(c) && !grupos.proxima.includes(c) && !grupos.completada.includes(c));
      const paneles={pendiente:'est-pendientes',proxima:'est-proximas',completada:'est-completadas',historial:'est-historial'};
      const vacios={pendiente:'No tienes solicitudes pendientes',proxima:'No tienes citas próximas',completada:'Aún no tienes asesorías completadas',historial:'Tu historial está vacío'};
      for(const tipo of Object.keys(paneles)){
        const panel=document.getElementById(paneles[tipo]);panel.innerHTML='';
        if(!grupos[tipo].length)panel.appendChild(pestanaVacia(vacios[tipo]));
        grupos[tipo].forEach(c=>panel.appendChild(tarjetaCita(c,'Estudiante',tipo)));
        document.getElementById('contador-'+paneles[tipo]).textContent=grupos[tipo].length;
      }
      document.getElementById('est-vacio').classList.toggle('hidden',citas.length>0);
    },()=>listarMisCitas());
  };
  // Conserva las operaciones nuevas y aplica la protección de envíos de T24.
  ['marcarResultado','calificar'].forEach(t24Proteger);
}
