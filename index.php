<?php

session_start();

function isValidCPF($cpf) {
    $cpf = preg_replace('/\D/', '', $cpf); // Remove caracteres não numéricos

    if (strlen($cpf) !== 11) {
        return false;
    }

    $sum = 0;
    for ($i = 0; $i < 9; $i++) {
        $sum += $cpf[$i] * (10 - $i);
    }

    $remainder = $sum % 11;
    $firstDigit = $remainder < 2 ? 0 : 11 - $remainder;
    if ($cpf[9] != $firstDigit) {
        return false;
    }

    $sum = 0;
    for ($i = 0; $i < 10; $i++) {
        $sum += $cpf[$i] * (11 - $i);
    }

    $remainder = $sum % 11;
    $secondDigit = $remainder < 2 ? 0 : 11 - $remainder;
    if ($cpf[10] != $secondDigit) {
        return false;
    }

    return true;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cpf = isset($_POST['cpf']) ? $_POST['cpf'] : '';

    if (!isValidCPF($cpf)) {
        echo json_encode(['success' => false, 'message' => 'Invalid CPF']);
        exit;
    }

    // Verificar se o CPF já existe
    $file = 'users.json';
    if (file_exists($file)) {
        $users = json_decode(file_get_contents($file), true);
        if ($users === null) {
            $users = [];
        }
    } else {
        $users = [];
    }

    // Verificar se o CPF já está registrado
    $existingUser = null;
    foreach ($users as $user) {
        if ($user['cpf'] === $cpf) {
            $existingUser = $user;
            break;
        }
    }

    if ($existingUser) {
        // Se o CPF já existe, loga o usuário
        $_SESSION['user'] = $existingUser;
        echo json_encode(['success' => true, 'message' => 'Logged in successfully!']);
    } else {
        // Se o CPF não existe, cria uma nova conta
        $user = [
            'id' => uniqid('user_', true),
            'username' => 'user_' . $cpf,
            'cpf' => $cpf,
            'created_at' => date('Y-m-d H:i:s'),
            'current_balance' => 1000,
        ];    

        $users[] = $user;

        if (file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT))) {
            $_SESSION['user'] = $user;
            echo json_encode(['success' => true, 'message' => 'Account created and logged in successfully!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save user data.']);
        }
    }
    exit;
}

?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criação de Conta</title>
    
    <!-- Carregar jQuery primeiro -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>  

    <!-- Carregar Toastr -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/inputmask@5.0.6/dist/inputmask.min.js"></script>

    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background-color: #f4f7fc;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .create-account-container {
            background-color: #ffffff;
            padding: 30px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            width: 350px;
            border: 1px solid #ddd;
        }
        h1 {
            font-size: 26px;
            text-align: center;
            color: #333;
            margin-bottom: 20px;
        }
        label {
            font-size: 14px;
            color: #555;
            margin-bottom: 8px;
            display: block;
        }
        input {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 10px;
            background-color: #007BFF;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>

    <div class="create-account-container">
        <h1>Create Account</h1>
        <form id="create-account-form">
            <label for="cpf">CPF:</label>
            <input type="text" id="cpf" name="cpf" required><br>
            <button type="submit">Create Account</button>
        </form>
    </div>

    <script>
        // Aplicando máscara no campo CPF
        const cpfInput = document.getElementById('cpf');
        const im = new Inputmask('999.999.999-99');
        im.mask(cpfInput);

        $("#create-account-form").submit(function(event) {
            event.preventDefault();
            const cpf = $("#cpf").val().replace(/\D/g, '');

            $.ajax({
                url: '',
                method: 'POST',
                data: { cpf: cpf },
                dataType: 'json',
                success: function(data) {
                    if (data.success) {
                        toastr.success(data.message || 'Account created and logged in successfully!', 'Success');
                        setTimeout(() => {
                            window.location.href = 'dashboard.php'; // Redireciona para a dashboard
                        }, 2000);
                    } else {
                        toastr.error(data.message || 'An error occurred. Please try again.', 'Error');
                    }
                },
                error: function() {
                    toastr.error('An error occurred. Please try again.', 'Error');
                }
            });
        });
    </script>

</body>
</html>
