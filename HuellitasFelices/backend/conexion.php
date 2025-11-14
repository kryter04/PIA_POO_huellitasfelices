<?php
/**
 * Archivo de conexión a la base de datos
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'huellitas_db';
$username = 'root';
$password = '';

try {
    // Crear la conexión PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    
    // Configurar atributos PDO
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
} catch (PDOException $e) {
    // En caso de error, mostrar mensaje y terminar la ejecución
    die("Error de conexión: " . $e->getMessage());
}

// Función para verificar el rol del usuario
function verificarRol($pdo, $rolRequerido) {
    session_start();
    
    // Verificar si el usuario está logueado
    if (!isset($_SESSION['user_id'])) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode([
            'success' => false,
            'message' => 'No autorizado - Sesión no iniciada'
        ]);
        exit();
    }
    
    // Obtener el rol del usuario
    $stmt = $pdo->prepare("SELECT r.nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ]);
        exit();
    }
    
    $rolUsuario = $usuario['nombre'];
    
    // Verificar si el rol tiene permiso
    $permiso = false;
    
    switch ($rolRequerido) {
        case 'admin':
            $permiso = ($rolUsuario === 'admin');
            break;
        case 'veterinario':
            $permiso = ($rolUsuario === 'admin' || $rolUsuario === 'veterinario');
            break;
        case 'empleado':
            $permiso = ($rolUsuario === 'admin' || $rolUsuario === 'veterinario' || $rolUsuario === 'empleado');
            break;
        case 'adoptante':
            $permiso = ($rolUsuario === 'admin' || $rolUsuario === 'veterinario' || $rolUsuario === 'empleado' || $rolUsuario === 'adoptante');
            break;
        default:
            $permiso = false;
    }
    
    if (!$permiso) {
        header('HTTP/1.1 403 Forbidden');
        echo json_encode([
            'success' => false,
            'message' => 'No tienes permisos para acceder a esta sección',
            'rol_usuario' => $rolUsuario,
            'rol_requerido' => $rolRequerido
        ]);
        exit();
    }
    
    return $rolUsuario;
}
?>