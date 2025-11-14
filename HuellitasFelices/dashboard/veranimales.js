// veranimales.js - Página de ver animales para el dashboard

document.addEventListener('DOMContentLoaded', function() {
    initializeAnimalsPage();
    loadAnimales();
});

function initializeAnimalsPage() {
    // Cargar nombre del usuario (redundante si dashboard.js lo maneja)
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Event listeners para filtros
    setupFilters();
    
    // Event listeners para el modal
    setupModalEvents();
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const tipoFilter = document.getElementById('tipoFilter');
    const edadFilter = document.getElementById('edadFilter');
    const tamanoFilter = document.getElementById('tamanoFilter');
    const estadoFilter = document.getElementById('estadoFilter');

    // Event listeners para filtros
    if (searchInput) searchInput.addEventListener('input', filterAnimals);
    if (tipoFilter) tipoFilter.addEventListener('change', filterAnimals);
    if (edadFilter) edadFilter.addEventListener('change', filterAnimals);
    if (tamanoFilter) tamanoFilter.addEventListener('change', filterAnimals);
    if (estadoFilter) estadoFilter.addEventListener('change', filterAnimals);
}

// FUNCIÓN PARA CERRAR EL MODAL
function setupModalEvents() {
    const animalModal = document.getElementById('animalModal');
    const closeModalBtn = document.getElementById('closeAnimalModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    const closeModal = () => {
        if (animalModal) animalModal.style.display = "none";
        // Limpiar el contenido al cerrar para que no se vea el anterior al abrir
        const modalBody = document.getElementById('modalBodyContent');
        if (modalBody) modalBody.innerHTML = '<div classs="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando...</p></div>';
    };

    if (closeModalBtn) closeModalBtn.onclick = closeModal;
    if (modalCloseBtn) modalCloseBtn.onclick = closeModal;

    window.onclick = (event) => {
        if (event.target === animalModal) {
            closeModal();
        }
    };
}


async function loadAnimales() {
    try {
        showLoadingState();

        // Verificar permisos (asumiendo que dashboard.js provee hasPermission)
        if (typeof hasPermission !== 'function' || !hasPermission('empleado')) {
            showErrorState('No tienes permisos para ver esta sección.');
            if (typeof showNotification === 'function') {
                 showNotification('Acceso denegado. Se requiere rol de empleado o superior.', 'error');
            }
            return;
        }

        const response = await fetch('../backend/ver_animales_dashboard.php');
        
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.success) {
            updateAnimalsGrid(data.data);
        } else {
            throw new Error(data?.message || 'Error desconocido al cargar animales');
        }

    } catch (error) {
        console.error('Error al cargar animales:', error);
        showErrorState(error.message);
    }
}

function showLoadingState() {
    const grid = document.getElementById('animalsGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando mascotas...</p></div>';
    }
}

