// veradoptantes.js - Lógica de la página para ver adoptantes

document.addEventListener('DOMContentLoaded', function() {
    initializeAdoptantesPage();
    loadAdoptantes();
});

function initializeAdoptantesPage() {
    // 1. Verificar Permisos
    if (typeof hasPermission !== 'function' || !hasPermission('empleado')) {
        showNotification('Acceso denegado. Se requiere rol de empleado o superior.', 'error');
        const grid = document.getElementById('adoptantesGrid');
        if(grid) grid.innerHTML = '<div class="error-placeholder"><p>No tienes permisos para ver esta sección.</p></div>';
        return;
    }
    
    // 2. Event listeners para filtros
    setupFilters();

    // 3. Event listeners para el modal
    setupModalEvents();
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const estadoFilter = document.getElementById('estadoFilter');
    const tipoViviendaFilter = document.getElementById('tipoViviendaFilter');

    if (searchInput) searchInput.addEventListener('input', filterAdoptantes);
    if (estadoFilter) estadoFilter.addEventListener('change', filterAdoptantes);
    if (tipoViviendaFilter) tipoViviendaFilter.addEventListener('change', filterAdoptantes);
}

// FUNCIÓN PARA CERRAR EL MODAL
function setupModalEvents() {
    const modal = document.getElementById('adoptanteModal');
    const closeModalBtn = document.getElementById('closeAdoptanteModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    const closeModal = () => {
        if (modal) modal.style.display = "none";
        const modalBody = document.getElementById('modalBodyContent');
        if (modalBody) modalBody.innerHTML = '<div classs="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando...</p></div>';
    };

    if (closeModalBtn) closeModalBtn.onclick = closeModal;
    if (modalCloseBtn) modalCloseBtn.onclick = closeModal;

    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
}

async function loadAdoptantes() {
    try {
        showLoadingState();
        
        // Asumimos que ver_adoptantes.php trae a TODOS los usuarios (incluyendo rol adoptante)
        const response = await fetch('../backend/ver_adoptantes.php'); 
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateAdoptantesGrid(data.data);
        } else {
            throw new Error(data.message || 'Error desconocido al cargar adoptantes');
        }
        
    } catch (error) {
        console.error('Error loading adoptantes:', error);
        showErrorState(error.message);
    }
}

function showLoadingState() {
    const grid = document.getElementById('adoptantesGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando adoptantes...</p></div>';
    }
}

function showErrorState(errorMessage) {
    const grid = document.getElementById('adoptantesGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los adoptantes: ${errorMessage}</p>
                <button onclick="loadAdoptantes()" class="retry-btn btn-primary">Reintentar</button>
            </div>
        `;
    }
}

function updateAdoptantesGrid(adoptantesData) {
    const grid = document.getElementById('adoptantesGrid');
    
    if (grid && adoptantesData && Array.isArray(adoptantesData) && adoptantesData.length > 0) {
        grid.innerHTML = '';
        
        const adoptantesCountElement = document.getElementById('adoptantesCount');
        if (adoptantesCountElement) {
            adoptantesCountElement.textContent = `Adoptantes Registrados (${adoptantesData.length})`;
        }
        
        adoptantesData.forEach(adoptante => {
            const adoptanteCard = createAdoptanteCard(adoptante);
            grid.appendChild(adoptanteCard);
        });
        
        setupActionButtons();
    } else if (grid) {
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay adoptantes registrados</p></div>';
        const adoptantesCountElement = document.getElementById('adoptantesCount');
        if (adoptantesCountElement) {
            adoptantesCountElement.textContent = 'Adoptantes Registrados (0)';
        }
    }
}

function createAdoptanteCard(adoptante) {
    const div = document.createElement('div');
    div.className = 'animal-card adoptante-card'; 
    const estadoClass = (adoptante.estado || 'inactivo').toLowerCase();

    div.innerHTML = `
        <div class="adoptante-info">
            <span class="adoptante-status-icon estado-${estadoClass}" title="Estado: ${adoptante.estado}">
                <i class="fas ${estadoClass === 'activo' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            </span>
            
            <h3>${adoptante.nombre || 'Nombre Desconocido'} ${adoptante.apellido || ''}</h3>
            <p class="animal-description"><i class="fas fa-envelope"></i> ${adoptante.email || 'Email desconocido'}</p>
            <p class="animal-description"><i class="fas fa-phone"></i> ${adoptante.telefono || 'Teléfono no disponible'}</p>
            <div class="animal-details">
                <span class="detail-item"><i class="fas fa-home"></i> ${adoptante.tipo_vivienda || 'Vivienda Desconocida'}</span>
                <span class="detail-item"><i class="fas fa-calendar"></i> Reg.: ${adoptante.fecha_registro || 'Fecha Desconocida'}</span>
                <span class="detail-item"><i class="fas fa-hashtag"></i> ID: ${adoptante.id}</span>
            </div>
            <div class="adoptante-actions">
                <button class="btn-primary btn-ver-mas" data-adoptante-id="${adoptante.id}">
                    <i class="fas fa-info-circle"></i> Ver Detalles
                </button>
                <button class="btn-secondary btn-edit" data-adoptante-id="${adoptante.id}" ${!hasPermission('empleado') ? 'disabled' : ''} title="${!hasPermission('empleado') ? 'No tienes permisos para editar' : 'Editar adoptante'}">
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
    
    const editBtns = document.querySelectorAll('.btn-edit');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const adoptanteId = this.getAttribute('data-adoptante-id');
            // CORRECCIÓN DE PERMISO: 'empleado' ahora puede editar
            if (hasPermission('empleado')) {
                editAdoptante(adoptanteId);
            } else {
                showNotification('No tienes permisos para editar este perfil.', 'warning');
            }
        });
    });
}

