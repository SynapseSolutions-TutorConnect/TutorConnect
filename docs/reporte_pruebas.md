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
| ESC-001 | Edgar | Correo nuevo; incógnito y sin sesión | Completar registro, crear cuenta y comprobar panel y perfil | MARIO SALVADOR; l25200500@pachuca.tecnm.mx; matrícula 25200500; Sistemas Computacionales; semestre 7 | Cuenta creada, rol Estudiante y redirección al panel | Cuenta creada; acceso directo sin confirmación por correo; perfil con los datos y rol Estudiante | ✅ | 20/11/2026 |
| ESC-002 | Yael | Franja libre a más de 24 h; dos estudiantes | Solicitar con uno; consultar agenda y buscar con el otro | Pendiente de registrar IDs y usuarios | Pendiente, franja Congelado y oculta al otro estudiante | Pendiente de ejecución | ⏳ | Pendiente |
| ESC-003 | Carlos | Solicitud virtual Pendiente | Aceptar con URL y revisar como estudiante | Pendiente de registrar solicitud y URL | Aceptada y enlace visible para el estudiante | Pendiente de ejecución | ⏳ | Pendiente |
| ESC-004 | Gamaliel Jiménez | Solicitud 102 Aceptada, prevista para el 24/11/2026 a las 10:00, aproximadamente 12 h después de la prueba | Revisar Cancelar en Próximas e intentar cancelar_asesoria(102) desde consola | Solicitud 102; franja 133 | Cancelación bloqueada con aviso del límite de 48 h | Botón deshabilitado con tooltip; RPC rechazado con HTTP 400 y mensaje «Solo se puede cancelar con al menos 48 horas de anticipación.» | ✅ | 23/11/2026 |
| ESC-005 | Gamaliel Jiménez | Solicitud 105 Realizada, correspondiente al 23/11/2026 a las 07:00, sin evaluación | Consultar promedio; calificar con 4 estrellas; comprobar tarjeta y promedio | Solicitud 105; franja 138; puntuación 4 | Evaluación sin texto a los 3 días y promedio actualizado correctamente | Evaluación registrada el 24/11; tarjeta Evaluada con 4 estrellas; promedio 4.0 con 2 evaluaciones pasó a 4.0 con 3. Falta ejecutar el caso específico a los 3 días | ⏳ | Parcial: 24/11/2026 |

## 2. Reglas de negocio

Cada fila se aprueba únicamente cuando pasan todos sus subcasos.

| ID | Responsable | Precondiciones | Pasos | Datos usados | Resultado esperado | Resultado obtenido | Estado | Fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RN-01 | Edgar Charrez | Sin sesión; formulario de registro del sitio publicado | Completar campos válidos e intentar registrar un correo Gmail | Correo de prueba con dominio @gmail.com | Rechazar el registro no institucional | Mostró «Acceso restringido a cuentas institucionales» y no permitió continuar | ✅ | 23/11/2026 | rechazado | Pendiente de ejecución | ⏳ | Pendiente |
| RN-02 | Ximena | Usuario sin materia aprobada | Intentar publicar una franja | Pendiente | Publicación rechazada | Pendiente de ejecución | ⏳ | Pendiente |
| RN-03 | Gamaliel Jiménez | Estudiante con solicitud Pendiente y asesor con bloque existente a la misma hora | Solicitar otra franja simultánea; revisar horas disponibles del asesor; intentar duplicar su bloque en SQL | Franjas 134 y 135; profesores 1 y 2; 26/11/2026 a las 10:00 | Rechazar ambos solapamientos | Segunda solicitud rechazada con «Ya tienes un compromiso agendado a esa misma hora.»; selector del asesor omite las 10:00; insert SQL rechazado con 23505, restricción uq_franja_asesor_bloque | ✅ | 23/11/2026 |
| RN-04 | Yael | Dos estudiantes y franja libre | Intentar doble reserva; comprobar liberación por rechazo y por cancelación | Pendiente | Segunda reserva rechazada; franja liberada en ambos casos | Pendiente de ejecución | ⏳ | Pendiente |
| RN-05 | Carlos | Solicitud Pendiente cuyo inicio está a menos de 24 h | Ejecutar el flujo que procesa vencimientos y revisar estado | Pendiente | Solicitud Caducada | Pendiente de ejecución | ⏳ | Pendiente |
| RN-06 | Gamaliel Jiménez | Citas Aceptadas aproximadamente a 12 h y 60 h del inicio | Comprobar bloqueo a 12 h; cancelar la cita a 60 h; verificar estado, notificación y liberación | Solicitudes 102 y 103; franjas 133 y 134 | Permitir cancelación a más de 48 h y bloquearla a menos de 48 h | Solicitud 102 bloqueada; solicitud 103 Cancelada; aviso enviado a profesor1 y franja 134 disponible nuevamente en Buscar | ✅ | 23/11/2026 |
| RN-07 | Carlos | Citas Realizadas dentro y fuera de 7 días | Calificar dentro del plazo, repetir e intentar fuera del plazo; revisar ausencia de texto | Pendiente | Solo una evaluación dentro de 7 días y sin texto | Pendiente de ejecución | ⏳ | Pendiente |
| RN-09 / RN-10 | Yael | Cita sin cerrar desde hace más de 48 h y casos a menos de 24 h | Procesar vencimiento; intentar publicar y solicitar dentro del límite | Pendiente | Sin registro; publicación y solicitud rechazadas | Pendiente de ejecución | ⏳ | Pendiente |

