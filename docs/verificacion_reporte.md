# Verificación del Reporte de Coordinador (TC-26 · RF-012)

- **Periodo evaluado:** `2026-08-01` al `2026-12-31` (Semestre agosto – diciembre 2026 completo)
- **Función verificada:** `reporte_materias(p_desde, p_hasta)` vs. consulta SQL directa sobre `solicitud_asesoria`, `franja_disponibilidad`, `materia` y `evaluacion`.
- **Nota sobre el rango de fechas:** Se utiliza `DATE '2026-12-31'` como límite superior en lugar de `CURRENT_DATE` porque `reporte_materias` filtra por la fecha programada de la asesoría (`franja_disponibilidad.fecha`), permitiendo contabilizar también las 3 solicitudes activas (`Pendiente` / `Aceptada`) agendadas para fechas posteriores al corte actual.

## 1. Consulta SQL directa utilizada

```sql
SELECT
  m.nombre_materia AS materia,
  COUNT(s.id_solicitud_asesoria) AS solicitadas,
  COUNT(*) FILTER (WHERE s.estado = 'Realizada') AS realizadas,
  ROUND(
    COUNT(*) FILTER (WHERE s.estado = 'Realizada')::NUMERIC
    / NULLIF(COUNT(s.id_solicitud_asesoria), 0) * 100,
    1
  ) AS tasa_realizacion_pct,
  COUNT(*) FILTER (WHERE s.estado IN ('No realizada', 'Sin registro')) AS no_realizadas_sin_reg,
  COUNT(*) FILTER (WHERE s.estado = 'Cancelada') AS canceladas,
  COUNT(*) FILTER (WHERE s.estado IN ('Caducada', 'Rechazada')) AS caducadas_rechazadas,
  ROUND(AVG(e.puntuacion), 2) AS promedio_calificacion
FROM public.solicitud_asesoria s
JOIN public.franja_disponibilidad f ON f.id_disponibilidad = s.id_disponibilidad
JOIN public.materia m ON m.id_materia = f.id_materia
LEFT JOIN public.evaluacion e ON e.id_solicitud_asesoria = s.id_solicitud_asesoria
WHERE f.fecha BETWEEN DATE '2026-08-01' AND DATE '2026-12-31'
GROUP BY m.nombre_materia
ORDER BY solicitadas DESC;
```

## 2. Comparativa materia por materia (SQL directo vs. Interfaz SCR-007)

| Materia | Solicitadas (SQL / UI) | Realizadas (SQL / UI) | Tasa realización (SQL / UI) | No realizadas / sin reg. (SQL / UI) | Canceladas (SQL / UI) | Caducadas / rechazadas (SQL / UI) | Promedio (SQL / UI) | ¿Coincide? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Taller de Base de Datos | 19 / 19 | 3 / 3 | 15.8 / 15.8% | 4 / 4 | 4 / 4 | 6 / 6 | NULL / — | Sí |
| Fundamentos de Programación | 9 / 9 | 3 / 3 | 33.3 / 33.3% | 4 / 4 | 0 / 0 | 2 / 2 | NULL / — | Sí |
| Base de Datos | 9 / 9 | 1 / 1 | 11.1 / 11.1% | 7 / 7 | 0 / 0 | 0 / 0 | 4.00 / 4.00 | Sí |
| Bases de Datos | 2 / 2 | 1 / 1 | 50.0 / 50.0% | 1 / 1 | 0 / 0 | 0 / 0 | NULL / — | Sí |
| Tópicos Avanzados de Programción | 1 / 1 | 0 / 0 | 0.0 / 0.0% | 0 / 0 | 1 / 1 | 0 / 0 | NULL / — | Sí |
| Calculo diferencial | 1 / 1 | 0 / 0 | 0.0 / 0.0% | 1 / 1 | 0 / 0 | 0 / 0 | NULL / — | Sí |
| **Total del periodo** | **41 / 41** | **8 / 8** | **19.5 / 19.5%** | **17 / 17** | **5 / 5** | **8 / 8** | **4.00 / 4.00** | **Sí** |

*(Observación: La suma de estados cerrados es `8 + 17 + 5 + 8 = 38`; las 3 solicitudes restantes para completar las `41` solicitadas corresponden a citas activas en estado `Pendiente` o `Aceptada` dentro del periodo.)*

## 3. Indicadores resumidos verificados en tarjetas superiores

- **Solicitadas:** `41`
- **Realizadas:** `8 (19.5%)`
- **No realizadas / sin registro:** `17`
- **Canceladas:** `5`
- **Materia con más demanda:** `Taller de Base de Datos` (`19 solicitud(es)`)
- **Promedio general:** `4.00` (`★★★★☆`)

## 4. Pruebas de seguridad y estados

1. **Periodo sin datos (`2025-01-01` a `2025-01-31`):** La interfaz muestra el mensaje `No hay asesorías registradas en este periodo`.
2. **Validación de fechas (`Desde > Hasta`):** La interfaz muestra el mensaje de error `La fecha «Desde» no puede ser mayor que la fecha «Hasta».` sin ejecutar la consulta.
3. **Acceso como Estudiante (`l23021613@pachuca.tecnm.mx`):**
   - La pestaña **Administración** no aparece en la barra de navegación.
   - Al navegar manualmente a `admin.html`, `iniciarPaginaProtegida('Coordinador')` redirige automáticamente a `panel.html`.
   - Al intentar invocar `ejecutar('reporte_materias', { p_desde: '2026-08-01', p_hasta: '2026-12-31' })` desde la consola del navegador con sesión de estudiante, PostgreSQL rechaza la operación con el mensaje: `Solo el coordinador puede ver reportes.`.