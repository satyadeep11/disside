<?php
/**
 * DISSIDE CREATIVE STUDIO — FULLY HARDENED EMAIL ENDPOINT
 * 
 * Implemented Protections & Fixes:
 *  1. Anti-Spoof IP Resolution (Strict REMOTE_ADDR fallback)
 *  2. Atomic File-Locking (flock LOCK_EX over full Read-Modify-Write cycle)
 *  3. Inode DoS Prevention (Probabilistic TTL Garbage Collector for expired rate files)
 *  4. Strict CORS Enforcement (No wildcard '*' fallback)
 *  5. Hard Payload Size Cap (8 KB)
 *  6. Full Scope & Enum Whitelisting (Industry, Stage, Scope)
 *  7. Full Payload Regex Exploit Filter across ALL fields
 *  8. Email Header Injection Stripper (ASCII control char & newline purge)
 *  9. Full HTML Entity Escaping (ENT_QUOTES | ENT_HTML5, UTF-8)
 * 10. Delivery Status & Error Logging
 */

// ----------------------------------------------------
// 1. STRICT SECURITY & CORS HEADERS
// ----------------------------------------------------
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: geolocation=(), camera=(), microphone=()');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none';");

// CORS: Strictly whitelist approved origins only (Zero wildcard fallback)
$allowedOrigins = [
    'https://disside.com',
    'https://www.disside.com',
    'http://localhost:4000',
    'http://127.0.0.1:4000'
];

$httpOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($httpOrigin)) {
    if (in_array($httpOrigin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$httpOrigin}");
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
        header('Access-Control-Max-Age: 86400');
    } else {
        // Disallowed cross-origin -> Refuse CORS headers
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Origin not allowed by CORS.']);
            exit;
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ----------------------------------------------------
// 2. PAYLOAD SIZE CAP & DOS MITIGATION (Max 8KB)
// ----------------------------------------------------
$contentLength = intval($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 8192) {
    http_response_code(413);
    echo json_encode(['success' => false, 'message' => 'Payload exceeds maximum allowed limit.']);
    exit;
}

$rawInput = file_get_contents('php://input', false, null, 0, 8193);
if (strlen($rawInput) > 8192) {
    http_response_code(413);
    echo json_encode(['success' => false, 'message' => 'Payload exceeds maximum allowed limit.']);
    exit;
}

$data = json_decode($rawInput, true);
if (!is_array($data)) {
    $data = $_POST;
}
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request format.']);
    exit;
}

// ----------------------------------------------------
// 3. UNFORGEABLE IP RESOLUTION & ATOMIC RATE LIMITING
// ----------------------------------------------------
// Do NOT trust X-Forwarded-For or CF headers unless behind verified proxies
$clientIp = filter_var($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0', FILTER_VALIDATE_IP) ?: '0.0.0.0';
$ipHash = hash('sha256', $clientIp . '_disside_security_token');

$rateLimitDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'disside_rate_limits';
if (!is_dir($rateLimitDir)) {
    @mkdir($rateLimitDir, 0700, true);
}

// Probabilistic Inode Garbage Collection (1 in 20 requests prunes expired files)
if (mt_rand(1, 20) === 1 && is_dir($rateLimitDir)) {
    $nowTime = time();
    $files = @glob($rateLimitDir . DIRECTORY_SEPARATOR . 'rl_*.json');
    if ($files) {
        foreach ($files as $f) {
            if (($nowTime - @filemtime($f)) > 1200) { // Older than 20 minutes
                @unlink($f);
            }
        }
    }
}

// Atomic Read-Modify-Write via flock
$rateFile = $rateLimitDir . DIRECTORY_SEPARATOR . 'rl_' . $ipHash . '.json';
$fp = @fopen($rateFile, 'c+');
$now = time();
$limitWindow = 600; // 10 minutes
$maxAttempts = 4;

if ($fp) {
    flock($fp, LOCK_EX);
    $fileSize = filesize($rateFile);
    $rateData = null;
    if ($fileSize > 0) {
        $raw = fread($fp, $fileSize);
        $rateData = json_decode($raw, true);
    }

    if (is_array($rateData) && isset($rateData['first_attempt']) && ($now - $rateData['first_attempt']) < $limitWindow) {
        if ($rateData['count'] >= $maxAttempts) {
            flock($fp, LOCK_UN);
            fclose($fp);
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'message' => 'Rate limit exceeded. Please wait a few minutes before submitting another brief.'
            ]);
            exit;
        }
        $rateData['count']++;
    } else {
        $rateData = ['first_attempt' => $now, 'count' => 1];
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($rateData));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

// ----------------------------------------------------
// 4. HONEYPOT TRAP & SUBMISSION SPEED CHECK
// ----------------------------------------------------
if (!empty($data['website_trap']) || !empty($data['b_url']) || !empty($data['honeypot'])) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Brief received successfully.']);
    exit;
}

