# 🛡️ Gemini 12: Actualización de Autenticación y Ecosistema Cloud

Esta actualización marca el paso definitivo de **GarantíaPro** de una herramienta local a una plataforma profesional en la nube, integrada totalmente en el ecosistema **The Workers** de **Servidiesel Cali SAS**.

## 🚀 Cambios Principales

### 1. Migración Total a Firebase (Fire Console)
Hemos abandonado las bases de datos locales y Supabase para unificarnos con la tecnología de **Firebase**.
- **Autenticación:** Ahora utilizas Firebase Auth para gestionar usuarios.
- **Base de Datos:** Los datos se guardan en **Firestore**, permitiendo persistencia real y acceso desde cualquier dispositivo.
- **Ecosistema:** Los usuarios de "The Workers" pueden entrar con sus mismas credenciales.

### 2. Seguridad y Protección Global (`auth_guard.js`)
Se ha implementado un "Portero" inteligente que protege todas las páginas:
- **Redirección Automática:** Si no estás logueado, el sistema te envía al Login de inmediato.
- **Prevención de Bucles:** Se corrigió el error de "parpadeo" asegurando que la página solo se muestre una vez confirmada la sesión.
- **Filtro de Usuario:** Cada usuario solo puede ver y editar sus propios equipos gracias a la vinculación del `UID` de Firebase.

### 3. Registro Manual con "Cerebro" IA
Ahora, el registro manual es más inteligente:
- Al guardar un equipo, el sistema consulta automáticamente a **Gemini**.
- La IA genera un **Plan de Mantenimiento Preventivo** (tareas, frecuencias e importancia) basado en el nombre y precio del activo.
- Todo se guarda en un solo documento de Firestore para máxima velocidad.

### 4. Búsqueda de Imágenes Realista
- Se eliminó la generación de imágenes aleatorias.
- Se implementó un motor de búsqueda que intenta obtener la **foto oficial del producto** desde Google o bancos de imágenes reales.

## 🛠️ Configuración Técnica

Para mantener la estabilidad, se han unificado los archivos de configuración:
- **`js/firebase_config.js`**: Contiene las llaves de acceso a tu Firebase Console.
- **`js/main.js`**: Centraliza funciones como el cierre de sesión (Logout).
- **`server.js`**: Optimizado para manejar solo las peticiones pesadas de IA, protegiendo las API Keys en el servidor.

## 📋 Próximos Pasos Recomendados
1. **Verificar Reglas de Firestore:** Asegúrate de que las reglas en Firebase Console permitan lectura/escritura solo a usuarios autenticados.
2. **Personalización de Perfil:** Próximamente se añadirá la opción de cambiar la foto y nombre del encargado del taller.

---
**Desarrollado para Servidiesel Cali SAS - 2026**
