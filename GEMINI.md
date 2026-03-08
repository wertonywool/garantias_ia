# Contexto del Proyecto: GarantíaPro (Object Lifecycle Manager)

Este proyecto ha evolucionado de un rastreador de garantías a un **Administrador de Ciclo de Vida de Objetos** impulsado por IA.

## Arquitectura Técnica
- **Backend:** Node.js + Express.
- **Base de Datos:** SQLite3 (Persistencia robusta y relacional).
- **Frontend:** Vanilla JavaScript, HTML5 y CSS3 (Separación clara de archivos por página).
- **IA:** Google Generative AI (Modelo: `gemini-2.5-flash`, API Version: `v1`).

## Estructura de Datos (SQLite3)
El sistema utiliza 4 tablas principales en `db.js`:
1. `products`: Almacena la información del objeto (nombre, marca, fecha de compra, etc.).
2. `maintenance_tasks`: Tareas preventivas sugeridas por la IA o manuales vinculadas a un producto.
3. `maintenance_logs`: Historial de ejecuciones de mantenimiento.
4. `system_logs`: Auditoría general de movimientos en la app.

## Flujo del IA Wizard
1. El usuario ingresa el nombre de un objeto.
2. El servidor consulta a Gemini con un prompt estructurado.
3. Gemini responde con un JSON que contiene:
   - Categoría sugerida.
   - Lista de tareas con: nombre, frecuencia (en días), importancia y descripción.
4. El sistema guarda el producto y genera automáticamente las tareas en la base de datos.

## Mandatos del Proyecto
1. **Migración de Datos:** Se debe priorizar la eliminación del uso de `localStorage` en favor de la API del servidor (`/api/products`, `/api/tasks`).
2. **Seguridad:** La API Key de Gemini debe permanecer en el Backend (`server.js`) y nunca exponerse al cliente.
3. **Organización:** Mantener la separación de archivos (un CSS y un JS dedicado por cada HTML).
4. **Validación:** Cada registro de producto debe asegurar la integridad de las relaciones en la base de datos.

## Próximos Pasos
- Migrar `inventory.js` para leer desde la base de datos.
- Implementar la lógica de "Alertas Próximas" basándose en la fecha de `next_due` de las tareas de mantenimiento.
- Refactorizar `edit.html` para soportar la edición de tareas de mantenimiento.

## Registro de Migración y Cambios (Marzo 2026)
Se ha completado la migración estructural de `localStorage` hacia la persistencia en SQLite3 a través de la API de Node.js.

### Cambios Realizados:
- **Base de Datos (`db.js`):** Se actualizaron las columnas de la tabla `products` para incluir `price` (REAL) y `serial` (TEXT), permitiendo una gestión financiera y de identificación más precisa.
- **Backend (`server.js`):** Implementación completa del CRUD para productos (`GET`, `POST`, `PUT`, `DELETE`) y logs de sistema. Se añadió el endpoint `GET /api/products/:id/tasks` para recuperar el plan de mantenimiento de un objeto específico.
- **Frontend (Migración Total):**
  - `inventory.js`: Carga dinámica desde la DB y cálculo de garantías en tiempo real.
  - `edit.js`: Implementación de guardado persistente (`PUT`) y carga de datos iniciales.
  - `history.js`: Visualización y limpieza de logs desde la base de datos.
  - `alerts.js`: Funcionalidad de extensión de garantía vinculada a la API.
  - `ia_wizard.js`: Registro de productos generados por IA sincronizado con el nuevo esquema de la DB.
- **Interfaz de Edición (`edit.html`):** Se añadió la sección "🛠️ Plan de Mantenimiento Sugerido" para visualizar las tareas generadas por Gemini durante la edición del activo.

### Información para Testing y Debugging:
- **Persistencia:** Si se producen errores de "columna no encontrada", se debe eliminar el archivo `database.db` local para que el sistema lo recree con el esquema actualizado.
- **Sincronización:** Los logs de sistema ahora se generan automáticamente en el servidor mediante disparadores en las rutas de `POST`, `PUT` y `DELETE`.
- **Campos IA:** El Wizard ahora envía valores por defecto (`price: 0`, `serial: "Generado por IA"`) para mantener la integridad de la base de datos.

## Actualización de Estabilidad y Capacidades IA (6 de marzo de 2026)

### Mejoras de Inteligencia y Extracción de Datos:
- **Backend (`server.js`):** Se optimizó el prompt de Gemini para actuar como un extractor de entidades. Ahora identifica automáticamente el nombre del objeto, calcula fechas relativas (ej: "ayer", "hace 3 días") basándose en la fecha actual del servidor, y extrae precios numéricos del texto de entrada.
- **Frontend (`ia_wizard.js`):** Se rediseñó la visualización de resultados para mostrar los datos extraídos (Nombre, Fecha, Precio) antes del guardado definitivo.
- **Lógica de Persistencia:** El guardado ahora utiliza la información dinámica de la IA en lugar de valores estáticos o genéricos.

### Correcciones Críticas de Base de Datos:
- **Resolución de Error 500:** Se identificó y resolvió un fallo de desincronización de esquema donde la base de datos física no contenía las columnas `price` y `serial`.
- **Protocolo de Recreación:** Se ejecutó la eliminación controlada del archivo `database.db` para forzar la regeneración del esquema completo según las especificaciones de `db.js`.
- **Depuración:** Se utilizó un script temporal de diagnóstico (`debug_db.js`) para verificar la integridad de las columnas antes de aplicar la solución definitiva.
