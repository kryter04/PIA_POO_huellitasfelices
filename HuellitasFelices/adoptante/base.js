// base.js - Funciones base para el módulo de adoptantes
document.addEventListener('DOMContentLoaded', function() {
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
    const navMenu = document.getElementById('navMenu');
    
    if (!navMenu) return;
    
    // Definir las opciones del menú para adoptantes
    const menuItems = [
        {
            title: 'Inicio',
            icon: 'fa-home',
            url: 'index.html',
            page: 'dashboard',
            active: true,
            roles: ['adoptante']
        },
        {
            title: 'Ver Mascotas',
            icon: 'fa-paw',
            url: 'veranimales.html',
            page: 'veranimales',
            active: false,
            roles: ['adoptante']
        },
        {
            title: 'Solicitar Adopción',
            icon: 'fa-heart',
            url: 'solicitaradopcion.html',
            page: 'solicitaradopcion',
            active: false,
            roles: ['adoptante']
        },
        {
            title: 'Mi Perfil',
            icon: 'fa-user',
            url: 'perfil.html',
            page: 'perfil',
            active: false,
            roles: ['adoptante']
        }
    ];
    
    // Generar el HTML del menú
    let menuHTML = '';
    
    menuItems.forEach(item => {
        menuHTML += `
            <a href="${item.url}" class="nav-link ${item.active ? 'active' : ''}" data-page="${item.page}">
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
    
    // Configurar eventos para los enlaces
    setupAdoptanteMenuEvents();
    
    // Configurar evento para logout
    setupAdoptanteLogoutEvent();
}

function setupAdoptanteMenuEvents() {
    // Eventos para los enlaces del menú
    const navLinks = document.querySelectorAll('.nav-link:not(.logout)');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al enlace actual
            this.classList.add('active');
            
            // Cargar la página correspondiente
            const page = this.getAttribute('data-page');
            if (page) {
                loadAdoptantePage(page);
            }
        });
    });
}

function setupAdoptanteLogoutEvent() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            adoptanteLogout();
        });
    }
}

function loadAdoptantePage(pageName) {
    // Redirigir a la página correspondiente
    window.location.href = `${pageName}.html`;
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