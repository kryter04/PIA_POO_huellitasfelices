// veranimales.js - Página de ver animales para el dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimalsPage();
    loadAnimales();
});

function initializeAnimalsPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    
    // Event listeners para filtros
    setupFilters();
    
    // Event listeners para vistas
    setupViewToggle();
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const tipoFilter = document.getElementById('tipoFilter');
    const edadFilter = document.getElementById('edadFilter');
    const tamanoFilter = document.getElementById('tamanoFilter');
    const estadoFilter = document.getElementById('estadoFilter');

    // Event listeners para filtros - VERIFICAR ANTES DE AGREGAR EVENTOS
    if (searchInput) searchInput.addEventListener('input', filterAnimals);
    if (tipoFilter) tipoFilter.addEventListener('change', filterAnimals);
    if (edadFilter) edadFilter.addEventListener('change', filterAnimals);
    if (tamanoFilter) tamanoFilter.addEventListener('change', filterAnimals);
    if (estadoFilter) estadoFilter.addEventListener('change', filterAnimales);
}

function setupViewToggle() {
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const animalsGrid = document.getElementById('animalsGrid');

    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', function() {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            animalsGrid.classList.remove('list-view');
            animalsGrid.classList.add('grid-view');
        });
    }

    if (listViewBtn) {
        listViewBtn.addEventListener('click', function() {
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            animalsGrid.classList.remove('grid-view');
            animalsGrid.classList.add('list-view');
        });
    }
}

async function loadAnimales() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos de animales desde la base de datos
        const response = await fetch('../backend/ver_animales_dashboard.php'); // ← USANDO EL ARCHIVO CORRECTO
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
        grid.innerHTML = '<div class="loading-placeholder"><p>Cargando mascotas...</p></div>';
    }
}

function showErrorState(errorMessage) {
    const grid = document.getElementById('animalsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las mascotas: ${errorMessage}</p>
                <button onclick="loadAnimales()" class="retry-btn">Reintentar</button>
            </div>
        `;
    }
}

function updateAnimalsGrid(animalsData) {
    const grid = document.getElementById('animalsGrid');
    
    if (grid && animalsData && Array.isArray(animalsData) && animalsData.length > 0) {
        grid.innerHTML = '';
        
        // Actualizar contador
        const animalsCountElement = document.getElementById('animalsCount');
        if (animalsCountElement) {
            animalsCountElement.textContent = `Mascotas en Sistema (${animalsData.length})`;
        }
        
        animalsData.forEach(animal => {
            const animalCard = createAnimalCard(animal);
            grid.appendChild(animalCard);
        });
        
        // Configurar eventos para los botones de acción
        setupActionButtons();
    } else if (grid && animalsData && Array.isArray(animalsData) && animalsData.length === 0) {
        // Si hay respuesta pero sin datos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay mascotas registradas</p></div>';
        const animalsCountElement = document.getElementById('animalsCount');
        if (animalsCountElement) {
            animalsCountElement.textContent = 'Mascotas en Sistema (0)';
        }
    } else if (grid) {
        // Si no hay datos válidos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay mascotas registradas</p></div>';
        const animalsCountElement = document.getElementById('animalsCount');
        if (animalsCountElement) {
            animalsCountElement.textContent = 'Mascotas en Sistema (0)';
        }
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
                <span class="detail-item"><i class="fas fa-heart"></i> ${animal.estado || 'Estado desconocido'}</span>
            </div>
            <div class="animal-actions">
                <button class="btn-ver-mas" data-animal-id="${animal.id}">
                    <i class="fas fa-info-circle"></i> Ver Detalles
                </button>
                <button class="btn-edit admin-only" data-animal-id="${animal.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete admin-only" data-animal-id="${animal.id}">
                    <i class="fas fa-trash"></i> Eliminar
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
            const animalId = this.getAttribute('data-animal-id');
            viewAnimalDetails(animalId);
        });
    });
    
    // Botones de edición (solo para admin)
    if (hasPermission('admin')) {
        const editBtns = document.querySelectorAll('.btn-edit');
        editBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const animalId = this.getAttribute('data-animal-id');
                editAnimal(animalId);
            });
        });
        
        const deleteBtns = document.querySelectorAll('.btn-delete');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const animalId = this.getAttribute('data-animal-id');
                deleteAnimal(animalId);
            });
        });
    } else {
        // Deshabilitar botones de edición si no se tiene permiso
        const editBtns = document.querySelectorAll('.btn-edit');
        editBtns.forEach(btn => {
            btn.disabled = true;
            btn.title = 'No tienes permisos para esta acción';
        });
        
        const deleteBtns = document.querySelectorAll('.btn-delete');
        deleteBtns.forEach(btn => {
            btn.disabled = true;
            btn.title = 'No tienes permisos para esta acción';
        });
    }
}

function viewAnimalDetails(animalId) {
    showNotification(`Viendo detalles de la mascota ${animalId}`, 'info');
}

function editAnimal(animalId) {
    showNotification(`Editando mascota ${animalId}`, 'info');
}

function deleteAnimal(animalId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta mascota?')) {
        showNotification(`Mascota ${animalId} eliminada`, 'success');
    }
}

function filterAnimals() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const tipoFilter = document.getElementById('tipoFilter')?.value || '';
    const edadFilter = document.getElementById('edadFilter')?.value || '';
    const tamanoFilter = document.getElementById('tamanoFilter')?.value || '';
    const estadoFilter = document.getElementById('estadoFilter')?.value || '';

    const animalCards = document.querySelectorAll('.animal-card');
    
    animalCards.forEach(card => {
        const animalName = card.querySelector('h3').textContent.toLowerCase();
        const animalType = card.querySelector('.animal-badge').textContent.toLowerCase();
        const animalAge = card.querySelector('.detail-item:nth-child(1)').textContent.toLowerCase();
        const animalSize = card.querySelector('.detail-item:nth-child(2)').textContent.toLowerCase();
        const animalStatus = card.querySelector('.detail-item:nth-child(4)').textContent.toLowerCase();

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