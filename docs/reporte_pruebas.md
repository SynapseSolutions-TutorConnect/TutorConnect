# T27 — Reporte de pruebas de TutorConnect

- Sitio: https://synapsesolutions-tutorconnect.github.io/TutorConnect/
- Tarea: https://sinon-marsh.atlassian.net/browse/TC-29
- Coordinador del reporte: Edgar Charrez Dothi.
- Entorno: sitio publicado en GitHub Pages.
- Versión publicada: pendiente de identificar.
- Evidencias: docs/capturas/pruebas/ y adjuntos de TC-29.
- Estados: ✅ Aprobada, ❌ Fallida, ⏳ Pendiente.
- La aprobación final corresponde al Scrum Master.

## 1. Escenarios de aceptación

| ID | Responsable | Precondiciones | Pasos | Datos usados | Resultado esperado | Resultado obtenido | Estado | Fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ESC-001 | Edgar | Correo nuevo; incógnito y sin sesión | Completar registro, crear cuenta y comprobar panel y perfil | M. S.; l252005**@pachuca.tecnm.mx; matrícula 252005**; Sistemas Computacionales; semestre 7 | Cuenta creada, rol Estudiante y redirección al panel | Cuenta creada; acceso directo sin confirmación por correo; perfil con los datos y rol Estudiante | ✅ | 20/11/2026 |
| ESC-002 | Yael | Franja libre y dos estudiantes | Solicitar; comprobar Pendiente y Congelado; buscar con el segundo estudiante | Bases de Datos, 26/11/2026, 07:00; faltan IDs y usuarios de la ficha | Pendiente, franja Congelado y oculta al otro estudiante | Capturas recibidas muestran la transición y búsqueda sin coincidencias; falta ficha con fecha, usuarios, IDs y revisión cruzada | ⏳ | Pendiente de confirmar por ejecutor |
| ESC-003 | Carlos | Solicitud virtual Pendiente en el sitio publicado | Aceptar con URL; revisar la cita como estudiante | estudiante2 y profesor1; Base de Datos; URL de prueba meet.google.com/abc-defg-hij | Aceptada y enlace visible para el estudiante | Aceptación y URL visibles como asesor; resolver_solicitud 204 en 245 ms. La captura del estudiante tiene Horario y detalles cerrado: falta mostrar el enlace | ⏳ | Parcial: 25/11/2026 |
| ESC-004 | Gamaliel Jiménez | Solicitud 102 Aceptada, prevista para el 24/11/2026 a las 10:00, aproximadamente 12 h después de la prueba | Revisar Cancelar en Próximas e intentar cancelar_asesoria(102) desde consola | Solicitud 102; franja 133 | Cancelación bloqueada con aviso del límite de 48 h | Botón deshabilitado con tooltip; RPC rechazado con HTTP 400 y mensaje «Solo se puede cancelar con al menos 48 horas de anticipación.» | ✅ | 23/11/2026 |
| ESC-005 | Gamaliel Jiménez | Solicitud 138 Realizada del 22/11/2026 a las 08:00, sin evaluar | Consultar promedio; calificar con 4 estrellas a los tres días; consultar evaluación y promedio posterior | Solicitud 138; franja 165; evaluación 17; profesor1 | Evaluación sin texto a los tres días y promedio recalculado | Calificación 4 registrada; calificar_asesoria 204 en 246 ms; evaluaciones de 7 a 8 y promedio mostrado 4.1 antes y después | ✅ | 25/11/2026 |

## 2. Reglas de negocio

Cada fila se aprueba únicamente cuando pasan todos sus subcasos.

