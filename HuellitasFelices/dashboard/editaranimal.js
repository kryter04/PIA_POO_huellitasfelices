// editaranimal.js - Página de editar animal
document.addEventListener('DOMContentLoaded', function() {
    initializeEditAnimalPage();
    loadAnimalData();
});

function initializeEditAnimalPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    
    // Event listener para el formulario
    setupEditForm();
}

async function loadAnimalData() {
    // Obtener el ID del animal de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const animalId = urlParams.get('id');
    
    if (!animalId) {
        showNotification('ID de animal no proporcionado', 'error');
        return;
    }
    
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos del animal desde la base de datos
        const response = await fetch(`../backend/ver_animales.php?id=${animalId}`);
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            populateForm(data.data[0]);
        } else {
            throw new Error(data.message || 'Animal no encontrado');
        }
        
    } catch (error) {
        console.error('Error loading animal data:', error);
        showErrorState(error.message);
    }
}

function showLoadingState() {
    // Mostrar estado de carga en todos los campos
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type !== 'file') {
            input.disabled = true;
            input.placeholder = 'Cargando...';
        }
    });
}

function showErrorState(errorMessage) {
    showNotification(`Error al cargar los datos: ${errorMessage}`, 'error');
    // Redirigir de vuelta a la página de ver animales
    setTimeout(() => {
        window.location.href = 'veranimales.html';
    }, 2000);
}

function populateForm(animal) {
    document.getElementById('nombre').value = animal.nombre || '';
    document.getElementById('tipo').value = animal.tipo || '';
    document.getElementById('raza').value = animal.raza || '';
    document.getElementById('sexo').value = animal.sexo || '';
    document.getElementById('edad').value = animal.edad || '';
    document.getElementById('tamano').value = animal.tamano || '';
    document.getElementById('peso').value = animal.peso || '';
    document.getElementById('color').value = animal.color || '';
    document.getElementById('descripcion').value = animal.descripcion || '';
    document.getElementById('estado').value = animal.estado || 'disponible';
    // Convertir la fecha de formato DD/MM/YYYY a YYYY-MM-DD para el input de fecha
    if (animal.fecha_ingreso) {
        // Convertir dd/mm/yyyy a yyyy-mm-dd
        const dateParts = animal.fecha_ingreso.split('/');
        if (dateParts.length === 3) {
            document.getElementById('fecha_ingreso').value = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        } else {
            // Si ya está en formato YYYY-MM-DD
            document.getElementById('fecha_ingreso').value = animal.fecha_ingreso;
        }
    }
    document.getElementById('observaciones').value = animal.observaciones || '';
    
    // Habilitar los inputs después de cargar los datos
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type !== 'file') {
            input.disabled = false;
        }
    });
}

function setupEditForm() {
    const editForm = document.getElementById('editAnimalForm');
    
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener el ID del animal de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const animalId = urlParams.get('id');
        
        if (!animalId) {
            showNotification('ID de animal no encontrado', 'error');
            return;
        }
        
        try {
            const formData = new FormData();
            
            // Recoger todos los campos del formulario
            const fields = ['nombre', 'tipo', 'raza', 'sexo', 'edad', 'tamano', 'peso', 'color', 'descripcion', 'estado', 'fecha_ingreso', 'observaciones'];
            
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    // Convertir la fecha de YYYY-MM-DD a DD/MM/YYYY para enviarla
                    if (field === 'fecha_ingreso') {
                        const dateValue = element.value;
                        if (dateValue) {
                            const dateObj = new Date(dateValue);
                            const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                            formData.append(field, formattedDate);
                        } else {
                            formData.append(field, element.value);
                        }
                    } else {
                        formData.append(field, element.value);
                    }
                }
            });
            
            // Agregar archivo de foto si existe
            const fotoInput = document.getElementById('foto');
            if (fotoInput && fotoInput.files[0]) {
                formData.append('foto', fotoInput.files[0]);
            }
            
            // Agregar ID del animal
            formData.append('animal_id', animalId);
            
            const response = await fetch('../backend/editar_animal.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Mascota actualizada exitosamente', 'success');
                // Redirigir de vuelta a la página de ver animales después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'veranimales.html';
                }, 2000);
            } else {
                showNotification(result.message || 'Error al actualizar la mascota', 'error');
            }
            
        } catch (error) {
            console.error('Error updating animal:', error);
            showNotification('Error de conexión al actualizar la mascota', 'error');
        }
    });
}