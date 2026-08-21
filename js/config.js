// ============================================
// CONFIGURACIÓN
// ============================================

// 📧 TU EMAIL AUTORIZADO (SOLO ESTE PUEDE ENTRAR)
// ⚠️ REEMPLAZÁ ESTE VALOR CON TU EMAIL
const EMAIL_AUTORIZADO = 'tucorreo@gmail.com';

// 🔑 CLIENTE ID DE GOOGLE
// ⚠️ REEMPLAZÁ ESTE VALOR CON EL TUYO
const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com';

// 📦 CLAVE PARA LOCALSTORAGE
const STORAGE_KEY = 'a220_pro_data';

// 👤 DATOS POR DEFECTO DE GITHUB
const DEFAULT_GITHUB = {
    user: 'kioscoa220munro',
    repo: 'a220-data',
    token: ''
};

// 📦 PRODUCTOS INICIALES
function getDefaultProducts() {
    return [
        { id: 1, name: "Huevo Kinder Sorpresa 20g", cat: "Golosinas", price: 2500, stock: 20, minStock: 5, barcode: "4008410", image: "" },
        { id: 2, name: "Alfajor Milka Chocolate 70g", cat: "Golosinas", price: 2200, stock: 15, minStock: 5, barcode: "7790377", image: "" },
        { id: 3, name: "Alfajor Milka Mousse Triple 55g", cat: "Golosinas", price: 2100, stock: 15, minStock: 5, barcode: "7790378", image: "" },
        { id: 4, name: "Alfajor Milka Avellana 36g", cat: "Golosinas", price: 1800, stock: 20, minStock: 5, barcode: "7792162", image: "" },
        { id: 5, name: "Alfajor Oreo Triple 62g", cat: "Golosinas", price: 1900, stock: 20, minStock: 5, barcode: "7790387", image: "" },
        { id: 6, name: "Alfajor Oreo Triple Choco 55g", cat: "Golosinas", price: 1800, stock: 20, minStock: 5, barcode: "7791649", image: "" },
        { id: 7, name: "Alfajor Pepitos Chips 57g", cat: "Golosinas", price: 1600, stock: 20, minStock: 5, barcode: "7791548", image: "" },
        { id: 8, name: "Alfajor Pepitos Triple 60g", cat: "Golosinas", price: 1700, stock: 20, minStock: 5, barcode: "7790079", image: "" },
        { id: 9, name: "Alfajor Terrabusi Chocolate 70g", cat: "Golosinas", price: 1800, stock: 20, minStock: 5, barcode: "7790379", image: "" },
        { id: 10, name: "Alfajor Terrabusi Frutilla 63g", cat: "Golosinas", price: 1500, stock: 20, minStock: 5, barcode: "7791175", image: "" },
        { id: 11, name: "Alfajor Terrabusi Limón 56g", cat: "Golosinas", price: 1500, stock: 20, minStock: 5, barcode: "7791176", image: "" },
        { id: 12, name: "Alfajor Tita 56g", cat: "Golosinas", price: 1600, stock: 20, minStock: 5, barcode: "7792296", image: "" },
        { id: 13, name: "Alfajor Bon o Bon Triple 60g", cat: "Golosinas", price: 2000, stock: 15, minStock: 5, barcode: "7794419", image: "" },
        { id: 14, name: "Alfajor Bon o Bon Chocolate 40g", cat: "Golosinas", price: 1600, stock: 20, minStock: 5, barcode: "7796064", image: "" },
        { id: 15, name: "Alfajor Bon o Bon Blanco 40g", cat: "Golosinas", price: 1600, stock: 20, minStock: 5, barcode: "7796082", image: "" },
        { id: 16, name: "Alfajor Guaymallén Leche 38g", cat: "Golosinas", price: 1200, stock: 30, minStock: 10, barcode: "7798021", image: "" },
        { id: 17, name: "Alfajor Guaymallén Chocolate 38g", cat: "Golosinas", price: 1200, stock: 30, minStock: 10, barcode: "7798022", image: "" },
        { id: 18, name: "Alfajor Guaymallén Leche 70g", cat: "Golosinas", price: 1600, stock: 20, minStock: 5, barcode: "7798026", image: "" },
        { id: 19, name: "Alfajor Guaymallén Chocolate 70g", cat: "Golosinas", price: 1600, stock: 20, minStock: 5, barcode: "7798027", image: "" },
        { id: 20, name: "Chocolate Milka Leger Leche 45g", cat: "Golosinas", price: 1800, stock: 15, minStock: 5, barcode: "7791610", image: "" },
        { id: 21, name: "Chocolate Lacta Leche 55g", cat: "Golosinas", price: 1600, stock: 15, minStock: 5, barcode: "7791477", image: "" },
        { id: 22, name: "Chocolate Lacta Blanco 55g", cat: "Golosinas", price: 1600, stock: 15, minStock: 5, barcode: "7791482", image: "" },
        { id: 23, name: "Chocolate Shot Bloque 35g", cat: "Golosinas", price: 1200, stock: 20, minStock: 5, barcode: "7791421", image: "" },
        { id: 24, name: "Chocolate Cofler Block 38g", cat: "Golosinas", price: 1300, stock: 20, minStock: 5, barcode: "7791770", image: "" },
        { id: 25, name: "Cigarrillos Red Point Rubios", cat: "Tabaco", price: 4000, stock: 10, minStock: 3, barcode: "7792796500010", image: "" },
        { id: 26, name: "Cigarrillos Red Point Menta", cat: "Tabaco", price: 4000, stock: 10, minStock: 3, barcode: "7792796500020", image: "" },
        { id: 27, name: "Gaseosa Coca-Cola 1.5L", cat: "Bebidas", price: 2000, stock: 24, minStock: 6, barcode: "7790123456789", image: "" },
        { id: 28, name: "Gaseosa Coca-Cola 2.25L", cat: "Bebidas", price: 2800, stock: 24, minStock: 6, barcode: "7790123456790", image: "" },
        { id: 29, name: "Gaseosa Pepsi 1.5L", cat: "Bebidas", price: 1800, stock: 24, minStock: 6, barcode: "7790123456800", image: "" },
        { id: 30, name: "Agua Villa del Sur 500ml", cat: "Bebidas", price: 1200, stock: 30, minStock: 10, barcode: "7790123456810", image: "" },
        { id: 31, name: "Agua Villa del Sur 1.5L", cat: "Bebidas", price: 1800, stock: 24, minStock: 6, barcode: "7790123456820", image: "" },
        { id: 32, name: "Bebida Energética Speed 473ml", cat: "Bebidas", price: 2500, stock: 12, minStock: 3, barcode: "7790123456830", image: "" },
        { id: 33, name: "Bebida Energética Monster 473ml", cat: "Bebidas", price: 3000, stock: 12, minStock: 3, barcode: "7790123456840", image: "" },
        { id: 34, name: "Gatorade 500ml", cat: "Bebidas", price: 2200, stock: 12, minStock: 3, barcode: "7790123456850", image: "" },
        { id: 35, name: "Papas Fritas Lays 100g", cat: "Snacks", price: 2000, stock: 20, minStock: 5, barcode: "7790123456860", image: "" },
        { id: 36, name: "Papas Fritas Lays 200g", cat: "Snacks", price: 3500, stock: 20, minStock: 5, barcode: "7790123456870", image: "" },
        { id: 37, name: "Papas Pringles Original 139g", cat: "Snacks", price: 2800, stock: 15, minStock: 5, barcode: "3700018477", image: "" },
        { id: 38, name: "Papas Pringles Queso 139g", cat: "Snacks", price: 2800, stock: 15, minStock: 5, barcode: "3700018483", image: "" },
        { id: 39, name: "Helado Palito 1ud", cat: "Helados", price: 1500, stock: 20, minStock: 5, barcode: "7790123456880", image: "" },
        { id: 40, name: "Helado Triple 1ud", cat: "Helados", price: 2000, stock: 20, minStock: 5, barcode: "7790123456890", image: "" }
    ];
}
