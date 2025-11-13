// veradopciones.js - Página de ver adopciones
document.addEventListener('DOMContentLoaded', function() {
    initializeAdopcionesPage();
    loadAdopciones();
});

function initializeAdopcionesPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Event listeners para filtros
    setupFilters();
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const estadoFilter = document.getElementById('estadoFilter');
    const tipoAnimalFilter = document.getElementById('tipoAnimalFilter');

    // Event listeners para filtros
    if (searchInput) searchInput.addEventListener('input', filterAdopciones);
    if (estadoFilter) estadoFilter.addEventListener('change', filterAdopciones);
    if (tipoAnimalFilter) tipoAnimalFilter.addEventListener('change', filterAdopciones);
}

async function loadAdopciones() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos de adopciones desde la base de datos
        const response = await fetch('../backend/ver_adopciones.php');
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateAdopcionesGrid(data.data);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error loading adopciones:', error);
        showErrorState(error.message);
    }
}

function showLoadingState() {
    const grid = document.getElementById('adopcionesGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-placeholder"><p>Cargando solicitudes de adopción...</p></div>';
    }
}

function showErrorState(errorMessage) {
    const grid = document.getElementById('adopcionesGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las adopciones: ${errorMessage}</p>
                <button onclick="loadAdopciones()" class="retry-btn">Reintentar</button>
            </div>
        `;
    }
}

function updateAdopcionesGrid(adopcionesData) {
    const grid = document.getElementById('adopcionesGrid');
    
    if (grid && adopcionesData && Array.isArray(adopcionesData) && adopcionesData.length > 0) {
        grid.innerHTML = '';
        
        // Actualizar contador
        const adopcionesCountElement = document.getElementById('adopcionesCount');
        if (adopcionesCountElement) {
            adopcionesCountElement.textContent = `Solicitudes de Adopción (${adopcionesData.length})`;
        }
        
        adopcionesData.forEach(adopcion => {
            const adopcionCard = createAdopcionCard(adopcion);
            grid.appendChild(adopcionCard);
        });
        
        // Configurar eventos para los botones de acción
        setupActionButtons();
    } else if (grid && adopcionesData && Array.isArray(adopcionesData) && adopcionesData.length === 0) {
        // Si hay respuesta pero sin datos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay solicitudes de adopción</p></div>';
        const adopcionesCountElement = document.getElementById('adopcionesCount');
        if (adopcionesCountElement) {
            adopcionesCountElement.textContent = 'Solicitudes de Adopción (0)';
        }
    } else if (grid) {
        // Si no hay datos válidos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay solicitudes de adopción</p></div>';
        const adopcionesCountElement = document.getElementById('adopcionesCount');
        if (adopcionesCountElement) {
            adopcionesCountElement.textContent = 'Solicitudes de Adopción (0)';
        }
    }
}

function createAdopcionCard(adopcion) {
    const div = document.createElement('div');
    div.className = 'animal-card'; // Reutilizamos el estilo de animal-card
    div.innerHTML = `
        <div class="animal-info">
            <h3>${adopcion.animal_nombre || 'Animal Desconocido'}</h3>
            <p class="animal-description"><i class="fas fa-paw"></i> ${adopcion.animal_tipo || 'Tipo desconocido'}</p>
            <p class="animal-description"><i class="fas fa-user"></i> ${adopcion.adoptante_nombre || 'Adoptante Desconocido'} ${adopcion.adoptante_apellido || ''}</p>
            <div class="animal-details">
                <span class="detail-item"><i class="fas fa-calendar"></i> ${adopcion.fecha_solicitud || 'Fecha desconocida'}</span>
                <span class="detail-item"><i class="fas fa-heart"></i> ${adopcion.estado || 'Estado desconocido'}</span>
                <span class="detail-item"><i class="fas fa-envelope"></i> ${adopcion.adoptante_email || 'Email desconocido'}</span>
                <span class="detail-item"><i class="fas fa-phone"></i> ${adopcion.adoptante_telefono || 'Teléfono desconocido'}</span>
                <span class="detail-item"><i class="fas fa-comment"></i> ${adopcion.motivo || 'Sin motivo'}</span>
            </div>
            <div class="animal-actions">
                <button class="btn-ver-mas" data-adopcion-id="${adopcion.id}">
                    <i class="fas fa-info-circle"></i> Ver Detalles
                </button>
                ${adopcion.estado === 'pendiente' ? `
                <button class="btn-approve empleado-only" data-adopcion-id="${adopcion.id}">
                    <i class="fas fa-check"></i> Aprobar
                </button>
                <button class="btn-reject empleado-only" data-adopcion-id="${adopcion.id}">
                    <i class="fas fa-times"></i> Rechazar
                </button>
                ` : ''}
            </div>
        </div>
    `;
    return div;
}

function setupActionButtons() {
    const verMasBtns = document.querySelectorAll('.btn-ver-mas');
    verMasBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const adopcionId = this.getAttribute('data-adopcion-id');
            viewAdopcionDetails(adopcionId);
        });
    });
    
    // Botones de aprobación/rechazo (solo para empleado y superior)
    if (hasPermission('empleado')) {
        const approveBtns = document.querySelectorAll('.btn-approve');
        approveBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const adopcionId = this.getAttribute('data-adopcion-id');
                approveAdopcion(adopcionId);
            });
        });
        
        const rejectBtns = document.querySelectorAll('.btn-reject');
        rejectBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const adopcionId = this.getAttribute('data-adopcion-id');
                rejectAdopcion(adopcionId);
            });
        });
    } else {
        // Deshabilitar botones de aprobación/rechazo si no se tiene permiso
        const approveBtns = document.querySelectorAll('.btn-approve');
        approveBtns.forEach(btn => {
            btn.disabled = true;
            btn.title = 'No tienes permisos para esta acción';
        });
        
        const rejectBtns = document.querySelectorAll('.btn-reject');
        rejectBtns.forEach(btn => {
            btn.disabled = true;
            btn.title = 'No tienes permisos para esta acción';
        });
    }
}

function viewAdopcionDetails(adopcionId) {
    showNotification(`Viendo detalles de la adopción ${adopcionId}`, 'info');
}

function approveAdopcion(adopcionId) {
    if (confirm('¿Estás seguro de que deseas aprobar esta adopción?')) {
        showNotification(`Adopción ${adopcionId} aprobada`, 'success');
    }
}

function rejectAdopcion(adopcionId) {
    if (confirm('¿Estás seguro de que deseas rechazar esta adopción?')) {
        showNotification(`Adopción ${adopcionId} rechazada`, 'info');
    }
}

function filterAdopciones() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const estadoFilter = document.getElementById('estadoFilter')?.value || '';
    const tipoAnimalFilter = document.getElementById('tipoAnimalFilter')?.value || '';

    const adopcionCards = document.querySelectorAll('.animal-card');
    
    adopcionCards.forEach(card => {
        const animalName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const animalType = card.querySelector('.animal-description:nth-child(2)')?.textContent.toLowerCase() || '';
        const adoptanteName = card.querySelector('.animal-description:nth-child(3)')?.textContent.toLowerCase() || '';
        const adopcionEstado = card.querySelector('.detail-item:nth-child(2)')?.textContent.toLowerCase() || '';

        const matchesSearch = animalName.includes(searchTerm) || adoptanteName.includes(searchTerm);
        const matchesEstado = estadoFilter === '' || adopcionEstado.includes(estadoFilter);
        const matchesTipoAnimal = tipoAnimalFilter === '' || animalType.includes(tipoAnimalFilter);

        if (matchesSearch && matchesEstado && matchesTipoAnimal) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}