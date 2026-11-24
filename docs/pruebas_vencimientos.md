# Pruebas de vencimientos automáticos — T23 (TC-24)

Responsable: Ximena Alcantara Omaña · Rama: `Ximena/Sp1` · Fecha: 21/11/2026

## Qué se prueba

| Regla | Descripción |
|---|---|
| RN-05 · Caducidad | Una solicitud **Pendiente** a 24 h o menos del inicio pasa a **Caducada**, la franja vuelve a Libre y se notifica a ambas partes (RF-007). |
| RN-09 · Cierre por omisión | Una cita **Aceptada** que el asesor no cierra en las 48 h siguientes a su fin pasa a **Sin registro** (RF-009). Solo estadística, sin bloqueos (RN-08). |

## Cómo se ejecuta `procesar_vencimientos()`

- **Al cargar las pantallas:** `js/sesion.js` → `iniciarPaginaProtegida()` hace `await ejecutar('procesar_vencimientos')`
  antes de que la página consulte las vistas. La usan `panel.html`, `buscar.html`, `agenda.html` y `solicitudes.html`.
- **Antes de cada operación:** `solicitar_asesoria`, `resolver_solicitud`, `cancelar_asesoria` y `marcar_resultado`
  ejecutan `PERFORM procesar_vencimientos()` al inicio (`sql/esquema.sql`).
- **Permiso:** `GRANT EXECUTE ON FUNCTION procesar_vencimientos() TO authenticated;` (documentado en `sql/esquema.sql`).
- **pg_cron:** opcional, no activado.

## Datos de prueba

`sql/pruebas_vencimientos.sql` (SQL Editor, rol postgres). Asesor: profesor1 (`43a01d3f-…`) · Estudiante: estudiante2 (`be2247d6-…`).
Las horas se calculan desde el momento de la ejecución y se ajustan a bloques válidos (07:00–20:00).

## Resultados

| Caso | Datos preparados | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| 1 · 23 h | Franja 125 «T23 · Caso 23 h (caducidad)», dom 22/11/2026 19:00 + solicitud **Pendiente** (id 98) | Al abrir `solicitudes.html`: **Caducada**; la franja deja de estar «Congelado» en Mi agenda; aviso de caducidad para estudiante y asesor | Solicitud 98 **Caducada**; franja 125 **Libre** en Mi agenda; aviso «Tu solicitud del 2026-11-22 19:00 caducó…» (estudiante2) y «La solicitud del 2026-11-22 19:00 caducó por falta de respuesta.» (profesor1) | ✅ |
| 2 · 49 h | Franja 126 «T23 · Caso 49 h (Sin registro)», jue 19/11/2026 18:00 + cita **Aceptada** (id 99) | **Sin registro**, sin botones de marcar ni calificar | Solicitud 99 **Sin registro**, sin botones (vista del asesor y del estudiante) | ✅ |
| 3 · 47 h (límite) | Franja 127 «T23 · Caso 47 h (límite)», vie 20/11/2026 07:00 + cita **Aceptada** (id 100) | Sigue **Aceptada** y el asesor ve «Realizada / No realizada» en Por cerrar | Solicitud 100 sigue **Aceptada**; en Por cerrar aparecen «No realizada / Realizada» y el aviso «vence dom 22 de nov, 08:00 a.m.»; en Mi agenda la franja sigue «Ocupado» | ✅ |

Prueba ejecutada el 21/11/2026 a las 21:00 (hora de Ciudad de México). `procesar_vencimientos()` se ejecutó al abrir
`solicitudes.html`; las solicitudes 98 y 99 se actualizaron en esa misma llamada (`fecha_actualizacion` idéntica).

## Evidencias

- `T23-0-datos-preparados.png` — resultado de `sql/pruebas_vencimientos.sql` (solicitudes 98, 99 y 100).
- `T23-1a-estudiante-caducada.png` — solicitudes.html del estudiante con la solicitud «Caducada».
- `T23-1b-agenda-asesor-libre.png` — Mi agenda del asesor: la franja del 22/11 19:00 está «Libre».
- `T23-1c-aviso-estudiante.png` — campana del estudiante con el aviso de caducidad.
- `T23-1c-aviso-asesor.png` — campana del asesor con el aviso de caducidad.
- `T23-1d-tabla-avisos.png` — tabla `notificacion` con los 2 avisos.
- `T23-2-sin-registro.png` — cita del caso 49 h en «Sin registro», sin botones.
- `T23-2a-agenda-vencido-49h.png` — Mi agenda: franja del caso 49 h «Vencido».
- `T23-3-limite-47h.png` — cita del caso 47 h en Por cerrar con «Realizada / No realizada».
- `T23-3a-agenda-ocupado-47h.png` — Mi agenda: franja del caso 47 h «Ocupado».
- `T23-4-tabla-estados.png` — consulta con los estados Caducada, Sin registro y Aceptada.