if (!empty($data['_t'])) {
    $renderedTime = intval($data['_t']);
    if ($renderedTime > 0 && ($now - $renderedTime) < 2) {
        // Fast automated submission -> Silently accept and drop
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Brief received successfully.']);
        exit;
    }
}

// ----------------------------------------------------
// 5. INPUT SANITIZATION & HEADER INJECTION PURGE
// ----------------------------------------------------
function cleanHeaderString($str, $maxLength = 80) {
    if (!is_string($str)) return '';
    // Strip ASCII control characters (0-31 and 127) including \r, \n, %0a, %0d
    $clean = preg_replace('/[\x00-\x1F\x7F]/', '', $str);
    $clean = str_ireplace(['bcc:', 'cc:', 'to:', 'content-type:', 'mime-version:', 'recipient:', 'boundary='], '', $clean);
    return trim(mb_substr($clean, 0, $maxLength, 'UTF-8'));
}

function escapeForHtml($str, $maxLength = 200) {
    if (!is_string($str)) return '';
    $clean = trim(mb_substr($str, 0, $maxLength, 'UTF-8'));
    return htmlspecialchars($clean, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

$name = cleanHeaderString($data['name'] ?? '', 80);
$email = cleanHeaderString($data['email'] ?? '', 80);
$company = cleanHeaderString($data['company'] ?? 'Not specified', 100);
$phone = cleanHeaderString($data['phone'] ?? 'Not provided', 30);

if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 80) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid name and work email address.']);
    exit;
}

// ----------------------------------------------------
// 6. ENUM WHITELIST VALIDATION (Industry, Stage, Scope)
// ----------------------------------------------------
$whitelistIndustries = [
    'Technology & SaaS',
    'D2C & Retail',
    'Real Estate & Architecture',
    'Hospitality & F&B',
    'Healthcare & Wellness',
    'Luxury & Lifestyle'
];

$whitelistStages = [
    'Early Stage / Seed',
    'Growth / Series A-C',
    'Growth / Scale',
    'Established Enterprise',
    'Established Leader'
];

$whitelistScopes = [
    'Full Brand Strategy & Positioning',
    'Visual Identity & Design System',
    'Packaging Architecture & Unboxing',
    'Digital Scrollytelling & Interactive Website',
    'Brand Strategy',
    'Visual Identity',
    'Packaging Design',
    'Digital Experience',
    'Full Brand Creation (0 to 1)',
    'Enterprise Brand Modernization'
];

$rawIndustry = is_string($data['industry'] ?? null) ? trim($data['industry']) : '';
$industry = in_array($rawIndustry, $whitelistIndustries, true) ? $rawIndustry : 'Technology & SaaS';

$rawStage = is_string($data['stage'] ?? null) ? trim($data['stage']) : '';
$stage = in_array($rawStage, $whitelistStages, true) ? $rawStage : 'Growth / Scale';

// Scope validation against enum whitelist
$rawScope = $data['scope'] ?? 'Full Brand Strategy & Positioning';
$validScopes = [];

if (is_array($rawScope)) {
    foreach ($rawScope as $s) {
        $sStr = trim((string)$s);
        foreach ($whitelistScopes as $ws) {
            if (stripos($sStr, $ws) !== false || stripos($ws, $sStr) !== false) {
                $validScopes[] = $ws;
                break;
            }
        }
    }
} elseif (is_string($rawScope)) {
    $scopeParts = explode(',', $rawScope);
    foreach ($scopeParts as $s) {
        $sStr = trim($s);
        foreach ($whitelistScopes as $ws) {
            if (stripos($sStr, $ws) !== false || stripos($ws, $sStr) !== false) {
                $validScopes[] = $ws;
                break;
            }
        }
    }
}

