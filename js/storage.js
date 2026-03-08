// Añade esto a tu objeto Storage existente
const Storage = {
    // ... lo que ya tenías ...
    saveLog(entry) {
        const logs = this.getLogs();
        logs.unshift(entry); // Añade al principio
        localStorage.setItem('wk_logs', JSON.stringify(logs));
    },
    getLogs() {
        const data = localStorage.getItem('wk_logs');
        return data ? JSON.parse(data) : [];
    }
};