// *** LÓGICA DEL MODAL ***

// Helper para buscar los datos completos de un adoptante
async function fetchAdoptanteData(adoptanteId) {
    // Asumimos que tienes un script PHP que puede buscar un usuario por ID.
    // Reutilizaremos el 'get_user_profile.php' que creamos para los adoptantes.
    const response = await fetch(`../backend/get_user_profile.php?id=${adoptanteId}`);
    if (!response.ok) {
        throw new Error('No se pudo cargar el perfil del adoptante.');
    }
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Error al obtener datos del adoptante.');
    }
    return result.data;
}

// 1. FUNCIÓN PARA VER DETALLES
async function viewAdoptanteDetails(adoptanteId) {
    const modal = document.getElementById('adoptanteModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBodyContent');
    const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
    
    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = `Detalles del Adoptante`;
    modalPrimaryBtn.style.display = 'none'; // Ocultar botón de guardar
    modal.style.display = 'block';
    modalBody.innerHTML = '<div class="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando perfil...</p></div>';

    try {
        const adoptante = await fetchAdoptanteData(adoptanteId);
        
        modalTitle.textContent = `Detalles de ${adoptante.nombre} ${adoptante.apellido}`;
        modalBody.innerHTML = `
            <div class="detail-grid">
                <strong>Nombre:</strong> <span>${adoptante.nombre || 'N/A'}</span>
                <strong>Apellido:</strong> <span>${adoptante.apellido || 'N/A'}</span>
                <strong>Email:</strong> <span>${adoptante.email || 'N/A'}</span>
                <strong>Teléfono:</strong> <span>${adoptante.telefono || 'N/A'}</span>
                <strong>Dirección:</strong> <span>${adoptante.direccion || 'N/A'}</span>
                <strong class="detail-full">--- Perfil de Adopción ---</strong>
                <strong>Vivienda:</strong> <span>${adoptante.tipo_vivienda || 'N/A'}</span>
                <strong>Espacio (m²):</strong> <span>${adoptante.espacio_hogar || 'N/A'}</span>
                <strong>Tiempo Cuidado:</strong> <span>${adoptante.tiempo_cuidado || 'N/A'}</span>
                <strong>Experiencia:</strong> <span>${adoptante.experiencia || 'N/A'}</span>
                <strong class="detail-full">--- Gestión ---</strong>
                <strong>ID Usuario:</strong> <span>${adoptante.id}</span>
                <strong>Estado:</strong> <span class="estado-badge estado-${(adoptante.estado || 'inactivo').toLowerCase()}">${adoptante.estado || 'inactivo'}</span>
                <strong>Registro:</strong> <span>${adoptante.fecha_registro || 'N/A'}</span>
            </div>
        `;

    } catch (error) {
        console.error('Error en viewAdoptanteDetails:', error);
        modalBody.innerHTML = `<div class="error-placeholder"><p>${error.message}</p></div>`;
    }
}

