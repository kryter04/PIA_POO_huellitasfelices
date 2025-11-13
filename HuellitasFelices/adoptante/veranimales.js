// veranimales.js - Página de ver animales para adoptantes
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimalsPage();
    loadAnimalesDisponibles();
});

function initializeAnimalsPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    document.getElementById('userName').textContent = userName;
    
    // Event listeners para filtros
    setupFilters();
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const tipoFilter = document.getElementById('tipoFilter');
    const edadFilter = document.getElementById('edadFilter');
    const tamanoFilter = document.getElementById('tamanoFilter');

    // Event listeners para filtros
    searchInput.addEventListener('input', filterAnimals);
    tipoFilter.addEventListener('change', filterAnimals);
    edadFilter.addEventListener('change', filterAnimals);
    tamanoFilter.addEventListener('change', filterAnimals);
}

async function loadAnimalesDisponibles() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos de animales desde la base de datos
        const response = await fetch('../backend/ver_animales_disponibles.php'); // Ruta correcta
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
    grid.innerHTML = '<div class="loading-placeholder"><p>Cargando mascotas disponibles...</p></div>';
}

function showErrorState(errorMessage) {
    const grid = document.getElementById('animalsGrid');
    grid.innerHTML = `
        <div class="error-placeholder">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error al cargar las mascotas: ${errorMessage}</p>
            <button onclick="loadAnimalesDisponibles()" class="retry-btn">Reintentar</button>
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
    div.innerHTML = `
        <div class="animal-image">
            <img src="${animal.foto || '../imagenes/animales/placeholder.jpg'}" alt="${animal.nombre}" onerror="this.src='../imagenes/animales/placeholder.jpg';">
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

function handleSolicitudAdopcion(animalId) {
    // Aquí iría la lógica para solicitar adopción
    showNotification(`Solicitud de adopción para la mascota ${animalId} enviada`, 'success');
}

function viewAnimalDetails(animalId) {
    // Aquí iría la lógica para ver detalles del animal
    showNotification(`Viendo detalles de la mascota ${animalId}`, 'info');
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
        const animalAge = card.querySelector('.detail-item:nth-child(1)').textContent.toLowerCase();
        const animalSize = card.querySelector('.detail-item:nth-child(2)').textContent.toLowerCase();

        const matchesSearch = animalName.includes(searchTerm);
        const matchesTipo = tipoFilter === '' || animalType.includes(tipoFilter);
        const matchesEdad = edadFilter === '' || animalAge.includes(edadFilter);
        const matchesTamano = tamanoFilter === '' || animalSize.includes(tamanoFilter);

        if (matchesSearch && matchesTipo && matchesEdad && matchesTamano) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}