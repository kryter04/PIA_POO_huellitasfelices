// registraranimal.js - Página de registrar animal
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimalRegistrationPage();
    setupAnimalForm();
});

function initializeAnimalRegistrationPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    
    // Establecer fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    const fechaIngreso = document.getElementById('fecha_ingreso');
    if (fechaIngreso) {
        fechaIngreso.value = today;
    }
}

function setupAnimalForm() {
    const animalForm = document.getElementById('animalForm');
    
    if (!animalForm) return;
    
    animalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            
            // Recoger todos los campos del formulario
            const fields = ['nombre', 'tipo', 'raza', 'sexo', 'edad', 'tamano', 'peso', 'color', 'descripcion', 'estado', 'fecha_ingreso', 'observaciones'];
            
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    formData.append(field, element.value);
                }
            });
            
            // Agregar foto si existe
            const fotoInput = document.getElementById('foto');
            if (fotoInput && fotoInput.files[0]) {
                formData.append('foto', fotoInput.files[0]);
            }
            
            // Agregar información del usuario
            formData.append('user_id', localStorage.getItem('userId') || 1);
            
            const response = await fetch('../backend/registrar_animal.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Animal registrado exitosamente', 'success');
                // Limpiar formulario
                animalForm.reset();
                // Establecer fecha actual de nuevo
                const today = new Date().toISOString().split('T')[0];
                const fechaIngreso = document.getElementById('fecha_ingreso');
                if (fechaIngreso) {
                    fechaIngreso.value = today;
                }
            } else {
                showNotification(result.message || 'Error al registrar el animal', 'error');
            }
            
        } catch (error) {
            console.error('Error registering animal:', error);
            showNotification('Error de conexión al registrar el animal', 'error');
        }
    });
}