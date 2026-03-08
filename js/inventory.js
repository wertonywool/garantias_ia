// js/inventory.js - Gestión de Inventario (Gemini 12 - Firestore)

document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que auth esté listo y el usuario autenticado
    auth.onAuthStateChanged(user => {
        if (user) {
            loadInventory(user.uid);
        }
    });
});

async function loadInventory(userId) {
    const grid = document.getElementById('inventoryGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="loader-box"><div class="loader"></div><p>Sincronizando con Firestore...</p></div>';

    try {
        // Consultar productos de este usuario en Firestore
        const snapshot = await db.collection('products')
            .where('user_id', '==', userId)
            .orderBy('created_at', 'desc')
            .get();

        grid.innerHTML = '';

        if (snapshot.empty) {
            grid.innerHTML = `
                <div class="empty-state">
                    <span style="font-size: 4rem;">📦</span>
                    <h3>Tu inventario está vacío</h3>
                    <p>Empieza agregando un producto manual o usa el Wizard de IA.</p>
                </div>`;
            return;
        }

        snapshot.forEach(doc => {
            const product = doc.data();
            const productId = doc.id;
            
            // Cálculos de garantía
            const buyDate = new Date(product.purchase_date);
            const expDate = new Date(buyDate);
            expDate.setMonth(buyDate.getMonth() + (product.warranty_months || 0));
            
            const diffDays = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
            const isActive = diffDays > 0;

            const card = document.createElement('div');
            card.className = 'inventory-card';
            card.innerHTML = `
                <div class="card-image-container">
                    <img src="${product.image_url || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}" alt="${product.name}">
                    <div class="badge ${isActive ? 'badge-active' : 'badge-expired'}">
                        ${isActive ? 'Protegido' : 'Sin Garantía'}
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${product.name}</h3>
                    <p class="card-brand">${product.brand || 'Marca no especificada'}</p>
                    
                    <div class="card-stats">
                        <div class="stat-item">
                            <span class="stat-label">Restante</span>
                            <span class="stat-value ${diffDays < 30 ? 'text-urgent' : ''}">${isActive ? diffDays + ' días' : 'Vencido'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Precio</span>
                            <span class="stat-value">$${(product.price || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="card-actions">
                        <button onclick="location.href='edit.html?id=${productId}'" class="btn-edit">Detalles</button>
                        <button onclick="deleteProduct('${productId}', '${product.name}')" class="btn-delete-icon">🗑️</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando inventario:", error);
        grid.innerHTML = `<p class="error-msg">Error al conectar con la nube: ${error.message}</p>`;
    }
}

async function deleteProduct(id, name) {
    if (!confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`)) return;

    try {
        await db.collection('products').doc(id).delete();
        console.log("Producto eliminado");
        
        // Registrar en historial
        if (typeof saveLog === 'function') {
            saveLog("Eliminación", `Se eliminó el equipo: ${name}`);
        }
        
        // Recargar inventario
        loadInventory(window.currentUser.uid);
    } catch (error) {
        alert("Error al eliminar: " + error.message);
    }
}