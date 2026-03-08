const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
let base64Image = "";

async function loadProductData() {
    if (!productId) {
        alert("ID de producto no proporcionado");
        window.location.href = "inventory.html";
        return;
    }

    try {
        // 1. Cargar datos del producto
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error('No se pudo cargar el producto');
        const product = await response.json();

        // Rellenar formulario
        document.getElementById('editName').value = product.name || "";
        document.getElementById('editPrice').value = product.price || 0;
        document.getElementById('editDate').value = product.purchase_date || "";
        document.getElementById('editMonths').value = product.warranty_months || 0;
        document.getElementById('editSerial').value = product.serial || "";
        document.getElementById('editNotes').value = product.notes || "";
        
        // Manejar categoría
        const catSelect = document.getElementById('categorySelect');
        if ([...catSelect.options].some(opt => opt.value === product.category)) {
            catSelect.value = product.category;
        } else if (product.category) {
            catSelect.value = "OTRA";
            const customInput = document.getElementById('customCategory');
            customInput.style.display = 'block';
            customInput.value = product.category;
        }

        // Manejar imagen
        if (product.image_url) {
            const img = document.getElementById('imgDisplay');
            img.src = product.image_url;
            img.style.display = 'block';
            document.getElementById('placeholderText').style.display = 'none';
            base64Image = product.image_url;
        }

        // 2. Cargar tareas de mantenimiento
        loadTasks();

    } catch (error) {
        console.error('Error:', error);
        alert("Error al cargar datos: " + error.message);
    }
}

async function loadTasks() {
    const tasksContainer = document.getElementById('tasksContainer');
    try {
        const response = await fetch(`/api/products/${productId}/tasks`);
        if (!response.ok) throw new Error('No se pudieron cargar las tareas');
        const tasks = await response.json();

        if (tasks.length === 0) {
            tasksContainer.innerHTML = '<p class="text-muted" style="font-size: 0.85rem;">No hay tareas de mantenimiento para este activo.</p>';
            return;
        }

        tasksContainer.innerHTML = tasks.map(t => `
            <div class="task-item-mini" style="background: #f8fafc; padding: 10px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid ${getImportanceColor(t.importance)};">
                <div style="display: flex; justify-content: space-between;">
                    <strong style="font-size: 0.9rem;">${t.task_name}</strong>
                    <span style="font-size: 0.75rem; color: #64748b;">Cada ${t.frequency_days} días</span>
                </div>
                <p style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Importancia: ${t.importance}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        tasksContainer.innerHTML = '<p style="color:red;">Error al cargar tareas.</p>';
    }
}

function getImportanceColor(imp) {
    if (imp === 'Alta') return '#ef4444';
    if (imp === 'Media') return '#f59e0b';
    return '#10b981';
}

// Manejo de archivo local
document.getElementById('fileInput').onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function() {
            const img = document.getElementById('imgDisplay');
            img.src = reader.result;
            img.style.display = 'block';
            document.getElementById('placeholderText').style.display = 'none';
            base64Image = reader.result;
        }
        reader.readAsDataURL(file);
    }
};

function checkCustomCategory(val) {
    const customInput = document.getElementById('customCategory');
    customInput.style.display = (val === "OTRA") ? "block" : "none";
}

function toggleAdvanced() {
    const sec = document.getElementById('advancedSection');
    sec.style.display = (sec.style.display === "block") ? "none" : "block";
}

async function magicImageIA() {
    const name = document.getElementById('editName').value;
    if(!name) { alert("Escribe un nombre primero para que la IA sepa qué buscar."); return; }
    
    const loader = document.getElementById('aiLoader');
    const btnMagic = document.getElementById('btnMagicIA');
    const btnRetry = document.getElementById('btnRetryIA');
    const status = document.getElementById('aiStatus');
    
    loader.style.display = 'flex';
    btnMagic.disabled = true;
    if(btnRetry) btnRetry.disabled = true;
    status.style.display = 'block';
    status.innerText = "🤖 Gemini está optimizando la búsqueda...";

    try {
        const response = await fetch('/api/ia/buscar-imagen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: name })
        });

        if (!response.ok) throw new Error('Error en el servidor de imágenes');
        
        const data = await response.json();
        const aiImg = data.image_url;

        const img = document.getElementById('imgDisplay');
        img.src = aiImg;
        
        // Esperar a que la imagen cargue para quitar el loader
        img.onload = () => {
            img.style.display = 'block';
            document.getElementById('placeholderText').style.display = 'none';
            loader.style.display = 'none';
            status.innerText = `✨ Imagen encontrada (vía ${data.source || 'IA'})`;
        };

        // Si la imagen falla al cargar, limpiar el estado
        img.onerror = () => {
            loader.style.display = 'none';
            status.innerText = "❌ No se pudo cargar la imagen. Reintenta con otro nombre.";
            btnMagic.disabled = false;
        };

        // Mostrar botón de reintento
        if(btnRetry) btnRetry.style.display = 'block';
        btnMagic.innerText = "✨ Buscar otra vez";

        base64Image = aiImg;

    } catch (error) {
        console.error("Error buscando imagen:", error);
        status.innerText = "❌ No se encontró una imagen clara. Intenta con otro nombre.";
        loader.style.display = 'none';
    } finally {
        btnMagic.disabled = false;
        if(btnRetry) btnRetry.disabled = false;
    }
}

function askIA() {
    alert("🤖 Gemini sugiere: Este equipo requiere un mantenimiento preventivo cada 6 meses debido a su categoría. Hemos actualizado tu plan de mantenimiento.");
}

document.getElementById('editForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const selectedCat = document.getElementById('categorySelect').value;
    const finalCategory = (selectedCat === "OTRA") ? document.getElementById('customCategory').value : selectedCat;

    const updatedData = {
        name: document.getElementById('editName').value,
        price: parseFloat(document.getElementById('editPrice').value),
        purchase_date: document.getElementById('editDate').value,
        category: finalCategory,
        warranty_months: parseInt(document.getElementById('editMonths').value) || 0,
        serial: document.getElementById('editSerial').value,
        notes: document.getElementById('editNotes').value,
        image_url: base64Image,
        brand: "", // Podríamos inferir esto del nombre o añadir campo
        model: ""
    };

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) throw new Error('Error al actualizar el producto');

        alert("¡Cambios guardados con éxito!");
        window.location.href = "inventory.html";
    } catch (error) {
        console.error('Error:', error);
        alert("Error al guardar: " + error.message);
    }
};

function viewBilling() { alert("💰 Módulo de facturación."); }

window.onload = loadProductData;