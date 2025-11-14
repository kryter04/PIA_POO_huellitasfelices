// perfil.js - Página de perfil
document.addEventListener('DOMContentLoaded', function() {
    initializeProfilePage();
    loadUserProfile();
});

function initializeProfilePage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Event listeners para botones
    const editarBtn = document.getElementById('editarBtn');
    const cambiarContrasenaBtn = document.getElementById('cambiarContrasenaBtn');
    
    if (editarBtn) {
        editarBtn.addEventListener('click', openEditModal);
    }
    if (cambiarContrasenaBtn) {
        cambiarContrasenaBtn.addEventListener('click', openPasswordModal);
    }
    
    // Event listeners para modales
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const closePasswordModalBtn = document.getElementById('closePasswordModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    
    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', closeEditModal);
    }
    if (closePasswordModalBtn) {
        closePasswordModalBtn.addEventListener('click', closePasswordModal);
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', closePasswordModal);
    }
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        const editModal = document.getElementById('editModal');
        const passwordModal = document.getElementById('passwordModal');
        
        if (editModal && e.target === editModal) {
            closeEditModal();
        }
        if (passwordModal && e.target === passwordModal) {
            closePasswordModal();
        }
    });
    
    // Event listeners para formularios
    const editProfileForm = document.getElementById('editProfileForm');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleEditProfile);
    }
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
}

async function loadUserProfile() {
    try {
        // Mostrar estado de carga
        showLoadingProfile();
        
        // Cargar datos del usuario desde la base de datos
        const userData = await fetchUserProfileFromDB(); // <--- Esta función ahora existe
        updateProfileDisplay(userData);
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        // showNotification está en base.js, que se carga primero
        if (typeof showNotification === 'function') {
            showNotification('Error al cargar el perfil: ' + error.message, 'error');
        }
    }
}

// =======================================================
// ESTA ES LA FUNCIÓN QUE FALTABA EN TU perfil.js
// =======================================================
async function fetchUserProfileFromDB() {
    try {
        const response = await fetch('../backend/get_user_profile.php', { // Asumiendo que este es el endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: localStorage.getItem('userId') || 1 // Enviar el ID del usuario logueado
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            return result.data; // Asumiendo que el backend devuelve { success: true, data: {...} }
        } else {
            throw new Error(result.message || "No se pudieron cargar los datos");
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

function showLoadingProfile() {
    // Mostrar estado de carga en los campos
    document.getElementById('profileName').textContent = 'Cargando...';
    document.getElementById('profileEmail').textContent = 'Cargando...';
    document.getElementById('profileNombre').textContent = 'Cargando...';
    document.getElementById('profileApellido').textContent = 'Cargando...';
    document.getElementById('profileTelefono').textContent = 'Cargando...';
    document.getElementById('profileDireccion').textContent = 'Cargando...';
}

function updateProfileDisplay(userData) {
    if (userData) {
        document.getElementById('profileName').textContent = userData.nombre || 'Usuario';
        document.getElementById('profileEmail').textContent = userData.email || 'email@ejemplo.com';
        document.getElementById('profileNombre').textContent = userData.nombre || 'Nombre';
        document.getElementById('profileApellido').textContent = userData.apellido || 'Apellido';
        document.getElementById('profileTelefono').textContent = userData.telefono || 'Teléfono no disponible';
        document.getElementById('profileDireccion').textContent = userData.direccion || 'Dirección no disponible';
        
        const fechaRegistro = document.getElementById('profileFechaRegistro');
        if (fechaRegistro) fechaRegistro.textContent = userData.fecha_registro || 'Fecha no disponible';
        
        const ultimaActualizacion = document.getElementById('profileUltimaActualizacion');
        if (ultimaActualizacion) ultimaActualizacion.textContent = userData.ultima_actualizacion || 'Fecha no disponible';
        
        // Actualizar también en el header
        document.getElementById('userName').textContent = userData.nombre || 'Usuario';
        localStorage.setItem('userName', userData.nombre || 'Usuario');
    }
}

function openEditModal() {
    // Cargar datos actuales en el formulario de edición
    const nombre = document.getElementById('profileNombre').textContent;
    const apellido = document.getElementById('profileApellido').textContent;
    const telefono = document.getElementById('profileTelefono').textContent;
    const direccion = document.getElementById('profileDireccion').textContent;
    
    // Evitar rellenar con "Cargando..." o "No disponible"
    document.getElementById('editNombre').value = (nombre.includes('Cargando') || nombre.includes('Nombre')) ? '' : nombre;
    document.getElementById('editApellido').value = (apellido.includes('Cargando') || apellido.includes('Apellido')) ? '' : apellido;
    document.getElementById('editTelefono').value = (telefono.includes('Cargando') || telefono.includes('no disponible')) ? '' : telefono;
    document.getElementById('editDireccion').value = (direccion.includes('Cargando') || direccion.includes('no disponible')) ? '' : direccion;
    
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function openPasswordModal() {
    document.getElementById('passwordModal').style.display = 'block';
}

function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('changePasswordForm').reset();
}

async function handleEditProfile(e) {
    e.preventDefault();
    
    try {
        const formData = {
            user_id: localStorage.getItem('userId') || 1,
            nombre: document.getElementById('editNombre').value,
            apellido: document.getElementById('editApellido').value,
            telefono: document.getElementById('editTelefono').value,
            direccion: document.getElementById('editDireccion').value
        };
        
        const response = await fetch('../backend/update_user_profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Perfil actualizado exitosamente', 'success');
            // Actualizar la visualización del perfil
            loadUserProfile();
            closeEditModal();
        } else {
            showNotification(result.message || 'Error al actualizar el perfil', 'error');
        }
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error de conexión al actualizar el perfil', 'error');
    }
}

async function handleChangePassword(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmNewPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }
    
    try {
        const formData = {
            user_id: localStorage.getItem('userId') || 1,
            current_password: document.getElementById('currentPassword').value,
            new_password: newPassword
        };
        
        const response = await fetch('../backend/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Contraseña actualizada exitosamente', 'success');
            closePasswordModal();
        } else {
            showNotification(result.message || 'Error al cambiar la contraseña', 'error');
        }
        
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Error de conexión al cambiar la contraseña', 'error');
    }
}