Evidencia RN-01: [Rechazo de correo no institucional](capturas/pruebas/RN-01-correo-no-institucional.png).
## 3. Requisitos no funcionales y permisos

| ID | Responsable | Precondiciones | Pasos | Datos usados | Resultado esperado | Resultado obtenido | Estado | Fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RNF-001 | Gamaliel Jiménez | Sesión de estudiante2 en el sitio publicado | Intentar cambiar su rol a Coordinador; consultar rol; intentar insertar una notificación para profesor1 | Usuario estudiante2; destinatario profesor1 | Rechazar escritura no autorizada; T27 exige comprobar específicamente solicitud_asesoria | El rol permaneció Estudiante tras respuesta 204; insert en notificacion rechazado con HTTP 403 y código 42501 por RLS. Evidencia complementaria; falta probar solicitud_asesoria | ⏳ | Parcial: 23/11/2026 |
| RNF-002 | Yael | Matriz y capturas de T24 disponibles | Revisar matriz de 8 pantallas en 360, 768 y 1440 px y estados de interfaz | Pendiente de enlazar matriz | Cumplimiento responsive documentado | Pendiente de revisión | ⏳ | Pendiente |
| RNF-003 | Yael | Network abierto, conservación del registro y sin limitación de velocidad | Medir las operaciones de los cinco escenarios | Mediciones parciales de ESC-001 en tabla inferior | Cada operación medida ≤ 2000 ms | signup: 1090 ms; registrar_perfil: 297 ms; faltan las demás operaciones | ⏳ | Parcial: 20/11/2026 |
| Permisos | Edgar Charrez | Sesión de Estudiante con autorización de asesor; materia de prueba ID 47 activa | Intentar abrir admin.html, consultar reporte_materias y crear, editar y desactivar una materia desde la consola del sitio publicado | Materia PRUEBA_T27_EDITAR_DESACTIVAR, ID 47; carrera ID 1; reporte del 01/11/2026 al 30/11/2026 | Acceso y operaciones administrativas no autorizadas bloqueados | admin.html redirigió al Panel; reporte rechazado con «Solo el coordinador puede ver reportes»; creación rechazada por permisos; edición conservó el nombre original y desactivación conservó estado_activo=true | ✅ | 23/11/2026 

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
| ESC-005, ejecución parcial | calificar_asesoria | 204 | 611 ms | Cumple ≤ 2000 ms para esta petición; pendiente escenario a los 3 días | Gamaliel Jiménez | 24/11/2026 |
Estas mediciones corresponden a peticiones individuales, no al tiempo total
hasta que el panel estuvo listo. RNF-003 permanece pendiente hasta completar
las mediciones requeridas de los cinco escenarios.

## 4. Evidencias
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
Permanece pendiente el intento específico sobre solicitud_asesoria.

- [Intento de cambio de rol](capturas/pruebas/RNF-001-01-cambio-de-rol.png)
- [Intento de aviso a otro usuario](capturas/pruebas/RNF-001-02-aviso-a-otro-usuario.png)

### ESC-001

- [Formulario de registro](capturas/pruebas/ESC-001_01_formulario.png)
- [Resultado del registro](capturas/pruebas/ESC-001_02_resultado.png)
- [Panel del estudiante](capturas/pruebas/ESC-001_03_panel.png)
- [Perfil y tiempos de Network](capturas/pruebas/ESC-001_04_perfil_tiempos.png)

Ejecución realizada con MARIO SALVADOR,
l25200500@pachuca.tecnm.mx.

Evidencias también adjuntas en TC-29.

### Pruebas restantes

Pendientes de recibir, revisar y enlazar.

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
| Aprobadas en ejecución, pendientes de validación del Scrum Master | 6 |
| Fallidas en las filas principales | 0 |
| Pendientes, incluidas ejecuciones parciales | 11 |

Comprobación: 6 + 0 + 11 = 17.

Aprobadas: ESC-001, ESC-004, RN-01, RN-03, RN-06 y Permisos.
ESC-005 y RNF-001 permanecen pendientes de completar sus casos específicos.
Existe una observación menor de interfaz pendiente de vincular a un Bug.