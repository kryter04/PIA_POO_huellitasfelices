<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

// CONFIGURACIÓN CON TUS CREDENCIALES
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "huellitas_db";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    $id_animal = $input['id_animal'] ?? null;

    if (!$id_animal) {
        throw new Exception('ID de animal no especificado');
    }

    // Consulta para obtener datos del animal
    $stmt = $conn->prepare("
        SELECT 
            id_animal,
            nombre,
            especie,
            raza,
            edad,
            sexo,
            estado_salud,
            disponible,
            en_cuarentena,
            foto_url,
            fecha_registro
        FROM animal 
        WHERE id_animal = :id_animal
    ");
    
    $stmt->bindParam(':id_animal', $id_animal, PDO::PARAM_INT);
    $stmt->execute();
    
    $animal = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($animal) {
        // Convertir valores booleanos
        $animal['disponible'] = (bool)$animal['disponible'];
        $animal['en_cuarentena'] = (bool)$animal['en_cuarentena'];
        
        echo json_encode([
            'success' => true,
            'animal' => $animal
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Animal no encontrado en la base de datos'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
}
?>