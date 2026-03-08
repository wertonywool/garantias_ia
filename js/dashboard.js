// Formatear Fecha Actual
document.getElementById('currentDate').innerText = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
});

// Cargar Datos del Servidor (API)
async function initDashboard() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Error al cargar productos del servidor');
        
        const products = await response.json();
        const tbody = document.getElementById('dashTableBody');
        
        let capital = 0;
        let critical = 0;

        tbody.innerHTML = '';

        // Solo mostrar los últimos 6 para no saturar el Dashboard
        const recentOnes = products.slice(0, 6); // Ya vienen ordenados por DESC en el backend

        recentOnes.forEach(p => {
            capital += parseFloat(p.price || 0);
            
            // Lógica de tiempo (Garantía)
            const buyDate = new Date(p.purchase_date);
            const expDate = new Date(buyDate.setMonth(buyDate.getMonth() + parseInt(p.warranty_months || 0)));
            const diffDays = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));

            let statusBadge = '';
            if(diffDays <= 0) {
                statusBadge = '<span class="badge bg-danger">Vencido</span>';
                critical++;
            } else if(diffDays < 30) {
                statusBadge = '<span class="badge bg-warning">Por Vencer</span>';
                critical++;
            } else {
                statusBadge = '<span class="badge bg-success">Protegido</span>';
            }

            tbody.innerHTML += `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>$${parseFloat(p.price || 0).toLocaleString()}</td>
                    <td>${statusBadge}</td>
                    <td>${diffDays > 0 ? diffDays + ' días rest.' : 'Expirada'}</td>
                    <td>
                        <a href="pages/edit.html?id=${p.id}" class="btn-edit">Editar</a>
                    </td>
                </tr>
            `;
        });

        // Actualizar contadores superiores
        document.getElementById('totalItems').innerText = products.length;
        document.getElementById('totalCapital').innerText = `$${capital.toLocaleString()}`;
        document.getElementById('criticalAlerts').innerText = critical;

        if(products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted)">No hay activos. Ve a Inventario para agregar el primero.</td></tr>';
        }

    } catch (error) {
        console.error('Error al inicializar dashboard:', error);
        document.getElementById('dashTableBody').innerHTML = `<tr><td colspan="5" style="text-align:center; color:red">Error conectando con el servidor.</td></tr>`;
    }
}

window.onload = initDashboard;
