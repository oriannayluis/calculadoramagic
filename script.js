// ===== VARIABLES GLOBALES =====
let productos = JSON.parse(localStorage.getItem('productos')) || [];
let nombreEstablecimiento = localStorage.getItem('nombreEstablecimiento') || '';
let tasaBCVGuardada = parseFloat(localStorage.getItem('tasaBCV')) || 0;
let ventasDiarias = JSON.parse(localStorage.getItem('ventasDiarias')) || [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let métodoPagoSeleccionado = null;
let detallesPago = {};
let productoEditando = null;
let productosFiltrados = [];
let monedaEtiquetas = localStorage.getItem('monedaEtiquetas') || 'VES';

// ===== SISTEMA DE CLAVE DE SEGURIDAD =====
let claveSeguridad = localStorage.getItem('claveSeguridad') || '1234';

// === NUEVAS VARIABLES PARA ESCÁNER ===
let tiempoUltimaTecla = 0;
let bufferEscaneo = '';

// ===== SISTEMA DE PROTECCIÓN INTELIGENTE CONTRA COMPARTIR ENLACES =====
let equipoID = localStorage.getItem('equipoID') || generarIDEquipo();
let accesoDesdePortal = false;

// ===== DETECCIÓN INTELIGENTE DE ACCESO VÁLIDO =====
(function() {
    console.log('🔍 Iniciando verificación de acceso inteligente...');
    
    // Verificar si viene desde el portal oficial
    const referrer = document.referrer;
    const vieneDePortalOficial = referrer && (
        referrer.includes('calculadoramagica.lat') ||
        referrer.includes('portal.calculadoramagica.lat') ||
        referrer.includes('clientes.calculadoramagica.lat') ||
        referrer.includes('tupaginaweb.com') // Cambia por tu dominio real
    );
    
    // Verificar parámetros de URL que indiquen acceso válido
    const urlParams = new URLSearchParams(window.location.search);
    const accesoValidoParam = urlParams.get('access') === 'portal';
    const tokenValido = urlParams.get('token') === 'calculadora_magica_2024';
    
    // Si viene del portal o tiene parámetros válidos, marcar como acceso válido
    if (vieneDePortalOficial || accesoValidoParam || tokenValido) {
        console.log('✅ Acceso válido detectado - Desde portal oficial');
        accesoDesdePortal = true;
        localStorage.setItem('accesoPortal', 'true');
        localStorage.setItem('fechaPrimerAcceso', new Date().toISOString());
        
        // Guardar información del equipo para referencia futura
        const infoEquipo = obtenerInformacionEquipo();
        localStorage.setItem('infoEquipoOriginal', JSON.stringify(infoEquipo));
        
        // Si tiene parámetros de acceso, limpiar la URL
        if (accesoValidoParam || tokenValido) {
            const nuevaURL = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, nuevaURL);
        }
        return; // Salir - acceso permitido
    }
    
    // ===== VERIFICACIÓN PARA ENLACES COMPARTIDOS =====
    const accesoPortalGuardado = localStorage.getItem('accesoPortal');
    const infoEquipoOriginal = localStorage.getItem('infoEquipoOriginal');
    
    // Si NO hay registro de acceso desde portal Y NO hay información de equipo original
    if (!accesoPortalGuardado && !infoEquipoOriginal) {
        console.log('🚨 Acceso directo detectado - Mostrando advertencia');
        mostrarAdvertenciaCompartir();
        return;
    }
    
    // Si hay información de equipo original, verificar coincidencia
    if (infoEquipoOriginal) {
        const equipoActual = obtenerInformacionEquipo();
        const equipoOriginal = JSON.parse(infoEquipoOriginal);
        const equiposCoinciden = verificarCoincidenciaEquipo(equipoActual, equipoOriginal);
        
        if (!equiposCoinciden) {
            console.log('🚨 Diferencia de equipo detectada - Enlace compartido');
            mostrarAdvertenciaCompartir();
            return;
        }
    }
    
    console.log('✅ Acceso normal permitido');
})();

