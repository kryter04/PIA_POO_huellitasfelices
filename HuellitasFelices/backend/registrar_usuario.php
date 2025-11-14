<?php
// (Archivo PHP para manejar el registro de un nuevo adoptante)

// (1. Establecer encabezados para respuesta JSON)
header('Content-Type: application/json');

// (2. Obtener datos del frontend - asumiendo que se envían por POST en formato JSON)
$input = json_decode(file_get_contents('php://input'), true);
$nombre = $input['txt_nombre_registro'] ?? null;
$correo = $input['txt_correo_registro'] ?? null;
$contrasena = $input['txt_contrasena_registro'] ?? null;
$telefono = $input['txt_telefono_registro'] ?? null; // (Opcional)

// (3. Validar campos vacíos (simplificado))
if (empty($nombre) || empty($correo) || empty($contrasena)) {
    // (Responde con error si faltan datos obligatorios)
    echo json_encode(['success' => false, 'message' => 'Error: Nombre, Correo y Contraseña son obligatorios.']);
    exit; // (Detiene la ejecución si hay error)
}

// (4. Conectar a la base de datos MySQL)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "huellitas_db";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // (5. Insertar en la tabla USUARIO)
    // NOTA: En una implementación real, la contraseña debe estar hasheada con password_hash().
    // Por simplicidad, se almacena en texto plano aquí, lo cual NO ES SEGURO.
    $stmt_usuario = $pdo->prepare("INSERT INTO USUARIO (nombre, correo, contrasena, telefono, rol) VALUES (:nombre, :correo, :contrasena, :telefono, 'adoptante')");
    $stmt_usuario->bindParam(':nombre', $nombre, PDO::PARAM_STR);
    $stmt_usuario->bindParam(':correo', $correo, PDO::PARAM_STR);
    $stmt_usuario->bindParam(':contrasena', $contrasena, PDO::PARAM_STR); // (Guardar como texto plano para este ejemplo)
    $stmt_usuario->bindParam(':telefono', $telefono, PDO::PARAM_STR); // (Puede ser NULL si no se envía)

    $stmt_usuario->execute();

    // Obtener el ID del usuario recién insertado
    $id_usuario_nuevo = $pdo->lastInsertId();

    // (6. Insertar en la tabla ADOPTANTE)
    $stmt_adoptante = $pdo->prepare("INSERT INTO ADOPTANTE (id_usuario) VALUES (:id_usuario)");
    $stmt_adoptante->bindParam(':id_usuario', $id_usuario_nuevo, PDO::PARAM_INT);
    $stmt_adoptante->execute();

    // (7. Confirmar registro)
    echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente.']);

} catch(PDOException $e) {
    // (Manejar errores, como correo duplicado por la restricción UNIQUE)
    if ($e->getCode() == 23000) { // (Código de error para violación de restricción UNIQUE)
        echo json_encode(['success' => false, 'message' => 'Error: El correo electrónico ya está registrado.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar usuario: ' . $e->getMessage()]);
    }
}

// (8. Cerrar la conexión a la base de datos)
$pdo = null;
?>