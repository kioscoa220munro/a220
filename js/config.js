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
  { "id": 1, "name": "Huevo Kinder Sorpresa 20g", "cat": "Golosinas", "price": 2500, "stock": 20, "minStock": 5, "barcode": "4008410", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_666119-MLA46111643712_052021-F.webp" },
  { "id": 2, "name": "Alfajor Milka Chocolate 70g", "cat": "Golosinas", "price": 2200, "stock": 15, "minStock": 5, "barcode": "7790377", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_992784-MLA53770615002_022023-F.webp" },
  { "id": 3, "name": "Alfajor Milka Mousse Triple 55g", "cat": "Golosinas", "price": 2100, "stock": 15, "minStock": 5, "barcode": "7790378", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_695239-MLA53754891743_022023-F.webp" },
  { "id": 4, "name": "Alfajor Milka Avellana 36g", "cat": "Golosinas", "price": 1800, "stock": 20, "minStock": 5, "barcode": "7792162", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_809563-MLA53754822365_022023-F.webp" },
  { "id": 5, "name": "Alfajor Oreo Triple 62g", "cat": "Golosinas", "price": 1900, "stock": 20, "minStock": 5, "barcode": "7790387", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_837252-MLA50988338368_072022-F.webp" },
  { "id": 6, "name": "Alfajor Oreo Triple Choco 55g", "cat": "Golosinas", "price": 1800, "stock": 20, "minStock": 5, "barcode": "7791649", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_634905-MLA50988338367_072022-F.webp" },
  { "id": 7, "name": "Alfajor Pepitos Chips 57g", "cat": "Golosinas", "price": 1600, "stock": 20, "minStock": 5, "barcode": "7791548", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_612708-MLA51465589500_092022-F.webp" },
  { "id": 8, "name": "Alfajor Pepitos Triple 60g", "cat": "Golosinas", "price": 1700, "stock": 20, "minStock": 5, "barcode": "7790079", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_703849-MLA51465589501_092022-F.webp" },
  { "id": 9, "name": "Alfajor Terrabusi Chocolate 70g", "cat": "Golosinas", "price": 1800, "stock": 20, "minStock": 5, "barcode": "7790379", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_911980-MLA51394629906_082022-F.webp" },
  { "id": 10, "name": "Alfajor Terrabusi Frutilla 63g", "cat": "Golosinas", "price": 1500, "stock": 20, "minStock": 5, "barcode": "7791175", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_829609-MLA51022020600_082022-F.webp" },
  { "id": 11, "name": "Alfajor Terrabusi Limón 56g", "cat": "Golosinas", "price": 1500, "stock": 20, "minStock": 5, "barcode": "7791176", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_898177-MLA51394629903_082022-F.webp" },
  { "id": 12, "name": "Alfajor Tita 56g", "cat": "Golosinas", "price": 1600, "stock": 20, "minStock": 5, "barcode": "7792296", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_774932-MLA51465589499_092022-F.webp" },
  { "id": 13, "name": "Alfajor Bon o Bon Triple 60g", "cat": "Golosinas", "price": 2000, "stock": 15, "minStock": 5, "barcode": "7794419", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_776524-MLA46111643713_052021-F.webp" },
  { "id": 14, "name": "Alfajor Bon o Bon Chocolate 40g", "cat": "Golosinas", "price": 1600, "stock": 20, "minStock": 5, "barcode": "7796064", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_693933-MLA51465589502_092022-F.webp" },
  { "id": 15, "name": "Alfajor Bon o Bon Blanco 40g", "cat": "Golosinas", "price": 1600, "stock": 20, "minStock": 5, "barcode": "7796082", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_690944-MLA51465589503_092022-F.webp" },
  { "id": 16, "name": "Alfajor Guaymallén Leche 38g", "cat": "Golosinas", "price": 1200, "stock": 30, "minStock": 10, "barcode": "7798021", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_766849-MLA50988338363_072022-F.webp" },
  { "id": 17, "name": "Alfajor Guaymallén Chocolate 38g", "cat": "Golosinas", "price": 1200, "stock": 30, "minStock": 10, "barcode": "7798022", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_661621-MLA50988338364_072022-F.webp" },
  { "id": 18, "name": "Alfajor Guaymallén Leche 70g", "cat": "Golosinas", "price": 1600, "stock": 20, "minStock": 5, "barcode": "7798026", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_913440-MLA50988338361_072022-F.webp" },
  { "id": 19, "name": "Alfajor Guaymallén Chocolate 70g", "cat": "Golosinas", "price": 1600, "stock": 20, "minStock": 5, "barcode": "7798027", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_850697-MLA50988338362_072022-F.webp" },
  { "id": 20, "name": "Chocolate Milka Leger Leche 45g", "cat": "Golosinas", "price": 1800, "stock": 15, "minStock": 5, "barcode": "7791610", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_816690-MLA53754891744_022023-F.webp" },
  { "id": 21, "name": "Chocolate Lacta Leche 55g", "cat": "Golosinas", "price": 1600, "stock": 15, "minStock": 5, "barcode": "7791477", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_659748-MLA53754822367_022023-F.webp" },
  { "id": 22, "name": "Chocolate Lacta Blanco 55g", "cat": "Golosinas", "price": 1600, "stock": 15, "minStock": 5, "barcode": "7791482", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_887593-MLA53754822368_022023-F.webp" },
  { "id": 23, "name": "Chocolate Shot Bloque 35g", "cat": "Golosinas", "price": 1200, "stock": 20, "minStock": 5, "barcode": "7791421", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_804848-MLA51394629904_082022-F.webp" },
  { "id": 24, "name": "Chocolate Cofler Block 38g", "cat": "Golosinas", "price": 1300, "stock": 20, "minStock": 5, "barcode": "7791770", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_858884-MLA51394629905_082022-F.webp" },
  { "id": 25, "name": "Cigarrillos Red Point Rubios", "cat": "Tabaco", "price": 4000, "stock": 10, "minStock": 3, "barcode": "7792796500010", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_954596-MLA51465589620_092022-F.webp" },
  { "id": 26, "name": "Cigarrillos Red Point Menta", "cat": "Tabaco", "price": 4000, "stock": 10, "minStock": 3, "barcode": "7792796500020", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_769776-MLA51465589621_092022-F.webp" },
  { "id": 27, "name": "Gaseosa Coca-Cola 1.5L", "cat": "Bebidas", "price": 2000, "stock": 24, "minStock": 6, "barcode": "7790123456789", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_947380-MLA53770615003_022023-F.webp" },
  { "id": 28, "name": "Gaseosa Coca-Cola 2.25L", "cat": "Bebidas", "price": 2800, "stock": 24, "minStock": 6, "barcode": "7790123456790", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_797448-MLA53770615004_022023-F.webp" },
  { "id": 29, "name": "Gaseosa Pepsi 1.5L", "cat": "Bebidas", "price": 1800, "stock": 24, "minStock": 6, "barcode": "7790123456800", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_822472-MLA53770615005_022023-F.webp" },
  { "id": 30, "name": "Agua Villa del Sur 500ml", "cat": "Bebidas", "price": 1200, "stock": 30, "minStock": 10, "barcode": "7790123456810", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_883846-MLA53770615006_022023-F.webp" },
  { "id": 31, "name": "Agua Villa del Sur 1.5L", "cat": "Bebidas", "price": 1800, "stock": 24, "minStock": 6, "barcode": "7790123456820", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_806677-MLA53770615007_022023-F.webp" },
  { "id": 32, "name": "Bebida Energética Speed 473ml", "cat": "Bebidas", "price": 2500, "stock": 12, "minStock": 3, "barcode": "7790123456830", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_800853-MLA53770615008_022023-F.webp" },
  { "id": 33, "name": "Bebida Energética Monster 473ml", "cat": "Bebidas", "price": 3000, "stock": 12, "minStock": 3, "barcode": "7790123456840", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_936090-MLA53770615009_022023-F.webp" },
  { "id": 34, "name": "Gatorade 500ml", "cat": "Bebidas", "price": 2200, "stock": 12, "minStock": 3, "barcode": "7790123456850", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_888810-MLA53770615010_022023-F.webp" },
  { "id": 35, "name": "Papas Fritas Lays 100g", "cat": "Snacks", "price": 2000, "stock": 20, "minStock": 5, "barcode": "7790123456860", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_923227-MLA53770615011_022023-F.webp" },
  { "id": 36, "name": "Papas Fritas Lays 200g", "cat": "Snacks", "price": 3500, "stock": 20, "minStock": 5, "barcode": "7790123456870", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_687465-MLA53770615012_022023-F.webp" },
  { "id": 37, "name": "Papas Pringles Original 139g", "cat": "Snacks", "price": 2800, "stock": 15, "minStock": 5, "barcode": "3700018477", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_977419-MLA53770615013_022023-F.webp" },
  { "id": 38, "name": "Papas Pringles Queso 139g", "cat": "Snacks", "price": 2800, "stock": 15, "minStock": 5, "barcode": "3700018483", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_720552-MLA53770615014_022023-F.webp" },
  { "id": 39, "name": "Helado Palito 1ud", "cat": "Helados", "price": 1500, "stock": 20, "minStock": 5, "barcode": "7790123456880", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_662371-MLA53770615015_022023-F.webp" },
  { "id": 40, "name": "Helado Triple 1ud", "cat": "Helados", "price": 2000, "stock": 20, "minStock": 5, "barcode": "7790123456890", "image": "https://http2.mlstatic.com/D_NQ_NP_2X_801234-MLA53770615016_022023-F.webp" }
];
}
