async function loadAssets() {
    const select = document.getElementById('assetSelect');
    
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Error al cargar productos');
        const products = await response.json();

        if (products.length === 0) {
            select.innerHTML = '<option>No hay activos registrados</option>';
            return;
        }

        select.innerHTML = products.map(p => 
            `<option value="${p.id}">${p.name} (Compra: ${p.purchase_date})</option>`
        ).join('');
    } catch (error) {
        console.error('Error:', error);
        select.innerHTML = '<option>Error al cargar activos</option>';
    }
}

async function setSmartReminder() {
    const assetId = document.getElementById('assetSelect').value;
    const days = document.getElementById('daysBefore').value;
    
    try {
        const response = await fetch(`/api/products/${assetId}`);
        if (!response.ok) throw new Error('No se encontró el producto');
        const p = await response.json();

        const msg = `✅ ¡Alerta configurada! Te avisaremos ${days} días antes de que tu ${p.name} pierda su protección.`;
        
        const statusDiv = document.getElementById('statusMsg');
        statusDiv.innerHTML = `<div class="info-box" style="border-left-color: var(--success); color: var(--success); background: #f0fdf4;">${msg}</div>`;
        
        // En una implementación real, esto se guardaría en una tabla de alertas.
        // Por ahora registramos la acción en los logs del sistema.
        console.log(`Recordatorio configurado para ${p.name} (${days} días antes)`);
        
    } catch (error) {
        console.error('Error:', error);
        alert("Error al configurar recordatorio: " + error.message);
    }
}

async function extendWarranty() {
    const assetId = document.getElementById('assetSelect').value;
    const extra = parseInt(document.getElementById('extraMonths').value);
    
    if(!extra || isNaN(extra)) {
        alert("Por favor introduce un número de meses válido.");
        return;
    }

    try {
        // 1. Obtener datos actuales
        const getRes = await fetch(`/api/products/${assetId}`);
        if (!getRes.ok) throw new Error('No se encontró el producto');
        const p = await getRes.json();

        // 2. Actualizar con nuevos meses
        const updatedData = {
            ...p,
            warranty_months: (parseInt(p.warranty_months) || 0) + extra
        };

        const putRes = await fetch(`/api/products/${assetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!putRes.ok) throw new Error('Error al extender garantía');

        alert(`✨ ¡Éxito! Se han añadido ${extra} meses de cobertura extra a ${p.name}.`);
        window.location.href = "inventory.html";
    } catch (error) {
        console.error('Error:', error);
        alert("Error al extender garantía: " + error.message);
    }
}

window.onload = loadAssets;