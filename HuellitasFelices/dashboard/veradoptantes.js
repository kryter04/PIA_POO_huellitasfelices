// veradoptantes.js - Página de ver adoptantes
document.addEventListener('DOMContentLoaded', function() {
    initializeAdoptantesPage();
    loadAdoptantes();
});

function initializeAdoptantesPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Inicializar el menú lateral
    initializeMenu();
    
    // Event listeners para filtros
    setupFilters();
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const estadoFilter = document.getElementById('estadoFilter');
    const tipoViviendaFilter = document.getElementById('tipoViviendaFilter');

    // Event listeners para filtros
    if (searchInput) searchInput.addEventListener('input', filterAdoptantes);
    if (estadoFilter) estadoFilter.addEventListener('change', filterAdoptantes);
    if (tipoViviendaFilter) tipoViviendaFilter.addEventListener('change', filterAdoptantes);
}

async function loadAdoptantes() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos de adoptantes desde la base de datos
        const response = await fetch('../backend/ver_adoptantes.php');
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateAdoptantesGrid(data.data);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error loading adoptantes:', error);
        showErrorState(error.message);
    }
}

function showLoadingState() {
    const grid = document.getElementById('adoptantesGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-placeholder"><p>Cargando adoptantes...</p></div>';
    }
}

function showErrorState(errorMessage) {
    const grid = document.getElementById('adoptantesGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los adoptantes: ${errorMessage}</p>
                <button onclick="loadAdoptantes()" class="retry-btn">Reintentar</button>
            </div>
        `;
    }
}

function updateAdoptantesGrid(adoptantesData) {
    const grid = document.getElementById('adoptantesGrid');
    
    if (grid && adoptantesData && Array.isArray(adoptantesData) && adoptantesData.length > 0) {
        grid.innerHTML = '';
        
        // Actualizar contador
        const adoptantesCountElement = document.getElementById('adoptantesCount');
        if (adoptantesCountElement) {
            adoptantesCountElement.textContent = `Adoptantes Registrados (${adoptantesData.length})`;
        }
        
        adoptantesData.forEach(adoptante => {
            const adoptanteCard = createAdoptanteCard(adoptante);
            grid.appendChild(adoptanteCard);
        });
        
        // Configurar eventos para los botones de acción
        setupActionButtons();
    } else if (grid && adoptantesData && Array.isArray(adoptantesData) && adoptantesData.length === 0) {
        // Si hay respuesta pero sin datos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay adoptantes registrados</p></div>';
        const adoptantesCountElement = document.getElementById('adoptantesCount');
        if (adoptantesCountElement) {
            adoptantesCountElement.textContent = 'Adoptantes Registrados (0)';
        }
    } else if (grid) {
        // Si no hay datos válidos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay adoptantes registrados</p></div>';
        const adoptantesCountElement = document.getElementById('adoptantesCount');
        if (adoptantesCountElement) {
            adoptantesCountElement.textContent = 'Adoptantes Registrados (0)';
        }
    }
}

function createAdoptanteCard(adoptante) {
    const div = document.createElement('div');
    div.className = 'animal-card'; // Reutilizamos el estilo de animal-card
    div.innerHTML = `
        <div class="animal-info">
            <h3>${adoptante.nombre} ${adoptante.apellido}</h3>
            <p class="animal-description"><i class="fas fa-envelope"></i> ${adoptante.email}</p>
            <p class="animal-description"><i class="fas fa-phone"></i> ${adoptante.telefono || 'No registrado'}</p>
            <div class="animal-details">
                <span class="detail-item"><i class="fas fa-home"></i> ${adoptante.tipo_vivienda || 'Tipo desconocido'}</span>
                <span class="detail-item"><i class="fas fa-ruler"></i> ${adoptante.espacio_hogar ? adoptante.espacio_hogar + ' m²' : 'No especificado'}</span>
                <span class="detail-item"><i class="fas fa-clock"></i> ${adoptante.tiempo_cuidado || 'Tiempo desconocido'}</span>
                <span class="detail-item"><i class="fas fa-paw"></i> ${adoptante.experiencia || 'Experiencia desconocida'}</span>
                <span class="detail-item"><i class="fas fa-user"></i> ${adoptante.estado || 'Estado desconocido'}</span>
                <span class="detail-item"><i class="fas fa-calendar"></i> ${adoptante.fecha_registro || 'Fecha desconocida'}</span>
            </div>
            <div class="animal-actions">
                <button class="btn-ver-mas" data-adoptante-id="${adoptante.id}">
                    <i class="fas fa-info-circle"></i> Ver Detalles
                </button>
                <button class="btn-edit admin-only" data-adoptante-id="${adoptante.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </div>
        </div>
    `;
    return div;
}

function setupActionButtons() {
    const verMasBtns = document.querySelectorAll('.btn-ver-mas');
    verMasBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const adoptanteId = this.getAttribute('data-adoptante-id');
            viewAdoptanteDetails(adoptanteId);
        });
    });
    
    // Botones de edición (solo para admin)
    if (hasPermission('admin')) {
        const editBtns = document.querySelectorAll('.btn-edit');
        editBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const adoptanteId = this.getAttribute('data-adoptante-id');
                editAdoptante(adoptanteId);
            });
        });
    } else {
        // Deshabilitar botones de edición si no se tiene permiso
        const editBtns = document.querySelectorAll('.btn-edit');
        editBtns.forEach(btn => {
            btn.disabled = true;
            btn.title = 'No tienes permisos para esta acción';
        });
    }
}

function viewAdoptanteDetails(adoptanteId) {
    showNotification(`Viendo detalles del adoptante ${adoptanteId}`, 'info');
}

function editAdoptante(adoptanteId) {
    showNotification(`Editando adoptante ${adoptanteId}`, 'info');
}

function filterAdoptantes() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const estadoFilter = document.getElementById('estadoFilter')?.value || '';
    const tipoViviendaFilter = document.getElementById('tipoViviendaFilter')?.value || '';

    const adoptanteCards = document.querySelectorAll('.animal-card');
    
    adoptanteCards.forEach(card => {
        const adoptanteName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const adoptanteEmail = card.querySelector('.animal-description:nth-child(2)')?.textContent.toLowerCase() || '';
        const adoptanteEstado = card.querySelector('.detail-item:nth-child(5)')?.textContent.toLowerCase() || '';
        const adoptanteTipoVivienda = card.querySelector('.detail-item:nth-child(1)')?.textContent.toLowerCase() || '';

        const matchesSearch = adoptanteName.includes(searchTerm) || adoptanteEmail.includes(searchTerm);
        const matchesEstado = estadoFilter === '' || adoptanteEstado.includes(estadoFilter);
        const matchesTipoVivienda = tipoViviendaFilter === '' || adoptanteTipoVivienda.includes(tipoViviendaFilter);

        if (matchesSearch && matchesEstado && matchesTipoVivienda) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}