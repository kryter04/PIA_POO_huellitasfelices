<?php
/**
 * API para registrar una revisión médica
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario
    $rolUsuario = verificarRol($pdo, 'veterinario');
    
    // Verificar si es una solicitud POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    // Obtener los datos del formulario
    $animal_id = (int)($_POST['animal_id'] ?? 0);
    $fecha_revision = $_POST['fecha_revision'] ?? date('Y-m-d');
    $hora_revision = $_POST['hora_revision'] ?? date('H:i:s');
    $tipo_revision = trim($_POST['tipo_revision'] ?? '');
    $estado_vacunas = trim($_POST['estado_vacunas'] ?? '');
    $peso = floatval($_POST['peso'] ?? 0);
    $temperatura = floatval($_POST['temperatura'] ?? 0);
    $estado_salud = trim($_POST['estado_salud'] ?? '');
    $estado_general = trim($_POST['estado_general'] ?? '');
    $diagnostico = trim($_POST['diagnostico'] ?? '');
    $tratamiento = trim($_POST['tratamiento'] ?? '');
    $observaciones = trim($_POST['observaciones'] ?? '');
    $proxima_cita = trim($_POST['proxima_cita'] ?? '');
    $costo = floatval($_POST['costo'] ?? 0);
    $user_id = (int)($_POST['user_id'] ?? 0);
    
    // Validar campos requeridos
    if (empty($animal_id) || empty($fecha_revision) || empty($hora_revision) || empty($tipo_revision) || empty($estado_salud) || empty($estado_general)) {
        throw new Exception('Campos requeridos incompletos');
    }
    
    // Validar valores permitidos
    $tipos_revision = ['rutinaria', 'vacunacion', 'desparasitacion', 'control', 'emergencia', 'otros'];
    $estados_vacunas = ['al_dia', 'pendiente', 'no_aplica'];
    $estados_salud = ['excelente', 'bueno', 'regular', 'malo'];
    $estados_general = ['activo', 'reposo', 'sedentario', 'enfermo'];
    
    if (!in_array($tipo_revision, $tipos_revision) || 
        (!empty($estado_vacunas) && !in_array($estado_vacunas, $estados_vacunas)) ||
        !in_array($estado_salud, $estados_salud) || 
        !in_array($estado_general, $estados_general)) {
        throw new Exception('Valores no válidos');
    }
    
    // Verificar que el animal exista
    $stmt = $pdo->prepare("SELECT id FROM animales WHERE id = ?");
    $stmt->execute([$animal_id]);
    if (!$stmt->fetch()) {
        throw new Exception('Animal no encontrado');
    }
    
    // Preparar la consulta SQL
    $sql = "INSERT INTO revisiones_medicas (animal_id, veterinario_id, fecha_revision, hora_revision, tipo_revision, estado_vacunas, peso, temperatura, estado_salud, estado_general, diagnostico, tratamiento, observaciones, proxima_cita, costo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $animal_id, $user_id, $fecha_revision, $hora_revision, $tipo_revision, 
        $estado_vacunas, $peso, $temperatura, $estado_salud, $estado_general, 
        $diagnostico, $tratamiento, $observaciones, $proxima_cita, $costo
    ]);
    
    if ($result) {
        // Actualizar la fecha de última revisión en la tabla de animales
        $stmt = $pdo->prepare("UPDATE animales SET fecha_ultima_revision = ? WHERE id = ?");
        $stmt->execute([$fecha_revision, $animal_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Revisión médica registrada exitosamente',
            'id' => $pdo->lastInsertId()
        ]);
    } else {
        throw new Exception('Error al registrar la revisión médica');
    }
    
} catch (PDOException $e) {
    error_log("Error en registrar_revision_medica.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en registrar_revision_medica.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>