// ===== FUNCIONES PARA IDENTIFICACIÓN DE EQUIPO =====
function generarIDEquipo() {
    const id = 'EQP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('equipoID', id);
    return id;
}

function obtenerInformacionEquipo() {
    // Información básica que no compromete privacidad pero identifica el equipo
    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        equipoID: equipoID,
        timestamp: new Date().toISOString()
    };
}

function verificarCoincidenciaEquipo(equipo1, equipo2) {
    // Comparar características clave que identifican el equipo
    const característicasClave = [
        'platform',
        'hardwareConcurrency',
        'screenResolution',
        'timezone'
    ];
    
    let coincidencias = 0;
    característicasClave.forEach(caracteristica => {
        if (equipo1[caracteristica] === equipo2[caracteristica]) {
            coincidencias++;
        }
    });
    
    // Requerir al menos 2 coincidencias de características clave
    // Esto permite cierto margen para cambios normales (como resize de ventana)
    return coincidencias >= 2;
}

function mostrarAdvertenciaCompartir() {
    // Crear overlay de advertencia que bloquea completamente la aplicación
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #b71c1c 0%, #7f0000 100%);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        font-family: 'Arial', sans-serif;
        text-align: center;
        padding: 30px;
        box-sizing: border-box;
    `;
    
    overlay.innerHTML = `
        <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 15px; border: 2px solid rgba(255,255,255,0.3); max-width: 600px; backdrop-filter: blur(10px);">
            <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
            <h1 style="color: white; margin-bottom: 25px; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                ACCESO NO AUTORIZADO DETECTADO
            </h1>
            
            <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #ffeb3b;">
                <p style="font-size: 18px; margin-bottom: 15px; line-height: 1.5;">
                    <strong>ESTÁ INTENTANDO ACCEDER AL SISTEMA MEDIANTE UN ENLACE COMPARTIDO</strong>
                </p>
                <p style="margin-bottom: 10px; line-height: 1.5;">
                    Esta acción está <strong>PROHIBIDA</strong> y va en contra de los términos de uso del sistema.
                </p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                <p style="font-size: 16px; margin-bottom: 10px;">
                    <strong>⚠️ CONSECUENCIAS:</strong> Si continúa compartiendo el enlace:
                </p>
                <ul style="text-align: left; margin: 15px 0; padding-left: 20px;">
                    <li>Su acceso será suspendido permanentemente</li>
                    <li>Perderá toda la inversión en el sistema</li>
                    <li>Se aplicarán sanciones según los términos de servicio</li>
                </ul>
            </div>
            
            <div style="background: #ffeb3b; color: #b71c1c; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-weight: bold;">
                📞 <strong>CONTACTO DEL ADMINISTRADOR:</strong><br>
                <span style="font-size: 20px;">0 412 527 8450</span>
            </div>
            
            <div style="margin-top: 25px;">
                <button onclick="redirigirAlPortal()" style="
                    background: #4caf50;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                    font-weight: bold;
                    margin: 10px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4caf50'">
                    🚀 IR AL PORTAL OFICIAL
                </button>
                
                <button onclick="cerrarAdvertencia()" style="
                    background: #ff9800;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                    font-weight: bold;
                    margin: 10px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#f57c00'" onmouseout="this.style.background='#ff9800'">
                    ❌ CERRAR (SOLO ADMIN)
                </button>
            </div>
            
            <div style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                Sistema protegido por Calculadora Mágica ®
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    // Bloquear completamente la aplicación
    setTimeout(() => {
        window.addEventListener('keydown', bloquearTeclasCompletamente);
        window.addEventListener('contextmenu', bloquearContextMenu);
        window.addEventListener('mousedown', bloquearClics);
        window.addEventListener('touchstart', bloquearClics);
    }, 100);
}

