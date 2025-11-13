<?php
/**
 * API para generar reportes
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario (solo admin puede generar reportes)
    $rolUsuario = verificarRol($pdo, 'admin');
    
    // Obtener parámetros del reporte
    $tipo = $_GET['tipo'] ?? 'resumen';
    $fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-01');
    $fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-d');
    
    switch ($tipo) {
        case 'resumen':
            // Reporte resumen general
            $reporte = [];
            
            // Contar animales por estado
            $stmt = $pdo->query("SELECT estado, COUNT(*) as cantidad FROM animales GROUP BY estado");
            $reporte['animales_por_estado'] = $stmt->fetchAll();
            
            // Contar adopciones por estado
            $stmt = $pdo->query("SELECT estado, COUNT(*) as cantidad FROM adopciones GROUP BY estado");
            $reporte['adopciones_por_estado'] = $stmt->fetchAll();
            
            // Contar adopciones aprobadas por mes
            $stmt = $pdo->prepare("
                SELECT 
                    DATE_FORMAT(fecha_aprobacion, '%Y-%m') as mes,
                    COUNT(*) as adopciones_realizadas
                FROM adopciones 
                WHERE estado = 'aprobada' AND fecha_aprobacion BETWEEN ? AND ?
                GROUP BY DATE_FORMAT(fecha_aprobacion, '%Y-%m')
                ORDER BY mes DESC
            ");
            $stmt->execute([$fecha_inicio, $fecha_fin]);
            $reporte['adopciones_por_mes'] = $stmt->fetchAll();
            
            // Contar usuarios por rol
            $stmt = $pdo->query("
                SELECT r.nombre as rol, COUNT(u.id) as cantidad 
                FROM usuarios u 
                JOIN roles r ON u.rol_id = r.id 
                GROUP BY r.nombre
            ");
            $reporte['usuarios_por_rol'] = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'tipo' => 'resumen',
                'fecha_inicio' => $fecha_inicio,
                'fecha_fin' => $fecha_fin,
                'data' => $reporte
            ]);
            break;
            
        case 'animales':
            // Reporte de animales
            $stmt = $pdo->prepare("
                SELECT a.*, r.nombre as responsable_nombre
                FROM animales a
                LEFT JOIN usuarios r ON a.responsable_id = r.id
                WHERE a.fecha_ingreso BETWEEN ? AND ?
                ORDER BY a.fecha_ingreso DESC
            ");
            $stmt->execute([$fecha_inicio, $fecha_fin]);
            $animales = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'tipo' => 'animales',
                'fecha_inicio' => $fecha_inicio,
                'fecha_fin' => $fecha_fin,
                'data' => $animales
            ]);
            break;
            
        case 'adopciones':
            // Reporte de adopciones
            $stmt = $pdo->prepare("
                SELECT ad.*, a.nombre as animal_nombre, a.tipo as animal_tipo, 
                       u.nombre as adoptante_nombre, u.apellido as adoptante_apellido, u.email as adoptante_email
                FROM adopciones ad
                JOIN animales a ON ad.animal_id = a.id
                JOIN usuarios u ON ad.adoptante_id = u.id
                WHERE ad.fecha_solicitud BETWEEN ? AND ?
                ORDER BY ad.fecha_solicitud DESC
            ");
            $stmt->execute([$fecha_inicio, $fecha_fin]);
            $adopciones = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'tipo' => 'adopciones',
                'fecha_inicio' => $fecha_inicio,
                'fecha_fin' => $fecha_fin,
                'data' => $adopciones
            ]);
            break;
            
        case 'revisiones':
            // Reporte de revisiones médicas
            $stmt = $pdo->prepare("
                SELECT rm.*, a.nombre as animal_nombre, a.tipo as animal_tipo,
                       v.nombre as veterinario_nombre, v.apellido as veterinario_apellido
                FROM revisiones_medicas rm
                JOIN animales a ON rm.animal_id = a.id
                JOIN usuarios v ON rm.veterinario_id = v.id
                WHERE rm.fecha_revision BETWEEN ? AND ?
                ORDER BY rm.fecha_revision DESC
            ");
            $stmt->execute([$fecha_inicio, $fecha_fin]);
            $revisiones = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'tipo' => 'revisiones',
                'fecha_inicio' => $fecha_inicio,
                'fecha_fin' => $fecha_fin,
                'data' => $revisiones
            ]);
            break;
            
        default:
            throw new Exception('Tipo de reporte no válido');
    }
    
} catch (PDOException $e) {
    error_log("Error en generar_reportes.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error general en generar_reportes.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>