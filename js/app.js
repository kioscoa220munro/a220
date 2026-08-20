// ============================================
// APP PRINCIPAL
// ============================================

let data = { products: [], sales: [], moves: [], scans: [] };
let cart = [];
let currentQty = 1;
let isLoggedIn = false;
let currentUser = null;
let emailReporte = '';
let productosFiltrados = [];

// ============================================
// LOGIN CON GMAIL
// ============================================

function loginConGmail() {
    const error = document.getElementById('loginError');
    error.textContent = '';

    if (GOOGLE_CLIENT_ID === 'TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com') {
        error.textContent = '❌ Configurá el CLIENT ID de Google en config.js';
        return;
    }

    if (EMAIL_AUTORIZADO === 'tucorreo@gmail.com') {
        error.textContent = '❌ Configurá tu EMAIL AUTORIZADO en config.js';
        return;
    }

    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            cancel_on_tap_outside: false
        });
        google.accounts.id.prompt();
    } else {
        error.textContent = '❌ Error al cargar Google Login. Recargá la página.';
    }
}

function handleCredentialResponse(response) {
    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const email = payload.email;
        const nombre = payload.name;
        const foto = payload.picture;

        if (!email) {
            document.getElementById('loginError').textContent = '❌ No se pudo obtener el email';
            return;
        }

        if (email !== EMAIL_AUTORIZADO) {
            document.getElementById('loginError').textContent = '❌ Acceso denegado. Email no autorizado.';
            return;
        }

        currentUser = email;
        isLoggedIn = true;

        document.getElementById('userDisplay').textContent = nombre || email;
        if (foto) {
            document.getElementById('userAvatar').src = foto;
            document.getElementById('userAvatar').style.display = 'inline-block';
        }

        document.getElementById('loginOverlay').classList.add('hidden');
        loadData();
        renderAll();
        showToast('✅ ¡Bienvenido ' + (nombre || email) + '!', 'success');

    } catch (e) {
        document.getElementById('loginError').textContent = '❌ Error al procesar el login';
        console.error(e);
    }
}

function doLogout() {
    if (confirm('¿Cerrar sesión?')) {
        isLoggedIn = false;
        currentUser = null;
        document.getElementById('loginOverlay').classList.remove('hidden');
        document.getElementById('loginError').textContent = '';
        document.getElementById('userDisplay').textContent = '';
        document.getElementById('userAvatar').style.display = 'none';
        showToast('👋 Sesión cerrada', 'info');
    }
}

// ============================================
// DATA
// ============================================

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            data = parsed;
            if (!data.products) data.products = [];
            if (!data.sales) data.sales = [];
            if (!data.moves) data.moves = [];
            if (!data.scans) data.scans = [];
        } else {
            data.products = getDefaultProducts();
            data.sales = [];
            data.moves = [];
            data.scans = [];
        }
        const emailSaved = localStorage.getItem('a220_email_reporte');
        if (emailSaved) {
            emailReporte = emailSaved;
            const el = document.getElementById('emailReporte');
            if (el) el.value = emailSaved;
        }
    } catch (e) {
        data.products = getDefaultProducts();
        data.sales = [];
        data.moves = [];
        data.scans = [];
    }
}

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        renderAll();
    } catch (e) {
        showToast('❌ Error al guardar: ' + e.message, 'error');
    }
}

function saveConfig() {
    const email = document.getElementById('emailReporte').value.trim();
    if (email) {
        emailReporte = email;
        localStorage.setItem('a220_email_reporte', email);
        showToast('✅ Email guardado: ' + email, 'success');
    }
    saveGitHubConfig();
}

// ============================================
// FORMATOS
// ============================================