function redirigirAlPortal() {
    // Redirigir al portal oficial
    window.location.href = 'http://portal.calculadoramagica.lat/';
}

function cerrarAdvertencia() {
    // Solo permitir cerrar si se ingresa la clave maestra
    const clave = prompt("Ingrese la clave de administrador para cerrar la advertencia:");
    if (clave === 'ACME123' || clave === claveSeguridad) {
        const overlay = document.querySelector('div[style*="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #b71c1c 0%, #7f0000 100%)"]');
        if (overlay) {
            overlay.remove();
        }
        document.body.style.overflow = '';
        
        // Remover event listeners de bloqueo
        window.removeEventListener('keydown', bloquearTeclasCompletamente);
        window.removeEventListener('contextmenu', bloquearContextMenu);
        window.removeEventListener('mousedown', bloquearClics);
        window.removeEventListener('touchstart', bloquearClics);
        
        // Marcar como acceso válido para esta sesión
        sessionStorage.setItem('accesoEmergencia', 'true');
    } else {
        alert('Clave incorrecta. Redirigiendo al portal oficial...');
        redirigirAlPortal();
    }
}

function bloquearTeclasCompletamente(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
}

function bloquearContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
}

function bloquearClics(e) {
    // Permitir solo clics en los botones de la advertencia
    if (!e.target.closest('button')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
    return false;
}

// ===== MONITOREO CONTINUO PARA DETECTAR CAMBIOS DE URL =====
function monitorearCambiosURL() {
    let urlOriginal = window.location.href;
    
    setInterval(() => {
        if (window.location.href !== urlOriginal) {
            console.log('🚨 Cambio de URL detectado - Posible compartir enlace');
            mostrarAdvertenciaCompartir();
            // Restaurar URL original
            window.history.replaceState(null, null, urlOriginal);
        }
    }, 1000);
}

// ===== FUNCIÓN PARA REDONDEAR A 2 DECIMALES =====
function redondear2Decimales(numero) {
    if (isNaN(numero)) return 0;
    return Math.round((numero + Number.EPSILON) * 100) / 100;
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧮 Calculadora Mágica - Sistema iniciado');
    
    // Solo inicializar la aplicación si no hay advertencia activa
    if (!document.querySelector('div[style*="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #b71c1c 0%, #7f0000 100%)"]')) {
        cargarDatosIniciales();
        actualizarLista();
        actualizarCarrito();
        configurarEventos();
        configurarEventosMoviles();
        actualizarGananciaTotal();
        
        // Iniciar monitoreo de URL
        monitorearCambiosURL();
    }
});

// ===== CONFIGURACIÓN ESPECÍFICA PARA MÓVILES =====
function configurarEventosMoviles() {
    const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!esMovil) return;
    
    console.log('📱 Configurando eventos optimizados para móviles');
    
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, { passive: true });
    
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    }
}

// ===== UTILIDADES / TOASTS =====
function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'success' : type === 'error' ? 'error' : 'warning'}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => {
            if (container.contains(toast)) container.removeChild(toast);
        }, 300);
    }, duration);
}

