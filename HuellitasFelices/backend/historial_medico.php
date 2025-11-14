<?php
// (Archivo PHP para obtener el historial médico de un animal específico)

// (1. Establecer encabezados para respuesta JSON)
header('Content-Type: application/json');

// (2. Obtener datos del frontend)
$input = json_decode(file_get_contents('php://input'), true);
$id_animal_para_historial = $input['txt_id_animal_historial'] ?? null;

// (3. Validar datos)
if (empty($id_animal_para_historial) || !is_numeric($id_animal_para_historial)) {
    echo json_encode(['success' => false, 'message' => 'Error: ID de animal inválido.']);
    exit;
}

// (4. Conectar a la base de datos MySQL)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "huellitas_db";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // (5. Buscar revisiones médicas del animal)
    // JOIN para obtener también el nombre del veterinario desde EMPLEADO -> USUARIO
    $stmt = $pdo->prepare("
        SELECT rm.id_revision, rm.fecha, rm.diagnostico, rm.tratamiento, u.nombre AS nombre_veterinario
        FROM REVISION_MEDICA rm
        JOIN EMPLEADO e ON rm.id_veterinario = e.id_empleado
        JOIN USUARIO u ON e.id_usuario = u.id_usuario
        WHERE rm.id_animal = :id_animal
        ORDER BY rm.fecha DESC
    ");
    $stmt->bindParam(':id_animal', $id_animal_para_historial, PDO::PARAM_INT);
    $stmt->execute();

    $revisiones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // (6. Mostrar resultados en JSON)
    echo json_encode(['success' => true, 'revisiones' => $revisiones]);

} catch(PDOException $e) {
    // (Manejar errores de conexión o consulta)
    echo json_encode(['success' => false, 'message' => 'Error al cargar historial médico: ' . $e->getMessage()]);
}

// (7. Cerrar la conexión a la base de datos)
$pdo = null;
?>