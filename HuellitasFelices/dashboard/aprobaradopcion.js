// aprobaradopcion.js - Página de aprobar adopciones
document.addEventListener('DOMContentLoaded', function() {
    initializeApprovalPage();
    loadAdopcionesPendientes();
});

function initializeApprovalPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    
    // Event listeners para filtros
    setupFilters();
    
    // Event listeners para modales
    setupModalEvents();
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

function setupModalEvents() {
    const closeApproveModal = document.getElementById('closeApproveModal');
    const cancelApproveBtn = document.getElementById('cancelApproveBtn');
    const confirmApproveBtn = document.getElementById('confirmApproveBtn');
    const confirmRejectBtn = document.getElementById('confirmRejectBtn');

    // CORREGIDO: Usar función handler en lugar de la función misma
    if (closeApproveModal) closeApproveModal.addEventListener('click', closeApproveModalHandler);
    if (cancelApproveBtn) cancelApproveBtn.addEventListener('click', closeApproveModalHandler);
    if (confirmApproveBtn) confirmApproveBtn.addEventListener('click', confirmApproveAdopcion);
    if (confirmRejectBtn) confirmRejectBtn.addEventListener('click', confirmRejectAdopcion);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('approveModal');
        if (e.target === modal) {
            closeApproveModalHandler();
        }
    });
}

async function loadAdopcionesPendientes() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos de adopciones desde la base de datos
        const response = await fetch('../backend/ver_adopciones_pendientes.php');
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
                <p>Error al cargar las solicitudes: ${errorMessage}</p>
                <button onclick="loadAdopcionesPendientes()" class="retry-btn">Reintentar</button>
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
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay solicitudes de adopción pendientes</p></div>';
        const adopcionesCountElement = document.getElementById('adopcionesCount');
        if (adopcionesCountElement) {
            adopcionesCountElement.textContent = 'Solicitudes de Adopción (0)';
        }
    } else if (grid) {
        // Si no hay datos válidos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay solicitudes de adopción pendientes</p></div>';
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
            <p class="animal-description"><i class="fas fa-envelope"></i> ${adopcion.adoptante_email || 'Email desconocido'}</p>
            <div class="animal-details">
                <span class="detail-item"><i class="fas fa-calendar"></i> ${adopcion.fecha_solicitud || 'Fecha desconocida'}</span>
                <span class="detail-item"><i class="fas fa-heart"></i> ${adopcion.estado || 'Estado desconocido'}</span>
                <span class="detail-item"><i class="fas fa-comment"></i> ${adopcion.motivo || 'Sin motivo'}</span>
                <span class="detail-item"><i class="fas fa-home"></i> ${adopcion.tipo_vivienda || 'Tipo de vivienda desconocido'}</span>
            </div>
            <div class="animal-actions">
                <button class="btn-ver-mas" data-adopcion-id="${adopcion.id}">
                    <i class="fas fa-info-circle"></i> Ver Detalles
                </button>
                <button class="btn-approve empleado-only" data-adopcion-id="${adopcion.id}">
                    <i class="fas fa-check"></i> Aprobar
                </button>
                <button class="btn-reject empleado-only" data-adopcion-id="${adopcion.id}">
                    <i class="fas fa-times"></i> Rechazar
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
            const adopcionId = this.getAttribute('data-adopcion-id');
            viewAdopcionDetails(adopcionId);
        });
    });
    
    // Botones de aprobación (solo para empleado y superior)
    if (hasPermission('empleado')) {
        const approveBtns = document.querySelectorAll('.btn-approve');
        approveBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const adopcionId = this.getAttribute('data-adopcion-id');
                openApproveModal(adopcionId, 'aprobar');
            });
        });
        
        const rejectBtns = document.querySelectorAll('.btn-reject');
        rejectBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const adopcionId = this.getAttribute('data-adopcion-id');
                openApproveModal(adopcionId, 'rechazar');
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

