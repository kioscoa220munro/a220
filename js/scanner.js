// ============================================
// ESCÁNER HÍBRIDO (BARCODEDETECTOR EN CELULAR, QUAGGA EN PC)
// ============================================

let scannerRunning = false;
let scanDebounce = false;
let scannerInterval = null;
let scannerStream = null;
let activeEngine = null; // 'native' (BarcodeDetector) o 'quagga' (QuaggaJS)
let isTorchOn = false;

// Detección de dispositivo (Móvil vs PC)
function isMobileDevice() {
    const ua = (typeof navigator !== 'undefined' && (navigator.userAgent || navigator.vendor || window.opera)) || '';
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    const isTouch = (typeof window !== 'undefined' && 'ontouchstart' in window) || 
                    (typeof navigator !== 'undefined' && Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 1));
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 1024;
    return Boolean(mobileRegex.test(ua) || (isTouch && isSmallScreen));
}

// Determinar el mejor motor según el dispositivo
function getPreferredEngine() {
    const isMobile = isMobileDevice();
    const hasBarcodeDetector = (typeof window !== 'undefined' && 'BarcodeDetector' in window);

    if (isMobile && hasBarcodeDetector) {
        return 'native'; // BarcodeDetector para celular
    } else {
        return 'quagga'; // Quagga para PC o cuando no hay BarcodeDetector
    }
}

// Iniciar escáner con motor automático o forzado
function startScanner(forcedEngine) {
    const container = document.getElementById('scannerContainer');
    const status = document.getElementById('scannerStatus');
    const view = document.querySelector('#scannerView');

    if (scannerRunning) {
        stopScanner();
    }

    container.classList.add('active');
    scanDebounce = false;
    isTorchOn = false;

    // Seleccionar motor
    activeEngine = forcedEngine || getPreferredEngine();

    // Actualizar badge del motor en la interfaz
    updateScannerEngineUI();

    if (activeEngine === 'native' && ('BarcodeDetector' in window)) {
        startNativeScanner();
    } else {
        activeEngine = 'quagga';
        updateScannerEngineUI();
        startQuaggaScanner();
    }
}

// ============================================
// MOTOR 1: BARCODEDETECTOR (MÓVIL / NATIVO)
// ============================================
function startNativeScanner() {
    const status = document.getElementById('scannerStatus');
    const view = document.querySelector('#scannerView');
    status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando escáner móvil...';
    view.innerHTML = '<div class="scanner-overlay"><div class="scanner-line"></div></div>';

    const constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            scannerStream = stream;
            const video = document.createElement('video');
            video.srcObject = stream;
            video.setAttribute('playsinline', '');
            video.setAttribute('autoplay', '');
            video.muted = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            view.prepend(video);
            video.play();

            status.innerHTML = '<i class="fas fa-camera"></i> Apuntá al código de barras (Móvil · BarcodeDetector)';

            let detector;
            try {
                detector = new BarcodeDetector({
                    formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e', 'code_39', 'qr_code']
                });
            } catch (err) {
                console.warn('BarcodeDetector format error, fallback default', err);
                detector = new BarcodeDetector();
            }

            scannerRunning = true;

            scannerInterval = setInterval(function() {
                if (!scannerRunning || scanDebounce) return;

                detector.detect(video)
                    .then(function(barcodes) {
                        if (barcodes.length > 0 && !scanDebounce) {
                            const code = barcodes[0].rawValue;
                            if (code && code.trim().length > 0) {
                                onBarcodeFound(code.trim());
                            }
                        }
                    })
                    .catch(function(err) {
                        // Error de cuadro puntual, ignorar
                    });
            }, 250);
        })
        .catch(function(err) {
            console.error('Error accediendo a cámara para BarcodeDetector:', err);
            status.innerHTML = '⚠️ Cambiando a escáner Quagga...';
            // Fallback automático a Quagga
            activeEngine = 'quagga';
            updateScannerEngineUI();
            startQuaggaScanner();
        });
}

