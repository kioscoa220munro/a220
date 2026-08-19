// ============================================
// CONFIGURACIÓN A220 PRO
// ============================================

// 📧 EMAILS AUTORIZADOS POR DEFECTO
var DEFAULT_AUTHORIZED_EMAILS = [
    'kiosco.a220@gmail.com',
    'kioscoa220munro@gmail.com'
];

// 🔑 CLIENTE ID DE GOOGLE
var GOOGLE_CLIENT_ID = '939192749315-chhqng50baio8koc839eu1quaatme0jm.apps.googleusercontent.com';

// 📦 CLAVE PARA LOCALSTORAGE
var STORAGE_KEY = 'a220_pro_data';
var AUTH_EMAILS_STORAGE_KEY = 'a220_authorized_emails';

// 👤 DATOS POR DEFECTO DE GITHUB
var DEFAULT_GITHUB = {
    user: 'kioscoa220munro',
    repo: 'a220',
    token: ''
};

// ============================================
// GESTIÓN DE EMAILS AUTORIZADOS
// ============================================

function getAuthorizedEmails() {
    try {
        const saved = localStorage.getItem(AUTH_EMAILS_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(e => String(e).toLowerCase().trim());
            }
        }
    } catch (e) {
        console.error('Error al leer emails autorizados:', e);
    }
    return [...DEFAULT_AUTHORIZED_EMAILS].map(e => e.toLowerCase().trim());
}

function saveAuthorizedEmails(emails) {
    if (!Array.isArray(emails)) return false;
    const cleanList = [...new Set(emails.map(e => String(e).toLowerCase().trim()).filter(e => e.length > 0))];
    localStorage.setItem(AUTH_EMAILS_STORAGE_KEY, JSON.stringify(cleanList));
    return true;
}

function isEmailAuthorized(email) {
    if (!email) return false;
    const clean = String(email).toLowerCase().trim();
    const authorized = getAuthorizedEmails();
    return authorized.includes(clean);
}

function addAuthorizedEmail(email) {
    if (!email) return { success: false, message: 'El email no puede estar vacío' };
    const clean = String(email).toLowerCase().trim();
    
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clean)) {
        return { success: false, message: 'Formato de email inválido' };
    }

    const current = getAuthorizedEmails();
    if (current.includes(clean)) {
        return { success: false, message: 'El email ya está autorizado' };
    }

    current.push(clean);
    saveAuthorizedEmails(current);
    return { success: true, message: `Email ${clean} autorizado correctamente` };
}

function removeAuthorizedEmail(email, loggedInUser) {
    if (!email) return { success: false, message: 'Email inválido' };
    const clean = String(email).toLowerCase().trim();
    const current = getAuthorizedEmails();

    if (current.length <= 1) {
        return { success: false, message: 'No podés eliminar el único email autorizado' };
    }

    if (loggedInUser && loggedInUser.toLowerCase().trim() === clean) {
        return { success: false, message: 'No podés eliminar tu propia cuenta mientras estás conectado' };
    }

    const filtered = current.filter(e => e !== clean);
    if (filtered.length === current.length) {
        return { success: false, message: 'El email no se encontró en la lista' };
    }

    saveAuthorizedEmails(filtered);
    return { success: true, message: `Email ${clean} eliminado de autorizados` };
}

// 📦 PRODUCTOS INICIALES
function getDefaultProducts() {
    return [
        { id: 1, name: 'Agua 500 ml', cat: 'Bebidas', price: 1200, stock: 24, minStock: 3, barcode: '7791234567890', image: '' },
        { id: 2, name: 'Gaseosa', cat: 'Bebidas', price: 1800, stock: 18, minStock: 3, barcode: '7791234567891', image: '' },
        { id: 3, name: 'Yerba 500g', cat: 'Almacén', price: 3500, stock: 10, minStock: 3, barcode: '7791234567892', image: '' },
        { id: 4, name: 'Alfajor', cat: 'Golosinas', price: 1300, stock: 20, minStock: 3, barcode: '7791234567893', image: '' },
        { id: 5, name: 'Papas snack', cat: 'Snacks', price: 1700, stock: 15, minStock: 3, barcode: '7791234567894', image: '' },
        { id: 6, name: 'Cigarrillos', cat: 'Tabaco', price: 4000, stock: 10, minStock: 3, barcode: '7791234567895', image: '' },
        { id: 7, name: 'Helado palito', cat: 'Helados', price: 1800, stock: 12, minStock: 3, barcode: '7791234567896', image: '' }
    ];
}