| ID | Responsable | Precondiciones | Pasos | Datos usados | Resultado esperado | Resultado obtenido | Estado | Fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RN-01 | Edgar Charrez | Sin sesión; formulario de registro del sitio publicado | Completar campos válidos e intentar registrar un correo Gmail | Correo de prueba con dominio @gmail.com | Rechazar el registro no institucional | Mostró «Acceso restringido a cuentas institucionales» y no permitió continuar | ✅ | 23/11/2026 |
| RN-02 | Ximena Alcantara Omaña | Estudiante sin materias aprobadas; profesor autorizado únicamente para materia 41 | Comprobar menú y acceso a Agenda; revisar materias disponibles; intentar publicar sin autorización en SQL con rollback | estudiantet19; profesort19; materias 41 y 5 | Impedir publicación de materias no autorizadas | Estudiante sin Mi agenda y redirigido al Panel; profesor solo ve materia 41; ambos intentos SQL no autorizados rechazados con «No tienes autorización para asesorar esta materia.» | ✅ | 20/11/2026 |
| RN-03 | Gamaliel Jiménez | Estudiante con solicitud Pendiente y asesor con bloque existente a la misma hora | Solicitar otra franja simultánea; revisar horas disponibles del asesor; intentar duplicar su bloque en SQL | Franjas 134 y 135; profesores 1 y 2; 26/11/2026 a las 10:00 | Rechazar ambos solapamientos | Segunda solicitud rechazada con «Ya tienes un compromiso agendado a esa misma hora.»; selector del asesor omite las 10:00; insert SQL rechazado con 23505, restricción uq_franja_asesor_bloque | ✅ | 23/11/2026 |
| RN-04 | Yael | Dos estudiantes y una franja libre | Intentar doble reserva; rechazar y cancelar; comprobar liberación en ambos casos | Cálculo diferencial, 26/11/2026, 08:00; faltan IDs y ficha | Segunda reserva rechazada; franja liberada en ambos casos | Se ve rechazo «Este horario ya no está disponible»; faltan datos que identifiquen la misma franja liberada por rechazo y por cancelación | ⏳ | Pendiente de confirmar por ejecutor |
| RN-05 | Carlos | Solicitud 135 Pendiente con inicio a menos de 24 h | Abrir flujo de solicitudes y procesar vencimientos; consultar estado posterior | Solicitud 135; tutor1; estudiante con datos protegidos; Fundamentos de Programación; 26/11/2026 a las 07:00 | Solicitud Caducada | Estado Pendiente inicial y Caducada posterior; procesar_vencimientos 204 en 125 ms | ✅ | 25/11/2026 |
| RN-06 | Gamaliel Jiménez | Citas Aceptadas aproximadamente a 12 h y 60 h del inicio | Comprobar bloqueo a 12 h; cancelar la cita a 60 h; verificar estado, notificación y liberación | Solicitudes 102 y 103; franjas 133 y 134 | Permitir cancelación a más de 48 h y bloquearla a menos de 48 h | Solicitud 102 bloqueada; solicitud 103 Cancelada; aviso enviado a profesor1 y franja 134 disponible nuevamente en Buscar | ✅ | 23/11/2026 |
| RN-07 | Carlos | Citas Realizadas dentro y fuera de siete días | Calificar dentro del plazo; repetir; intentar fuera del plazo; revisar formulario sin texto | Solicitud 136 del 24/11/2026 a las 16:00; 5 estrellas; solicitud 93 del 12/11/2026 a las 08:00 para fuera de plazo | Una sola evaluación dentro de siete días y sin texto | Evaluación registrada, HTTP 204 en 186 ms; repetición rechazada «Esta asesoría ya fue calificada»; fuera de plazo rechazado «El periodo de evaluación ha expirado»; formulario sin texto | ✅ | 25/11/2026 |
| RN-09 / RN-10 | Yael | Cita sin cerrar por más de 48 h; bloques a menos de 24 h | Verificar vencimiento; intentar publicar y solicitar dentro del límite | Publicación: 26/11/2026 a las 09:00; falta ficha con hora de ejecución e IDs | Sin registro; publicación y solicitud rechazadas | Historial muestra Sin registro y publicación muestra aviso de 24 h. Faltan fecha/hora de la cita para acreditar las 48 h y evidencia identificable del bloqueo de solicitud a menos de 24 h | ⏳ | Pendiente de confirmar por ejecutor |

