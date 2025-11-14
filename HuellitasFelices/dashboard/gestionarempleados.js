// gestionarempleados.js - Página de gestionar empleados
document.addEventListener('DOMContentLoaded', function() {
    initializeEmployeesPage();
    loadEmpleados();
});

function initializeEmployeesPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Event listeners para filtros
    setupFilters();
    
    // Event listeners para modales
    setupModalEvents();
    
    // Event listeners para botón de agregar
    setupAddButton();
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const rolFilter = document.getElementById('rolFilter');
    const estadoFilter = document.getElementById('estadoFilter');

    // Event listeners para filtros
    if (searchInput) searchInput.addEventListener('input', filterEmployees);
    if (rolFilter) rolFilter.addEventListener('change', filterEmployees);
    if (estadoFilter) estadoFilter.addEventListener('change', filterEmployees);
}

function setupModalEvents() {
    // Eventos para el modal de agregar
    const closeAddModal = document.getElementById('closeAddModal');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const addEmployeeForm = document.getElementById('addEmployeeForm');

    if (closeAddModal) closeAddModal.addEventListener('click', closeAddModal);
    if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddModal);
    if (addEmployeeForm) addEmployeeForm.addEventListener('submit', handleAddEmployee);

    // Eventos para el modal de editar
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editEmployeeForm = document.getElementById('editEmployeeForm');

    if (closeEditModal) closeEditModal.addEventListener('click', closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
    if (editEmployeeForm) editEmployeeForm.addEventListener('submit', handleEditEmployee);

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        const addModal = document.getElementById('addModal');
        const editModal = document.getElementById('editModal');
        
        if (e.target === addModal) {
            closeAddModal();
        }
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

function setupAddButton() {
    const addBtn = document.getElementById('addEmployeeBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddModal);
    }
}

async function loadEmpleados() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar datos de empleados desde la base de datos
        const response = await fetch('../backend/ver_empleados.php');
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateEmployeesGrid(data.data);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error loading employees:', error);
        showErrorState(error.message);
    }
}

function showLoadingState() {
    const grid = document.getElementById('employeesGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-placeholder"><p>Cargando empleados...</p></div>';
    }
}

function showErrorState(errorMessage) {
    const grid = document.getElementById('employeesGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los empleados: ${errorMessage}</p>
                <button onclick="loadEmpleados()" class="retry-btn">Reintentar</button>
            </div>
        `;
    }
}

function updateEmployeesGrid(employeesData) {
    const grid = document.getElementById('employeesGrid');
    
    if (grid && employeesData && Array.isArray(employeesData) && employeesData.length > 0) {
        grid.innerHTML = '';
        
        // Actualizar contador
        const employeesCountElement = document.getElementById('employeesCount');
        if (employeesCountElement) {
            employeesCountElement.textContent = `Empleados Registrados (${employeesData.length})`;
        }
        
        employeesData.forEach(employee => {
            const employeeCard = createEmployeeCard(employee);
            grid.appendChild(employeeCard);
        });
        
        // Configurar eventos para los botones de acción
        setupActionButtons();
    } else if (grid && employeesData && Array.isArray(employeesData) && employeesData.length === 0) {
        // Si hay respuesta pero sin datos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay empleados registrados</p></div>';
        const employeesCountElement = document.getElementById('employeesCount');
        if (employeesCountElement) {
            employeesCountElement.textContent = 'Empleados Registrados (0)';
        }
    } else if (grid) {
        // Si no hay datos válidos
        grid.innerHTML = '<div class="no-data-placeholder"><p>No hay empleados registrados</p></div>';
        const employeesCountElement = document.getElementById('employeesCount');
        if (employeesCountElement) {
            employeesCountElement.textContent = 'Empleados Registrados (0)';
        }
    }
}

function createEmployeeCard(employee) {
    const div = document.createElement('div');
    div.className = 'animal-card'; // Reutilizamos el estilo de animal-card
    div.innerHTML = `
        <div class="animal-info">
            <h3>${employee.nombre} ${employee.apellido}</h3>
            <p class="animal-description"><i class="fas fa-envelope"></i> ${employee.email}</p>
            <p class="animal-description"><i class="fas fa-phone"></i> ${employee.telefono || 'No registrado'}</p>
            <div class="animal-details">
                <span class="detail-item"><i class="fas fa-user-tag"></i> ${employee.rol_nombre || 'Rol desconocido'}</span>
                <span class="detail-item"><i class="fas fa-circle"></i> ${employee.estado || 'Estado desconocido'}</span>
                <span class="detail-item"><i class="fas fa-calendar"></i> ${employee.fecha_registro ? formatDate(employee.fecha_registro) : 'Fecha desconocida'}</span>
                <span class="detail-item"><i class="fas fa-user-clock"></i> ${employee.fecha_actualizacion ? formatDate(employee.fecha_actualizacion) : 'No actualizado'}</span>
            </div>
            <div class="animal-actions">
                <button class="btn-ver-mas" data-employee-id="${employee.id}">
                    <i class="fas fa-info-circle"></i> Ver Detalles
                </button>
                <button class="btn-edit" data-employee-id="${employee.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" data-employee-id="${employee.id}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
    return div;
}

function setupActionButtons() {
    const verMasBtns = document.querySelectorAll('.btn-ver-mas');
    verMasBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-employee-id');
            viewEmployeeDetails(employeeId);
        });
    });
    
    const editBtns = document.querySelectorAll('.btn-edit');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-employee-id');
            openEditModal(employeeId);
        });
    });
    
    const deleteBtns = document.querySelectorAll('.btn-delete');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-employee-id');
            deleteEmployee(employeeId);
        });
    });
}