function showErrorState(errorMessage) {
    const grid = document.getElementById('animalsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${errorMessage}</p>
                <button onclick="loadAnimales()" class="retry-btn btn-primary">Reintentar</button>
            </div>
        `;
    }
}

function updateAnimalsGrid(animalesData) {
    const grid = document.getElementById('animalsGrid');
    
    if (grid && Array.isArray(animalesData) && animalesData.length > 0) {
        grid.innerHTML = '';
        
        const animalsCountElement = document.getElementById('animalsCount');
        if (animalsCountElement) {
            animalsCountElement.textContent = `Animales Registrados (${animalesData.length})`;
        }
        
        animalesData.forEach(animal => {
            const animalCard = createAnimalCard(animal);
            grid.appendChild(animalCard);
        });
        
        setupActionButtons();
    } else if (grid) {
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay mascotas registradas</p></div>';
        const animalsCountElement = document.getElementById('animalsCount');
        if (animalsCountElement) {
            animalsCountElement.textContent = 'Animales Registrados (0)';
        }
    }
}

function createAnimalCard(animal) {
    const div = document.createElement('div');
    div.className = 'animal-card';
    
    const FALLBACK_IMAGE_PATH = '../imagenes/animales/placeholder.jpg';
    
    // Corregido: Usa la propiedad 'foto' si existe, si no 'imagen_url' (o fallback)
    const imagePath = animal.foto || animal.imagen_url;
    
    const imagenSrc = imagePath 
        ? `../${imagePath}` // Asume que la ruta guardada es relativa al root (ej: 'imagenes/animales/...')
        : FALLBACK_IMAGE_PATH;

    // Corregido para normalizar guiones bajos y espacios
    const estadoClase = (animal.estado || '').toLowerCase().replace(/[\s_]+/g, '-');
    
    div.innerHTML = `
        <div class="animal-image">
            <img src="${imagenSrc}" 
                 alt="${animal.nombre || 'Mascota'}" 
                 onerror="this.onerror=null;this.src='${FALLBACK_IMAGE_PATH}';"> 
        </div>
        <div class="animal-info">
            <h3>${animal.nombre || 'Sin Nombre'}</h3>
            <p class="animal-description">Raza: ${animal.raza || 'Desconocida'}</p>
            <span class="animal-badge">${animal.tipo_animal || animal.tipo || 'Animal'}</span>
            <div class="animal-details">
                <span class="detail-item"><i class="fas fa-birthday-cake"></i> ${animal.edad || 'N/A'}</span>
                <span class="detail-item"><i class="fas fa-ruler-combined"></i> ${animal.tamano || 'N/A'}</span>
                <span class="detail-item"><i class="fas fa-calendar-alt"></i> Ingreso: ${animal.fecha_ingreso || 'N/A'}</span>
                <span class="detail-item estado-badge estado-${estadoClase}"><i class="fas fa-shield"></i> ${animal.estado || 'N/A'}</span>
            </div>
            <div class="animal-actions">
                <button class="btn-primary btn-ver-ficha" data-animal-id="${animal.id || ''}">
                    <i class="fas fa-info-circle"></i> Ver Detalles
                </button>
                <button class="btn-secondary btn-edit" data-animal-id="${animal.id || ''}" ${!hasPermission('empleado') ? 'disabled' : ''} title="${!hasPermission('empleado') ? 'No tienes permiso para editar' : 'Editar animal'}">
                    <i class="fas fa-edit"></i> Editar Animal
                </button>
            </div>
        </div>
    `;
    return div;
}

function setupActionButtons() {
    // 1. Configurar botón 'Ver Detalles'
    const verFichaBtns = document.querySelectorAll('.btn-ver-ficha');
    verFichaBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const animalId = this.getAttribute('data-animal-id');
            viewAnimalFicha(animalId);
        });
    });
    
    // 2. Configurar el botón 'Editar Animal'
    const editBtns = document.querySelectorAll('.btn-edit');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const animalId = this.getAttribute('data-animal-id');
            // =======================================================
            // CORREGIDO: Permiso cambiado de 'admin' a 'empleado'
            // =======================================================
            if (hasPermission('empleado')) {
                editAnimal(animalId);
            } else {
                 if (typeof showNotification === 'function') {
                    showNotification('No tienes permiso para editar animales.', 'warning');
                }
            }
        });
    });
}

// *** FUNCIÓN "VER DETALLES" MEJORADA ***
async function viewAnimalFicha(animalId) {
    const animalModal = document.getElementById('animalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBodyContent');
    const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
    
    if (!animalModal || !modalTitle || !modalBody || !modalPrimaryBtn) return;

    modalTitle.textContent = `Detalles de la Mascota`;
    modalPrimaryBtn.style.display = 'none';
    animalModal.style.display = 'block';
    modalBody.innerHTML = '<div classs="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando detalles...</p></div>';

    try {
        // Cargar datos del animal e historial médico en paralelo
        const [animalRes, historialRes] = await Promise.all([
            fetch(`../backend/ver_animales_dashboard.php?id=${animalId}`),
            fetch(`../backend/ver_historial_medico.php?animal_id=${animalId}`)
        ]);

        if (!animalRes.ok || !historialRes.ok) {
            throw new Error('Error al cargar la información del animal o su historial.');
        }

        const animalData = await animalRes.json();
        const historialData = await historialRes.json();

        if (!animalData.success || !animalData.data.length) {
            throw new Error('Animal no encontrado.');
        }
        
        const animal = animalData.data[0];
        const historial = historialData.data || [];

        // Actualizar título con el nombre
        modalTitle.textContent = `Detalles de ${animal.nombre || 'Mascota'}`;

        // Renderizar HTML de detalles
        let historialHtml = '<h4>Historial Médico</h4>';
        if (historial.length > 0) {
            historialHtml += historial.map(item => `
                <div class="historial-item">
                    <p><strong>Fecha:</strong> ${item.fecha_revision || 'N/A'}</p>
                    <p><strong>Tipo:</strong> ${item.tipo_revision || 'N/A'}</p>
                    <p><strong>Descripción:</strong> ${item.descripcion || 'Sin descripción.'}</p>
                    <small>Veterinario: ${item.veterinario_nombre || ''} ${item.veterinario_apellido || ''}</small>
                </div>
            `).join('');
        } else {
            historialHtml += '<p class="no-historial">No hay revisiones médicas registradas.</p>';
        }

        modalBody.innerHTML = `
            <div class="detail-grid">
                <strong>Nombre:</strong> <span>${animal.nombre || 'N/A'}</span>
                <strong>ID:</strong> <span>${animal.id || 'N/A'}</span>
                <strong>Tipo:</strong> <span>${animal.tipo || 'N/A'}</span>
                <strong>Raza:</strong> <span>${animal.raza || 'N/A'}</span>
                <strong>Sexo:</strong> <span>${animal.sexo || 'N/A'}</span>
                <strong>Edad:</strong> <span>${animal.edad || 'N/A'}</span>
                <strong>Tamaño:</strong> <span>${animal.tamano || 'N/A'}</span>
                <strong>Peso:</strong> <span>${animal.peso || 'N/A'} kg</span>
                <strong>Color:</strong> <span>${animal.color || 'N/A'}</span>
                <strong>Estado:</strong> <span>${animal.estado || 'N/A'}</span>
                <strong>Ingreso:</strong> <span>${animal.fecha_ingreso || 'N/A'}</span>
                <strong>Responsable:</strong> <span>${animal.responsable_nombre || ''} ${animal.responsable_apellido || ''}</span>
                
                <div class="detail-full detail-section">
                    <strong>Descripción:</strong>
                    <span>${animal.descripcion || 'Sin descripción.'}</span>
                </div>
                <div class="detail-full detail-section">
                    <strong>Observaciones:</strong>
                    <span>${animal.observaciones || 'Sin observaciones.'}</span>
                </div>
                <div class="detail-full detail-section">
                    ${historialHtml}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error en viewAnimalFicha:', error);
        modalBody.innerHTML = `<div class="error-placeholder"><p><i class="fas fa-exclamation-triangle"></i> Error al cargar: ${error.message}</p></div>`;
    }
}

