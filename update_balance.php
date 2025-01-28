<?php


if (!isset($_SESSION)) {
    session_start();
};

$userCpf = $_POST['userCpf'];
$recipientCpf = $_POST['recipientCpf'];
$userNewBalance = $_POST['userNewBalance'];
$recipientNewBalance = $_POST['recipientNewBalance'];

$users = json_decode(file_get_contents('users.json'), true);

$userIndex = array_search($userCpf, array_column($users, 'cpf'));
$recipientIndex = array_search($recipientCpf, array_column($users, 'cpf'));

if ($userIndex !== false && $recipientIndex !== false) {
    $users[$userIndex]['current_balance'] = $userNewBalance;
    $users[$recipientIndex]['current_balance'] = $recipientNewBalance;

    $user = $_SESSION['user'];
    $user['current_balance'] = $userNewBalance;

    if (file_put_contents('users.json', json_encode($users, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar o arquivo']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Usuários não encontrados']);
}
?>
