<?php
/**
 * Procesamiento del registro de usuarios
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
session_start();

require_once 'conexion.php';

// Verificar si se envió el formulario
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit();
}

// Obtener los datos del formulario
$input = json_decode(file_get_contents('php://input'), true);
$nombre = trim($input['nombre'] ?? '');
$apellido = trim($input['apellido'] ?? '');
$email = trim($input['email'] ?? '');
$telefono = trim($input['telefono'] ?? '');
$direccion = trim($input['direccion'] ?? '');
$tipo_vivienda = $input['tipo_vivienda'] ?? '';
$espacio_hogar = $input['espacio_hogar'] ?? null;
$tiempo_cuidado = $input['tiempo_cuidado'] ?? '';
$experiencia = $input['experiencia'] ?? '';
$disponibilidad = $input['disponibilidad'] ?? false;
$password = $input['password'] ?? '';
$confirm_password = $input['confirm_password'] ?? '';

// Validar campos requeridos
if (empty($nombre) || empty($apellido) || empty($email) || empty($telefono) || empty($direccion) || empty($password) || empty($confirm_password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Por favor complete todos los campos requeridos'
    ]);
    exit();
}

// Validar email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Email no válido'
    ]);
    exit();
}

// Validar contraseña
if (strlen($password) < 6) {
    echo json_encode([
        'success' => false,
        'message' => 'La contraseña debe tener al menos 6 caracteres'
    ]);
    exit();
}

if ($password !== $confirm_password) {
    echo json_encode([
        'success' => false,
        'message' => 'Las contraseñas no coinciden'
    ]);
    exit();
}

try {
    // Verificar si el email ya existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'El email ya está registrado'
        ]);
        exit();
    }
    
    // Encriptar contraseña
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar nuevo usuario (por defecto como adoptante - rol_id = 1)
    $stmt = $pdo->prepare("
        INSERT INTO usuarios (nombre, apellido, email, telefono, direccion, tipo_vivienda, 
                             espacio_hogar, tiempo_cuidado, experiencia, disponibilidad, password_hash, rol_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ");
    
    $result = $stmt->execute([
        $nombre, $apellido, $email, $telefono, $direccion, $tipo_vivienda,
        $espacio_hogar, $tiempo_cuidado, $experiencia, $disponibilidad, $password_hash
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado exitosamente'
        ]);
    } else {
        throw new Exception('Error al registrar el usuario');
    }
    
} catch (PDOException $e) {
    error_log("Error en register.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>