// ============================================
// SCANNER HÍBRIDO (PC + CELULAR)
// ============================================

let scannerRunning = false;
let scanDebounce = false;
let scannerInterval = null;
let scannerStream = null;

function startScanner() {
    const container = document.getElementById('scannerContainer');
    const status = document.getElementById('scannerStatus');
    const view = document.querySelector('#scannerView');

    // Detectar si es móvil
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    container.classList.add('active');
    status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando cámara...';
    view.innerHTML = '<div class="scanner-overlay"><div class="scanner-line"></div></div>';

    // === MÓVIL: usar BarcodeDetector (rápido) ===
    if (isMobile && 'BarcodeDetector' in window) {
        iniciarConBarcode(status, view);
        return;
    }

    // === PC o navegador sin BarcodeDetector: usar Quagga ===
    iniciarConQuagga(status, view);
}

// ============================================
// MÓVIL: BarcodeDetector
// ============================================
function iniciarConBarcode(status, view) {
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
        }
    })
    .then(function(stream) {
        scannerStream = stream;
        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', '');
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        view.innerHTML = '';
        view.appendChild(video);
        video.play();

        status.innerHTML = '<i class="fas fa-camera"></i> Apuntá al código';

        const detector = new BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'qr_code']
        });

        scannerRunning = true;
        scanDebounce = false;

        scannerInterval = setInterval(function() {
            if (!scannerRunning || scanDebounce) return;

            detector.detect(video)
                .then(function(barcodes) {
                    if (barcodes.length > 0 && !scanDebounce) {
                        scanDebounce = true;
                        const code = barcodes[0].rawValue;
                        status.innerHTML = '✅ Código: ' + code;
                        procesarCodigo(code);
                        setTimeout(stopScanner, 1500);
                    }
                })
                .catch(function(err) {
                    // Error de detección, se ignora
                });
        }, 300);
    })
    .catch(function(err) {
        status.innerHTML = '❌ Error al acceder a la cámara';
        showToast('❌ No se puede acceder a la cámara', 'error');
        console.error('Error:', err);
        // Si falla BarcodeDetector, intentar con Quagga
        status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Intentando con método alternativo...';
        setTimeout(() => iniciarConQuagga(status, view), 1000);
    });
}

// ============================================
// PC: Quagga (compatible con todos) CON RETRASO
// ============================================
function iniciarConQuagga(status, view) {
    view.innerHTML = '<div class="scanner-overlay"><div class="scanner-line"></div></div>';

    // RETRASO DE 500ms PARA ASEGURAR QUE EL DOM ESTÉ LISTO
    setTimeout(function() {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector('#scannerView'),
                constraints: {
                    facingMode: "environment",
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "code_128_reader"],
                multiple: false
            },
            locate: false
        }, function(err) {
            if (err) {
                status.innerHTML = '❌ Error: ' + err.message;
                showToast('❌ Error al iniciar escáner', 'error');
                return;
            }
            Quagga.start();
            scannerRunning = true;
            status.innerHTML = '<i class="fas fa-camera"></i> Apuntá al código';
        });
    }, 500);
}

// ============================================
// PROCESAR CÓDIGO (común para ambos)
// ============================================
function procesarCodigo(code) {
    playBeep();

    const product = data.products.find(p => p.barcode === code);
    if (product) {
        document.getElementById('saleProduct').value = product.id;
        updatePreview();
        setPrice();
        currentQty = 1;
        document.getElementById('qtyDisplay').textContent = '1';
        document.getElementById('saleQty').value = '1';

        if (product.stock >= 1) {
            const existing = cart.find(item => item.id === product.id);
            if (existing) {
                existing.qty += 1;
                existing.total = existing.qty * existing.price;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    qty: 1,
                    price: product.price,
                    total: product.price
                });
            }
            renderCart();
            showToast('📷 ' + product.name + ' agregado', 'success');
        } else {
            showToast('⚠️ Stock insuficiente', 'error');
            playErrorBeep();
            scanDebounce = false;
            return;
        }

        data.scans.unshift({
            date: dateTimeStr(),
            barcode: code,
            product: product.name
        });
        save();

        const log = document.getElementById('scanLog');
        if (log) {
            const div = document.createElement('div');
            div.innerHTML = '<span>✅ ' + product.name + '</span><span class="time">' + dateTimeStr() + '</span>';
            log.prepend(div);
            if (log.children.length > 20) log.removeChild(log.lastChild);
        }
    } else {
        showToast('⚠️ Producto no encontrado: ' + code, 'error');
        playErrorBeep();
        setTimeout(() => { scanDebounce = false; }, 1000);
    }
}

// ============================================
// DETENER ESCÁNER
// ============================================
function stopScanner() {
    scannerRunning = false;
    if (scannerInterval) {
        clearInterval(scannerInterval);
        scannerInterval = null;
    }
    if (scannerStream) {
        scannerStream.getTracks().forEach(function(track) {
            track.stop();
        });
        scannerStream = null;
    }
    if (typeof Quagga !== 'undefined' && Quagga.stop) {
        try { Quagga.stop(); } catch(e) {}
    }
    document.getElementById('scannerContainer').classList.remove('active');
    const view = document.querySelector('#scannerView');
    if (view) view.innerHTML = '';
    const status = document.getElementById('scannerStatus');
    if (status) status.innerHTML = '<i class="fas fa-camera"></i> Apuntá al código';
}

// ============================================
// LINTERNA
// ============================================
function toggleTorch() {
    showToast('🔦 Linterna', 'info');
    try {
        const track = Quagga.CameraAccess?.getActiveStream()?.getVideoTracks()[0];
        if (track && track.getCapabilities && track.getCapabilities().torch) {
            const t = !track.getSettings().torch;
            track.applyConstraints({ advanced: [{ torch: t }] });
        }
    } catch(e) {
        // Si Quagga no está, intentar con stream de BarcodeDetector
        try {
            if (scannerStream) {
                const track = scannerStream.getVideoTracks()[0];
                if (track && track.getCapabilities && track.getCapabilities().torch) {
                    const t = !track.getSettings().torch;
                    track.applyConstraints({ advanced: [{ torch: t }] });
                }
            }
        } catch(e2) {}
    }
}

// ============================================
// SONIDOS
// ============================================
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
    } catch(e) {}
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
    } catch(e) {}
}
