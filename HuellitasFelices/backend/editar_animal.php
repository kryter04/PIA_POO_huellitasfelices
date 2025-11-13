<?php
/**
 * API para editar un animal
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario (solo admin puede editar animales)
    $rolUsuario = verificarRol($pdo, 'admin');
    
    // Verificar si es una solicitud POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    // Obtener los datos del formulario
    $animal_id = (int)($_POST['animal_id'] ?? 0);
    $nombre = trim($_POST['nombre'] ?? '');
    $tipo = trim($_POST['tipo'] ?? '');
    $raza = trim($_POST['raza'] ?? '');
    $sexo = trim($_POST['sexo'] ?? '');
    $edad = trim($_POST['edad'] ?? '');
    $tamano = trim($_POST['tamano'] ?? '');
    $peso = floatval($_POST['peso'] ?? 0);
    $color = trim($_POST['color'] ?? '');
    $descripcion = trim($_POST['descripcion'] ?? '');
    $estado = trim($_POST['estado'] ?? 'disponible');
    $fecha_ingreso = $_POST['fecha_ingreso'] ?? date('Y-m-d');
    $observaciones = trim($_POST['observaciones'] ?? '');
    
    // Validar campos requeridos
    if (empty($animal_id) || empty($nombre) || empty($tipo) || empty($sexo) || empty($edad) || empty($tamano)) {
        throw new Exception('Campos requeridos incompletos');
    }
    
    // Validar valores permitidos
    $tipos_permitidos = ['perro', 'gato', 'conejo', 'ave', 'otro'];
    $sexos_permitidos = ['macho', 'hembra'];
    $edades_permitidas = ['cachorro', 'joven', 'adulto', 'senior'];
    $tamanos_permitidos = ['pequeno', 'mediano', 'grande'];
    $estados_permitidos = ['disponible', 'en_adopcion', 'adoptado'];
    
    if (!in_array($tipo, $tipos_permitidos) || !in_array($sexo, $sexos_permitidos) || 
        !in_array($edad, $edades_permitidas) || !in_array($tamano, $tamanos_permitidos) || 
        !in_array($estado, $estados_permitidos)) {
        throw new Exception('Valores no válidos');
    }
    
    // Verificar que el animal exista
    $stmt = $pdo->prepare("SELECT id FROM animales WHERE id = ?");
    $stmt->execute([$animal_id]);
    if (!$stmt->fetch()) {
        throw new Exception('Animal no encontrado');
    }
    
    // Manejar la subida de la foto
    $foto = null;
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../imagenes/animales/';
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        
        // Validar tipo de archivo
        $fileType = $_FILES['foto']['type'];
        if (!in_array($fileType, $allowedTypes)) {
            throw new Exception('Tipo de archivo no permitido');
        }
        
        // Validar tamaño
        if ($_FILES['foto']['size'] > $maxSize) {
            throw new Exception('Archivo demasiado grande');
        }
        
        // Generar nombre único
        $extension = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid('animal_') . '.' . $extension;
        $uploadPath = $uploadDir . $fileName;
        
        // Mover archivo al directorio
        if (move_uploaded_file($_FILES['foto']['tmp_name'], $uploadPath)) {
            $foto = 'imagenes/animales/' . $fileName;
        } else {
            throw new Exception('Error al subir la imagen');
        }
    }
    
    // Formatear la fecha de ingreso si está en formato DD/MM/YYYY
    if (strpos($fecha_ingreso, '/') !== false) {
        $dateParts = explode('/', $fecha_ingreso);
        if (count($dateParts) === 3) {
            $fecha_ingreso = $dateParts[2] . '-' . $dateParts[1] . '-' . $dateParts[0]; // Convertir a YYYY-MM-DD
        }
    }
    
    // Preparar la consulta SQL
    if ($foto) {
        // Si hay nueva foto
        $sql = "UPDATE animales SET nombre = ?, tipo = ?, raza = ?, sexo = ?, edad = ?, tamano = ?, peso = ?, color = ?, descripcion = ?, foto = ?, estado = ?, fecha_ingreso = ?, observaciones = ? WHERE id = ?";
        $params = [$nombre, $tipo, $raza, $sexo, $edad, $tamano, $peso, $color, $descripcion, $foto, $estado, $fecha_ingreso, $observaciones, $animal_id];
    } else {
        // Si no hay nueva foto
        $sql = "UPDATE animales SET nombre = ?, tipo = ?, raza = ?, sexo = ?, edad = ?, tamano = ?, peso = ?, color = ?, descripcion = ?, estado = ?, fecha_ingreso = ?, observaciones = ? WHERE id = ?";
        $params = [$nombre, $tipo, $raza, $sexo, $edad, $tamano, $peso, $color, $descripcion, $estado, $fecha_ingreso, $observaciones, $animal_id];
    }
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Animal actualizado exitosamente'
        ]);
    } else {
        throw new Exception('Error al actualizar el animal');
    }
    
} catch (PDOException $e) {
    error_log("Error en editar_animal.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error general en editar_animal.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>