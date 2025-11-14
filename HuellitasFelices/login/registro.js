// (Script principal para la lógica del registro - Actualizado para conectar con PHP)
document.getElementById('registroForm').addEventListener('submit', function(event) {
    event.preventDefault(); // (Evita que el formulario se envíe de forma tradicional)

    // (1. Capturar la acción del botón)
    // (2. Leer los datos ingresados)
    const nombre = document.getElementById('txt_nombre_registro').value; // (Obtiene el valor del campo de nombre)
    const correo = document.getElementById('txt_correo_registro').value; // (Obtiene el valor del campo de correo)
    const contrasena = document.getElementById('txt_contrasena_registro').value; // (Obtiene el valor del campo de contraseña)
    const telefono = document.getElementById('txt_telefono_registro').value; // (Obtiene el valor del campo de teléfono, puede ser vacío)

    // (3. Validar campos vacíos (simplificado))
    if (nombre === '' || correo === '' || contrasena === '') {
        alert('Error: Nombre, Correo y Contraseña son obligatorios.'); // (Muestra un mensaje de error si faltan campos obligatorios)
        return;
    }

    // (4. Conectar al backend PHP - Simulado aquí con fetch)
    // Enviar los datos al archivo PHP de registro (ej: registrar_usuario.php)
    // NOTA: Aún no hemos creado el archivo PHP para el registro. Este es un placeholder.
    fetch('../backend/registrar_usuario.php', { // (Ruta al archivo PHP de registro)
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            txt_nombre_registro: nombre,
            txt_correo_registro: correo,
            txt_contrasena_registro: contrasena,
            txt_telefono_registro: telefono
        }) // (Envía los datos como JSON)
    })
    .then(response => response.json()) // (Convierte la respuesta de PHP a JSON)
    .then(data => {
        // (5. Verificar la respuesta del backend PHP)
        if (data.success) {
            // (6. Confirmar registro)
            alert(data.message); // (Muestra un mensaje de confirmación recibido de PHP)

            // (7. Opcional: Redirigir al inicio de sesión)
            window.location.href = 'login.html'; // (Redirige al usuario a la página de login después del registro)
        } else {
            // (8. Error en el registro)
            alert(data.message); // (Muestra mensaje de error recibido de PHP)
        }
    })
    .catch(error => {
        // (Manejar errores de red o del servidor)
        console.error('Error en la conexión con el servidor:', error);
        alert('Error de red o del servidor al registrar usuario. Intente nuevamente.');
    });

    // (9. Cerrar la conexión a la base de datos - No aplica en JS del lado del cliente, pero se menciona por consistencia con el pseudocódigo)
    // En una implementación real, la conexión se manejaría en el servidor (PHP).
});