// indexAP.js - Página de inicio para adoptantes (AP = Adoptante)
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadDashboardData();
});

function initializeDashboard() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    const greetingNameElement = document.getElementById('greetingName');
    if (greetingNameElement) {
        greetingNameElement.textContent = userName;
    }
    
    // REMOVIDO: initializeMenu() - No se usa en adoptantes porque tienen menú estático
    
    // Cargar datos del dashboard
    loadDashboardData();
}

async function loadDashboardData() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos del usuario y estadísticas desde la base de datos
        const [statsData, activityData] = await Promise.all([
            fetchAdoptanteStatsFromDB(),
            fetchUserActivityFromDB()
        ]);
        
        updateStats(statsData);
        updateActivity(activityData);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Mostrar mensaje de error claro
        showErrorState(error.message);
    }
}

function showLoadingState() {
    // Mostrar estado de carga en estadísticas - VERIFICAR ANTES DE ACCEDER
    const totalAnimalesElement = document.getElementById('totalAnimales');
    if (totalAnimalesElement) totalAnimalesElement.textContent = 'Cargando...';
    
    const misSolicitudesElement = document.getElementById('misSolicitudes');
    if (misSolicitudesElement) misSolicitudesElement.textContent = 'Cargando...';
    
    const adopcionesAprobadasElement = document.getElementById('adopcionesAprobadas');
    if (adopcionesAprobadasElement) adopcionesAprobadasElement.textContent = 'Cargando...';
    
    // Mostrar estado de carga en actividad
    const activityList = document.getElementById('activityList');
    if (activityList) {
        activityList.innerHTML = '<div class="loading-placeholder"><p>Cargando actividad reciente...</p></div>';
    }
}

function showErrorState(errorMessage) {
    // Mostrar mensaje de error en estadísticas - VERIFICAR ANTES DE ACCEDER
    const totalAnimalesElement = document.getElementById('totalAnimales');
    if (totalAnimalesElement) totalAnimalesElement.textContent = 'Error';
    
    const misSolicitudesElement = document.getElementById('misSolicitudes');
    if (misSolicitudesElement) misSolicitudesElement.textContent = 'Error';
    
    const adopcionesAprobadasElement = document.getElementById('adopcionesAprobadas');
    if (adopcionesAprobadasElement) adopcionesAprobadasElement.textContent = 'Error';
    
    // Mostrar mensaje de error en actividad
    const activityList = document.getElementById('activityList');
    if (activityList) {
        activityList.innerHTML = `
            <div class="error-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar la actividad: ${errorMessage}</p>
                <button onclick="loadDashboardData()" class="retry-btn">Reintentar</button>
            </div>
        `;
    }
}

// FUNCIONES ESPECÍFICAS PARA ADOPTANTES
async function fetchAdoptanteStatsFromDB() {
    try {
        const response = await fetch('../backend/get_adoptante_stats.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: localStorage.getItem('userId') || 1 // Temporal
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching adoptante stats:', error);
        throw error; // Lanzar el error para que se maneje arriba
    }
}

async function fetchUserActivityFromDB() {
    try {
        const response = await fetch('../backend/get_user_activity.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: localStorage.getItem('userId') || 1 // Temporal
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user activity:', error);
        throw error; // Lanzar el error para que se maneje arriba
    }
}

function updateStats(statsData) {
    // Verificar que los datos sean válidos antes de actualizar - VERIFICAR ANTES DE ACCEDER
    if (statsData && typeof statsData === 'object') {
        const totalAnimalesElement = document.getElementById('totalAnimales');
        if (totalAnimalesElement) totalAnimalesElement.textContent = statsData.total_animales || 0;
        
        const misSolicitudesElement = document.getElementById('misSolicitudes');
        if (misSolicitudesElement) misSolicitudesElement.textContent = statsData.mis_solicitudes || 0;
        
        const adopcionesAprobadasElement = document.getElementById('adopcionesAprobadas');
        if (adopcionesAprobadasElement) adopcionesAprobadasElement.textContent = statsData.adopciones_aprobadas || 0;
    } else {
        const totalAnimalesElement = document.getElementById('totalAnimales');
        if (totalAnimalesElement) totalAnimalesElement.textContent = '0';
        
        const misSolicitudesElement = document.getElementById('misSolicitudes');
        if (misSolicitudesElement) misSolicitudesElement.textContent = '0';
        
        const adopcionesAprobadasElement = document.getElementById('adopcionesAprobadas');
        if (adopcionesAprobadasElement) adopcionesAprobadasElement.textContent = '0';
    }
}

function updateActivity(activityData) {
    const activityList = document.getElementById('activityList');
    if (activityList) {
        activityList.innerHTML = '';
        
        if (activityData && Array.isArray(activityData) && activityData.length > 0) {
            activityData.forEach(activity => {
                const activityItem = createActivityElement(activity);
                activityList.appendChild(activityItem);
            });
        } else if (activityData && Array.isArray(activityData) && activityData.length === 0) {
            // Si hay respuesta pero sin datos
            activityList.innerHTML = '<div class="no-data-placeholder"><p>No hay actividad reciente</p></div>';
        } else {
            // Si no hay datos válidos
            activityList.innerHTML = '<div class="no-data-placeholder"><p>No hay actividad disponible</p></div>';
        }
    }
}

function createActivityElement(activity) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    div.innerHTML = `
        <div class="activity-icon">
            <i class="fas fa-${activity.icon || 'info-circle'}"></i>
        </div>
        <div class="activity-content">
            <h3>${activity.title || 'Actividad'}</h3>
            <p>${activity.description || 'Descripción de la actividad'}</p>
            <span class="activity-time">${activity.time || 'Ahora'}</span>
        </div>
    `;
    return div;
}