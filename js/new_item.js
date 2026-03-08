// js/new_item.js - Registro Manual con Cerebro IA (Gemini 12)

const API_BASE = "http://localhost:3000/api";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newProductForm');
    const btnSearchImage = document.getElementById('btnSearchImage');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const imgPreview = document.getElementById('imgPreview');
    const placeholder = document.getElementById('placeholder');
    const imageUrlInput = document.getElementById('imageUrl');
    const nameInput = document.getElementById('name');
    const aiLoading = document.getElementById('aiLoading');
    const formContainer = document.getElementById('formContainer');

    // 1. Manejo de Imágenes
    btnSearchImage.onclick = async (e) => {
        e.stopPropagation();
        const name = nameInput.value;
        if (!name) return alert("Escribe el nombre del equipo para buscar su imagen.");

        btnSearchImage.innerText = "Buscando...";
        try {
            const resp = await fetch(`${API_BASE}/ia/buscar-imagen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: name })
            });
            const data = await resp.json();
            if (data.image_url) {
                imgPreview.src = data.image_url;
                imgPreview.style.display = 'block';
                placeholder.style.display = 'none';
                imageUrlInput.value = data.image_url;
            }
        } catch (err) {
            console.error(err);
        } finally {
            btnSearchImage.innerText = "🔍 Buscar Imagen Real";
        }
    };

    dropZone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
                imgPreview.src = re.target.result;
                imgPreview.style.display = 'block';
                placeholder.style.display = 'none';
                imageUrlInput.value = re.target.result; // Base64 (pequeño) o manejar upload
            };
            reader.readAsDataURL(file);
        }
    };

    // 2. Envío de Formulario + Cerebro IA
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        if (!window.currentUser) return alert("Debes estar logueado.");

        const productData = {
            name: nameInput.value,
            brand: document.getElementById('brand').value,
            price: parseFloat(document.getElementById('price').value),
            purchase_date: document.getElementById('date').value,
            warranty_months: parseInt(document.getElementById('months').value),
            serial: document.getElementById('serial').value || "No especificado",
            image_url: imageUrlInput.value || "",
            user_id: window.currentUser.uid,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Mostrar carga de IA
        formContainer.style.display = 'none';
        aiLoading.style.display = 'block';

        try {
            // A. Guardar Producto en Firestore
            const productRef = await db.collection('products').add(productData);
            const productId = productRef.id;

            // B. Consultar Cerebro IA (Gemini) para el Plan de Mantenimiento
            const iaResp = await fetch(`${API_BASE}/ia/consultar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ objeto: productData.name })
            });
            const iaData = await iaResp.json();

            // C. Guardar Tareas de Mantenimiento Sugeridas
            if (iaData.sugerencias && iaData.sugerencias.length > 0) {
                const batch = db.batch();
                iaData.sugerencias.forEach(task => {
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

            // D. Registrar Log
            if (typeof saveLog === 'function') {
                saveLog("Nuevo Registro IA", `Se registró ${productData.name} con plan de mantenimiento preventivo.`);
            }

            // Éxito: Redirigir al inventario
            window.location.href = 'inventory.html';

        } catch (error) {
            console.error("Error en proceso:", error);
            alert("Error al procesar el equipo: " + error.message);
            formContainer.style.display = 'block';
            aiLoading.style.display = 'none';
        }
    };
});