Evidencia RN-01: [Rechazo de correo no institucional](capturas/pruebas/RN-01-correo-no-institucional.png).
## 3. Requisitos no funcionales y permisos

| ID | Responsable | Precondiciones | Pasos | Datos usados | Resultado esperado | Resultado obtenido | Estado | Fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RNF-001 | Gamaliel Jiménez | Sesión de estudiante2 en GitHub Pages | Intentar lectura y cambios directos; insertar solicitud Aceptada directamente desde consola | Tabla solicitud_asesoria; solicitud 125; franja 135 | Rechazar escritura directa no autorizada en solicitud_asesoria | Insert rechazado con HTTP 403 y código 42501 por RLS; lectura devuelve cero filas y updates no modifican filas. Complementa las pruebas previas de rol y notificaciones | ✅ | 25/11/2026 |
| RNF-002 | Yael | Matriz y capturas de T24 disponibles | Revisar matriz de 8 pantallas en 360, 768 y 1440 px y estados de interfaz | Pendiente de enlazar matriz | Cumplimiento responsive documentado | Pendiente de revisión | ⏳ | Pendiente |
| RNF-003 | Yael, con mediciones de Edgar, Carlos y Gamaliel | Network abierto y sin limitación de velocidad | Registrar petición, HTTP y tiempo de las operaciones de los cinco escenarios | Ver tabla de mediciones inferior | Cada operación medida ≤ 2000 ms | Registro 1090 y 297 ms; solicitar_asesoria 172 ms; resolver_solicitud 245 ms; calificar_asesoria a tres días 246 ms. Falta completar cobertura, fechas y evidencia de ESC-004 | ⏳ | Parcial: 20–25/11/2026; fecha de Yael pendiente |
| Permisos | Edgar Charrez | Sesión de Estudiante con autorización de asesor; materia de prueba ID 47 activa | Intentar abrir admin.html, consultar reporte_materias y crear, editar y desactivar una materia desde la consola del sitio publicado | Materia PRUEBA_T27_EDITAR_DESACTIVAR, ID 47; carrera ID 1; reporte del 01/11/2026 al 30/11/2026 | Acceso y operaciones administrativas no autorizadas bloqueados | admin.html redirigió al Panel; reporte rechazado con «Solo el coordinador puede ver reportes»; creación rechazada por permisos; edición conservó el nombre original y desactivación conservó estado_activo=true | ✅ | 23/11/2026 |

### Evidencias de Permisos

Ejecutado sobre https://synapsesolutions-tutorconnect.github.io/TutorConnect/.

- [Acceso a Administración](capturas/pruebas/PERMISOS-01-estudiante-admin.png)
- [Consulta de reportes](capturas/pruebas/PERMISOS-02-estudiante-reporte.png)
- [Creación de materia](capturas/pruebas/PERMISOS-03-estudiante-crear-materia.png)
- [Edición de materia](capturas/pruebas/PERMISOS-04-estudiante-editar-materia.png)
- [Desactivación de materia](capturas/pruebas/PERMISOS-05-estudiante-desactivar-materia.png)

En edición y desactivación se comprobó el estado posterior de la materia; no se interpretó la respuesta HTTP como prueba suficiente de modificación.

Bugs: ninguno detectado en estos intentos. Pendiente de verificación del Scrum Master.


### Mediciones por petición

