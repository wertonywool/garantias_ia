const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexión a la base de datos SQLite3
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con SQLite3:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite3.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Habilitar claves foráneas
        db.run("PRAGMA foreign_keys = ON");

        // 1. Tabla de Productos (El Objeto Físico)
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand TEXT,
            model TEXT,
            purchase_date TEXT,
            warranty_months INTEGER DEFAULT 0,
            category TEXT,
            notes TEXT,
            image_url TEXT,
            price REAL DEFAULT 0,
            serial TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // 2. Tareas de Mantenimiento (Lo que la IA sugiere hacerle)
        // frequency_days: Cada cuántos días se debe repetir (ej: 30 para filtros, 365 para revisión general)
        db.run(`CREATE TABLE IF NOT EXISTS maintenance_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            task_name TEXT NOT NULL,
            frequency_days INTEGER NOT NULL,
            last_performed TEXT,
            next_due TEXT,
            importance TEXT DEFAULT 'Normal', -- Alta, Media, Baja
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )`);

        // 3. Historial de Mantenimientos Realizados (Log específico de tareas)
        db.run(`CREATE TABLE IF NOT EXISTS maintenance_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            performed_date TEXT DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (task_id) REFERENCES maintenance_tasks(id) ON DELETE CASCADE
        )`);
        
        // 4. Logs Generales del Sistema (Auditoría: "Se creó producto X")
        db.run(`CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT,
            details TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

module.exports = db;
