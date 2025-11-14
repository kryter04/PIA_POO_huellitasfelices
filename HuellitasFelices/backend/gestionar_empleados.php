<?php
/**
 * API para gestionar empleados
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario
    $rolUsuario = verificarRol($pdo, 'admin');
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Obtener empleados
            $rol = $_GET['rol'] ?? 'empleado';
            $sql = "SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.estado, r.nombre as rol_nombre, u.fecha_registro 
                    FROM usuarios u 
                    JOIN roles r ON u.rol_id = r.id 
                    WHERE r.nombre = ? OR r.nombre = 'veterinario' 
                    ORDER BY u.fecha_registro DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$rol]);
            $empleados = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $empleados,
                'count' => count($empleados)
            ]);
            break;
            
        case 'POST':
            // Crear nuevo empleado
            $input = json_decode(file_get_contents('php://input'), true);
            $nombre = trim($input['nombre'] ?? '');
            $apellido = trim($input['apellido'] ?? '');
            $email = trim($input['email'] ?? '');
            $telefono = trim($input['telefono'] ?? '');
            $rol_nombre = trim($input['rol'] ?? 'empleado');
            $password = $input['password'] ?? '';
            $confirm_password = $input['confirm_password'] ?? '';
            
            // Validar campos requeridos
            if (empty($nombre) || empty($apellido) || empty($email) || empty($password) || empty($confirm_password)) {
                throw new Exception('Campos requeridos incompletos');
            }
            
            // Validar contraseña
            if ($password !== $confirm_password) {
                throw new Exception('Las contraseñas no coinciden');
            }
            
            // Validar rol
            $stmt = $pdo->prepare("SELECT id FROM roles WHERE nombre = ? AND nombre IN ('empleado', 'veterinario')");
            $stmt->execute([$rol_nombre]);
            $rol = $stmt->fetch();
            
            if (!$rol) {
                throw new Exception('Rol no válido');
            }
            
            // Verificar si el email ya existe
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                throw new Exception('Email ya registrado');
            }
            
            // Encriptar contraseña
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            
            // Insertar nuevo empleado
            $sql = "INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol_id, estado) 
                    VALUES (?, ?, ?, ?, ?, ?, 'activo')";
            
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute([$nombre, $apellido, $email, $telefono, $password_hash, $rol['id']]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Empleado registrado exitosamente',
                    'id' => $pdo->lastInsertId()
                ]);
            } else {
                throw new Exception('Error al registrar el empleado');
            }
            break;
            
        case 'PUT':
            // Actualizar empleado
            $input = json_decode(file_get_contents('php://input'), true);
            
            $id = (int)($input['id'] ?? 0);
            $nombre = trim($input['nombre'] ?? '');
            $apellido = trim($input['apellido'] ?? '');
            $email = trim($input['email'] ?? '');
            $telefono = trim($input['telefono'] ?? '');
            $estado = trim($input['estado'] ?? 'activo');
            $rol_nombre = trim($input['rol'] ?? 'empleado');
            
            // Validar campos requeridos
            if (empty($id) || empty($nombre) || empty($apellido) || empty($email)) {
                throw new Exception('Campos requeridos incompletos');
            }
            
            // Validar rol
            $stmt = $pdo->prepare("SELECT id FROM roles WHERE nombre = ? AND nombre IN ('empleado', 'veterinario')");
            $stmt->execute([$rol_nombre]);
            $rol = $stmt->fetch();
            
            if (!$rol) {
                throw new Exception('Rol no válido');
            }
            
            // Verificar si el empleado existe
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                throw new Exception('Empleado no encontrado');
            }
            
            // Actualizar empleado
            $sql = "UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, rol_id = ?, estado = ? WHERE id = ?";
            
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute([$nombre, $apellido, $email, $telefono, $rol['id'], $estado, $id]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Empleado actualizado exitosamente'
                ]);
            } else {
                throw new Exception('Error al actualizar el empleado');
            }
            break;
            
        case 'DELETE':
            // Eliminar empleado
            $id = (int)($_GET['id'] ?? 0);
            
            if (empty($id)) {
                throw new Exception('ID de empleado no proporcionado');
            }
            
            // Verificar si el empleado existe
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                throw new Exception('Empleado no encontrado');
            }
            
            // No se puede eliminar al usuario actual
            if ($id == $_SESSION['user_id']) {
                throw new Exception('No puedes eliminarte a ti mismo');
            }
            
            // Eliminar empleado (marcar como inactivo)
            $sql = "UPDATE usuarios SET estado = 'inactivo' WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute([$id]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Empleado desactivado exitosamente'
                ]);
            } else {
                throw new Exception('Error al desactivar el empleado');
            }
            break;
            
        default:
            throw new Exception('Método no permitido');
    }
    
} catch (PDOException $e) {
    error_log("Error en gestionar_empleados.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en gestionar_empleados.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>