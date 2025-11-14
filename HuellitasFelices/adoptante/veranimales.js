// veranimales.js - Página de ver animales para adoptantes
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimalsPage();
    loadAnimalesDisponibles();
    setupModalEvents(); // Configurar eventos del modal
});

function initializeAnimalsPage() {
    // Cargar nombre del usuario (manejado por base.js)
    
    // Event listeners para filtros
    setupFilters();
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const tipoFilter = document.getElementById('tipoFilter');
    const edadFilter = document.getElementById('edadFilter');
    const tamanoFilter = document.getElementById('tamanoFilter');

    // Event listeners para filtros
    if (searchInput) searchInput.addEventListener('input', filterAnimals);
    if (tipoFilter) tipoFilter.addEventListener('change', filterAnimals);
    if (edadFilter) edadFilter.addEventListener('change', filterAnimals);
    if (tamanoFilter) tamanoFilter.addEventListener('change', filterAnimals);
}

// FUNCIÓN PARA CERRAR EL MODAL
function setupModalEvents() {
    const animalModal = document.getElementById('animalModal');
    const closeModalBtn = document.getElementById('closeAnimalModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    const closeModal = () => {
        if (animalModal) animalModal.style.display = "none";
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


async function loadAnimalesDisponibles() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos de animales desde la base de datos
        const response = await fetch('../backend/ver_animales_disponibles.php');
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateAnimalsGrid(data.data);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error loading animals:', error);
        showErrorState(error.message);
    }
}

function showLoadingState() {
    const grid = document.getElementById('animalsGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-placeholder"><p>Cargando mascotas disponibles...</p></div>';
    }
}

function showErrorState(errorMessage) {
    const grid = document.getElementById('animalsGrid');
    grid.innerHTML = `
        <div class="error-placeholder">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error al cargar las mascotas: ${errorMessage}</p>
            <button onclick="loadAnimalesDisponibles()" class="retry-btn btn-primary">Reintentar</button>
        </div>
    `;
}

function updateAnimalsGrid(animalsData) {
    const grid = document.getElementById('animalsGrid');
    
    if (animalsData && Array.isArray(animalsData) && animalsData.length > 0) {
        grid.innerHTML = '';
        
        // Actualizar contador
        document.getElementById('animalsCount').textContent = 
            `Mascotas Disponibles (${animalsData.length})`;
        
        animalsData.forEach(animal => {
            const animalCard = createAnimalCard(animal);
            grid.appendChild(animalCard);
        });
        
        // Configurar eventos para los botones de solicitud
        setupSolicitudButtons();
    } else if (animalsData && Array.isArray(animalsData) && animalsData.length === 0) {
        // Si hay respuesta pero sin datos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay mascotas disponibles actualmente</p></div>';
        document.getElementById('animalsCount').textContent = 'Mascotas Disponibles (0)';
    } else {
        // Si no hay datos válidos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay mascotas disponibles</p></div>';
        document.getElementById('animalsCount').textContent = 'Mascotas Disponibles (0)';
    }
}

function createAnimalCard(animal) {
    const div = document.createElement('div');
    div.className = 'animal-card';

    // ========= CORRECCIÓN DE RUTA DE IMAGEN =========
    // Asumimos que la ruta en BBDD es "imagenes/animales/foto.jpg"
    // y que esta página está en una subcarpeta (ej. /adoptante/)
    const FALLBACK_IMAGE_PATH = '../imagenes/animales/placeholder.jpg';
    // Usamos 'foto' o 'imagen_url' como fallback
    const imagePath = animal.foto || animal.imagen_url;
    // Añadimos '../' para salir de la carpeta actual (ej. /adoptante/)
    const imagenSrc = imagePath ? `../${imagePath}` : FALLBACK_IMAGE_PATH;
    // ===============================================

    div.innerHTML = `
        <div class="animal-image">
            <img src="${imagenSrc}" alt="${animal.nombre}" onerror="this.src='${FALLBACK_IMAGE_PATH}';">
            <div class="animal-badge">${animal.tipo}</div>
        </div>
        <div class="animal-info">
            <h3>${animal.nombre}</h3>
            <p class="animal-description">${animal.descripcion || 'Sin descripción'}</p>
            <div class="animal-details">
                <span class="detail-item"><i class="fas fa-birthday-cake"></i> ${animal.edad || 'Edad desconocida'}</span>
                <span class="detail-item"><i class="fas fa-ruler"></i> ${animal.tamano || 'Tamaño desconocido'}</span>
                <span class="detail-item"><i class="fas fa-venus-mars"></i> ${animal.sexo || 'Sexo desconocido'}</span>
            </div>
            <div class="animal-actions">
                <button class="btn-solicitar" data-animal-id="${animal.id}">
                    <i class="fas fa-heart"></i> Solicitar Adopción
                </button>
                <button class="btn-ver-mas" data-animal-id="${animal.id}">
                    <i class="fas fa-info-circle"></i> Ver Detalles
                </button>
            </div>
        </div>
    `;
    return div;
}

