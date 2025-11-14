// reportes.js - Página de reportes para el dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeReportsPage();
    initializeCharts();
    loadDefaultReport();
});

function initializeReportsPage() {
    // Cargar nombre del usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Event listeners para generación de reportes
    setupReportEvents();
}

function setupReportEvents() {
    const generarReporteBtn = document.getElementById('generarReporteBtn');
    const exportarBtn = document.getElementById('exportarBtn');

    if (generarReporteBtn) {
        generarReporteBtn.addEventListener('click', function() {
            const tipo = document.getElementById('tipoReporte').value;
            const fechaInicio = document.getElementById('fechaInicio').value;
            const fechaFin = document.getElementById('fechaFin').value;
            
            generateReport(tipo, fechaInicio, fechaFin);
        });
    }

    if (exportarBtn) {
        exportarBtn.addEventListener('click', exportReport);
    }
}

function initializeCharts() {
    // Inicializar todos los gráficos
    const animalesCtx = document.getElementById('animalesChart').getContext('2d');
    this.animalesChart = new Chart(animalesCtx, {
        type: 'bar',
        data: {
            labels: ['Disponible', 'En Adopción', 'Adoptado'],
            datasets: [{
                label: 'Animales',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(54, 162, 235, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Animales por Estado'
                }
            }
        }
    });

    const adopcionesCtx = document.getElementById('adopcionesChart').getContext('2d');
    this.adopcionesChart = new Chart(adopcionesCtx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Adopciones',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Adopciones por Mes'
                }
            }
        }
    });

    const revisionesCtx = document.getElementById('revisionesChart').getContext('2d');
    this.revisionesChart = new Chart(revisionesCtx, {
        type: 'pie',
        data: {
            labels: ['Rutinaria', 'Vacunación', 'Desparasitación', 'Control', 'Emergencia'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Revisiones por Tipo'
                }
            }
        }
    });

    const usuariosCtx = document.getElementById('usuariosChart').getContext('2d');
    this.usuariosChart = new Chart(usuariosCtx, {
        type: 'doughnut',
        data: {
            labels: ['Adoptantes', 'Empleados', 'Veterinarios', 'Admin'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)',
                    'rgba(83, 102, 147, 0.6)',
                    'rgba(54, 162, 235, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 147, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Usuarios por Rol'
                }
            }
        }
    });
}

async function loadDefaultReport() {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar reporte por defecto (resumen general)
        const response = await fetch('../backend/generar_reportes.php?tipo=resumen');
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateReportData(data);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error loading default report:', error);
        showErrorState(error.message);
    }
}

async function generateReport(tipo, fechaInicio, fechaFin) {
    try {
        // Mostrar estado de carga
        showLoadingState();
        
        // Construir URL con parámetros
        let url = `../backend/generar_reportes.php?tipo=${tipo}`;
        if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
        if (fechaFin) url += `&fecha_fin=${fechaFin}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateReportData(data);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error generating report:', error);
        showErrorState(error.message);
    }
}

function showLoadingState() {
    // Mostrar estado de carga en gráficos y tabla
    document.getElementById('reportTableBody').innerHTML = '<tr><td colspan="5"><div class="loading-placeholder">Cargando reporte...</div></td></tr>';
}

function showErrorState(errorMessage) {
    // Mostrar mensaje de error en la tabla
    document.getElementById('reportTableBody').innerHTML = `
        <tr>
            <td colspan="5">
                <div class="error-placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al generar el reporte: ${errorMessage}</p>
                </div>
            </td>
        </tr>
    `;
}

function updateReportData(reportData) {
    if (reportData && reportData.data) {
        // Actualizar gráficos
        updateCharts(reportData.data);
        
        // Actualizar tabla
        updateReportTable(reportData.data);
        
        // Actualizar contador
        document.getElementById('reportsCount').textContent = `Reporte: ${reportData.tipo || 'General'}`;
    }
}

function updateCharts(reportData) {
    if (reportData && reportData.tipo) {
        switch(reportData.tipo) {
            case 'resumen':
                // Actualizar gráfico de animales
                if (reportData.data.animales_por_estado) {
                    const animalesData = reportData.data.animales_por_estado;
                    this.animalesChart.data.datasets[0].data = [
                        animalesData.disponible || 0,
                        animalesData.en_adopcion || 0,
                        animalesData.adoptado || 0
                    ];
                    this.animalesChart.update();
                }
                
                // Actualizar gráfico de adopciones
                if (reportData.data.adopciones_por_mes) {
                    const adopcionesData = reportData.data.adopciones_por_mes;
                    this.adopcionesChart.data.labels = adopcionesData.map(item => item.mes);
                    this.adopcionesChart.data.datasets[0].data = adopcionesData.map(item => item.adopciones_realizadas);
                    this.adopcionesChart.update();
                }
                
                // Actualizar gráfico de revisiones
                if (reportData.data.revisiones_por_tipo) {
                    const revisionesData = reportData.data.revisiones_por_tipo;
                    this.revisionesChart.data.labels = revisionesData.map(item => item.tipo);
                    this.revisionesChart.data.datasets[0].data = revisionesData.map(item => item.cantidad);
                    this.revisionesChart.update();
                }
                
                // Actualizar gráfico de usuarios
                if (reportData.data.usuarios_por_rol) {
                    const usuariosData = reportData.data.usuarios_por_rol;
                    this.usuariosChart.data.labels = usuariosData.map(item => item.rol);
                    this.usuariosChart.data.datasets[0].data = usuariosData.map(item => item.cantidad);
                    this.usuariosChart.update();
                }
                break;
                
            case 'animales':
                // Actualizar gráfico de animales
                if (reportData.data) {
                    this.animalesChart.data.datasets[0].data = [
                        reportData.data.length,
                        0, // Puedes calcular otros estados según necesites
                        0
                    ];
                    this.animalesChart.update();
                }
                break;
                
            // Agregar más casos según sea necesario
        }
    }
}

function updateReportTable(reportData) {
    const tableBody = document.getElementById('reportTableBody');
    
    if (reportData && reportData.data) {
        let rowsHTML = '';
        
        if (Array.isArray(reportData.data)) {
            reportData.data.forEach(item => {
                rowsHTML += `
                    <tr>
                        <td>${item.id || 'N/A'}</td>
                        <td>${item.nombre || item.animal_nombre || item.usuario_nombre || 'N/A'}</td>
                        <td>${item.tipo || item.animal_tipo || item.rol || 'N/A'}</td>
                        <td>${item.fecha_ingreso || item.fecha_solicitud || item.fecha_registro || 'N/A'}</td>
                        <td>${item.estado || 'N/A'}</td>
                    </tr>
                `;
            });
        }
        
        tableBody.innerHTML = rowsHTML;
    }
}

function exportReport() {
    showNotification('Funcionalidad de exportación en desarrollo', 'info');
}