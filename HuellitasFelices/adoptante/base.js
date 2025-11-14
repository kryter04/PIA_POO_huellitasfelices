// base.js - Funciones base para el módulo de adoptantes
document.addEventListener('DOMContentLoaded', function() {
    // Añadir estilos de notificación
    addNotificationStyles();
    
    initializeAdoptanteApp();
});

function initializeAdoptanteApp() {
    // Cargar datos del usuario desde localStorage o sessionStorage
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    
    // Verificar si el usuario está autenticado
    if (!userRole) {
        redirectToLogin();
        return;
    }
    
    // Inicializar el menú lateral según el rol (siempre adoptante)
    initializeAdoptanteMenu();
    
    // Cargar información del usuario en el header
    loadUserInfo(userName);
}

function initializeAdoptanteMenu() {
    // Tus archivos HTML (veranimales.html, etc.) deben tener <nav class="nav-menu" id="navMenu">
    const navMenu = document.getElementById('navMenu');
    
    if (!navMenu) {
        // Si no hay menú dinámico, al menos configurar el logout del menú estático
        console.warn("Elemento #navMenu no encontrado. Asumiendo menú estático.");
        setupAdoptanteLogoutEvent();
        return;
    }
    
    // Obtener el nombre de la página actual para el 'active'
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Definir las opciones del menú para adoptantes
    const menuItems = [
        {
            title: 'Inicio',
            icon: 'fa-home',
            url: 'index.html',
            page: 'dashboard'
        },
        {
            title: 'Ver Mascotas',
            icon: 'fa-paw',
            url: 'veranimales.html',
            page: 'veranimales'
        },
        {
            title: 'Solicitar Adopción',
            icon: 'fa-heart',
            url: 'solicitaradopcion.html',
            page: 'solicitaradopcion'
        },
        {
            title: 'Mi Perfil',
            icon: 'fa-user',
            url: 'perfil.html',
            page: 'perfil'
        }
    ];
    
    // Generar el HTML del menú
    let menuHTML = '';
    
    menuItems.forEach(item => {
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
    });
    
    // Agregar el botón de logout
    menuHTML += `
        <a href="#" class="nav-link logout" id="logoutBtn">
            <i class="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
        </a>
    `;
    
    // Reemplazar el contenido del menú
    navMenu.innerHTML = menuHTML;
    
    // Configurar evento para logout
    setupAdoptanteLogoutEvent();

    // NOTA: Se eliminó setupAdoptanteMenuEvents para que los enlaces <a> funcionen nativamente.
}


function setupAdoptanteLogoutEvent() {
    // CORRECCIÓN: Usar un selector que funcione en menú estático o dinámico
    const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('.nav-link.logout');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            adoptanteLogout();
        });
    } else {
        console.error("No se pudo encontrar el botón de 'Cerrar Sesión'.");
    }
}

function loadUserInfo(userName) {
    // Cargar nombre del usuario en el header
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName || 'Usuario';
    }
}

function adoptanteLogout() {
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

// =========================================================================
// FUNCIONES DE NOTIFICACIÓN (Añadidas desde dashboard.js)
// =========================================================================

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