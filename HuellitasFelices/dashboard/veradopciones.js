// veradopciones.js - Página de ver adopciones
document.addEventListener('DOMContentLoaded', function() {
    initializeAdopcionesPage();
    loadAdopciones();
});

function initializeAdopcionesPage() {
    // Cargar nombre del usuario (manejado por dashboard.js)
    
    // Event listeners para filtros
    setupFilters();

    // Event listeners para el modal
    setupModalEvents();
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const estadoFilter = document.getElementById('estadoFilter');
    const tipoAnimalFilter = document.getElementById('tipoAnimalFilter');

    if (searchInput) searchInput.addEventListener('input', filterAdopciones);
    if (estadoFilter) estadoFilter.addEventListener('change', filterAdopciones);
    if (tipoAnimalFilter) tipoAnimalFilter.addEventListener('change', filterAdopciones);
}

// FUNCIÓN PARA CERRAR EL MODAL
function setupModalEvents() {
    const modal = document.getElementById('adopcionModal');
    const closeModalBtn = document.getElementById('closeAdopcionModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    const closeModal = () => {
        if (modal) modal.style.display = "none";
        // Limpiar y ocultar secciones del modal
        const modalBody = document.getElementById('modalBodyContent');
        const comentariosSection = document.getElementById('modalComentariosSection');
        const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');

        if (modalBody) modalBody.innerHTML = '<div class="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando...</p></div>';
        if (comentariosSection) comentariosSection.style.display = 'none';
        if (modalPrimaryBtn) modalPrimaryBtn.style.display = 'none';
        document.getElementById('comentarios').value = '';
    };

    if (closeModalBtn) closeModalBtn.onclick = closeModal;
    if (modalCloseBtn) modalCloseBtn.onclick = closeModal;

    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
}


async function loadAdopciones() {
    try {
        showLoadingState();
        
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
        grid.innerHTML = '<div class="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando solicitudes...</p></div>';
    }
}

function showErrorState(errorMessage) {
    const grid = document.getElementById('adopcionesGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las adopciones: ${errorMessage}</p>
                <button onclick="loadAdopciones()" class="retry-btn btn-primary">Reintentar</button>
            </div>
        `;
    }
}

function updateAdopcionesGrid(adopcionesData) {
    const grid = document.getElementById('adopcionesGrid');
    
    if (grid && adopcionesData && Array.isArray(adopcionesData) && adopcionesData.length > 0) {
        grid.innerHTML = '';
        
        const adopcionesCountElement = document.getElementById('adopcionesCount');
        if (adopcionesCountElement) {
            adopcionesCountElement.textContent = `Solicitudes de Adopción (${adopcionesData.length})`;
        }
        
        adopcionesData.forEach(adopcion => {
            const adopcionCard = createAdopcionCard(adopcion);
            grid.appendChild(adopcionCard);
        });
        
        setupActionButtons();
    } else if (grid) {
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay solicitudes de adopción</p></div>';
        const adopcionesCountElement = document.getElementById('adopcionesCount');
        if (adopcionesCountElement) {
            adopcionesCountElement.textContent = 'Solicitudes de Adopción (0)';
        }
    }
}

function createAdopcionCard(adopcion) {
    const div = document.createElement('div');
    div.className = 'animal-card'; 
    const estadoClass = (adopcion.estado || 'pendiente').toLowerCase();

    div.innerHTML = `
        <div class="animal-info">
            <h3>${adopcion.animal_nombre || 'Animal Desconocido'}</h3>
            <p class="animal-description"><i class="fas fa-paw"></i> ${adopcion.animal_tipo || 'Tipo desconocido'}</p>
            <p class="animal-description"><i class="fas fa-user"></i> ${adopcion.adoptante_nombre || '...'} ${adopcion.adoptante_apellido || ''}</p>
            <div class="animal-details">
                <span class="detail-item"><i class="fas fa-calendar"></i> ${adopcion.fecha_solicitud || 'Fecha desconocida'}</span>
                <span class="detail-item estado-badge estado-${estadoClass}"><i class="fas fa-heart"></i> ${adopcion.estado || 'Estado desconocido'}</span>
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
                openApprovalModal(adopcionId, 'aprobar');
            });
        });
        
        const rejectBtns = document.querySelectorAll('.btn-reject');
        rejectBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const adopcionId = this.getAttribute('data-adopcion-id');
                openApprovalModal(adopcionId, 'rechazar');
            });
        });
    } else {
        // Deshabilitar botones si no hay permiso
        document.querySelectorAll('.btn-approve, .btn-reject').forEach(btn => {
            btn.disabled = true;
            btn.title = 'No tienes permisos para esta acción';
        });
    }
}

// *** LÓGICA DEL MODAL ***

