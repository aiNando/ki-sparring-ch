<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function read_payload(): array
{
    $raw = file_get_contents('php://input');
    if (is_string($raw) && trim($raw) !== '') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }

    return $_POST;
}

function clean_string(mixed $value): string
{
    return trim(is_string($value) ? $value : '');
}

$data = read_payload();

$name = clean_string($data['name'] ?? '');
$email = clean_string($data['email'] ?? '');
$firma = clean_string($data['firma'] ?? '');
$interesse = clean_string($data['interesse'] ?? '');
$nachricht = clean_string($data['nachricht'] ?? '');

if ($name === '' || $email === '' || $interesse === '' || $nachricht === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Ungültige Eingabe.']);
    exit;
}

$recipient = 'iN@ndo.ch';
$subject = 'Neue Anfrage via ki-sparring.ch';
$body = implode("\n", [
    "Name: {$name}",
    "E-Mail: {$email}",
    "Unternehmen: {$firma}",
    "Interesse: {$interesse}",
    "",
    "Nachricht:",
    $nachricht,
    "",
    '---',
    'Gesendet: ' . gmdate('c'),
    'Quelle: ki-sparring.ch',
]) . "\n";

$headers = [
    'From: ki-sparring.ch <no-reply@ki-sparring.ch>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
];

$sent = @mail($recipient, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'E-Mail-Versand fehlgeschlagen.']);
    exit;
}

echo json_encode(['ok' => true]);
