// js/main.js - Funciones globales y compartidas (Gemini 12 - Firebase)

document.addEventListener('DOMContentLoaded', () => {
    // Escuchar el estado de la sesión para actualizar el perfil en el header
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(user => {
            if (user) {
                const nameDisplay = document.getElementById('userNameDisplay');
                const emailDisplay = document.getElementById('userEmailDisplay');
                
                if (nameDisplay) nameDisplay.innerText = user.displayName || "Usuario";
                if (emailDisplay) emailDisplay.innerText = user.email;
            }
        });
    }

    setupMenu();
});

// Cerrar Sesión
async function logout() {
    try {
        await auth.signOut();
        console.log("Sesión cerrada correctamente.");
        // auth_guard redirigirá automáticamente a login.html
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
}

function setupMenu() {
    const toggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    if(toggle) {
        toggle.onclick = () => sidebar.classList.toggle('active');
    }
}

// Abrir Perfil (Placeholder)
function openProfile() {
    alert("Próximamente: Edición de perfil de 'The Workers'");
}

// Guardar en Historial (Firestore)
async function saveLog(action, details) {
    if (!window.currentUser) return;
    
    try {
        await db.collection('system_logs').add({
            user_id: window.currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            action: action,
            details: details
        });
    } catch (error) {
        console.error("Error guardando log:", error);
    }
}

// Lógica de Modal compartida
function openModal() {
    const modal = document.getElementById('modalOverlay');
    if(modal) modal.style.display = 'grid';
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if(modal) modal.style.display = 'none';
}