// Script principal para la logica del login - Unificado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la pagina de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // Logica especifica para el formulario de login
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita que el formulario se envie de forma tradicional

            // Capturar la accion del boton y leer los datos ingresados
            const correoUsuario = document.getElementById('txt_correo').value.trim();
            const contrasenaUsuario = document.getElementById('txt_contrasena').value.trim();

            // Validar campos vacios en el frontend
            if (!correoUsuario || !contrasenaUsuario) {
                alert('Error: Por favor, ingrese correo y contrasena.');
                return;
            }

            // Conectar al backend PHP
            fetch('../backend/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ txt_correo: correoUsuario, txt_contrasena: contrasenaUsuario })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    const rolUsuario = data.rol;
                    // Redirigir segun el rol
                    switch(rolUsuario) {
                        case 'adoptante':
                            window.location.href = '../adoptante/index.html';
                            break;
                        case 'empleado':
                        case 'veterinario':
                        case 'administrador':
                            window.location.href = '../empleado/index.html'; // Dashboard comun
                            break;
                        default:
                            alert('Rol no reconocido.');
                    }
                } else {
                    alert(data.message || 'Error en el inicio de sesion.');
                }
            })
            .catch(error => {
                console.error('Error en la conexion:', error);
                alert('Error de red o del servidor. Intente nuevamente.');
            });
        });
    }
});