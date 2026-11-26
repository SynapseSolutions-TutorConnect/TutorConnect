# T24–T25 · Revisión responsive y estados de interfaz

## Datos de la revisión

- Proyecto: TutorConnect.
- Responsable: Edgar Charrez.
- Rama original: `EdgarCharrez/t24-t25` (PR #35 integrado a qa).
- Rama de cierre documental: `EdgarCharrez/t24-cierre-docs`.
- Entorno inicial: vista previa del Codespace, puerto 8000.
- Evidencias finales: GitHub Pages, https://synapsesolutions-tutorconnect.github.io/TutorConnect/.
- Actualización documental: 25/11/2026.
- Navegador: Chrome con DevTools.
- Anchos revisados: 360, 768 y 1440 px.
- Trazabilidad: RNF-002 y capítulos 13.6 y 13.7.
- Estado: revisión realizada con pendientes documentados; pendiente de revisión por Carlos y validación del Scrum Master.

## Alcance y método

Se revisaron las ocho pantallas en celular, tableta y escritorio.
Se comprobó la distribución del contenido, la navegación y el acceso
a campos, botones y tablas.

En cada ancho se ejecutó:

`document.documentElement.scrollWidth > window.innerWidth`

El resultado reportado fue `false`. También se revisó visualmente que
el contenido no quedara cortado y que las tablas anchas pudieran
recorrerse dentro de su contenedor.

Las comprobaciones de estados se realizaron con DevTools:

- Carga: conexión limitada a 3G.
- Error de conexión: modo Offline.
- Recuperación: volver a No throttling y pulsar Reintentar.
- Vacío: ausencia real de registros o filtros sin coincidencias.

Un resultado correcto en la comparación de anchos no demuestra por
sí solo el cumplimiento de todos los requisitos de accesibilidad,
estados o funcionamiento.

## Matriz responsive

✅ indica que se revisó ese ancho y se reportó ausencia de
desbordamiento horizontal. No significa que todos los requisitos
funcionales de la pantalla estén terminados.

| Pantalla | 360 px | 768 px | 1440 px | Observaciones |
|---|---|---|---|---|
| Inicio y registro | [✅](capturas/responsive/index-360.jpeg) | [✅](capturas/responsive/index-768.jpeg) | [✅](capturas/responsive/index-1440.jpeg) | Se revisaron los formularios de inicio de sesión y registro. Evidencias adicionales del registro debajo de esta tabla. |
| Panel | [✅](capturas/responsive/panel-360.png) | [✅](capturas/responsive/panel-768.png) | [✅](capturas/responsive/panel-1440.png) | Barra inferior en móvil, ajuste de cabecera y distribución de escritorio. |
| Buscar | [✅](capturas/responsive/buscar-360.png) | [✅](capturas/responsive/buscar-768.png) | [✅](capturas/responsive/buscar-1440.png) | Una columna en móvil, tres columnas y menú lateral en escritorio. |
| Agenda | [✅](capturas/responsive/agenda-360.jpeg) | [✅](capturas/responsive/agenda-768.jpeg) | [✅](capturas/responsive/agenda-1440.jpeg) | Navegación responsive y tabla con desplazamiento interno. La confirmación de Retirar y el formulario Publicar conservan pendientes. |
| Solicitudes | [✅](capturas/responsive/solicitudes-360.jpeg) | [✅](capturas/responsive/solicitudes-768.jpeg) | [✅](capturas/responsive/solicitudes-1440.jpeg) | Se repitieron las capturas después de corregir la carga del script de sesión. |
| Postulación | [✅](capturas/responsive/postulacion-360.jpeg) | [✅](capturas/responsive/postulacion-768.jpeg) | [✅](capturas/responsive/postulacion-1440.jpeg) | Formulario y tabla revisados en los tres tamaños. |
| Perfil | [✅](capturas/responsive/perfil-360.png) | [✅](capturas/responsive/perfil-768.png) | [✅](capturas/responsive/perfil-1440.png) | Datos y navegación revisados. Solicitar actualización de datos sigue pendiente. |
| Administración | [✅](capturas/responsive/admin-360.jpeg) | [✅](capturas/responsive/admin-768.jpeg) | [✅](capturas/responsive/admin-1440.jpeg) | Tablas de Postulaciones y Catálogo revisadas. El reporte real de asesorías de Carlos está integrado. |

### Evidencias adicionales del registro

- [Registro en 360 px](capturas/responsive/index-registro-360.jpeg)
- [Registro en 768 px](capturas/responsive/index-registro-768.jpeg)
- [Registro en 1440 px](capturas/responsive/index-registro-1440.jpeg)

## Estados de interfaz

✅ = probado y reportado como correcto.
Pendiente = no hay confirmación suficiente para marcarlo como aprobado.

| Pantalla | Carga | Vacío | Error de conexión | Recuperación |
|---|---|---|---|---|
| Inicio y registro | ✅ Carga del catálogo de carreras | Pendiente: no se vació el catálogo para generar evidencia | ✅ | ✅ Carreras disponibles tras Reintentar |
| Panel | ✅ Skeletons de próximas citas | ✅ Sin próximas citas | ✅ | ✅ |
| Buscar | ✅ Tres skeletons y botón Procesando… | ✅ Búsqueda sin coincidencias | ✅ | ✅ Conservó los filtros y recuperó resultados |
| Agenda | ✅ | Pendiente de evidencia con cuenta autorizada sin horarios | ✅ | ✅ |
| Solicitudes | ✅ | Pendiente de confirmar una evidencia de vacío real | ✅ | ✅ Después de corregir la carga de sesión |
| Postulación | ✅ | Pendiente de evidencia con cuenta sin postulaciones | ✅ | ✅ |
| Perfil | ✅ | Pendiente: no se verificó un caso real de datos opcionales ausentes | ✅ | ✅ Recuperó los datos sin volver a iniciar sesión |
| Administración | ✅ Consultas de Postulaciones y Catálogo | ✅ Catálogo filtrado sin coincidencias | ✅ | ✅ |

El vacío del catálogo filtrado de Administración no demuestra que
se haya probado una base de datos sin materias.

En Perfil, “No registrado” corresponde a campos opcionales ausentes.
No debe simularse un perfil inexistente ni eliminar datos para obtener
una captura.

## Evidencias de estados

### Inicio y registro

- [Carga de carreras](capturas/responsive/index-carga.jpeg)
- [Error de conexión](capturas/responsive/index-error-conexion.jpeg)
- [Recuperación](capturas/responsive/index-recuperacion.jpeg)

### Panel

- [Carga](capturas/responsive/panel-carga.png)
- [Vacío: sin citas en las próximas 24 horas](capturas/responsive/panel-vacio.jpeg)
- [Error de conexión](capturas/responsive/panel-errordeconexion.png)
- [Recuperación](capturas/responsive/panel-recuperacion.png)

### Buscar

Las evidencias de carga, vacío, error, recuperación, Procesando…,
modal y tarjetas colapsables se conservan en la
[carpeta de capturas](capturas/responsive/).

Se verificó el mensaje:

> No encontramos asesorías disponibles para esta materia en la fecha seleccionada.

### Agenda

- [Carga](capturas/responsive/agenda-carga.png)
- [Error de conexión](capturas/responsive/agenda-error-conexion.png)
- [Recuperación](capturas/responsive/agenda-recuperacion.png)

### Solicitudes

- [Carga](capturas/responsive/solicitudes-carga.png)
- [Error de conexión](capturas/responsive/solicitudes-error-conexion.png)
- [Recuperación](capturas/responsive/solicitudes-recuperacion.png)

### Postulación

- [Carga](capturas/responsive/postulacion-carga.jpeg)
- [Error de conexión](capturas/responsive/postulacion-error-conexion.jpeg)
- [Recuperación](capturas/responsive/postulacion-recuperacion.jpeg)

### Perfil

- [Carga](capturas/responsive/perfil-carga.png)
- [Error de conexión](capturas/responsive/perfil-error-conexion.png)
- [Recuperación](capturas/responsive/perfil-recuperacion.png)

### Administración

- [Carga](capturas/responsive/admin-carga.jpeg)
- [Vacío por filtro sin coincidencias](capturas/responsive/admin-vacio.jpeg)
- [Error de conexión](capturas/responsive/admin-error-conexion.jpeg)
- [Recuperación](capturas/responsive/admin-recuperacion.jpeg)
- [Modal en móvil](capturas/responsive/admin-modal-360.jpeg)

## Accesibilidad y comportamiento verificados

### Buscar

- Las etiquetas Materia, Fecha y Modalidad enfocan sus campos.
- Las tarjetas colapsables funcionan con clic, Tab y Enter.
- Se probó la navegación del modal con teclado.
- El modal se adapta a pantalla completa en móvil.
- El botón Buscar muestra spinner y Procesando….
- El botón y los filtros se restauran al terminar, incluso ante error.
- Reintentar conserva los filtros de búsqueda.
- Se ajustaron colores para mejorar la legibilidad.

### Panel

- La barra inferior no tapa el contenido en móvil.
- La campana y el menú funcionan con clic y teclado.
- Se probaron Tab, Enter y Escape.
- Se verificaron carga, vacío y recuperación de próximas citas.

### Perfil

- La barra inferior y el contenido se revisaron en los tres tamaños.
- Se verificaron carga, error y recuperación del perfil.

### Solicitudes, Postulación e Inicio

- Se revisaron los tres tamaños y los estados reportados en la matriz.
- El paquete incorpora mejoras de foco y teclado en los modales,
  spinner y protección contra envíos repetidos.
- La revisión detallada de todos los modales, controles y variantes
  de rol debe completarse antes de declarar accesibilidad total.

### Administración

- Se revisaron las tablas y sus acciones accesibles mediante
  desplazamiento interno.
- Se probó el modal Agregar materia sin guardar cambios.
- Se reportó correcto el recorrido con Tab y cierre con Escape.

No se ha realizado una auditoría completa de contraste, lector de
pantalla, textos alternativos y dimensiones táctiles de todos los
controles de las ocho páginas.

## Correcciones realizadas durante la revisión

- Ajustes de cabeceras, formularios y distribución por ancho.
- Navegación inferior móvil y menú lateral de escritorio en las
  pantallas protegidas revisadas.
- Cuadrícula de tres columnas en Buscar para escritorio.
- Modal de Buscar adaptado a móvil.
- Tarjetas colapsables en Buscar y mejoras incorporadas en Solicitudes.
- Estados de carga, vacío y error recuperable en las consultas revisadas.
- Botones con spinner y texto Procesando….
- Conservación de filtros al reintentar consultas.
- Manejo de respuestas fuera de orden en consultas del lote.
- Mejoras de teclado y foco en modales.
- Ajustes para respetar la preferencia de movimiento reducido.
- Corrección de la carga de scripts mediante versiones en sus enlaces.

Durante las pruebas aparecieron errores como:

- `iniciarPaginaProtegidaConOpciones is not defined`
- `t24Recargar is not defined`

Se corrigió la carga de los archivos actualizados y se repitieron las
pruebas afectadas. Las capturas con esos errores no deben usarse como
evidencia de estado vacío ni como pruebas aprobadas de recuperación.

## Validación técnica

Durante el trabajo se ejecutaron comprobaciones de sintaxis JavaScript
con `node --check` y revisiones de espacios con `git diff --check`.

También se realizaron pruebas locales simuladas de error, recuperación,
resultados vacíos y respuestas fuera de orden en los paquetes preparados.

Estas comprobaciones complementan las pruebas manuales; no sustituyen
la validación en el navegador, los permisos de Supabase ni la revisión
de los flujos completos.

Antes del commit final se deben volver a ejecutar las comprobaciones
sobre los archivos que realmente están en la rama.

## Backlog acordado y límites

Por acuerdo con el Scrum Master, los pendientes de Agenda, los estados vacíos
restantes, la auditoría completa de accesibilidad y el flujo de actualización
de Perfil pasan a backlog y no bloquean el cierre de T24–T25. Esto no implica
que dichas pruebas o funciones estén aprobadas.

### Agenda

- Revisar completamente el formulario Publicar, incluidos teclado,
  validación, carga, error y cierre.
- Reemplazar o verificar la confirmación de Retirar para cumplir con:
  botón destructivo rojo y opción secundaria “No, mantener”.
- Adjuntar evidencia de vacío real si todavía no existe.

### Perfil

- El botón Solicitar actualización de datos no tiene una operación de
  backend identificada para guardar y gestionar solicitudes.
- Este flujo no se considera implementado ni aprobado.

### Administración

- El reporte real de asesorías de Carlos está integrado; se retira la observación anterior sobre valores fijos.
- Las pruebas de carga, vacío, error y recuperación documentadas
  corresponden a Postulaciones y Catálogo.

### Evidencias y accesibilidad

- Completar los estados vacíos pendientes sin borrar datos existentes.
- Confirmar las variantes de rol que no se hayan probado.
- Completar la revisión de todos los controles, contraste, áreas táctiles,
  textos alternativos y modales.
- Verificar que todos los enlaces del reporte correspondan a archivos
  existentes y a capturas posteriores a las correcciones.
- Confirmar que las tarjetas colapsables y las confirmaciones destructivas
  cumplen los requisitos en todas las pantallas donde aplican.

## Cierre y revisión

- [x] Revisión reportada de ocho pantallas en 360, 768 y 1440 px.
- [x] Ausencia de desbordamiento horizontal reportada en esos tamaños.
- [x] Pruebas de carga, error y recuperación reportadas.
- [x] Comprobaciones de sintaxis y espacios realizadas en la entrega de código.
- [x] Commit y push de la entrega original.
- [x] PR #35 integrado a qa.
- [x] Existencia de los 50 enlaces de la entrega anterior verificada por el Scrum Master.
- [ ] Comprobación de enlaces y espacios del nuevo cierre documental.
- [ ] Commit y push de las correcciones documentales de esta rama.
- [ ] Nuevo PR de documentación hacia qa.
- [ ] Revisión visual de las capturas sustituidas de Administración, Registro y vacío de Panel.
- [ ] Revisión y aprobación de Carlos en el nuevo PR.
- [ ] Validación final del Scrum Master.

Los pendientes funcionales, de vacíos y de auditoría de accesibilidad se
mantienen en el backlog acordado; no se marcan como pruebas aprobadas.

Commit de cierre previsto: `TC-27: corregir evidencias y reporte responsive`.

## Conclusión

La revisión permitió corregir problemas de distribución y navegación e
incorporar estados de carga y errores recuperables. Las pruebas manuales
reportaron ausencia de desbordamiento horizontal en los tres anchos.

El cierre de T24–T25 queda sujeto a la revisión de las evidencias corregidas,
la aprobación de Carlos y la validación del Scrum Master. Los pendientes
acordados pasan a backlog; no se declara una auditoría completa de
accesibilidad ni la aprobación de los flujos pendientes.