function money(n) {
    return '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

function todayStr() {
    return new Date().toLocaleDateString('es-AR');
}

function dateTimeStr() {
    return new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR');
}

// ============================================
// NAVEGACIÓN
// ============================================

function showView(id, btn) {
    document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    document.querySelectorAll('nav button').forEach(x => x.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (isLoggedIn) renderAll();
}

// ============================================
// DASHBOARD
// ============================================

function renderDashboard() {
    if (!data || !data.products) return;
    const today = todayStr();
    const todays = data.sales.filter(s => s.date && s.date.startsWith(today));
    const total = todays.reduce((a, s) => a + (s.total || 0), 0);
    const units = todays.reduce((a, s) => a + (s.items ? s.items.reduce((b, i) => b + (i.qty || 0), 0) : 0), 0);

    document.getElementById('dVentas').textContent = money(total);
    document.getElementById('dProductos').textContent = data.products.length;
    document.getElementById('dBajo').textContent = data.products.filter(p => p.stock <= p.minStock).length;
    document.getElementById('dUnidades').textContent = units;

    const low = data.products.filter(p => p.stock <= p.minStock);
    document.getElementById('alertas').innerHTML = low.length ? low.map(p => '<div class="alert-item">⚠️ ' + p.name + ': ' + p.stock + ' uds</div>').join('') : 'Sin alertas.';

    const catSales = {};
    data.sales.forEach(s => {
        if (s.items) {
            s.items.forEach(i => {
                const p = data.products.find(x => x.id === i.id);
                const cat = p ? p.cat : 'Otros';
                catSales[cat] = (catSales[cat] || 0) + (i.total || 0);
            });
        }
    });
    const sorted = Object.entries(catSales).sort((a, b) => b[1] - a[1]);
    document.getElementById('categorySummary').innerHTML = sorted.length ? sorted.map(([cat, total]) =>
        '<div class="category-item"><span>' + cat + '</span><strong>' + money(total) + '</strong></div>'
    ).join('') : 'Sin ventas.';

    mostrarAnalisis();
}

function mostrarAnalisis() {
    const container = document.getElementById('analisisContainer');
    if (!container) return;

    const diarias = {};
    const productos = {};
    data.sales.forEach(s => {
        const dia = s.date.split(' ')[0];
        diarias[dia] = (diarias[dia] || 0) + (s.total || 0);
        if (s.items) {
            s.items.forEach(i => {
                productos[i.name] = (productos[i.name] || 0) + (i.qty || 0);
            });
        }
    });

    let html = '<div class="analisis-grid">';
    html += '<div><h4>📊 Ventas por día</h4>';
    const dias = Object.keys(diarias).sort().slice(-7);
    dias.forEach(dia => {
        html += `<div class="analisis-item"><span>${dia}</span><strong>${money(diarias[dia])}</strong></div>`;
    });
    html += '</div>';

    html += '<div><h4>📦 Top productos</h4>';
    const prods = Object.keys(productos).sort((a,b) => productos[b] - productos[a]).slice(0,5);
    prods.forEach(p => {
        html += `<div class="analisis-item"><span>${p}</span><strong>${productos[p]} uds</strong></div>`;
    });
    html += '</div></div>';

    const totalGeneral = Object.values(diarias).reduce((a,b) => a + b, 0);
    html += `<div class="analisis-total">💰 Total general: ${money(totalGeneral)}</div>`;

    container.innerHTML = html;
}

// ============================================
// BUSCADOR DE PRODUCTOS
// ============================================

function filtrarProductos() {
    const input = document.getElementById('buscarProducto');
    const lista = document.getElementById('listaProductos');
    const texto = input.value.toLowerCase().trim();

    if (texto.length === 0) {
        lista.style.display = 'none';
        return;
    }

    productosFiltrados = data.products.filter(p =>
        p.name.toLowerCase().includes(texto) ||
        (p.barcode && p.barcode.includes(texto))
    );

    if (productosFiltrados.length === 0) {
        lista.innerHTML = '<div style="padding:10px;color:var(--l);text-align:center;">❌ No se encontraron productos</div>';
        lista.style.display = 'block';
        return;
    }

    lista.innerHTML = productosFiltrados.map(p => `
        <div onclick="seleccionarProducto(${p.id})" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--e);display:flex;justify-content:space-between;align-items:center;transition:0.2s;">
            <div>
                <strong>${p.name}</strong>
                <div style="font-size:12px;color:var(--l);">${p.cat} · Stock: ${p.stock}</div>
                <div style="font-size:10px;color:var(--l);">Código: ${p.barcode || '—'}</div>
            </div>
            <div style="font-weight:800;color:var(--a);">${money(p.price)}</div>
        </div>
    `).join('');

    lista.style.display = 'block';
}

function seleccionarProducto(id) {
    const product = data.products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('listaProductos').style.display = 'none';
    document.getElementById('buscarProducto').value = product.name;
    document.getElementById('saleProduct').value = product.id;

    updatePreview();
    setPrice();

    currentQty = 1;
    document.getElementById('qtyDisplay').textContent = '1';
    document.getElementById('saleQty').value = '1';

    showToast('✅ ' + product.name + ' seleccionado', 'success');
}

// Cerrar lista al hacer clic fuera
document.addEventListener('click', function(e) {
    const lista = document.getElementById('listaProductos');
    const input = document.getElementById('buscarProducto');
    if (lista && input) {
        if (e.target !== lista && e.target !== input) {
            lista.style.display = 'none';
        }
    }
});

// ============================================
// PRODUCTOS
// ============================================

function renderProducts() {
    if (!data || !data.products) return;
    const search = document.getElementById('productSearch');
    const searchVal = search ? search.value.toLowerCase().trim() : '';
    const filtered = data.products.filter(p => p.name.toLowerCase().includes(searchVal) || (p.barcode && p.barcode.includes(searchVal)));

    const table = document.getElementById('productTable');
    if (!table) return;
    table.innerHTML = filtered.map(p => `
        <tr>
            <td>${p.image ? `<img src="${p.image}" class="product-image-thumb">` : '—'}</td>
            <td><strong>${p.name}</strong></td>
            <td><span class="badge badge-info">${p.cat}</span></td>
            <td>${money(p.price)}</td>
            <td class="${p.stock <= p.minStock ? 'stock-low' : 'stock-ok'}">${p.stock}</td>
            <td><span class="barcode-badge">${p.barcode || '—'}</span></td>
            <td>
                <button class="btn btn-accent btn-xs" onclick="quickSell(${p.id})"><i class="fas fa-cart-plus"></i></button>
                <button class="btn btn-primary btn-xs" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-xs" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--l);">No hay productos</td></tr>';

    renderSelect();
    updatePreview();
}

function renderSelect() {
    const sel = document.getElementById('saleProduct');
    if (!sel) return;
    const val = sel.value;
    sel.innerHTML = data.products.map(p => `<option value="${p.id}">${p.name} — ${money(p.price)} — stock ${p.stock}</option>`).join('');
    if (val) sel.value = val;
    setPrice();
}

function setPrice() {
    const p = data.products.find(x => x.id == document.getElementById('saleProduct').value);
    const priceInput = document.getElementById('salePrice');
    if (p && priceInput) priceInput.value = p.price;
}

function updatePreview() {
    const id = parseInt(document.getElementById('saleProduct').value);
    const p = data.products.find(x => x.id === id);
    const preview = document.getElementById('productPreview');
    if (!preview) return;

    if (p) {
        document.getElementById('previewName').textContent = p.name;
        document.getElementById('previewPrice').textContent = money(p.price);
        const stockEl = document.getElementById('previewStock');
        stockEl.textContent = 'Stock: ' + p.stock;
        stockEl.className = 'product-stock' + (p.stock <= p.minStock ? ' low' : '');
        const img
