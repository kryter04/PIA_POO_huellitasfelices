<?php
/**
 * Procesamiento del login de usuarios (versión API que devuelve JSON)
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
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Validar que se hayan enviado los datos
if (empty($email) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Por favor complete todos los campos'
    ]);
    exit();
}

try {
    // Consultar el usuario en la base de datos
    $stmt = $pdo->prepare("
        SELECT u.id, u.nombre, u.apellido, u.email, u.password_hash, u.estado, r.nombre as rol_nombre
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE u.email = ?
    ");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();
    
    // Verificar si el usuario existe
    if (!$usuario) {
        echo json_encode([
            'success' => false,
            'message' => 'Credenciales incorrectas'
        ]);
        exit();
    }
    
    // Verificar si el usuario está activo
    if ($usuario['estado'] !== 'activo') {
        echo json_encode([
            'success' => false,
            'message' => 'Cuenta desactivada. Contacte al administrador.'
        ]);
        exit();
    }
    
    // Verificar la contraseña
    if (!password_verify($password, $usuario['password_hash'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Credenciales incorrectas'
        ]);
        exit();
    }
    
    // Iniciar sesión
    $_SESSION['user_id'] = $usuario['id'];
    $_SESSION['user_name'] = $usuario['nombre'] . ' ' . $usuario['apellido'];
    $_SESSION['user_email'] = $usuario['email'];
    $_SESSION['rol'] = $usuario['rol_nombre'];
    $_SESSION['logged_in'] = true;
    
    // Actualizar la fecha de último login
    $stmt = $pdo->prepare("UPDATE usuarios SET fecha_ultimo_login = NOW() WHERE id = ?");
    $stmt->execute([$usuario['id']]);
    
    // Devolver respuesta exitosa con datos del usuario
    echo json_encode([
        'success' => true,
        'message' => 'Inicio de sesión exitoso',
        'user' => [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre'] . ' ' . $usuario['apellido'],
            'email' => $usuario['email'],
            'rol' => $usuario['rol_nombre']
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Error en login.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
}
?>