function setupSolicitudButtons() {
    const solicitudBtns = document.querySelectorAll('.btn-solicitar');
    solicitudBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const animalId = this.getAttribute('data-animal-id');
            handleSolicitudAdopcion(animalId);
        });
    });

    const verMasBtns = document.querySelectorAll('.btn-ver-mas');
    verMasBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const animalId = this.getAttribute('data-animal-id');
            viewAnimalDetails(animalId);
        });
    });
}

// ========= FUNCIONALIDAD DE BOTÓN CORREGIDA =========
function handleSolicitudAdopcion(animalId) {
    // Redirige a la página de solicitud, pasando el ID como parámetro
    // para que esa página pueda auto-seleccionar la mascota.
    showNotification(`Redirigiendo al formulario de solicitud...`, 'info');
    window.location.href = `solicitaradopcion.html?animal_id=${animalId}`;
}

// ========= FUNCIONALIDAD DE BOTÓN CORREGIDA =========
async function viewAnimalDetails(animalId) {
    const animalModal = document.getElementById('animalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBodyContent');
    
    if (!animalModal || !modalTitle || !modalBody) return;

    modalTitle.textContent = `Detalles de la Mascota`;
    animalModal.style.display = 'block';
    modalBody.innerHTML = '<div classs="loading-placeholder"><p><i class="fas fa-spinner fa-spin"></i> Cargando detalles...</p></div>';

    try {
        // Usamos el mismo endpoint pero pedimos un ID específico
        const response = await fetch(`../backend/ver_animales_disponibles.php?id=${animalId}`);
        if (!response.ok) throw new Error('No se pudo cargar la información.');

        const data = await response.json();
        if (!data.success || !data.data.length) throw new Error('Animal no encontrado.');
        
        const animal = data.data[0];

        // Actualizar título con el nombre
        modalTitle.textContent = `Detalles de ${animal.nombre || 'Mascota'}`;

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
                <strong>Ingreso:</strong> <span>${animal.fecha_ingreso || 'N/A'}</span>
                
                <div class="detail-full detail-section">
                    <strong>Descripción:</strong>
                    <span>${animal.descripcion || 'Sin descripción.'}</span>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error en viewAnimalDetails:', error);
        modalBody.innerHTML = `<div class="error-placeholder"><p><i class="fas fa-exclamation-triangle"></i> Error al cargar: ${error.message}</p></div>`;
    }
}


function filterAnimals() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const tipoFilter = document.getElementById('tipoFilter').value;
    const edadFilter = document.getElementById('edadFilter').value;
    const tamanoFilter = document.getElementById('tamanoFilter').value;

    const animalCards = document.querySelectorAll('.animal-card');
    
    animalCards.forEach(card => {
        const animalName = card.querySelector('h3').textContent.toLowerCase();
        const animalType = card.querySelector('.animal-badge').textContent.toLowerCase();
        
        // Seleccionadores más robustos
        const animalAgeText = card.querySelector('.detail-item:nth-child(1)')?.textContent.toLowerCase() || '';
        const animalSizeText = card.querySelector('.detail-item:nth-child(2)')?.textContent.toLowerCase() || '';

        const matchesSearch = animalName.includes(searchTerm);
        const matchesTipo = tipoFilter === '' || animalType.includes(tipoFilter);
        const matchesEdad = edadFilter === '' || animalAgeText.includes(edadFilter);
        const matchesTamano = tamanoFilter === '' || animalSizeText.includes(tamanoFilter);

        if (matchesSearch && matchesTipo && matchesEdad && matchesTamano) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}