| Escenario | Petición | HTTP | Tiempo | Resultado | Ejecutor | Fecha |
| --- | --- | --- | --- | --- | --- | --- |
| ESC-001 | signup | 200 | 1090 ms | Cumple ≤ 2000 ms | Edgar | 20/11/2026 |
| ESC-001 | registrar_perfil | 204 | 297 ms | Cumple ≤ 2000 ms | Edgar | 20/11/2026 |
| RN-03, operación complementaria | Solicitud base de la franja 134 | 200 | 472 ms | Cumple ≤ 2000 ms para esta petición | Gamaliel Jiménez | 23/11/2026 |
| ESC-005, ejecución anterior complementaria | calificar_asesoria | 204 | 611 ms | Cumple para esta petición; no corresponde al caso de tres días | Gamaliel Jiménez | 24/11/2026 |
| ESC-002 | solicitar_asesoria (fetch; excluye preflight) | 200 | 172 ms | Cumple para esta petición | Yael | Pendiente de confirmar |
| ESC-003 | resolver_solicitud | 204 | 245 ms | Cumple para esta petición | Carlos | 25/11/2026 |
| ESC-005, tres días | calificar_asesoria | 204 | 246 ms | Cumple para esta petición | Gamaliel Jiménez | 25/11/2026 |
| ESC-004 | Intento de cancelación rechazado | 400 | Pendiente | Falta medición; el botón bloqueado no genera una petición | Gamaliel Jiménez | 23/11/2026 |

Estas mediciones corresponden a peticiones individuales, no al tiempo total
hasta que el panel estuvo listo. RNF-003 permanece pendiente hasta completar
las mediciones requeridas de los cinco escenarios.

## 4. Evidencias
### RN-02

Ejecutora: Ximena Alcantara Omaña. Fecha: 20/11/2026.

Las comprobaciones de interfaz se realizaron sobre GitHub Pages.
Los intentos de publicación no autorizada se comprobaron adicionalmente
en SQL Editor, simulando usuarios dentro de transacciones con rollback.

- [Sin acceso Mi agenda](capturas/pruebas/RN-02-1a-sin-mi-agenda.png)
- [Redirección al Panel](capturas/pruebas/RN-02-1b-redirige-panel.png)
- [Solo materia aprobada](capturas/pruebas/RN-02-2-solo-materia-aprobada.png)
- [Publicación sin aprobación rechazada](capturas/pruebas/RN-02-3a-sql-sin-aprobacion.png)
- [Publicación de otra materia rechazada](capturas/pruebas/RN-02-3b-sql-otra-materia.png)

Resultado aprobado reportado por la ejecutora, pendiente de validación
del Scrum Master y confirmación de revisión cruzada.
Bugs reportados: ninguno.
### Pruebas aportadas por Gamaliel Jiménez

Ambiente reportado: GitHub Pages de TutorConnect y Supabase.
Usuarios: estudiante2, profesor1 y profesor2.
Datos de prueba identificados como «T27 · …».
Revisión cruzada declarada por el ejecutor; pendiente de verificación del Scrum Master.

#### ESC-004

- [Datos preparados](capturas/pruebas/ESC-004-00-datos-preparados.png)
- [Botón bloqueado](capturas/pruebas/ESC-004-01-estudiante-boton-bloqueado.png)
- [Rechazo desde consola](capturas/pruebas/ESC-004-02-consola-rechazo.png)

#### RN-06

- [Comparación de botones a 12 y 60 horas](capturas/pruebas/RN-06-01-botones-12h-bloqueado-60h-activo.png)
- [Confirmación](capturas/pruebas/RN-06-02-confirmacion.png)
- [Cita cancelada](capturas/pruebas/RN-06-03-cancelada.png)
- [Verificación SQL](capturas/pruebas/RN-06-04-verificacion-sql.png)
- [Franja liberada](capturas/pruebas/RN-06-05-franja-liberada.png)

#### RN-03

- [Datos preparados](capturas/pruebas/RN-03-00-datos-preparados.png)
- [Solicitud base](capturas/pruebas/RN-03-01-solicitud-base.png)
- [Franja del otro asesor](capturas/pruebas/RN-03-02a-franja-otro-asesor.png)
- [Rechazo del solapamiento del estudiante](capturas/pruebas/RN-03-02-estudiante-solapamiento.png)
- [Hora ocupada omitida para el asesor](capturas/pruebas/RN-03-03-asesor-hora-ocupada-oculta.png)
- [Rechazo del duplicado en base de datos](capturas/pruebas/RN-03-04-bd-rechaza-duplicado.png)

#### ESC-005 parcial

Estas evidencias acreditan una evaluación al día siguiente de la cita.
No sustituyen el caso requerido de evaluación a los tres días.

