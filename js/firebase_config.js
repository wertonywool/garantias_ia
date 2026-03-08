// js/firebase_config.js - Configuración Central de Firebase para GarantíaPro (Gemini 12)
const firebaseConfig = {
    apiKey: "AIzaSyBjTFuASVM9JpXtM04dKwgaO2bC_thSxXs",
    authDomain: "the-workes.firebaseapp.com",
    projectId: "the-workes",
    storageBucket: "the-workes.firebasestorage.app",
    messagingSenderId: "836433638146",
    appId: "1:836433638146:web:2c1bb69904a82e2f49c81b"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Instancias globales
const auth = firebase.auth();
const db = firebase.firestore();

// Persistencia local (para que no pida login al refrescar)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);