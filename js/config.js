// js/config.js - Configuración Central de Supabase
const SUPABASE_URL = "https://cfjgzbfgzocxmohckzcc.supabase.co";

// USA AQUÍ TU CLAVE "anon" "public" (Empieza por eyJ...)
// No uses la clave "service_role" aquí por seguridad.
const SUPABASE_KEY = "sb_secret_VtT__S-erbW_zJ6zeHmYog_HFnZuAvc";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);