- [Datos preparados](capturas/pruebas/ESC-005-00-datos-preparados.png)
- [Promedio anterior](capturas/pruebas/ESC-005-01-promedio-antes.png)
- [Botón de calificación](capturas/pruebas/ESC-005-02-boton-calificar.png)
- [Evaluación registrada](capturas/pruebas/ESC-005-04-evaluada.png)
- [Promedio posterior](capturas/pruebas/ESC-005-05-promedio-despues.png)

#### RNF-001 complementaria

Se verificó protección sobre usuario y notificacion.
El complemento del 25/11/2026 acredita también el intento sobre solicitud_asesoria; véase la sección de evidencias nuevas.

- [Intento de cambio de rol](capturas/pruebas/RNF-001-01-cambio-de-rol.png)
- [Intento de aviso a otro usuario](capturas/pruebas/RNF-001-02-aviso-a-otro-usuario.png)

### ESC-001

- [Formulario de registro](capturas/pruebas/ESC-001_01_formulario.png)
- [Resultado del registro](capturas/pruebas/ESC-001_02_resultado.png)
- [Panel del estudiante](capturas/pruebas/ESC-001_03_panel.png)
- [Panel y tiempos de Network con datos personales ocultos](capturas/pruebas/ESC-001_04_perfil_tiempos.png)
Las cuatro capturas de ESC-001 tienen los datos personales cubiertos
con rectángulos sólidos. Se conservaron los resultados y tiempos visibles.

Ejecución realizada con M. S.,
l252005**@pachuca.tecnm.mx.

Evidencias también adjuntas en TC-29.

### Evidencias nuevas recibidas el 26/11/2026

Los informes de los ejecutores se conservan como anexos:
[Resultados de Carlos](t27_carlos_resultados.md),
[Complemento de Gamaliel](t27_gamaliel_resultados.md) y
[Revisión de evidencias y pendientes](t27_revision_evidencias_26nov.md).

Carlos declara revisión cruzada de las funciones probadas. Gamaliel declara revisión cruzada. Yael debe completar su ficha de ejecución y confirmar esa condición. Las aprobaciones de este reporte representan resultados de ejecución, no el cierre administrativo del Scrum Master.

- ESC-003: [Aceptación](capturas/pruebas/ESC-003-02-aceptacion-con-url.png), [URL como asesor](capturas/pruebas/ESC-003-02-01-aceptacion-con-url.png), [Vista del estudiante, detalles aún cerrados](capturas/pruebas/ESC-003-03-enlace-visible-estudiante.png), [245 ms](capturas/pruebas/ESC-003-04-tiempo-network.png).
- RN-05: [Pendiente inicial](capturas/pruebas/RN-05-01-pendiente-inicio-menor-24h.png), [Caducada](capturas/pruebas/RN-05-02-solicitud-caducada.png).
- RN-07: [Evaluación dentro de plazo](capturas/pruebas/RN-07-01-calificacion-dentro-7-dias.png), [Repetición rechazada](capturas/pruebas/RN-07-02-segunda-calificacion-rechazada.png), [Fuera de plazo](capturas/pruebas/RN-07-03-calificacion-fuera-plazo-rechazada.png), [Formulario sin texto](capturas/pruebas/RN-07-04-formulario-sin-texto.png).
- ESC-005 a tres días: [Datos preparados](capturas/pruebas/ESC-005-3D-00-datos-preparados.png), [Promedio antes](capturas/pruebas/ESC-005-3D-01-promedio-antes.png), [Cita del 22/11](capturas/pruebas/ESC-005-3D-02-boton-calificar.png), [Evaluación y 246 ms](capturas/pruebas/ESC-005-3D-03-evaluada.png), [Promedio después](capturas/pruebas/ESC-005-3D-04-promedio-despues.png), [Evaluación 17 de solicitud 138](capturas/pruebas/ESC-005-3D-05-evaluacion-138.png).
- RNF-001: [Rechazo de inserción en solicitud_asesoria](capturas/pruebas/RNF-001-03-solicitud-asesoria.png).
- ESC-002: [Libre](capturas/pruebas/ESC-002-01-franja-libre.jpeg), [Pendiente](capturas/pruebas/ESC-002-02-solicitud-pendiente.jpeg), [Congelada](capturas/pruebas/ESC-002-03-franja-congelada.jpeg), [Búsqueda del segundo estudiante](capturas/pruebas/ESC-002-04-no-disponible-segundo-estudiante.jpeg), [172 ms](capturas/pruebas/ESC-002-05-tiempo-network.jpeg).
- RN-04: [Primera reserva](capturas/pruebas/RN-04-01-primera-reserva.jpeg), [Segunda rechazada](capturas/pruebas/RN-04-02-segunda-reserva-rechazada.jpeg), [Liberación por rechazo, identificación pendiente](capturas/pruebas/RN-04-03-franja-liberada-por-rechazo.jpeg), [Liberación por cancelación, identificación pendiente](capturas/pruebas/RN-04-04-franja-liberada-por-cancelacion.jpeg).
- RN-09/RN-10: [Historial Sin registro, falta acreditar 48 h](capturas/pruebas/RN-09-01-cita-sin-registro.jpeg), [Bloqueo de publicación](capturas/pruebas/RN-10-01-publicacion-menor-24h.jpeg), [Búsqueda vacía, insuficiente por sí sola para el límite de solicitud](capturas/pruebas/RN-10-02-solicitud-menor-24h.jpeg).
- RNF-002: [Panel móvil complementario](capturas/pruebas/RNF-002-01-responsive-movil.jpeg). Falta enlazar y validar la matriz completa de T24; una captura no la sustituye.