// ===== CONFIGURACIÓN DE EVENTOS MEJORADA =====
function configurarEventos() {
    const buscarInput = document.getElementById('buscar');
    if (buscarInput) {
        buscarInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarProducto();
            }
        });
        
        buscarInput.addEventListener('input', function(e) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                buscarProducto();
            }, 500);
        });
    }

    const codigoInput = document.getElementById('codigoBarrasInput');
    if (codigoInput) {
        codigoInput.addEventListener('keydown', function(e) {
            const tiempoActual = new Date().getTime();
            
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                
                if (this.value.trim() && (tiempoActual - tiempoUltimaTecla) < 100) {
                    procesarEscaneo(this.value.trim());
                    this.value = '';
                }
                return;
            }
            
            if (e.key.length === 1) {
                bufferEscaneo += e.key;
                tiempoUltimaTecla = tiempoActual;
                
                clearTimeout(window.bufferTimeout);
                window.bufferTimeout = setTimeout(() => {
                    if (bufferEscaneo.length > 0) {
                        bufferEscaneo = '';
                    }
                }, 60);
            }
        });

        codigoInput.addEventListener('input', function() {
            const termino = this.value.trim().toLowerCase();
            const sugerenciasDiv = document.getElementById('sugerencias');
            if (!sugerenciasDiv) return;
            sugerenciasDiv.innerHTML = '';

            if (termino.length < 2) return;

            const coincidencias = productos.filter(p =>
                (p.nombre || p.producto || '').toLowerCase().includes(termino) ||
                (p.codigoBarras && p.codigoBarras.toLowerCase().includes(termino))
            );

            coincidencias.slice(0, 8).forEach(prod => {
                const opcion = document.createElement('div');
                opcion.textContent = `${(prod.nombre || prod.producto)} (${prod.descripcion || prod.descripcion})`;
                opcion.onclick = function() {
                    document.getElementById('codigoBarrasInput').value = prod.codigoBarras || prod.nombre || prod.producto;
                    procesarEscaneo(document.getElementById('codigoBarrasInput').value);
                    sugerenciasDiv.innerHTML = '';
                    document.getElementById('codigoBarrasInput').focus();
                };
                sugerenciasDiv.appendChild(opcion);
            });
        });

        codigoInput.addEventListener('blur', function() {
            setTimeout(() => {
                const activeElement = document.activeElement;
                const esCampoConfiguracion = activeElement && 
                    (activeElement.id === 'tasaBCV' || 
                     activeElement.id === 'nombreEstablecimiento' ||
                     activeElement.closest('.config-section'));
                
                if (!esCampoConfiguracion && 
                    (!activeElement || 
                     !activeElement.matches('button, input[type="text"], select, textarea'))) {
                    codigoInput.focus();
                }
            }, 100);
        });
    }

    setTimeout(() => {
        if (codigoInput) {
            codigoInput.focus();
            codigoInput.select();
        }
    }, 500);

    const camposConfiguracion = ['tasaBCV', 'nombreEstablecimiento'];
    camposConfiguracion.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('focus', function() {
                this.setAttribute('data-scanning-disabled', 'true');
            });
            campo.addEventListener('blur', function() {
                this.removeAttribute('data-scanning-disabled');
            });
        }
    });
}

// ===== FUNCIONES BÁSICAS =====
function cargarDatosIniciales() {
    const nombreElem = document.getElementById('nombreEstablecimiento');
    const tasaElem = document.getElementById('tasaBCV');
    const monedaEtiquetasElem = document.getElementById('monedaEtiquetas');
    
    if (nombreElem) nombreElem.value = nombreEstablecimiento;
    if (tasaElem) tasaElem.value = tasaBCVGuardada || '';
    if (monedaEtiquetasElem) monedaEtiquetasElem.value = monedaEtiquetas;
}

function calcularPrecioVenta() {
    const tasaBCV = parseFloat(document.getElementById('tasaBCV').value) || tasaBCVGuardada;
    const costo = parseFloat(document.getElementById('costo').value);
    const ganancia = parseFloat(document.getElementById('ganancia').value);
    const unidadesPorCaja = parseFloat(document.getElementById('unidadesPorCaja').value);

    if (!tasaBCV || tasaBCV <= 0) {
        showToast("Ingrese una tasa BCV válida", 'error');
        return;
    }
    if (!costo || !ganancia || !unidadesPorCaja) {
        showToast("Complete todos los campos requeridos", 'error');
        return;
    }

    const gananciaDecimal = ganancia / 100;
    const precioDolar = costo / (1 - gananciaDecimal);
    const precioBolivares = precioDolar * tasaBCV;
    const precioUnitarioDolar = redondear2Decimales(precioDolar / unidadesPorCaja);
    const precioUnitarioBolivar = redondear2Decimales(precioBolivares / unidadesPorCaja);

    const precioUnitarioElem = document.getElementById('precioUnitario');
    if (precioUnitarioElem) {
        precioUnitarioElem.innerHTML =
            `<strong>Precio unitario:</strong> $${precioUnitarioDolar.toFixed(2)} / Bs${precioUnitarioBolivar.toFixed(2)}`;
    }
}

