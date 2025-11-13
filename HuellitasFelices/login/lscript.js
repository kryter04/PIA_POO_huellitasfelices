// lscript.js - Versión corregida para manejar ambos formularios
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si es el formulario de login
    const loginForm = document.getElementById('loginForm');
    
    // Verificar si es el formulario de registro
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        setupLoginForm(loginForm);
    } else if (registerForm) {
        setupRegisterForm(registerForm);
    }
    // Si no hay ningún formulario, no hacer nada
});

function setupLoginForm(loginForm) {
    const messageDiv = document.getElementById('message');

    // Función para mostrar mensajes
    function showMessage(text, type) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
            messageDiv.classList.remove('hidden');
            
            setTimeout(() => {
                messageDiv.classList.add('hidden');
            }, 5000);
        }
    }

    // Manejar el envío del formulario
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validación básica
        if (!email || !password) {
            showMessage('Por favor, completa todos los campos', 'error');
            return;
        }

        try {
            // Enviar credenciales al backend
            const response = await fetch('../backend/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();
            
            if (data.success) {
                showMessage('Inicio de sesión exitoso', 'success');
                
                // Guardar información del usuario en localStorage
                localStorage.setItem('userName', data.user.nombre);
                localStorage.setItem('userRole', data.user.rol);
                localStorage.setItem('userId', data.user.id);
                
                // Redirigir según el rol del usuario
                setTimeout(() => {
                    if (data.user.rol === 'admin') {
                        window.location.href = '../dashboard/index.html';
                    } else if (data.user.rol === 'veterinario') {
                        window.location.href = '../dashboard/index.html';
                    } else if (data.user.rol === 'empleado') {
                        window.location.href = '../dashboard/index.html';
                    } else if (data.user.rol === 'adoptante') {
                        window.location.href = '../adoptante/index.html';
                    }
                }, 1500);
            } else {
                showMessage(data.message || 'Credenciales incorrectas', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión con el servidor', 'error');
        }
    });

    // Animación adicional para inputs (solo si existen)
    const inputs = document.querySelectorAll('.input-group input');
    if (inputs.length > 0) {
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });
    }
}

function setupRegisterForm(registerForm) {
    const messageDiv = document.getElementById('message');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    // Función para mostrar mensajes
    function showMessage(text, type) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
            messageDiv.classList.remove('hidden');
            
            setTimeout(() => {
                messageDiv.classList.add('hidden');
            }, 5000);
        }
    }

    // Validar contraseñas (solo si existen los campos)
    if (password && confirmPassword) {
        function validatePasswords() {
            if (password.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity('Las contraseñas no coinciden');
            } else {
                confirmPassword.setCustomValidity('');
            }
        }

        password.addEventListener('input', validatePasswords);
        confirmPassword.addEventListener('input', validatePasswords);
    }

    // Manejar el envío del formulario
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener todos los valores del formulario
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const direccion = document.getElementById('direccion').value;
        const passwordValue = document.getElementById('password').value;
        const confirmPasswordValue = document.getElementById('confirmPassword').value;
        
        // Validación básica
        if (!nombre || !apellido || !email || !telefono || !direccion || !passwordValue || !confirmPasswordValue) {
            showMessage('Por favor, completa todos los campos', 'error');
            return;
        }

        if (passwordValue.length < 6) {
            showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        if (passwordValue !== confirmPasswordValue) {
            showMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const response = await fetch('../backend/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombre,
                    apellido: apellido,
                    email: email,
                    telefono: telefono,
                    direccion: direccion,
                    password: passwordValue,
                    confirm_password: confirmPasswordValue,
                    // Campos adicionales para adoptantes
                    tipo_vivienda: '', // Puedes agregar select en el formulario si quieres
                    espacio_hogar: null,
                    tiempo_cuidado: '',
                    experiencia: '',
                    disponibilidad: false
                })
            });

            const data = await response.json();
            
            if (data.success) {
                showMessage('Registro exitoso. ¡Bienvenido a Huellitas Felizes!', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(data.message || 'Error en el registro', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión con el servidor', 'error');
        }
    });
}