// ============================================
// MOTOR 2: QUAGGA JS (PC / ESCRITORIO)
// ============================================
function startQuaggaScanner() {
    const status = document.getElementById('scannerStatus');
    const view = document.querySelector('#scannerView');
    status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando escáner Quagga (PC)...';
    view.innerHTML = '<div class="scanner-overlay"><div class="scanner-line"></div></div>';

    if (typeof Quagga === 'undefined') {
        status.innerHTML = '❌ Biblioteca Quagga no disponible. Verificá tu conexión.';
        return;
    }

    const isMobile = isMobileDevice();

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: view,
            constraints: {
                facingMode: isMobile ? "environment" : "user",
                width: { min: 640, ideal: 1280 },
                height: { min: 480, ideal: 720 }
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency ? Math.min(4, navigator.hardwareConcurrency) : 2,
        frequency: 10,
        decoder: {
            readers: [
                "ean_reader",
                "ean_8_reader",
                "code_128_reader",
                "upc_reader",
                "upc_e_reader",
                "code_39_reader",
                "codabar_reader"
            ]
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error('Error al inicializar Quagga:', err);
            status.innerHTML = '❌ No se pudo acceder a la cámara. Verificá los permisos.';
            showToast('❌ Error de cámara: ' + (err.message || 'Sin acceso'), 'error');
            return;
        }

        scannerRunning = true;
        Quagga.start();
        status.innerHTML = '<i class="fas fa-desktop"></i> Apuntá al código de barras (PC · Quagga)';

        // Capturar stream activo de Quagga para linterna y cierre limpio
        try {
            const videoEl = view.querySelector('video');
            if (videoEl && videoEl.srcObject) {
                scannerStream = videoEl.srcObject;
            }
        } catch (e) {}
    });

    // Remover listeners previos para evitar duplicaciones
    Quagga.offDetected(quaggaDetectionHandler);
    Quagga.onDetected(quaggaDetectionHandler);
}

function quaggaDetectionHandler(result) {
    if (!scannerRunning || scanDebounce) return;
    if (result && result.codeResult && result.codeResult.code) {
        const code = result.codeResult.code;
        // Validación de confianza de lectura de Quagga
        if (result.codeResult.start && result.codeResult.end) {
            onBarcodeFound(code);
        } else {
            onBarcodeFound(code);
        }
    }
}

// ============================================
// PROCESAMIENTO DEL CÓDIGO LEÍDO
// ============================================
function onBarcodeFound(code) {
    if (scanDebounce) return;
    scanDebounce = true;

    const status = document.getElementById('scannerStatus');
    status.innerHTML = '✅ Código detectado: <strong>' + code + '</strong>';
    playBeep();

    // Buscar producto
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
            if (existing) {
                existing.qty += qty;
                existing.total = existing.qty * existing.price;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    qty: qty,
                    price: product.price,
                    total: product.price
                });
            }
            renderCart();
            showToast('📷 ' + product.name + ' agregado al carrito', 'success');
        } else {
            showToast('⚠️ Stock insuficiente para ' + product.name, 'error');
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
            div.innerHTML = '<span>✅ ' + product.name + ' (' + code + ')</span><span class="time">' + dateTimeStr() + '</span>';
            log.prepend(div);
            if (log.children.length > 20) log.removeChild(log.lastChild);
        }

        setTimeout(stopScanner, 1200);
    } else {
        showToast('⚠️ Código leído: ' + code + ' (no registrado)', 'info');
        playErrorBeep();

        // Ofrecer asignar código en el formulario de productos si el usuario lo desea
        const pBarcodeInput = document.getElementById('pBarcode');
        if (pBarcodeInput) {
            pBarcodeInput.value = code;
        }

        data.scans.unshift({
            date: dateTimeStr(),
            barcode: code,
            product: 'No registrado'
        });
        save();

        const log = document.getElementById('scanLog');
        if (log) {
            const div = document.createElement('div');
            div.innerHTML = '<span style="color:#f59e0b;">⚠️ ' + code + ' (Sin registrar)</span><span class="time">' + dateTimeStr() + '</span>';
            log.prepend(div);
            if (log.children.length > 20) log.removeChild(log.lastChild);
        }

        // Permitir volver a escanear tras 2 segundos
        setTimeout(function() {
            scanDebounce = false;
            if (scannerRunning) {
                const engineName = activeEngine === 'native' ? 'Móvil (BarcodeDetector)' : 'PC (Quagga)';
                status.innerHTML = '<i class="fas fa-camera"></i> Apuntá al código de barras (' + engineName + ')';
            }
        }, 2000);
    }
}