// 2. FUNCIÓN PARA EDITAR
async function editAdoptante(adoptanteId) {
    const modal = document.getElementById('adoptanteModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBodyContent');
    const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
    
    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = `Editar Adoptante`;
    modalPrimaryBtn.style.display = 'inline-block'; // Mostrar botón de guardar
    modalPrimaryBtn.disabled = true;
    modal.style.display = 'block';
    modalBody.innerHTML = '<div class="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando formulario...</p></div>';

    try {
        const adoptante = await fetchAdoptanteData(adoptanteId);
        
        modalTitle.textContent = `Editando a ${adoptante.nombre} ${adoptante.apellido}`;
        
        // Helper para crear <option>
        const createOption = (value, text, selectedValue) => 
            `<option value="${value}" ${value === selectedValue ? 'selected' : ''}>${text}</option>`;

        // CORRECCIÓN: Comprobar si el que edita es ADMIN para habilitar el campo 'Estado'
        const isAdmin = hasPermission('admin');
        
        modalBody.innerHTML = `
            <form id="editAdoptanteForm" class="modal-form-grid">
                <p>Editando campos de perfil y gestión. El nombre y email no se pueden cambiar aquí.</p>
                
                <div class="form-group">
                    <label for="edit_telefono">Teléfono</label>
                    <input type="tel" id="edit_telefono" name="telefono" value="${adoptante.telefono || ''}">
                </div>
                <div class="form-group">
                    <label for="edit_direccion">Dirección</label>
                    <input type="text" id="edit_direccion" name="direccion" value="${adoptante.direccion || ''}">
                </div>
                
                <div class="form-group">
                    <label for="edit_tipo_vivienda">Tipo de Vivienda</label>
                    <select id="edit_tipo_vivienda" name="tipo_vivienda">
                        ${createOption('casa', 'Casa', adoptante.tipo_vivienda)}
                        ${createOption('departamento', 'Departamento', adoptante.tipo_vivienda)}
                        ${createOption('casaConPatio', 'Casa con Patio', adoptante.tipo_vivienda)}
                        ${createOption('otro', 'Otro', adoptante.tipo_vivienda)}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit_espacio_hogar">Espacio (m²)</label>
                    <input type="number" id="edit_espacio_hogar" name="espacio_hogar" value="${adoptante.espacio_hogar || 0}">
                </div>
                
                <div class="form-group">
                    <label for="edit_tiempo_cuidado">Tiempo de Cuidado</label>
                    <select id="edit_tiempo_cuidado" name="tiempo_cuidado">
                        ${createOption('menos4', 'Menos de 4h', adoptante.tiempo_cuidado)}
                        ${createOption('4a6', '4 a 6 horas', adoptante.tiempo_cuidado)}
                        ${createOption('mas6', 'Más de 6 horas', adoptante.tiempo_cuidado)}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit_experiencia">Experiencia</label>
                    <select id="edit_experiencia" name="experiencia">
                        ${createOption('si', 'Sí', adoptante.experiencia)}
                        ${createOption('no', 'No', adoptante.experiencia)}
                        ${createOption('poco', 'Poca', adoptante.experiencia)}
                    </select>
                </div>

                <div class="form-group form-group-full">
                    <label for="edit_estado">Estado del Adoptante (Gestión)</label>
                    <select id="edit_estado" name="estado" ${!isAdmin ? 'disabled' : ''} title="${!isAdmin ? 'Solo un Administrador puede cambiar el estado' : 'Cambiar estado del adoptante'}">
                        ${createOption('activo', 'Activo (Elegible para adoptar)', adoptante.estado)}
                        ${createOption('inactivo', 'Inactivo (Bloqueado)', adoptante.estado)}
                    </select>
                </div>
            </form>
        `;
        
        modalPrimaryBtn.disabled = false;
        // Asignar el evento de guardado
        modalPrimaryBtn.onclick = () => saveAdoptanteChanges(adoptanteId);

    } catch (error) {
        console.error('Error en editAdoptante:', error);
        modalBody.innerHTML = `<div class="error-placeholder"><p>${error.message}</p></div>`;
    }
}

// 3. FUNCIÓN PARA GUARDAR CAMBIOS
async function saveAdoptanteChanges(adoptanteId) {
    const form = document.getElementById('editAdoptanteForm');
    const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
    if (!form || !modalPrimaryBtn) return;

    modalPrimaryBtn.disabled = true;
    modalPrimaryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        const formData = new FormData(form);
        formData.append('user_id', adoptanteId); // ID del usuario a editar
        
        // Asumimos que tienes un script PHP para actualizar
        const response = await fetch('../backend/update_adoptante_profile.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Perfil del adoptante actualizado', 'success');
            document.getElementById('adoptanteModal').style.display = 'none';
            loadAdoptantes(); // Recargar la lista
        } else {
            throw new Error(result.message || 'Error al guardar');
        }

    } catch (error) {
        console.error('Error en saveAdoptanteChanges:', error);
        showNotification(error.message, 'error');
        modalPrimaryBtn.disabled = false;
        modalPrimaryBtn.innerHTML = 'Guardar Cambios';
    }
}


// FUNCIÓN DE FILTRADO
function filterAdoptantes() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const estadoFilter = document.getElementById('estadoFilter')?.value.toLowerCase() || '';
    const tipoViviendaFilter = document.getElementById('tipoViviendaFilter')?.value.toLowerCase() || '';

    const adoptanteCards = document.querySelectorAll('.adoptante-card');
    
    adoptanteCards.forEach(card => {
        const adoptanteName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const adoptanteEmail = card.querySelector('.animal-description:nth-child(2)')?.textContent.toLowerCase() || '';
        
        const details = card.querySelectorAll('.detail-item');
        const adoptanteTipoVivienda = details[0]?.textContent.toLowerCase() || '';
        
        // Buscar el estado en el icono
        const adoptanteEstadoIcon = card.querySelector('.adoptante-status-icon');
        let adoptanteEstado = 'inactivo';
        if (adoptanteEstadoIcon && adoptanteEstadoIcon.classList.contains('estado-activo')) {
            adoptanteEstado = 'activo';
        }

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