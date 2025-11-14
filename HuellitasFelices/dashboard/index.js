// index.js - Página de inicio del dashboard (CORREGIDO)

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos del usuario y estadísticas desde la base de datos
        const [statsData, activityData] = await Promise.all([
            fetchStatsFromDB(),
            fetchActivityFromDB()
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
    // Mostrar estado de carga en estadísticas
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
    // Mostrar mensaje de error en estadísticas
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

// Funciones para conectarse a la base de datos
async function fetchStatsFromDB() {
    try {
        const response = await fetch('../backend/ver_estadisticas.php');
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
}

async function fetchActivityFromDB() {
    try {
        const response = await fetch('../backend/ver_actividad.php');
        if (!response.ok) {
            // Si el archivo no existe, crear actividad simulada
            if (response.status === 404) {
                console.warn('Archivo ver_actividad.php no encontrado, usando datos simulados');
                return [
                    {
                        'title': 'Bienvenido',
                        'description': 'Dashboard inicializado correctamente',
                        'time': new Date().toLocaleDateString('es-ES'),
                        'icon': 'check-circle'
                    }
                ];
            }
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching activity:', error);
        throw error;
    }
}

function updateStats(statsData) {
    // Verificar que los datos sean válidos antes de actualizar
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