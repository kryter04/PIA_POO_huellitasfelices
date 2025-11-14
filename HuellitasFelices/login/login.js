// (Script principal para la lógica del login - Actualizado para conectar con PHP)
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // (Evita que el formulario se envíe de forma tradicional)

    // (1. Capturar la acción del botón y leer los datos ingresados)
    const correo_usuario = document.getElementById('txt_correo').value; // (Obtiene el valor del campo de correo)
    const contrasena_usuario = document.getElementById('txt_contrasena').value; // (Obtiene el valor del campo de contraseña)

    // (2. Validar campos vacíos en el frontend)
    if (correo_usuario === '' || contrasena_usuario === '') {
        alert('Error: Por favor, ingrese correo y contraseña.'); // (Muestra un mensaje de error si están vacíos)
        return;
    }

    // (3. Conectar al backend PHP - Simulado aquí con fetch)
    // Enviar los datos al login.php usando fetch
    fetch('../backend/login.php', { // (Ruta relativa al archivo PHP)
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txt_correo: correo_usuario, txt_contrasena: contrasena_usuario }) // (Envía los datos como JSON)
    })
    .then(response => response.json()) // (Convierte la respuesta de PHP a JSON)
    .then(data => {
        // (4. Verificar la respuesta del backend PHP)
        if (data.success) {
            // (5. Credenciales correctas)
            alert(data.message); // (Muestra mensaje de bienvenida recibido de PHP)

            // (6. Obtener el rol del usuario desde la respuesta PHP)
            const rol_usuario = data.rol; // (Guarda el rol del usuario recibido)

            // (7. Redirigir según el rol recibido desde PHP)
            switch(rol_usuario) {
                case 'adoptante':
                    window.location.href = '../adoptante/index.html'; // (Redirige al dashboard de adoptante)
                    break;
                case 'empleado':
                    window.location.href = '../empleado/index.html'; // (Redirige al dashboard de empleado)
                    break;
                case 'veterinario':
                    // (Opcional: Si veterinarios tienen dashboard separado)
                    // window.location.href = '../veterinario/index.html';
                    // (O, como está implementado, usan el mismo dashboard que empleado/admin)
                    window.location.href = '../empleado/index.html';
                    break;
                case 'administrador':
                    window.location.href = '../empleado/index.html'; // (Redirige al dashboard de admin)
                    break;
                default:
                    alert('Rol no reconocido.');
            }
        } else {
            // (8. Credenciales incorrectas o error del servidor)
            alert(data.message); // (Muestra mensaje de error recibido de PHP)
        }
    })
    .catch(error => {
        // (Manejar errores de red o del servidor)
        console.error('Error en la conexión con el servidor:', error);
        alert('Error de red o del servidor. Intente nuevamente.');
    });

    // (9. Cerrar la conexión a la base de datos - No aplica en JS del lado del cliente, pero se menciona por consistencia con el pseudocódigo)
    // En una implementación real, la conexión se manejaría en el servidor (PHP).
});