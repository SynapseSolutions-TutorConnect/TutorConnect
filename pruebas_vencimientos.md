Pruebas de vencimientos automáticos — T23 (TC-24)

Responsable: Ximena Alcantara Omaña · Rama: Ximena/Sp1 · Fecha: __/11/2026

Qué se prueba
Regla	Descripción
RN-05 · Caducidad	Una solicitud Pendiente a 24 h o menos del inicio pasa a Caducada, la franja vuelve a Libre y se notifica a ambas partes (RF-007).
RN-09 · Cierre por omisión	Una cita Aceptada que el asesor no cierra en las 48 h siguientes a su fin pasa a Sin registro (RF-009). Solo estadística, sin bloqueos (RN-08).
Cómo se ejecuta procesar_vencimientos()
Al cargar las pantallas: js/sesion.js → iniciarPaginaProtegida() hace await ejecutar('procesar_vencimientos') antes de que la página consulte las vistas. La usan panel.html, buscar.html, agenda.html y solicitudes.html.
Antes de cada operación: solicitar_asesoria, resolver_solicitud, cancelar_asesoria y marcar_resultado ejecutan PERFORM procesar_vencimientos() al inicio (sql/esquema.sql).
Permiso: GRANT EXECUTE ON FUNCTION procesar_vencimientos() TO authenticated; (documentado en sql/esquema.sql).
pg_cron: opcional, no activado.
Datos de prueba

sql/pruebas_vencimientos.sql (SQL Editor, rol postgres). Asesor: profesor1 (43a01d3f-…) · Estudiante: estudiante2 (be2247d6-…). Las horas se calculan desde el momento de la ejecución y se ajustan a bloques válidos (07:00–20:00).

Resultados
Caso	Datos preparados	Resultado esperado	Resultado obtenido	✅/❌
1 · 23 h	Franja «T23 · Caso 23 h (caducidad)» que empieza en menos de 24 h + solicitud Pendiente (id ___)	Al abrir solicitudes.html: Caducada; la franja deja de estar «Congelado» en Mi agenda; aviso de caducidad para estudiante y asesor		
2 · 49 h	Franja «T23 · Caso 49 h (Sin registro)» cuyo fin fue hace más de 48 h + cita Aceptada (id ___)	Sin registro, sin botones de marcar ni calificar		
3 · 47 h (límite)	Franja «T23 · Caso 47 h (límite)» cuyo fin fue hace menos de 48 h + cita Aceptada (id ___)	Sigue Aceptada y el asesor ve «Realizada / No realizada» en Por cerrar		
Evidencias
T23-1a-estudiante-caducada.png — solicitudes.html del estudiante con la solicitud «Caducada».
T23-1b-agenda-asesor-libre.png — Mi agenda del asesor: la franja ya no está «Congelado».
T23-1c-avisos-caducidad.png — campana / tabla notificacion con el aviso para ambas partes.
T23-1d-tabla-caducada.png — Table Editor → solicitud_asesoria con estado = 'Caducada'.
T23-2-sin-registro.png — cita del caso 49 h en «Sin registro», sin botones.
T23-3-limite-47h.png — cita del caso 47 h «Aceptada» con los botones de cierre.
T23-4-tabla-estados.png — Table Editor con los estados Sin registro y Aceptada.
