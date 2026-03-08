// auth_guard.js - PROTECCIÓN GLOBAL DE SESIÓN (Gemini 12 - Firebase Version)
// IMPORTANTE: Este archivo usa firebaseAuth definido en js/firebase_config.js

function checkGlobalSession() {
    // Si auth (Firebase) no está listo, esperamos
    if (typeof auth === 'undefined') {
        console.error("Firebase Auth no encontrado. Asegúrate de incluir js/firebase_config.js antes.");
        return;
    }

    // Escuchar el estado de la sesión de Firebase
    auth.onAuthStateChanged((user) => {
        const currentPage = window.location.pathname;
        const isAuthPage = currentPage.includes('login.html') || currentPage.includes('register.html');
        const isRoot = currentPage === '/' || currentPage.endsWith('index.html');

        if (user) {
            // Sesión activa, guardar el UID globalmente
            window.currentUser = user;
            
            // Si hay sesión y estamos en login/register o en la raíz, ir al inventario
            if (isAuthPage || isRoot) {
                console.log("Sesión activa de Firebase, redirigiendo...");
                const redirectPath = isRoot ? 'pages/inventory.html' : 'inventory.html';
                window.location.href = redirectPath;
            }
            
            // Si la página tiene un body oculto (para evitar parpadeo), lo mostramos
            if (document.body.style.display === 'none') {
                document.body.style.display = 'block';
            }
        } else {
            // Si NO hay sesión y NO estamos en login/register, ir al login
            if (!isAuthPage) {
                console.warn("Acceso denegado: Sesión de Firebase no encontrada.");
                const redirectPath = isRoot ? 'pages/login.html' : 'login.html';
                window.location.href = redirectPath;
            }
        }
    });
}

// Ejecutar protección
checkGlobalSession();