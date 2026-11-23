-- =====================================================================
-- T23 · TC-24 · Pruebas de vencimientos automáticos (RN-05 y RN-09)
--
-- Crea 3 casos con profesor1 (asesor de Bases de Datos) y estudiante2:
--   Caso 1 · 23 h : franja que empieza en menos de 24 h + solicitud Pendiente
--                   -> al cargar una pantalla pasa a «Caducada» (RN-05).
--   Caso 2 · 49 h : cita Aceptada cuyo fin fue hace más de 48 h
--                   -> pasa a «Sin registro» (RN-09).
--   Caso 3 · 47 h : cita Aceptada cuyo fin fue hace menos de 48 h
--                   -> sigue «Aceptada» y el asesor aún puede marcarla (límite).
--
-- Se ejecuta en SQL Editor con el rol postgres (insert directo, porque la
-- interfaz no permite solicitar con menos de 24 h ni crear citas pasadas).
-- Las horas se calculan desde el momento de la ejecución (Ciudad de México)
-- y se ajustan a bloques de 1 hora entre 07:00 y 20:00 (chk_franja_hora).
-- Puede ejecutarse de nuevo: ON CONFLICT evita franjas duplicadas y solo se
-- crea solicitud si la franja no tiene una Pendiente o Aceptada.
--
-- IMPORTANTE: procesar_vencimientos() corre cada vez que alguien abre una
-- pantalla, así que los casos 1 y 2 cambian de estado en cuanto se cargue
-- cualquier página. Ejecutar este archivo justo antes de probar.
-- =====================================================================
BEGIN;

DO $$
DECLARE
  v_asesor     UUID;
  v_materia    BIGINT;
  v_estudiante UUID;
  v_ahora      TIMESTAMP := now() AT TIME ZONE 'America/Mexico_City';
  v_t          TIMESTAMP;
  v_inicio_23  TIMESTAMP;
  v_inicio_49  TIMESTAMP;
  v_inicio_47  TIMESTAMP;
BEGIN
  SELECT u.id_usuario, a.id_materia INTO v_asesor, v_materia
  FROM usuario u
  JOIN asesor_materia a ON a.id_asesor = u.id_usuario AND a.estado_autorizacion = 'Aprobada'
  WHERE u.correo_institucional = 'profesor1@pachuca.tecnm.mx'
  ORDER BY a.id_materia
  LIMIT 1;

  SELECT id_usuario INTO v_estudiante
  FROM usuario WHERE correo_institucional = 'estudiante2@pachuca.tecnm.mx';

  IF v_asesor IS NULL OR v_estudiante IS NULL THEN
    RAISE EXCEPTION 'Faltan profesor1 (aprobado) o estudiante2: ejecutar antes sql/datos_prueba.sql';
  END IF;

  -- Caso 1 · 23 h: la hora en punto más cercana a «ahora + 23 h» que sea
  -- futura y válida (07:00–20:00). Siempre queda a 24 h o menos.
  v_t := date_trunc('hour', v_ahora + INTERVAL '23 hours');
  WHILE (v_t::TIME NOT BETWEEN TIME '07:00' AND TIME '20:00') LOOP
    v_t := v_t - INTERVAL '1 hour';
  END LOOP;
  IF v_t <= v_ahora THEN
    RAISE EXCEPTION 'No hay un bloque válido en las próximas 24 h; ejecutar entre las 07:00 y las 20:00.';
  END IF;
  v_inicio_23 := v_t;

  -- Caso 2 · 49 h: fin hace 49 h o más (inicio = ahora − 50 h, hacia atrás).
  v_t := date_trunc('hour', v_ahora - INTERVAL '50 hours');
  WHILE (v_t::TIME NOT BETWEEN TIME '07:00' AND TIME '20:00') LOOP
    v_t := v_t - INTERVAL '1 hour';
  END LOOP;
  v_inicio_49 := v_t;

  -- Caso 3 · 47 h: fin hace menos de 48 h pero ya pasado (hacia adelante).
  v_t := date_trunc('hour', v_ahora - INTERVAL '48 hours') + INTERVAL '1 hour';
  WHILE (v_t::TIME NOT BETWEEN TIME '07:00' AND TIME '20:00') LOOP
    v_t := v_t + INTERVAL '1 hour';
  END LOOP;
  IF v_t + INTERVAL '1 hour' > v_ahora THEN
    RAISE EXCEPTION 'No hay un bloque terminado en las últimas 48 h para el caso de 47 h.';
  END IF;
  v_inicio_47 := v_t;

  INSERT INTO franja_disponibilidad (id_asesor, id_materia, fecha, hora_inicio, modalidad, ubicacion_presencial)
  VALUES
    (v_asesor, v_materia, v_inicio_23::DATE, v_inicio_23::TIME, 'Presencial', 'T23 · Caso 23 h (caducidad)'),
    (v_asesor, v_materia, v_inicio_49::DATE, v_inicio_49::TIME, 'Presencial', 'T23 · Caso 49 h (Sin registro)'),
    (v_asesor, v_materia, v_inicio_47::DATE, v_inicio_47::TIME, 'Presencial', 'T23 · Caso 47 h (límite)')
  ON CONFLICT (id_asesor, fecha, hora_inicio) DO NOTHING;

  INSERT INTO solicitud_asesoria (id_estudiante, id_disponibilidad, estado)
  SELECT v_estudiante, f.id_disponibilidad,
         CASE WHEN f.fecha = v_inicio_23::DATE AND f.hora_inicio = v_inicio_23::TIME
              THEN 'Pendiente' ELSE 'Aceptada' END
  FROM franja_disponibilidad f
  WHERE f.id_asesor = v_asesor
    AND (f.fecha, f.hora_inicio) IN ((v_inicio_23::DATE, v_inicio_23::TIME),
                                     (v_inicio_49::DATE, v_inicio_49::TIME),
                                     (v_inicio_47::DATE, v_inicio_47::TIME))
    AND f.ubicacion_presencial LIKE 'T23 ·%'
    AND NOT EXISTS (
      SELECT 1 FROM solicitud_asesoria s
      WHERE s.id_disponibilidad = f.id_disponibilidad
        AND s.estado IN ('Pendiente', 'Aceptada')
    );

  RAISE NOTICE 'Caso 23 h: %  ·  Caso 49 h: %  ·  Caso 47 h: %', v_inicio_23, v_inicio_49, v_inicio_47;
END $$;

COMMIT;

-- Resultado: estados de los 3 casos (ejecutar de nuevo después de abrir
-- solicitudes.html para ver los cambios de procesar_vencimientos).
SELECT s.id_solicitud_asesoria, f.id_disponibilidad, f.fecha, f.hora_inicio,
       f.ubicacion_presencial, s.estado, s.fecha_actualizacion
FROM solicitud_asesoria s
JOIN franja_disponibilidad f USING (id_disponibilidad)
WHERE f.ubicacion_presencial LIKE 'T23 ·%'
ORDER BY s.id_solicitud_asesoria DESC
LIMIT 3;
