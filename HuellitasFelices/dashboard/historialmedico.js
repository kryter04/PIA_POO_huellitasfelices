// historialmedico.js - Página de historial médico
document.addEventListener('DOMContentLoaded', function() {
    initializeHistorialPage();
    loadAnimalesForFilter();
    loadHistorialMedico();
});

function initializeHistorialPage() {
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
    const animalFilter = document.getElementById('animalFilter');
    const tipoRevisionFilter = document.getElementById('tipoRevisionFilter');
    const estadoSaludFilter = document.getElementById('estadoSaludFilter');

    // Event listeners para filtros
    if (searchInput) searchInput.addEventListener('input', filterHistorial);
    if (animalFilter) animalFilter.addEventListener('change', filterHistorial);
    if (tipoRevisionFilter) tipoRevisionFilter.addEventListener('change', filterHistorial);
    if (estadoSaludFilter) estadoSaludFilter.addEventListener('change', filterHistorial);
}

async function loadAnimalesForFilter() {
    try {
        const response = await fetch('../backend/ver_animales.php');
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            populateAnimalesFilter(data.data);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error loading animals for filter:', error);
        showNotification('Error al cargar animales para el filtro', 'error');
    }
}

function populateAnimalesFilter(animalesData) {
    const select = document.getElementById('animalFilter');
    select.innerHTML = '<option value="">Todos los animales</option>';
    
    if (animalesData && Array.isArray(animalesData) && animalesData.length > 0) {
        animalesData.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.id;
            option.textContent = `${animal.nombre} (${animal.tipo})`;
            select.appendChild(option);
        });
    }
}

async function loadHistorialMedico() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos de revisiones médicas desde la base de datos
        const response = await fetch('../backend/ver_historial_medico.php');
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateHistorialGrid(data.data);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error loading medical history:', error);
        showErrorState(error.message);
    }
}

function showLoadingState() {
    const grid = document.getElementById('historialGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-placeholder"><p>Cargando historial médico...</p></div>';
    }
}

function showErrorState(errorMessage) {
    const grid = document.getElementById('historialGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar el historial médico: ${errorMessage}</p>
                <button onclick="loadHistorialMedico()" class="retry-btn">Reintentar</button>
            </div>
        `;
    }
}

function updateHistorialGrid(historialData) {
    const grid = document.getElementById('historialGrid');
    
    if (grid && historialData && Array.isArray(historialData) && historialData.length > 0) {
        grid.innerHTML = '';
        
        // Actualizar contador
        const historialCountElement = document.getElementById('historialCount');
        if (historialCountElement) {
            historialCountElement.textContent = `Historial Médico (${historialData.length})`;
        }
        
        historialData.forEach(revision => {
            const revisionCard = createRevisionCard(revision);
            grid.appendChild(revisionCard);
        });
        
        // Configurar eventos para los botones de acción
        setupActionButtons();
    } else if (grid && historialData && Array.isArray(historialData) && historialData.length === 0) {
        // Si hay respuesta pero sin datos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay revisiones médicas registradas</p></div>';
        const historialCountElement = document.getElementById('historialCount');
        if (historialCountElement) {
            historialCountElement.textContent = 'Historial Médico (0)';
        }
    } else if (grid) {
        // Si no hay datos válidos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay revisiones médicas registradas</p></div>';
        const historialCountElement = document.getElementById('historialCount');
        if (historialCountElement) {
            historialCountElement.textContent = 'Historial Médico (0)';
        }
    }
}

function createRevisionCard(revision) {
    const div = document.createElement('div');
    div.className = 'animal-card'; // Reutilizamos el estilo de animal-card
    div.innerHTML = `
        <div class="animal-info">
            <h3>${revision.animal_nombre || 'Animal Desconocido'}</h3>
            <p class="animal-description"><i class="fas fa-user-md"></i> ${revision.veterinario_nombre || 'Veterinario Desconocido'} ${revision.veterinario_apellido || ''}</p>
            <div class="animal-details">
                <span class="detail-item"><i class="fas fa-calendar"></i> ${revision.fecha_revision || 'Fecha desconocida'}</span>
                <span class="detail-item"><i class="fas fa-clock"></i> ${revision.hora_revision || 'Hora desconocida'}</span>
                <span class="detail-item"><i class="fas fa-stethoscope"></i> ${revision.tipo_revision || 'Tipo desconocido'}</span>
                <span class="detail-item"><i class="fas fa-heartbeat"></i> ${revision.estado_salud || 'Estado desconocido'}</span>
                <span class="detail-item"><i class="fas fa-weight"></i> ${revision.peso ? revision.peso + ' kg' : 'Peso no registrado'}</span>
                <span class="detail-item"><i class="fas fa-thermometer"></i> ${revision.temperatura ? revision.temperatura + ' °C' : 'Temperatura no registrada'}</span>
                <span class="detail-item"><i class="fas fa-shield-virus"></i> ${revision.estado_vacunas || 'Estado vacunas desconocido'}</span>
                <span class="detail-item"><i class="fas fa-dollar-sign"></i> $${revision.costo || '0'}</span>
            </div>
            <div class="animal-actions">
                <button class="btn-ver-mas" data-revision-id="${revision.id}">
                    <i class="fas fa-info-circle"></i> Ver Detalles
                </button>
                <button class="btn-edit admin-only" data-revision-id="${revision.id}">
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
            const revisionId = this.getAttribute('data-revision-id');
            viewRevisionDetails(revisionId);
        });
    });
    
    // Botones de edición (solo para admin)
    if (hasPermission('admin')) {
        const editBtns = document.querySelectorAll('.btn-edit');
        editBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const revisionId = this.getAttribute('data-revision-id');
                editRevision(revisionId);
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

function viewRevisionDetails(revisionId) {
    showNotification(`Viendo detalles de la revisión ${revisionId}`, 'info');
}

function editRevision(revisionId) {
    showNotification(`Editando revisión ${revisionId}`, 'info');
}

function filterHistorial() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const animalFilter = document.getElementById('animalFilter')?.value || '';
    const tipoRevisionFilter = document.getElementById('tipoRevisionFilter')?.value || '';
    const estadoSaludFilter = document.getElementById('estadoSaludFilter')?.value || '';

    const revisionCards = document.querySelectorAll('.animal-card');
    
    revisionCards.forEach(card => {
        const animalName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const veterinarianName = card.querySelector('.animal-description')?.textContent.toLowerCase() || '';
        const revisionType = card.querySelector('.detail-item:nth-child(3)')?.textContent.toLowerCase() || '';
        const healthStatus = card.querySelector('.detail-item:nth-child(4)')?.textContent.toLowerCase() || '';

        const matchesSearch = animalName.includes(searchTerm) || veterinarianName.includes(searchTerm);
        const matchesAnimal = animalFilter === '' || animalName.includes(animalFilter.toLowerCase());
        const matchesTipoRevision = tipoRevisionFilter === '' || revisionType.includes(tipoRevisionFilter.toLowerCase());
        const matchesEstadoSalud = estadoSaludFilter === '' || healthStatus.includes(estadoSaludFilter.toLowerCase());

        if (matchesSearch && matchesAnimal && matchesTipoRevision && matchesEstadoSalud) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}