// ============================================
// SCANNER OPTIMIZADO
// ============================================

let scannerRunning = false;
let scanDebounce = false;
let currentFacing = 'environment';

function startScanner() {
    const c = document.getElementById('scannerContainer');
    if (c) c.classList.add('active');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const status = document.getElementById('scannerStatus');
        if (status) status.innerHTML = '❌ No se puede acceder a la cámara';
        return;
    }

    const status = document.getElementById('scannerStatus');
    if (status) status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
    const view = document.querySelector('#scannerView');
    if (view) view.innerHTML = '<div class="scanner-overlay"><div class="scanner-line"></div></div>';

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scannerView'),
            constraints: {
                facingMode: currentFacing,
                width: { ideal: 400 },
                height: { ideal: 300 }
            }
        },
        decoder: {
            readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader"],
            multiple: false
        },
        locate: false
    }, function(err) {
        if (err) {
            if (status) status.innerHTML = '❌ Error al iniciar';
            return;
        }
        Quagga.start();
        scannerRunning = true;
        if (status) status.innerHTML = '<i class="fas fa-camera"></i> Apuntá al código';
    });

    Quagga.onDetected(function(result) {
        if (scanDebounce) return;
        scanDebounce = true;

        const code = result.codeResult.code;
        if (status) status.innerHTML = '✅ Código: ' + code;
        playBeep();

        const product = data.products.find(p => p.barcode === code);
        if (product) {
            document.getElementById('saleProduct').value = product.id;
            updatePreview();
            setPrice();
            currentQty = 1;
            document.getElementById('qtyDisplay').textContent = '1';
            document.getElementById('saleQty').value = '1';

            const qty = 1;
            if (product.stock >= qty) {
                const existing = cart.find(item => item.id === product.id);
                if (existing) { existing.qty += qty;
                    existing.total = existing.qty * existing.price; } else { cart.push({ id: product.id,
                    name: product.name, qty, price: product.price, total: product.price }); }
                renderCart();
                showToast('📷 ' + product.name + ' agregado', 'success');
            } else {
                showToast('⚠️ Stock insuficiente', 'error');
            }

            data.scans.unshift({ date: dateTimeStr(), barcode: code, product: product.name });
            save();

            const log = document.getElementById('scanLog');
            if (log) {
                const div = document.createElement('div');
                div.innerHTML = '<span>✅ ' + product.name + '</span><span class="time">' + dateTimeStr() + '</span>';
                log.prepend(div);
                if (log.children.length > 20) log.removeChild(log.lastChild);
            }

            setTimeout(stopScanner, 1500);
        } else {
            showToast('⚠️ Producto no encontrado: ' + code, 'error');
            playErrorBeep();
        }

        setTimeout(() => { scanDebounce = false; }, 1500);
    });
}

function stopScanner() {
    if (scannerRunning) { try { Quagga.stop(); } catch (e) {} scannerRunning = false; }
    const c = document.getElementById('scannerContainer');
    if (c) c.classList.remove('active');
    const view = document.querySelector('#scannerView');
    if (view) view.innerHTML = '';
    const status = document.getElementById('scannerStatus');
    if (status) status.innerHTML = '<i class="fas fa-camera"></i> Apuntá al código';
}

function toggleTorch() {
    showToast('🔦 Linterna', 'info');
    try {
        const track = Quagga.CameraAccess.getActiveStream().getVideoTracks()[0];
        if (track && track.getCapabilities && track.getCapabilities().torch) {
            const t = !track.getSettings().torch;
            track.applyConstraints({ advanced: [{ torch: t }] });
        }
    } catch (e) {}
}

function playBeep() {
    try {
        const ctx = new(window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
}

function playErrorBeep() {
    try {
        const ctx = new(window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 300;
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
}