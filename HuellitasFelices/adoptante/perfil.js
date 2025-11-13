// perfil.js - Página de perfil
document.addEventListener('DOMContentLoaded', function() {
    initializeProfilePage();
    loadUserProfile();
});

function initializeProfilePage() {
    // Cargar nombre del usuario - VERIFICAR ANTES DE ACCEDER
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Cargar nombre del perfil - VERIFICAR ANTES DE ACCEDER
    const profileNameElement = document.getElementById('profileName');
    if (profileNameElement) {
        profileNameElement.textContent = userName;
    }
    
    // Cargar email del perfil - VERIFICAR ANTES DE ACCEDER
    const profileEmailElement = document.getElementById('profileEmail');
    if (profileEmailElement) {
        profileEmailElement.textContent = localStorage.getItem('userEmail') || 'email@ejemplo.com';
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
    const closeEditModal = document.getElementById('closeEditModal');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    
    if (closeEditModal) {
        closeEditModal.addEventListener('click', closeEditModal);
    }
    if (closePasswordModal) {
        closePasswordModal.addEventListener('click', closePasswordModal);
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
    
    // Cargar datos del perfil
    loadUserProfile();
}

async function loadUserProfile() {
    try {
        // Mostrar estado de carga
        showLoadingProfile();
        
        // Cargar datos del usuario desde la base de datos
        const userData = await fetchUserProfileFromDB();
        updateProfileDisplay(userData);
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        showNotification('Error al cargar el perfil', 'error');
    }
}

function showLoadingProfile() {
    // Mostrar estado de carga en los campos - VERIFICAR ANTES DE ACCEDER
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileNombre = document.getElementById('profileNombre');
    const profileApellido = document.getElementById('profileApellido');
    const profileTelefono = document.getElementById('profileTelefono');
    const profileDireccion = document.getElementById('profileDireccion');
    
    if (profileName) profileName.textContent = 'Cargando...';
    if (profileEmail) profileEmail.textContent = 'Cargando...';
    if (profileNombre) profileNombre.textContent = 'Cargando...';
    if (profileApellido) profileApellido.textContent = 'Cargando...';
    if (profileTelefono) profileTelefono.textContent = 'Cargando...';
    if (profileDireccion) profileDireccion.textContent = 'Cargando...';
}

function updateProfileDisplay(userData) {
    if (userData) {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileNombre = document.getElementById('profileNombre');
        const profileApellido = document.getElementById('profileApellido');
        const profileTelefono = document.getElementById('profileTelefono');
        const profileDireccion = document.getElementById('profileDireccion');
        const profileFechaRegistro = document.getElementById('profileFechaRegistro');
        const profileUltimaActualizacion = document.getElementById('profileUltimaActualizacion');
        const userNameElement = document.getElementById('userName');
        
        if (profileName) profileName.textContent = userData.nombre || 'Usuario';
        if (profileEmail) profileEmail.textContent = userData.email || 'email@ejemplo.com';
        if (profileNombre) profileNombre.textContent = userData.nombre || 'Nombre';
        if (profileApellido) profileApellido.textContent = userData.apellido || 'Apellido';
        if (profileTelefono) profileTelefono.textContent = userData.telefono || 'Teléfono no disponible';
        if (profileDireccion) profileDireccion.textContent = userData.direccion || 'Dirección no disponible';
        if (profileFechaRegistro) profileFechaRegistro.textContent = userData.fecha_registro || 'Fecha no disponible';
        if (profileUltimaActualizacion) profileUltimaActualizacion.textContent = userData.ultima_actualizacion || 'Fecha no disponible';
        
        // Actualizar también en el header
        if (userNameElement) {
            userNameElement.textContent = userData.nombre || 'Usuario';
            localStorage.setItem('userName', userData.nombre || 'Usuario');
        }
    }
}

function openEditModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) {
        // Cargar datos actuales en el formulario de edición
        const profileNombre = document.getElementById('profileNombre');
        const profileApellido = document.getElementById('profileApellido');
        const profileTelefono = document.getElementById('profileTelefono');
        const profileDireccion = document.getElementById('profileDireccion');
        const editNombre = document.getElementById('editNombre');
        const editApellido = document.getElementById('editApellido');
        const editTelefono = document.getElementById('editTelefono');
        const editDireccion = document.getElementById('editDireccion');
        
        if (editNombre && profileNombre) editNombre.value = profileNombre.textContent;
        if (editApellido && profileApellido) editApellido.value = profileApellido.textContent;
        if (editTelefono && profileTelefono) editTelefono.value = profileTelefono.textContent;
        if (editDireccion && profileDireccion) editDireccion.value = profileDireccion.textContent;
        
        editModal.style.display = 'block';
    }
}

function closeEditModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.style.display = 'none';
    }
}

function openPasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
        passwordModal.style.display = 'block';
    }
}

function closePasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    if (passwordModal) {
        passwordModal.style.display = 'none';
    }
    if (changePasswordForm) {
        changePasswordForm.reset();
    }
}

async function handleEditProfile(e) {
    e.preventDefault();
    
    try {
        const editNombre = document.getElementById('editNombre');
        const editApellido = document.getElementById('editApellido');
        const editTelefono = document.getElementById('editTelefono');
        const editDireccion = document.getElementById('editDireccion');
        
        const formData = {
            user_id: localStorage.getItem('userId') || 1,
            nombre: editNombre ? editNombre.value : '',
            apellido: editApellido ? editApellido.value : '',
            telefono: editTelefono ? editTelefono.value : '',
            direccion: editDireccion ? editDireccion.value : ''
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
    
    const newPassword = document.getElementById('newPassword');
    const confirmNewPassword = document.getElementById('confirmNewPassword');
    
    if (!newPassword || !confirmNewPassword) return;
    
    // Validar que las contraseñas coincidan
    if (newPassword.value !== confirmNewPassword.value) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }
    
    try {
        const formData = {
            user_id: localStorage.getItem('userId') || 1,
            current_password: document.getElementById('currentPassword').value,
            new_password: newPassword.value
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