// *** FUNCIÓN "EDITAR ANIMAL" MEJORADA ***
async function editAnimal(animalId) {
    const animalModal = document.getElementById('animalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBodyContent');
    const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
    
    if (!animalModal || !modalTitle || !modalBody || !modalPrimaryBtn) return;

    modalTitle.textContent = `Editar Mascota (ID: ${animalId})`;
    modalPrimaryBtn.style.display = 'inline-block';
    modalPrimaryBtn.textContent = 'Guardar Cambios';
    modalPrimaryBtn.disabled = true; // Deshabilitar hasta que carguen los datos
    animalModal.style.display = 'block';
    modalBody.innerHTML = '<div classs="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando formulario...</p></div>';

    try {
        const response = await fetch(`../backend/ver_animales_dashboard.php?id=${animalId}`);
        if (!response.ok) throw new Error('No se pudieron cargar los datos del animal.');
        
        const data = await response.json();
        if (!data.success || !data.data.length) throw new Error('Animal no encontrado.');
        
        const animal = data.data[0];

        // Helper para crear <option> y marcar el seleccionado
        const createOption = (value, text, selectedValue) => 
            `<option value="${value}" ${value === selectedValue ? 'selected' : ''}>${text}</option>`;
        
        // Formatear fecha de DD/MM/YYYY a YYYY-MM-DD para el input
        const fechaIngreso = formatDateForInput(animal.fecha_ingreso);

        modalBody.innerHTML = `
            <form id="editAnimalForm" class="modal-form-grid">
                <div class="form-group">
                    <label for="edit_nombre">Nombre</label>
                    <input type="text" id="edit_nombre" name="nombre" value="${animal.nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit_tipo">Tipo</label>
                    <select id="edit_tipo" name="tipo" required>
                        ${createOption('perro', 'Perro', animal.tipo)}
                        ${createOption('gato', 'Gato', animal.tipo)}
                        ${createOption('conejo', 'Conejo', animal.tipo)}
                        ${createOption('ave', 'Ave', animal.tipo)}
                        ${createOption('otro', 'Otro', animal.tipo)}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit_raza">Raza</label>
                    <input type="text" id="edit_raza" name="raza" value="${animal.raza || ''}">
                </div>
                <div class="form-group">
                    <label for="edit_sexo">Sexo</label>
                    <select id="edit_sexo" name="sexo" required>
                        ${createOption('macho', 'Macho', animal.sexo)}
                        ${createOption('hembra', 'Hembra', animal.sexo)}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit_edad">Edad (Categoría)</label>
                    <select id="edit_edad" name="edad" required>
                        ${createOption('cachorro', 'Cachorro', animal.edad)}
                        ${createOption('joven', 'Joven', animal.edad)}
                        ${createOption('adulto', 'Adulto', animal.edad)}
                        ${createOption('senior', 'Senior', animal.edad)}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit_tamano">Tamaño</label>
                    <select id="edit_tamano" name="tamano" required>
                        ${createOption('pequeno', 'Pequeño', animal.tamano)}
                        ${createOption('mediano', 'Mediano', animal.tamano)}
                        ${createOption('grande', 'Grande', animal.tamano)}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit_peso">Peso (kg)</label>
                    <input type="number" step="0.1" id="edit_peso" name="peso" value="${animal.peso || 0}">
                </div>
                <div class="form-group">
                    <label for="edit_color">Color</label>
                    <input type="text" id="edit_color" name="color" value="${animal.color || ''}">
                </div>
                <div class="form-group">
                    <label for="edit_estado">Estado</label>
                    <select id="edit_estado" name="estado" required>
                        ${createOption('disponible', 'Disponible', animal.estado)}
                        ${createOption('en_adopcion', 'En Adopción', animal.estado)}
                        ${createOption('adoptado', 'Adoptado', animal.estado)}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit_fecha_ingreso">Fecha Ingreso</label>
                    <input type="date" id="edit_fecha_ingreso" name="fecha_ingreso" value="${fechaIngreso || ''}" required>
                </div>
                <div class="form-group form-group-full">
                    <label for="edit_descripcion">Descripción</label>
                    <textarea id="edit_descripcion" name="descripcion">${animal.descripcion || ''}</textarea>
                </div>
                <div class="form-group form-group-full">
                    <label for="edit_observaciones">Observaciones (Internas)</label>
                    <textarea id="edit_observaciones" name="observaciones">${animal.observaciones || ''}</textarea>
                </div>
                <div class="form-group form-group-full">
                    <label for="edit_foto">Cambiar Foto (Opcional)</label>
                    <input type="file" id="edit_foto" name="foto" accept="image/jpeg,image/png,image/gif">
                    ${animal.foto ? `<img src="../${animal.foto}" alt="Foto actual" class="current-image-thumb">` : ''}
                </div>
            </form>
        `;
        
        // Habilitar el botón y asignarle el evento
        modalPrimaryBtn.disabled = false;
        modalPrimaryBtn.onclick = () => saveAnimalChanges(animalId);

    } catch (error) {
        console.error('Error en editAnimal:', error);
        modalBody.innerHTML = `<div class="error-placeholder"><p><i class="fas fa-exclamation-triangle"></i> Error al cargar formulario: ${error.message}</p></div>`;
    }
}