$validScopes = array_unique($validScopes);
if (empty($validScopes)) {
    $validScopes = ['Full Brand Strategy & Positioning'];
}
$scopeDisplay = implode(', ', array_slice($validScopes, 0, 6));

// ----------------------------------------------------
// 7. COMPREHENSIVE EXPLOIT PATTERN FILTER ACROSS ALL FIELDS
// ----------------------------------------------------
$exploitPatterns = [
    '/<script\b[^>]*>/i',
    '/javascript\s*:/i',
    '/data\s*:\s*text\/html/i',
    '/onload\s*=/i',
    '/onerror\s*=/i',
    '/\b(viagra|cialis|casino|poker|cryptocurrency|porn|loan|href=|<iframe|<embed|<object)\b/i'
];

$allFieldsCombined = $name . ' ' . $company . ' ' . $phone . ' ' . $email . ' ' . $industry . ' ' . $stage . ' ' . $scopeDisplay;
foreach ($exploitPatterns as $pattern) {
    if (preg_match($pattern, $allFieldsCombined)) {
        // Silently drop exploit payloads
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Brief received successfully.']);
        exit;
    }
}

// ----------------------------------------------------
// 8. COMPOSE ESCAPED HTML EMAIL
// ----------------------------------------------------
$to = 'hello@disside.com';
$safeName = escapeForHtml($name, 80);
$safeCompany = escapeForHtml($company, 100);
$safePhone = escapeForHtml($phone, 30);
$safeEmail = escapeForHtml($email, 80);
$safeIndustry = escapeForHtml($industry, 80);
$safeStage = escapeForHtml($stage, 80);
$safeScope = escapeForHtml($scopeDisplay, 250);

$subject = "🚀 Strategic Brief: {$safeName} ({$safeCompany})";

$messageBody = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>New Strategic Brief</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a; margin: 0; }
    .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: #fff3eb; color: #ff4d00; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 24px 0; border-bottom: 2px solid #ff4d00; padding-bottom: 16px; }
    .item { margin-bottom: 16px; }
    .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 4px; }
    .val { font-size: 15px; color: #0f172a; font-weight: 600; word-break: break-word; }
    .divider { border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='badge'>VERIFIED INQUIRY</div>
    <div class='title'>Strategic Brand Brief Submission</div>

    <div class='item'>
      <div class='label'>Client Name</div>
      <div class='val'>{$safeName}</div>
    </div>

    <div class='item'>
      <div class='label'>Work Email</div>
      <div class='val'><a href='mailto:{$safeEmail}' style='color:#ff4d00; text-decoration:none; font-weight:bold;'>{$safeEmail}</a></div>
    </div>

    <div class='item'>
      <div class='label'>Company / Enterprise</div>
      <div class='val'>{$safeCompany}</div>
    </div>

    <div class='item'>
      <div class='label'>Phone / WhatsApp</div>
      <div class='val'>{$safePhone}</div>
    </div>

    <hr class='divider'>

    <div class='item'>
      <div class='label'>Industry Sector</div>
      <div class='val'>{$safeIndustry}</div>
    </div>

    <div class='item'>
      <div class='label'>Selected Deliverables (Scope)</div>
      <div class='val' style='color:#ff4d00;'>{$safeScope}</div>
    </div>

    <div class='item'>
      <div class='label'>Enterprise Stage</div>
      <div class='val' style='color:#059669;'>{$safeStage}</div>
    </div>

    <div class='footer'>
      🛡️ Verified & XSS-sanitized lead via Disside Website (https://disside.com)<br>
      Origin IP: {$clientIp} • Sent to hello@disside.com
    </div>
  </div>
</body>
</html>
";

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=utf-8',
    'From: Disside Brief Engine <noreply@disside.com>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
];

$mailSent = @mail($to, $subject, $messageBody, implode("\r\n", $headers));

if (!$mailSent) {
    error_log("[Disside Mail Handler] Warning: mail() returned false for dispatch from: {$email}");
}

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Brief received successfully. A Senior Partner will contact you within 4 hours.'
]);
