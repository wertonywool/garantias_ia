// js/login.js - Lógica de Inicio de Sesión (Gemini 12 - Firebase)

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const btnGoogle = document.getElementById('btn-google');
    const authUI = document.getElementById('auth-ui');
    const loadingUI = document.getElementById('loading-ui');

    // Función para mostrar/ocultar carga
    const toggleLoading = (show) => {
        authUI.style.display = show ? 'none' : 'block';
        loadingUI.style.display = show ? 'block' : 'none';
    };

    // 1. LOGIN CON EMAIL Y CONTRASEÑA
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        toggleLoading(true);

        try {
            await auth.signInWithEmailAndPassword(email, password);
            console.log("Inicio de sesión exitoso");
            // El auth_guard se encarga de la redirección
        } catch (error) {
            console.error("Error en login:", error.message);
            alert("Error al iniciar sesión: " + error.message);
            toggleLoading(false);
        }
    });

    // 2. LOGIN CON GOOGLE
    btnGoogle.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        toggleLoading(true);

        try {
            await auth.signInWithPopup(provider);
            console.log("Inicio de sesión con Google exitoso");
            // El auth_guard se encarga de la redirección
        } catch (error) {
            console.error("Error en Google login:", error.message);
            alert("Error con Google: " + error.message);
            toggleLoading(false);
        }
    });
});