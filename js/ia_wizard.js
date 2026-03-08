// js/ia_wizard.js - Wizard de IA (Gemini 12 - Firestore)

const API_BASE = "http://localhost:3000/api";

document.addEventListener('DOMContentLoaded', () => {
    const wizardForm = document.getElementById('wizardForm');
    const inputObjeto = document.getElementById('inputObjeto');
    const loadingState = document.getElementById('loadingState');
    const resultState = document.getElementById('resultState');
    
    if (!wizardForm) return;

    wizardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const objeto = inputObjeto.value;
        if (!objeto) return;

        // UI: Procesando
        wizardForm.style.display = 'none';
        loadingState.style.display = 'block';

        try {
            // 1. Consultar IA (Gemini)
            const resp = await fetch(`${API_BASE}/ia/consultar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ objeto })
            });
            const data = await resp.json();

            // 2. Buscar Imagen Automáticamente
            const imgResp = await fetch(`${API_BASE}/ia/buscar-imagen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: data.nombre_objeto || objeto })
            });
            const imgData = await imgResp.json();

            // 3. Preparar Datos para Guardar
            if (!window.currentUser) throw new Error("Sesión no encontrada");

            const productData = {
                name: data.nombre_objeto || objeto,
                brand: "Sugerido por IA",
                category: data.categoria_sugerida || "Tecnología",
                price: 0,
                purchase_date: new Date().toISOString().split('T')[0],
                warranty_months: 12,
                image_url: imgData.image_url || "",
                user_id: window.currentUser.uid,
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            };

            // 4. Guardar en Firestore
            const productRef = await db.collection('products').add(productData);
            const productId = productRef.id;

            // 5. Guardar Tareas de Mantenimiento
            if (data.sugerencias) {
                const batch = db.batch();
                data.sugerencias.forEach(task => {
                    const taskRef = db.collection('maintenance_tasks').doc();
                    batch.set(taskRef, {
                        product_id: productId,
                        user_id: window.currentUser.uid,
                        name: task.tarea,
                        frequency_days: task.frecuencia_dias,
                        importance: task.importancia,
                        description: task.descripcion,
                        is_active: true,
                        created_at: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
                await batch.commit();
            }

            // UI: Éxito
            loadingState.style.display = 'none';
            resultState.style.display = 'block';
            
            // Log
            if (typeof saveLog === 'function') {
                saveLog("Wizard IA", `Se autogeneró ${productData.name} con plan preventivo.`);
            }

            // Redirigir tras 2 segundos
            setTimeout(() => {
                window.location.href = 'inventory.html';
            }, 2500);

        } catch (error) {
            console.error(error);
            alert("Error del Wizard: " + error.message);
            wizardForm.style.display = 'block';
            loadingState.style.display = 'none';
        }
    });
});