function viewEmployeeDetails(employeeId) {
    showNotification(`Viendo detalles del empleado ${employeeId}`, 'info');
}

function openAddModal() {
    // Limpiar el formulario
    document.getElementById('addEmployeeForm').reset();
    document.getElementById('addModal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

function openEditModal(employeeId) {
    // Cargar los datos del empleado en el formulario de edición
    fetchEmployeeById(employeeId).then(employee => {
        if (employee) {
            document.getElementById('editEmployeeId').value = employee.id;
            document.getElementById('editNombre').value = employee.nombre;
            document.getElementById('editApellido').value = employee.apellido;
            document.getElementById('editEmail').value = employee.email;
            document.getElementById('editTelefono').value = employee.telefono || '';
            document.getElementById('editRol').value = employee.rol_nombre;
            document.getElementById('editEstado').value = employee.estado;
            
            document.getElementById('editModal').style.display = 'block';
        }
    });
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function handleAddEmployee(e) {
    e.preventDefault();
    
    const password = document.getElementById('addPassword').value;
    const confirmPassword = document.getElementById('addConfirmPassword').value;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }
    
    try {
        const formData = {
            nombre: document.getElementById('addNombre').value,
            apellido: document.getElementById('addApellido').value,
            email: document.getElementById('addEmail').value,
            telefono: document.getElementById('addTelefono').value,
            rol: document.getElementById('addRol').value,
            estado: document.getElementById('addEstado').value,
            password: password
        };
        
        const response = await fetch('../backend/registrar_empleado.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Empleado registrado exitosamente', 'success');
            closeAddModal();
            loadEmpleados(); // Recargar la lista
        } else {
            showNotification(result.message || 'Error al registrar el empleado', 'error');
        }
        
    } catch (error) {
        console.error('Error adding employee:', error);
        showNotification('Error de conexión al registrar el empleado', 'error');
    }
}

async function handleEditEmployee(e) {
    e.preventDefault();
    
    try {
        const formData = {
            id: document.getElementById('editEmployeeId').value,
            nombre: document.getElementById('editNombre').value,
            apellido: document.getElementById('editApellido').value,
            email: document.getElementById('editEmail').value,
            telefono: document.getElementById('editTelefono').value,
            rol: document.getElementById('editRol').value,
            estado: document.getElementById('editEstado').value
        };
        
        const response = await fetch('../backend/editar_empleado.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Empleado actualizado exitosamente', 'success');
            closeEditModal();
            loadEmpleados(); // Recargar la lista
        } else {
            showNotification(result.message || 'Error al actualizar el empleado', 'error');
        }
        
    } catch (error) {
        console.error('Error editing employee:', error);
        showNotification('Error de conexión al actualizar el empleado', 'error');
    }
}

async function deleteEmployee(employeeId) {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
        try {
            const response = await fetch(`../backend/eliminar_empleado.php?id=${employeeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Empleado eliminado exitosamente', 'success');
                loadEmpleados(); // Recargar la lista
            } else {
                showNotification(result.message || 'Error al eliminar el empleado', 'error');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            showNotification('Error de conexión al eliminar el empleado', 'error');
        }
    }
}

async function fetchEmployeeById(id) {
    try {
        const response = await fetch(`../backend/ver_empleados.php?id=${id}`);
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            return data.data[0];
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching employee:', error);
        return null;
    }
}

function filterEmployees() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const rolFilter = document.getElementById('rolFilter')?.value || '';
    const estadoFilter = document.getElementById('estadoFilter')?.value || '';

    const employeeCards = document.querySelectorAll('.animal-card');
    
    employeeCards.forEach(card => {
        const employeeName = card.querySelector('h3').textContent.toLowerCase();
        const employeeEmail = card.querySelector('.animal-description:nth-child(2)').textContent.toLowerCase();
        const employeeRole = card.querySelector('.detail-item:nth-child(1)').textContent.toLowerCase();
        const employeeStatus = card.querySelector('.detail-item:nth-child(2)').textContent.toLowerCase();

        const matchesSearch = employeeName.includes(searchTerm) || employeeEmail.includes(searchTerm);
        const matchesRol = rolFilter === '' || employeeRole.includes(rolFilter.toLowerCase());
        const matchesEstado = estadoFilter === '' || employeeStatus.includes(estadoFilter.toLowerCase());

        if (matchesSearch && matchesRol && matchesEstado) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function formatDate(dateString) {
    if (!dateString) return 'Fecha desconocida';
    
    // Convertir fecha de formato YYYY-MM-DD a DD/MM/YYYY
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}