La fecha UTC de la evaluación 17 (26/11/2026 02:57) corresponde al 25/11/2026 en Ciudad de México, coherente con la ficha de Gamaliel. Los datos personales de ESC-001 permanecen enmascarados.

## 5. Bugs

Gamaliel reportó una incidencia menor de interfaz: en el modal de cancelación,
el botón que permite conservar la cita dice «Cancelar», lo que resulta ambiguo.
Se propone «No, mantener». Pendiente de confirmar o crear el Bug en Jira y enlazarlo a TC-29.
Esta observación no cambia el resultado de la regla temporal RN-06.

Esto no implica que las pruebas pendientes estén aprobadas.

Por cada fila fallida se registrará el Bug enlazado en Jira, con pasos,
resultado esperado, resultado obtenido, captura y prioridad.

| Prueba fallida | Bug Jira | Prioridad | Evidencia |
| --- | --- | --- | --- |
| Modal de cancelación, observación de interfaz | Pendiente de registrar o confirmar ID | Menor | [Confirmación](capturas/pruebas/RN-06-02-confirmacion.png) |

## 6. Resumen parcial

| Concepto | Cantidad |
| --- | ---: |
| Pruebas principales planificadas | 17 |
| Aprobadas en ejecución, sujetas a validación del Scrum Master | 11 |
| Fallidas en las filas principales | 0 |
| Pendientes, incluidas ejecuciones parciales y documentación | 6 |

Comprobación: 11 + 0 + 6 = 17.

Aprobadas: ESC-001, ESC-004, ESC-005, RN-01, RN-02, RN-03, RN-05, RN-06, RN-07, RNF-001 y Permisos.

Pendientes: ESC-002, ESC-003, RN-04, RN-09/RN-10, RNF-002 y RNF-003.

RN-02 ya estaba aprobada en su fila pero no se había contado en el resumen anterior. Las capturas y los subcasos no se cuentan como pruebas principales adicionales.

Para cerrar: completar la ficha de Yael y las evidencias señaladas, mostrar la URL como estudiante en ESC-003, enlazar y validar T24 para RNF-002, completar tiempos de RNF-003, identificar la versión publicada probada y confirmar el vínculo Jira de la observación de interfaz. No se declara T27 Done hasta la validación del Scrum Master.