function openApproveModal(adopcionId, accion) {
    // Cargar detalles de la adopción
    fetchAdopcionById(adopcionId).then(adopcion => {
        if (adopcion) {
            document.getElementById('modalTitle').textContent = 
                accion === 'aprobar' ? 'Aprobar Adopción' : 'Rechazar Adopción';
            
            // Mostrar detalles de la adopción
            document.getElementById('adopcionDetails').innerHTML = `
                <div class="adopcion-detail-info">
                    <h4>Detalles de la Adopción</h4>
                    <div class="detail-field">
                        <strong>Animal:</strong> ${adopcion.animal_nombre || 'Animal Desconocido'} (${adopcion.animal_tipo || 'Tipo desconocido'})
                    </div>
                    <div class="detail-field">
                        <strong>Adoptante:</strong> ${adopcion.adoptante_nombre || 'Adoptante Desconocido'} ${adopcion.adoptante_apellido || ''}
                    </div>
                    <div class="detail-field">
                        <strong>Email:</strong> ${adopcion.adoptante_email || 'Email desconocido'}
                    </div>
                    <div class="detail-field">
                        <strong>Teléfono:</strong> ${adopcion.adoptante_telefono || 'Teléfono desconocido'}
                    </div>
                    <div class="detail-field">
                        <strong>Tipo de Vivienda:</strong> ${adopcion.tipo_vivienda || 'No especificado'}
                    </div>
                    <div class="detail-field">
                        <strong>Espacio del Hogar:</strong> ${adopcion.espacio_hogar ? adopcion.espacio_hogar + ' m²' : 'No especificado'}
                    </div>
                    <div class="detail-field">
                        <strong>Tiempo de Cuidado:</strong> ${adopcion.tiempo_cuidado || 'Tiempo desconocido'}
                    </div>
                    <div class="detail-field">
                        <strong>Experiencia:</strong> ${adopcion.experiencia || 'Experiencia desconocida'}
                    </div>
                    <div class="detail-field">
                        <strong>Motivo de Adopción:</strong> ${adopcion.motivo || 'Sin motivo'}
                    </div>
                    <div class="detail-field">
                        <strong>Fecha de Solicitud:</strong> ${adopcion.fecha_solicitud || 'Fecha desconocida'}
                    </div>
                </div>
            `;
            
            // Guardar información en el botón para usarla después
            document.getElementById('confirmApproveBtn').setAttribute('data-adopcion-id', adopcionId);
            document.getElementById('confirmRejectBtn').setAttribute('data-adopcion-id', adopcionId);
            document.getElementById('confirmApproveBtn').setAttribute('data-accion', 'aprobar');
            document.getElementById('confirmRejectBtn').setAttribute('data-accion', 'rechazar');
            
            document.getElementById('approveModal').style.display = 'block';
        }
    });
}

// CORREGIDO: Nueva función handler para cerrar modal
function closeApproveModalHandler() {
    document.getElementById('approveModal').style.display = 'none';
    document.getElementById('comentarios').value = '';
}

async function confirmApproveAdopcion() {
    const adopcionId = document.getElementById('confirmApproveBtn').getAttribute('data-adopcion-id');
    const comentarios = document.getElementById('comentarios').value;
    
    try {
        const response = await fetch('../backend/aprobar_adopcion.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                adopcion_id: adopcionId,
                accion: 'aprobar',
                comentarios: comentarios
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Adopción aprobada exitosamente', 'success');
            closeApproveModalHandler();
            loadAdopcionesPendientes(); // Recargar la lista
        } else {
            showNotification(result.message || 'Error al aprobar la adopción', 'error');
        }
    } catch (error) {
        console.error('Error approving adoption:', error);
        showNotification('Error de conexión al aprobar la adopción', 'error');
    }
}

async function confirmRejectAdopcion() {
    const adopcionId = document.getElementById('confirmRejectBtn').getAttribute('data-adopcion-id');
    const comentarios = document.getElementById('comentarios').value;
    
    try {
        const response = await fetch('../backend/aprobar_adopcion.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                adopcion_id: adopcionId,
                accion: 'rechazar',
                comentarios: comentarios
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Adopción rechazada exitosamente', 'success');
            closeApproveModalHandler();
            loadAdopcionesPendientes(); // Recargar la lista
        } else {
            showNotification(result.message || 'Error al rechazar la adopción', 'error');
        }
    } catch (error) {
        console.error('Error rejecting adoption:', error);
        showNotification('Error de conexión al rechazar la adopción', 'error');
    }
}

async function fetchAdopcionById(id) {
    try {
        const response = await fetch(`../backend/ver_adopciones.php?id=${id}`);
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            return data.data[0];
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching adopcion:', error);
        return null;
    }
}

function filterAdopciones() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const estadoFilter = document.getElementById('estadoFilter')?.value || '';
    const tipoAnimalFilter = document.getElementById('tipoAnimalFilter')?.value || '';

    const adopcionCards = document.querySelectorAll('.animal-card');
    
    adopcionCards.forEach(card => {
        const animalName = card.querySelector('h3').textContent.toLowerCase();
        const animalType = card.querySelector('.animal-description:nth-child(2)').textContent.toLowerCase();
        const adoptanteName = card.querySelector('.animal-description:nth-child(3)').textContent.toLowerCase();
        const adopcionEstado = card.querySelector('.detail-item:nth-child(2)').textContent.toLowerCase();

        const matchesSearch = animalName.includes(searchTerm) || adoptanteName.toLowerCase().includes(searchTerm);
        const matchesEstado = estadoFilter === '' || adopcionEstado.includes(estadoFilter.toLowerCase());
        const matchesTipoAnimal = tipoAnimalFilter === '' || animalType.includes(tipoAnimalFilter.toLowerCase());

        if (matchesSearch && matchesEstado && matchesTipoAnimal) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}