// *** NUEVA FUNCIÓN PARA GUARDAR CAMBIOS ***
async function saveAnimalChanges(animalId) {
    const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
    const form = document.getElementById('editAnimalForm');
    
    if (!form) return;

    // Deshabilitar botón para evitar envíos múltiples
    modalPrimaryBtn.disabled = true;
    modalPrimaryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        const formData = new FormData(form);
        formData.append('animal_id', animalId);

        const response = await fetch('../backend/editar_animal.php', {
            method: 'POST',
            body: formData // No se pone Content-Type, FormData lo maneja
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Animal actualizado exitosamente', 'success');
            document.getElementById('animalModal').style.display = 'none'; // Cerrar modal
            loadAnimales(); // Recargar la lista de animales
        } else {
            throw new Error(result.message || 'Error desconocido al guardar.');
        }

    } catch (error) {
        console.error('Error en saveAnimalChanges:', error);
        showNotification(`Error al guardar: ${error.message}`, 'error');
        // Habilitar el botón de nuevo si hay error
        modalPrimaryBtn.disabled = false;
        modalPrimaryBtn.innerHTML = 'Guardar Cambios';
    }
}

// *** FUNCIÓN HELPER PARA FORMATEAR FECHA ***
// Convierte 'DD/MM/YYYY' a 'YYYY-MM-DD' para <input type="date">
function formatDateForInput(dateStr) {
    if (!dateStr || !dateStr.includes('/')) {
        // Si ya está en formato YYYY-MM-DD (o es nulo), devolverlo tal cual
        return dateStr;
    }
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return ''; // Formato no reconocido
}