// Helper para buscar los datos completos de una adopción
async function fetchAdopcionData(adopcionId) {
    const response = await fetch(`../backend/ver_adopciones.php?id=${adopcionId}`);
    if (!response.ok) {
        throw new Error('No se pudo cargar la información de la adopción.');
    }
    const result = await response.json();
    if (!result.success || !result.data.length) {
        throw new Error(result.message || 'Error al obtener datos de la adopción.');
    }
    return result.data[0];
}

// 1. FUNCIÓN PARA VER DETALLES (CORREGIDA)
async function viewAdopcionDetails(adopcionId) {
    const modal = document.getElementById('adopcionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBodyContent');
    const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
    
    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = `Detalles de Solicitud`;
    modalPrimaryBtn.style.display = 'none'; // Ocultar botón de guardar
    document.getElementById('modalComentariosSection').style.display = 'none';
    modal.style.display = 'block';
    modalBody.innerHTML = '<div class="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando detalles...</p></div>';

    try {
        const adopcion = await fetchAdopcionData(adopcionId);
        
        modalTitle.textContent = `Solicitud de ${adopcion.adoptante_nombre} ${adopcion.adoptante_apellido}`;
        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-full">
                    <strong>Animal:</strong> 
                    <span>${adopcion.animal_nombre} (Tipo: ${adopcion.animal_tipo}, Raza: ${adopcion.animal_raza})</span>
                </div>
                <div class="detail-full">
                    <strong>Estado de Solicitud:</strong> 
                    <span class="estado-badge estado-${adopcion.estado}">${adopcion.estado}</span>
                </div>

                <div class="detail-section detail-full">
                    <h4>Información del Adoptante</h4>
                    <strong>Nombre:</strong> <span>${adopcion.adoptante_nombre} ${adopcion.adoptante_apellido}</span>
                    <strong>Email:</strong> <span>${adopcion.adoptante_email}</span>
                    <strong>Teléfono:</strong> <span>${adopcion.adoptante_telefono || 'No registrado'}</span>
                    <strong>Dirección:</strong> <span>${adopcion.adoptante_direccion || 'No registrada'}</span>
                    <strong>Vivienda:</strong> <span>${adopcion.adoptante_tipo_vivienda || 'N/A'}</span>
                    <strong>Experiencia:</strong> <span>${adopcion.adoptante_experiencia || 'N/A'}</span>
                </div>

                <div class="detail-section detail-full">
                    <h4>Detalles de la Solicitud (ID: ${adopcion.id})</h4>
                    <strong>Fecha de Solicitud:</strong> <span>${adopcion.fecha_solicitud || 'N/A'}</span>
                    <strong>Motivo:</strong> <span>${adopcion.motivo || 'N/A'}</span>
                    <strong>Comentarios (Gestión):</strong> <span>${adopcion.comentarios || 'Sin comentarios.'}</span>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error en viewAdopcionDetails:', error);
        modalBody.innerHTML = `<div class="error-placeholder"><p>${error.message}</p></div>`;
    }
}

// 2. FUNCIÓN PARA ABRIR MODAL DE APROBACIÓN/RECHAZO
function openApprovalModal(adopcionId, accion) {
    const modal = document.getElementById('adopcionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBodyContent');
    const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
    const comentariosSection = document.getElementById('modalComentariosSection');

    // Cargar detalles básicos en el cuerpo del modal
    viewAdopcionDetails(adopcionId);

    // Configurar el modal para la acción
    if (accion === 'aprobar') {
        modalTitle.textContent = 'Aprobar Solicitud';
        modalPrimaryBtn.textContent = 'Confirmar Aprobación';
        modalPrimaryBtn.className = 'btn-primary'; // Botón verde
    } else {
        modalTitle.textContent = 'Rechazar Solicitud';
        modalPrimaryBtn.textContent = 'Confirmar Rechazo';
        modalPrimaryBtn.className = 'btn-reject'; // Botón rojo
    }

    comentariosSection.style.display = 'block';
    modalPrimaryBtn.style.display = 'inline-block';
    modal.style.display = 'block';

    // Asignar el evento al botón
    modalPrimaryBtn.onclick = () => handleApprovalAction(adopcionId, accion);
}

// 3. FUNCIÓN PARA ENVIAR LA ACCIÓN AL BACKEND
async function handleApprovalAction(adopcionId, accion) {
    const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
    const comentarios = document.getElementById('comentarios').value;

    modalPrimaryBtn.disabled = true;
    modalPrimaryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    try {
        const response = await fetch('../backend/aprobar_adopcion.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adopcion_id: adopcionId,
                accion: accion,
                comentarios: comentarios
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(result.message, 'success');
            document.getElementById('adopcionModal').style.display = 'none';
            loadAdopciones(); // Recargar la lista de adopciones
        } else {
            throw new Error(result.message || 'Error al procesar la solicitud');
        }

    } catch (error) {
        console.error('Error en handleApprovalAction:', error);
        showNotification(error.message, 'error');
        modalPrimaryBtn.disabled = false;
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
        const adopcionEstado = card.querySelector('.detail-item.estado-badge')?.textContent.toLowerCase() || '';

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