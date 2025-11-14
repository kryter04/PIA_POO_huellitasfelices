// dashboard.js - Funciones base para el dashboard (CON PROTECCIÓN)

let menuInitialized = false; // Flag para evitar doble inicialización

document.addEventListener('DOMContentLoaded', function() {
    // Si la función addNotificationStyles no existe, la añadimos y la llamamos
    if (typeof addNotificationStyles === 'undefined') {
        addNotificationStyles();
    }
    
    if (!menuInitialized) {
        initializeDashboardApp();
        menuInitialized = true;
    }
});

function initializeDashboardApp() {
    // Cargar datos del usuario desde localStorage o sessionStorage
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    
    // Verificar si el usuario está autenticado
    if (!userRole) {
        console.log('Usuario no autenticado, redirigiendo...');
        redirectToLogin();
        return;
    }
    
    console.log('Rol del usuario:', userRole);
    console.log('Nombre del usuario:', userName);
    
    // Inicializar el menú lateral
    initializeMenu(userRole);
    
    // Cargar información del usuario en el header
    loadUserInfo(userName);
}

function initializeMenu(userRole) {
    const navMenu = document.getElementById('navMenu');
    
    if (!navMenu) {
        console.error('Elemento navMenu no encontrado en el DOM');
        return;
    }
    
    // Obtener el nombre de la página actual
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    console.log('Página actual:', currentPage);
    
    // Definir las opciones del menú según el rol
    const menuItems = getMenuItemsByRole(userRole);
    
    // Generar el HTML del menú
    let menuHTML = '';
    
    menuItems.forEach(item => {
        // Verificar si el usuario tiene permiso para ver este ítem
        if (item.roles.includes(userRole)) {
            // Determinar si este ítem debe estar activo
            const isActive = currentPage === item.page || 
                             (currentPage === 'index' && item.page === 'dashboard') ||
                             (currentPage === '' && item.page === 'dashboard');
            
            menuHTML += `
                <a href="${item.url}" class="nav-link ${isActive ? 'active' : ''}" data-page="${item.page}">
                    <i class="fas ${item.icon}"></i>
                    <span>${item.title}</span>
                </a>
            `;
        }
    });
    
    // Agregar el botón de logout
    menuHTML += `
        <a href="#" class="nav-link logout" id="logoutBtn">
            <i class="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
        </a>
    `;
    
    // Actualizar el contenido del menú
    navMenu.innerHTML = menuHTML;
    
    // Configurar eventos para el logout
    setupLogoutEvent();
}

function getMenuItemsByRole(role) {
    console.log('Generando menú para rol:', role);
    
    // Definir todos los ítems del menú
    const allMenuItems = [
        {
            title: 'Inicio',
            icon: 'fa-home',
            url: 'index.html',
            page: 'dashboard',
            active: true,
            roles: ['admin', 'veterinario', 'empleado']
        },
        {
            title: 'Ver Mascotas',
            icon: 'fa-paw',
            url: 'veranimales.html',
            page: 'veranimales',
            active: false,
            roles: ['admin', 'veterinario', 'empleado']
        },
        {
            title: 'Ver Adoptantes',
            icon: 'fa-users',
            url: 'veradoptantes.html',
            page: 'veradoptantes',
            active: false,
            roles: ['admin', 'veterinario', 'empleado']
        },
        {
            title: 'Ver Adopciones',
            icon: 'fa-heart',
            url: 'veradopciones.html',
            page: 'veradopciones',
            active: false,
            roles: ['admin', 'veterinario', 'empleado']
        },
        {
            title: 'Registrar Animal',
            icon: 'fa-plus-circle',
            url: 'registraranimal.html',
            page: 'registraranimal',
            active: false,
            roles: ['admin', 'veterinario', 'empleado']
        },
        {
            title: 'Nueva Revisión',
            icon: 'fa-stethoscope',
            url: 'nuevarevision.html',
            page: 'nuevarevision',
            active: false,
            roles: ['admin', 'veterinario']
        },
        // --- SECCIÓN ELIMINADA ---
        /*
        {
            title: 'Aprobar Adopción',
            icon: 'fa-check-circle',
            url: 'aprobaradopcion.html',
            page: 'aprobaradopcion',
            active: false,
            roles: ['admin', 'veterinario', 'empleado']
        },
        */
        // -------------------------
        {
            title: 'Gestionar Empleados',
            icon: 'fa-users-cog',
            url: 'gestionarempleados.html',
            page: 'gestionarempleados',
            active: false,
            roles: ['admin']
        },
        {
            title: 'Reportes',
            icon: 'fa-chart-bar',
            url: 'reportes.html',
            page: 'reportes',
            active: false,
            roles: ['admin']
        }
    ];
    
    // Filtrar los ítems según el rol del usuario
    const filteredItems = allMenuItems.filter(item => item.roles.includes(role));
    console.log('Items filtrados:', filteredItems);
    return filteredItems;
}

function setupLogoutEvent() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

function loadUserInfo(userName) {
    // Cargar nombre del usuario en el header
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName || 'Usuario';
        console.log('Nombre de usuario cargado:', userNameElement.textContent);
    }
}

function logout() {
    // Confirmar logout
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Limpiar datos de sesión
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userName');
        
        // Redirigir al login
        window.location.href = '../login/login.html';
    }
}

function redirectToLogin() {
    window.location.href = '../login/login.html';
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear un contenedor para la notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        zIndex: '10000',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.3s ease-out'
    });
    
    // Colores según el tipo
    switch(type) {
        case 'success':
            notification.style.background = '#4CAF50';
            break;
        case 'error':
            notification.style.background = '#f44336';
            break;
        case 'warning':
            notification.style.background = '#ff9800';
            break;
        default:
            notification.style.background = '#2196F3';
    }
    
    // Agregar al body
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        // Usar animación de slideOut si está definida o simplemente fade out
        if (typeof document.body.style.animationName !== 'undefined' && document.body.style.animationName.includes('slideOut')) {
             notification.style.animation = 'slideOut 0.3s ease-in';
        } else {
             notification.style.opacity = '0';
             notification.style.transition = 'opacity 0.3s ease-in';
        }
       
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Añadir estilos para las notificaciones (Asegurar que se añadan una sola vez)
function addNotificationStyles() {
    // Evitar añadir estilos múltiples veces
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Llamar a la función para añadir estilos
addNotificationStyles();


// Función para verificar permisos
function hasPermission(requiredRole) {
    const currentUserRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    
    if (!currentUserRole) return false;
    
    // Definir jerarquía de roles
    const roleHierarchy = {
        'adoptante': 1,
        'empleado': 2,
        'veterinario': 3,
        'admin': 4
    };
    
    return roleHierarchy[currentUserRole] >= roleHierarchy[requiredRole];
}