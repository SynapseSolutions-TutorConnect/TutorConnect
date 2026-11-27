# T28 · TC-44, TC-45 y TC-46

Base: qa, commit 5011eef507a2c3b3982836d83195e0d4aa1dad87.

## Cambios

- TC-44: aviso de conexión con icono, colores institucionales y un solo mensaje al fallar el inicio de sesión. Reintentar consulta la conexión sin volver a enviar credenciales ni registrar cuentas. La recuperación conserva los campos. También se aplica el estilo al error de consulta de carreras del registro.
- TC-45: se conserva un único título principal en Solicitudes y se distinguen las secciones «Como estudiante» y «Como asesor» mediante subtítulos de menor jerarquía.
- TC-46: iconos SVG decorativos con texto visible, opción activa y foco visibles en las navegaciones de las siete pantallas protegidas. Se conservan los atributos de autorización y las rutas existentes.

## Verificación local (25/11/2026)

Chrome automatizado, respuestas de Supabase y roles simulados. No son pruebas de permisos de la base de datos ni evidencia final sobre GitHub Pages.

- Sintaxis de los dos archivos JavaScript modificados/agregados.
- Login: fallo de red, un único aviso, Reintentar, recuperación, conservación del correo y ausencia de reenvío automático de credenciales.
- Login: un intento posterior con credenciales inválidas oculta el aviso anterior y muestra el error de credenciales.
- Registro: fallo de consulta de carreras y recuperación por Reintentar.
- Solicitudes: título principal único, iconos y enlaces restringidos ocultos para tres roles simulados.
- Navegación de Panel, Buscar, Agenda, Perfil, Postulación y Administración: iconos y ausencia de desbordamiento horizontal.
- Anchos comprobados: 360, 768 y 1440 px.
- Contraste calculado de texto/fondo: navegación 9.26:1, hover 8.80:1, opción activa 11.41:1, aviso 9.90:1 y recuperación 8.70:1.

## Validación final pendiente

1. En la rama de T28, abrir Index, activar Offline e intentar iniciar sesión con una cuenta de prueba. Capturar en 360, 768 y 1440 px. Volver a No throttling y pulsar Reintentar; comprobar recuperación y campos conservados. Probar también la carga de carreras en Registro.
2. Revisar Solicitudes como estudiante y como asesor en los tres anchos; verificar títulos, pestañas y acciones existentes.
3. Revisar navegación con Estudiante, Profesor y Coordinador; comprobar iconos, opción activa, destinos, teclado, menú móvil y ausencia de opciones no autorizadas.
4. Adjuntar las capturas reales a TC-44, TC-45 y TC-46. No usar las capturas locales simuladas como evidencia de una ejecución publicada.
5. Revisar el PR hacia qa y completar el flujo de integración qa → main. GitHub Pages se publica desde main; verificar de nuevo después del despliegue.

No se declara publicada la modificación ni terminadas las subtareas hasta completar su revisión y evidencia.
