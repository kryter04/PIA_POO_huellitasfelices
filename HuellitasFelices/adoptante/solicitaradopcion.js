// solicitaradopcion.js - Página de solicitar adopción para adoptantes
document.addEventListener('DOMContentLoaded', function() {
    initializeSolicitudPage();
    loadAnimalesDisponiblesForSolicitud();
});

function initializeSolicitudPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Inicializar el menú lateral
    initializeMenu();
    
    // Event listener para el formulario
    setupSolicitudForm();
}

function setupSolicitudForm() {
    const solicitudForm = document.getElementById('solicitudForm');
    
    if (solicitudForm) {
        solicitudForm.addEventListener('submit', handleSubmitSolicitud);
    }
}

async function loadAnimalesDisponiblesForSolicitud() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos de animales disponibles desde la base de datos
        const animalsData = await fetchAnimalesDisponiblesFromDB(); // CAMBIADO A fetchAnimalesDisponiblesFromDB
        populateAnimalesSelect(animalsData);
        
    } catch (error) {
        console.error('Error loading animals for solicitud:', error);
        showErrorState(error.message);
    }
}

function showLoadingState() {
    // Mostrar estado de carga en el select de animales
    const animalSelect = document.getElementById('nombreMascota');
    if (animalSelect) {
        animalSelect.innerHTML = '<option value="">Cargando animales...</option>';
    }
}

function showErrorState(errorMessage) {
    // Mostrar mensaje de error en el select de animales
    const animalSelect = document.getElementById('nombreMascota');
    if (animalSelect) {
        animalSelect.innerHTML = `<option value="">Error: ${errorMessage}</option>`;
    }
}

async function fetchAnimalesDisponiblesFromDB() {
    try {
        const response = await fetch('../backend/ver_animales_disponibles.php');
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error fetching animals for solicitud:', error);
        throw error;
    }
}

function populateAnimalesSelect(animalsData) {
    const select = document.getElementById('nombreMascota');
    
    if (select && animalsData && Array.isArray(animalsData) && animalsData.length > 0) {
        select.innerHTML = '<option value="">Selecciona una mascota</option>';
        
        animalsData.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.id;
            option.textContent = `${animal.nombre} (${animal.tipo})`;
            select.appendChild(option);
        });
    } else if (select && animalsData && Array.isArray(animalsData) && animalsData.length === 0) {
        // Si hay respuesta pero sin datos
        select.innerHTML = '<option value="">No hay animales disponibles</option>';
    } else if (select) {
        // Si no hay datos válidos
        select.innerHTML = '<option value="">Error al cargar animales</option>';
    }
}

async function handleSubmitSolicitud(e) {
    e.preventDefault();
    
    // Validar que se haya seleccionado una mascota
    const nombreMascota = document.getElementById('nombreMascota');
    if (!nombreMascota || !nombreMascota.value) {
        showNotification('Por favor, selecciona una mascota', 'error');
        return;
    }
    
    // Validar que se haya aceptado la disponibilidad
    const disponibilidad = document.getElementById('disponibilidad');
    if (!disponibilidad || !disponibilidad.checked) {
        showNotification('Debes aceptar estar disponible para revisiones médicas', 'error');
        return;
    }
    
    try {
        // Recoger datos del formulario
        const formData = new FormData();
        
        const fields = ['nombreMascota', 'fechaSolicitud', 'tipoVivienda', 'espacioHogar', 'tiempoCuidado', 'experiencia', 'motivo', 'disponibilidad'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                // Para checkboxes, usar checked en lugar de value
                if (element.type === 'checkbox') {
                    formData.append(field, element.checked);
                } else {
                    formData.append(field, element.value);
                }
            }
        });
        
        // Agregar información del usuario
        formData.append('user_id', localStorage.getItem('userId') || 1);
        
        const response = await fetch('../backend/solicitar_adopcion.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Solicitud de adopción enviada exitosamente', 'success');
            // Limpiar formulario
            const solicitudForm = document.getElementById('solicitudForm');
            if (solicitudForm) {
                solicitudForm.reset();
                // Establecer fecha actual de nuevo
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('fechaSolicitud').value = today;
            }
        } else {
            showNotification(result.message || 'Error al enviar la solicitud', 'error');
        }
        
    } catch (error) {
        console.error('Error submitting solicitud:', error);
        showNotification('Error de conexión al enviar la solicitud', 'error');
    }
}