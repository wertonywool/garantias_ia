async function renderHistory() {
    const container = document.getElementById('logContainer');
    const timeF = document.getElementById('timeFilter').value;
    const typeF = document.getElementById('typeFilter').value;
    
    try {
        const response = await fetch('/api/logs');
        if (!response.ok) throw new Error('Error al obtener logs');
        let logs = await response.json();

        // 1. Filtrar por Tiempo
        const now = new Date();
        logs = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            const diffMs = now - logDate;
            
            if(timeF === 'hour') return diffMs <= 3600000;
            if(timeF === 'day') return diffMs <= 86400000;
            if(timeF === 'week') return diffMs <= 604800000;
            if(timeF === 'month') return diffMs <= 2592000000;
            return true;
        });

        // 2. Filtrar por Tipo
        if(typeF !== 'all') {
            logs = logs.filter(log => log.action.toLowerCase().includes(typeF.toLowerCase()));
        }

        if(logs.length === 0) {
            container.innerHTML = `<div class="empty-state">No se encontraron eventos con estos filtros.</div>`;
            return;
        }

        container.innerHTML = logs.map((log) => {
            const actionClass = log.action.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar tildes
                .replace(/\s+/g, '-'); // Reemplazar espacios por guiones

            return `
                <div class="log-card ${actionClass}">
                    <div class="log-dot"></div>
                    <div class="log-header">
                        <div>
                            <span class="tag tag-${actionClass}">${log.action}</span>
                            <span class="log-time" style="margin-left:10px;">${new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <button class="btn-delete-log" onclick="deleteSingleLog(${log.id})" title="Eliminar este registro">✕</button>
                    </div>
                    <p class="log-body">${log.details}</p>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `<p style="color:red; text-align:center;">Error al cargar el historial: ${error.message}</p>`;
    }
}

async function deleteSingleLog(id) {
    if (confirm("¿Eliminar este registro de auditoría?")) {
        try {
            const response = await fetch(`/api/logs/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('No se pudo eliminar el log');
            renderHistory();
        } catch (error) {
            console.error('Error:', error);
            alert("Error al eliminar log: " + error.message);
        }
    }
}

// Escuchar cambios en los filtros
document.getElementById('timeFilter').addEventListener('change', renderHistory);
document.getElementById('typeFilter').addEventListener('change', renderHistory);

window.onload = renderHistory;