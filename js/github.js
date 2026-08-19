// ============================================
// GITHUB SYNC
// ============================================

var githubConfig = { 
    user: (typeof DEFAULT_GITHUB !== 'undefined' ? DEFAULT_GITHUB.user : 'kioscoa220munro'), 
    repo: (typeof DEFAULT_GITHUB !== 'undefined' ? DEFAULT_GITHUB.repo : 'a220'), 
    token: (typeof DEFAULT_GITHUB !== 'undefined' ? DEFAULT_GITHUB.token : '') 
};

function loadGitHubConfig() {
    const saved = localStorage.getItem('a220_github_config');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            githubConfig = {
                user: parsed.user || DEFAULT_GITHUB.user,
                repo: parsed.repo || DEFAULT_GITHUB.repo,
                token: parsed.token || ''
            };
        } catch (e) {
            githubConfig = { ...DEFAULT_GITHUB };
        }
    } else {
        githubConfig = { ...DEFAULT_GITHUB };
    }

    const uInput = document.getElementById('githubUser');
    const rInput = document.getElementById('githubRepo');
    const tInput = document.getElementById('githubToken');

    if (uInput) uInput.value = githubConfig.user;
    if (rInput) rInput.value = githubConfig.repo;
    if (tInput) tInput.value = githubConfig.token;
}

function saveGitHubConfig() {
    const user = document.getElementById('githubUser').value.trim() || DEFAULT_GITHUB.user;
    const repo = document.getElementById('githubRepo').value.trim() || DEFAULT_GITHUB.repo;
    const token = document.getElementById('githubToken').value.trim();

    githubConfig.user = user;
    githubConfig.repo = repo;
    githubConfig.token = token;

    localStorage.setItem('a220_github_config', JSON.stringify(githubConfig));
    showToast('✅ Configuración de GitHub guardada', 'success');
    addSyncLog('✅ Configuración guardada (Repo: ' + user + '/' + repo + ')');
}

function addSyncLog(msg) {
    const log = document.getElementById('syncLog');
    if (!log) return;
    const div = document.createElement('div');
    div.textContent = '🕐 ' + new Date().toLocaleTimeString('es-AR') + ' - ' + msg;
    log.prepend(div);
    if (log.children.length > 20) log.removeChild(log.lastChild);
}

async function syncToGitHub() {
    if (!githubConfig.user || !githubConfig.repo || !githubConfig.token) {
        showToast('⚠️ Ingresá tu Token de GitHub en Configuración', 'error');
        return;
    }

    // Usar el email del usuario para identificar el archivo de datos
    const emailSafe = currentUser ? currentUser.replace(/[^a-zA-Z0-9]/g, '_') : 'kiosco_data';
    const filename = `data_${emailSafe}.json`;
    const url = `https://api.github.com/repos/${githubConfig.user}/${githubConfig.repo}/contents/${filename}`;

    // Empaquetar datos junto a cuentas autorizadas para backup
    const exportPayload = {
        app: 'A220 Pro',
        version: '2.0',
        timestamp: new Date().toISOString(),
        user: currentUser,
        data: data,
        authorizedEmails: getAuthorizedEmails()
    };

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(exportPayload, null, 2))));

    try {
        showToast('📤 Subiendo datos a GitHub...', 'info');
        addSyncLog('📤 Subiendo a ' + githubConfig.user + '/' + githubConfig.repo + '...');

        let sha = null;
        try {
            const r = await fetch(url, {
                headers: { 
                    'Authorization': `Bearer ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (r.ok) {
                const d = await r.json();
                sha = d.sha;
            }
        } catch (e) {}

        const body = {
            message: `Actualización A220 Pro - ${currentUser || 'Admin'} - ${new Date().toLocaleString('es-AR')}`,
            content: content,
            branch: 'main'
        };
        if (sha) body.sha = sha;

        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showToast('✅ Datos sincronizados con GitHub', 'success');
            addSyncLog('✅ Datos subidos correctamente (' + filename + ')');
            playBeep();
        } else {
            const error = await res.json();
            showToast('❌ Error al subir: ' + (error.message || 'Error desconocido'), 'error');
            addSyncLog('❌ Error: ' + (error.message || 'Error desconocido'));
        }
    } catch (e) {
        showToast('❌ Error de conexión: ' + e.message, 'error');
        addSyncLog('❌ Error: ' + e.message);
    }
}

async function syncFromGitHub() {
    if (!githubConfig.user || !githubConfig.repo || !githubConfig.token) {
        showToast('⚠️ Ingresá tu Token de GitHub en Configuración', 'error');
        return;
    }

    const emailSafe = currentUser ? currentUser.replace(/[^a-zA-Z0-9]/g, '_') : 'kiosco_data';
    const filename = `data_${emailSafe}.json`;
    const url = `https://api.github.com/repos/${githubConfig.user}/${githubConfig.repo}/contents/${filename}`;

    try {
        showToast('📥 Descargando desde GitHub...', 'info');
        addSyncLog('📥 Descargando...');

        const res = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (res.ok) {
            const file = await res.json();
            const content = decodeURIComponent(escape(atob(file.content)));
            const downloaded = JSON.parse(content);

            if (downloaded.data && downloaded.data.products) {
                data = downloaded.data;
                if (downloaded.authorizedEmails && Array.isArray(downloaded.authorizedEmails)) {
                    saveAuthorizedEmails(downloaded.authorizedEmails);
                    renderAuthorizedEmails();
                }
                save();
                showToast('✅ Datos descargados de GitHub', 'success');
                addSyncLog('✅ Datos sincronizados correctamente');
                playBeep();
            } else if (downloaded.products) {
                data = downloaded;
                save();
                showToast('✅ Datos descargados de GitHub', 'success');
                addSyncLog('✅ Datos sincronizados correctamente');
                playBeep();
            } else {
                showToast('⚠️ El archivo no contiene datos válidos', 'error');
                addSyncLog('⚠️ Datos inválidos');
            }
        } else if (res.status === 404) {
            showToast('⚠️ No hay datos en GitHub para este usuario. Subí primero.', 'error');
            addSyncLog('⚠️ Archivo no encontrado en GitHub (' + filename + ')');
        } else {
            const error = await res.json();
            showToast('❌ Error al descargar: ' + (error.message || 'Error desconocido'), 'error');
            addSyncLog('❌ Error: ' + (error.message || 'Error desconocido'));
        }
    } catch (e) {
        showToast('❌ Error: ' + e.message, 'error');
        addSyncLog('❌ Error: ' + e.message);
    }
}