// ============================================
// DETENER ESCÁNER
// ============================================
function stopScanner() {
    scannerRunning = false;

    // Detener intervalo de BarcodeDetector
    if (scannerInterval) {
        clearInterval(scannerInterval);
        scannerInterval = null;
    }

    // Detener Quagga si está activo
    if (typeof Quagga !== 'undefined') {
        try {
            Quagga.offDetected(quaggaDetectionHandler);
            Quagga.stop();
        } catch (e) {}
    }

    // Detener pistas de la cámara
    if (scannerStream) {
        try {
            scannerStream.getTracks().forEach(track => track.stop());
        } catch (e) {}
        scannerStream = null;
    }

    const container = document.getElementById('scannerContainer');
    if (container) container.classList.remove('active');

    const view = document.querySelector('#scannerView');
    if (view) {
        view.innerHTML = '<div class="scanner-overlay"><div class="scanner-line"></div></div>';
    }

    const status = document.getElementById('scannerStatus');
    if (status) status.innerHTML = '<i class="fas fa-camera"></i> Apuntá al código de barras';
}

// ============================================
// CAMBIAR MOTOR MANUALMENTE
// ============================================
function switchScannerEngine() {
    const nextEngine = activeEngine === 'native' ? 'quagga' : 'native';
    if (nextEngine === 'native' && !('BarcodeDetector' in window)) {
        showToast('⚠️ Tu navegador no soporta BarcodeDetector nativo', 'info');
        return;
    }
    stopScanner();
    startScanner(nextEngine);
    showToast('🔄 Motor cambiado a: ' + (nextEngine === 'native' ? 'Móvil (BarcodeDetector)' : 'PC (Quagga)'), 'info');
}

function updateScannerEngineUI() {
    const badge = document.getElementById('scannerEngineBadge');
    if (!badge) return;
    const isMobile = isMobileDevice();
    if (activeEngine === 'native') {
        badge.innerHTML = '<i class="fas fa-mobile-alt"></i> Móvil (BarcodeDetector)';
        badge.className = 'badge badge-success';
    } else {
        badge.innerHTML = '<i class="fas fa-desktop"></i> PC (Quagga)';
        badge.className = 'badge badge-info';
    }
}

// ============================================
// CONTROL DE LINTERNA (TORCH)
// ============================================
function toggleTorch() {
    if (!scannerStream) {
        showToast('🔦 Cámara no iniciada', 'info');
        return;
    }
    const track = scannerStream.getVideoTracks()[0];
    if (!track) {
        showToast('🔦 No hay cámara disponible', 'info');
        return;
    }

    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    if (!capabilities.torch) {
        showToast('🔦 Linterna no disponible en este dispositivo/cámara', 'info');
        return;
    }

    isTorchOn = !isTorchOn;
    track.applyConstraints({
        advanced: [{ torch: isTorchOn }]
    })
    .then(() => {
        showToast(isTorchOn ? '🔦 Linterna encendida' : '🔦 Linterna apagada', 'info');
    })
    .catch(err => {
        console.warn('Error al activar linterna:', err);
        showToast('🔦 No se pudo cambiar estado de la linterna', 'error');
    });
}

// ============================================
// TONOS DE SONIDO
// ============================================
function playBeep() {
    try {
        const ctx = new(window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
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
        osc.frequency.value = 320;
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
}
