// nuevarevision.js - Página de nueva revisión médica
document.addEventListener('DOMContentLoaded', function() {
    initializeRevisionPage();
    loadAnimalesForRevision();
    setupRevisionForm();
});

function initializeRevisionPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    
    // Establecer fecha y hora actual por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_revision').value = today;
    
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('hora_revision').value = `${hours}:${minutes}`;
}

async function loadAnimalesForRevision() {
    try {
        const response = await fetch('../backend/ver_animales.php');
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            populateAnimalesSelect(data.data);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error loading animals for revision:', error);
        showNotification('Error al cargar animales para revisión', 'error');
    }
}

function populateAnimalesSelect(animalesData) {
    const select = document.getElementById('animal_id');
    select.innerHTML = '<option value="">Selecciona un animal</option>';
    
    if (animalesData && Array.isArray(animalesData) && animalesData.length > 0) {
        animalesData.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.id;
            option.textContent = `${animal.nombre} (${animal.tipo})`;
            select.appendChild(option);
        });
    }
}

function setupRevisionForm() {
    const revisionForm = document.getElementById('revisionForm');
    
    if (revisionForm) {
        revisionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData();
                
                // Recoger todos los campos del formulario
                const fields = ['animal_id', 'fecha_revision', 'hora_revision', 'tipo_revision', 'estado_vacunas', 'peso', 'temperatura', 'estado_salud', 'estado_general', 'diagnostico', 'tratamiento', 'observaciones', 'proxima_cita', 'costo'];
                
                fields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        formData.append(field, element.value);
                    }
                });
                
                // Agregar información del usuario
                formData.append('user_id', localStorage.getItem('userId') || 1);
                
                const response = await fetch('../backend/registrar_revision_medica.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Revisión médica registrada exitosamente', 'success');
                    // Limpiar formulario
                    revisionForm.reset();
                    // Establecer fecha y hora actual de nuevo
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById('fecha_revision').value = today;
                    
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    document.getElementById('hora_revision').value = `${hours}:${minutes}`;
                } else {
                    showNotification(result.message || 'Error al registrar la revisión', 'error');
                }
                
            } catch (error) {
                console.error('Error registering revision:', error);
                showNotification('Error de conexión al registrar la revisión', 'error');
            }
        });
    }
}