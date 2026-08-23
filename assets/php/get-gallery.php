<?php
/**
 * DISSIDE CREATIVE STUDIO — PRODUCTION-HARDENED GALLERY DISCOVERY API
 * 
 * Auto-discovers images added to any client folder (e.g. images/v-krafts/, images/uber/)
 * with HTTP caching, atomic ETag evaluation, and robust defense-in-depth protections.
 */

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

$whitelistProjects = [
    'uber', 'bambino', 'cream-stone', 'karma-kettle', 'fhd-group', 'organo',
    'eclaire', 'knot', 'sensomatic', 'amogham', 'brew-nation', 'shian',
    'v-krafts', 'over-the-wicket', 'goldstone', 'supervek'
];

function fail(int $code, string $message): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message, 'images' => []]);
    exit;
}

// 1. Guard against array input before string manipulation (Prevents PHP 8+ TypeError)
$rawClient = $_GET['client'] ?? $_GET['project'] ?? '';
$client = is_string($rawClient) ? trim($rawClient) : '';

if ($client === '' || !preg_match('/^[a-z0-9\-]+$/', $client) || !in_array($client, $whitelistProjects, true)) {
    fail(400, 'Invalid or unapproved project identifier.');
}

// 2. Resolve root /images directory from /php folder
$baseImagesDir = realpath(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'images');
if ($baseImagesDir === false) {
    fail(500, 'Server configuration error.');
}

// 3. Strict Confinement: append DIRECTORY_SEPARATOR to prevent sibling-prefix matches
$basePrefix = $baseImagesDir . DIRECTORY_SEPARATOR;
$targetDir = realpath($baseImagesDir . DIRECTORY_SEPARATOR . $client);

if ($targetDir === false || strpos($targetDir . DIRECTORY_SEPARATOR, $basePrefix) !== 0 || !is_dir($targetDir)) {
    fail(404, 'Project directory not found.');
}

// 4. HTTP Caching & ETag Optimization (Zero rescanning on unmodified folders)
$dirMtime = @filemtime($targetDir) ?: time();
$etag = 'W/"' . md5($client . '_' . $dirMtime) . '"';
header('Cache-Control: public, max-age=300');
header('ETag: ' . $etag);

if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
    http_response_code(304);
    exit;
}

// 5. Scan directory, verify is_file() & is_readable(), and preserve authentic filenames
$allowedExtensions = ['jpg', 'jpeg', 'webp', 'png', 'mp4'];
$discoveredFiles = [];

$scan = @scandir($targetDir) ?: [];
foreach ($scan as $file) {
    if ($file === '' || $file[0] === '.') continue;

    $fullPath = $targetDir . DIRECTORY_SEPARATOR . $file;
    if (!is_file($fullPath) || !is_readable($fullPath)) continue;

    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExtensions, true)) continue;

    // Preserve authentic filename; json_encode() safely formats strings in JSON context
    $discoveredFiles[] = 'assets/images/' . $client . '/' . $file;
}

natsort($discoveredFiles);
$discoveredFiles = array_values($discoveredFiles);

http_response_code(200);
echo json_encode([
    'success' => true,
    'client'  => $client,
    'total'   => count($discoveredFiles),
    'images'  => $discoveredFiles,
]);
