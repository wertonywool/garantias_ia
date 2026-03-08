// js/register.js - Lógica de Registro (Gemini 12 - Firebase)

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const authUI = document.getElementById('auth-ui');
    const loadingUI = document.getElementById('loading-ui');

    // Función para mostrar/ocultar carga
    const toggleLoading = (show) => {
        authUI.style.display = show ? 'none' : 'block';
        loadingUI.style.display = show ? 'block' : 'none';
    };

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        toggleLoading(true);

        try {
            await auth.createUserWithEmailAndPassword(email, password);
            console.log("Registro exitoso");
            // El auth_guard se encarga de la redirección
        } catch (error) {
            console.error("Error en registro:", error.message);
            alert("Error al registrar: " + error.message);
            toggleLoading(false);
        }
    });
});