// ===== GUARDAR / EDITAR PRODUCTOS =====
function guardarProducto() {
    const nombre = document.getElementById('producto').value.trim();
    const codigoBarras = document.getElementById('codigoBarras').value.trim();
    const descripcion = document.getElementById('descripcion').value;
    const costo = parseFloat(document.getElementById('costo').value);
    const ganancia = parseFloat(document.getElementById('ganancia').value);
    const unidadesPorCaja = parseFloat(document.getElementById('unidadesPorCaja').value);
    const unidadesExistentesInput = parseFloat(document.getElementById('unidadesExistentes').value) || 0;
    const tasaBCV = parseFloat(document.getElementById('tasaBCV').value) || tasaBCVGuardada;

    if (!nombre || !descripcion) { 
        showToast("Complete el nombre y descripción del producto", 'error'); 
        return; 
    }
    if (!tasaBCV || tasaBCV <= 0) { 
        showToast("Ingrese una tasa BCV válida", 'error'); 
        return; 
    }
    if (!costo || !ganancia || !unidadesPorCaja) { 
        showToast("Complete todos los campos requeridos", 'error'); 
        return; 
    }

    if (codigoBarras && productoEditando === null) {
        const codigoExistente = productos.findIndex(p => 
            p.codigoBarras && p.codigoBarras.toLowerCase() === codigoBarras.toLowerCase()
        );
        if (codigoExistente !== -1) {
            showToast("El código de barras ya existe para otro producto", 'error');
            return;
        }
    }

    let productoExistenteIndex = -1;
    if (productoEditando !== null) {
        productoExistenteIndex = productoEditando;
    } else {
        productoExistenteIndex = productos.findIndex(p => 
            (p.nombre || p.producto || '').toLowerCase() === nombre.toLowerCase()
        );
    }

    const gananciaDecimal = ganancia / 100;
    const precioDolar = costo / (1 - gananciaDecimal);
    const precioBolivares = precioDolar * tasaBCV;
    const precioUnitarioDolar = redondear2Decimales(precioDolar / unidadesPorCaja);
    const precioUnitarioBolivar = redondear2Decimales(precioBolivares / unidadesPorCaja);

    const producto = {
        nombre,
        codigoBarras,
        descripcion,
        costo,
        ganancia: gananciaDecimal,
        unidadesPorCaja,
        unidadesExistentes: unidadesExistentesInput,
        precioMayorDolar: precioDolar,
        precioMayorBolivar: precioBolivares,
        precioUnitarioDolar: precioUnitarioDolar,
        precioUnitarioBolivar: precioUnitarioBolivar,
        fechaActualizacion: new Date().toISOString()
    };

    if (productoExistenteIndex !== -1) {
        productos[productoExistenteIndex] = producto;
        showToast("✓ Producto actualizado exitosamente", 'success');
    } else {
        productos.push(producto);
        showToast("✓ Producto guardado exitosamente", 'success');
    }

    localStorage.setItem('productos', JSON.stringify(productos));
    actualizarLista();
    actualizarGananciaTotal();

    document.getElementById('producto').value = '';
    document.getElementById('codigoBarras').value = '';
    document.getElementById('costo').value = '';
    document.getElementById('ganancia').value = '';
    document.getElementById('unidadesPorCaja').value = '';
    document.getElementById('unidadesExistentes').value = '';
    document.getElementById('descripcion').selectedIndex = 0;
    document.getElementById('precioUnitario').innerHTML = '';

    productoEditando = null;
}

// ... (el resto de las funciones se mantienen igual que en el código anterior)
// [Todas las demás funciones permanecen exactamente iguales]