function filterAnimals() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const tipoFilter = document.getElementById('tipoFilter')?.value.toLowerCase() || '';
    const edadFilter = document.getElementById('edadFilter')?.value.toLowerCase() || '';
    const tamanoFilter = document.getElementById('tamanoFilter')?.value.toLowerCase() || '';
    const estadoFilter = document.getElementById('estadoFilter')?.value.toLowerCase() || '';

    const animalCards = document.querySelectorAll('.animal-card');
    
    animalCards.forEach(card => {
        const animalName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const animalType = card.querySelector('.animal-badge')?.textContent.toLowerCase() || '';
        
        const detailItems = card.querySelectorAll('.detail-item');

        const animalAge = detailItems[0]?.textContent.toLowerCase() || '';
        const animalSize = detailItems[1]?.textContent.toLowerCase() || '';
        const animalStatus = detailItems[3]?.textContent.toLowerCase() || '';

        const matchesSearch = animalName.includes(searchTerm);
        const matchesTipo = tipoFilter === '' || animalType.includes(tipoFilter);
        const matchesEdad = edadFilter === '' || animalAge.includes(edadFilter);
        const matchesTamano = tamanoFilter === '' || animalSize.includes(tamanoFilter);
        const matchesEstado = estadoFilter === '' || animalStatus.includes(estadoFilter);

        if (matchesSearch && matchesTipo && matchesEdad && matchesTamano && matchesEstado) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}