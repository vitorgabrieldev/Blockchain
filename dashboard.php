<?php
session_start();

if (!isset($_SESSION['user'])) {
    header("Location: index.php");
    exit;
}

$user = $_SESSION['user'];

if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header("Location: index.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    
     <!-- Carregar jQuery e jQuery UI -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>

    <!-- Carregar Toastr -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.js"></script>

    <!-- Carregar SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- Carregar jQuery Mask Plugin -->
    <script src="https://cdn.jsdelivr.net/npm/jquery-mask-plugin@1.14.16/dist/jquery.mask.min.js"></script>

    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .dashboard-container {
            background-color: #ffffff;
            padding: 30px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            width: 400px;
            border: 1px solid #ddd;
        }
        h1 {
            font-size: 28px;
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        h3 {
            margin-top: 10px;
            margin-bottom: 10px;
        }
        .user-info {
            font-size: 16px;
            color: #555;
            margin-bottom: 25px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .user-info strong {
            font-weight: 600;
        }
        .button-logout {
            width: 100%;
            padding: 12px;
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .button-logout:hover {
            background-color: #c82333;
        }
        .transfer-form {
            display: flex;
            flex-direction: column;
            row-gap: 10px;
        }
        .transfer-form input, .transfer-form button {
            width: 100%;
            padding: 12px;
            font-size: 16px;
            border-radius: 6px;
            border: 1px solid #ddd;
        }
        .transfer-form input:focus, .transfer-form button:focus {
            outline: none;
            border-color: #007bff;
        }
        .transfer-form button {
            background-color: #28a745;
            color: white;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .transfer-form button:hover {
            background-color: #218838;
        }
        .transfer-form input[type="text"],
        .transfer-form input[type="number"] {
            background-color: #f8f9fa;
            width: auto;
        }

        #transfer-button {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>

    <div class="dashboard-container">
        <h1>Dashboard</h1>
        <div class="user-info">
            <strong>Username:</strong> <?php echo htmlspecialchars($user['username']); ?><br>
            <strong>CPF:</strong> <?php echo htmlspecialchars($user['cpf']); ?><br>
            <strong>Account Created At:</strong> <?php echo htmlspecialchars($user['created_at']); ?><br>
            <strong>Current Balance:</strong> R$ <?php echo number_format($user['current_balance'], 2, ',', '.'); ?><br>
        </div>

        <h3>Transfer Money</h3>
        <div class="transfer-form">
            <input type="text" id="transfer-cpf" placeholder="CPF da outra pessoa" required>
            <input type="number" id="transfer-amount" placeholder="Valor a Transferir" required>
            <button id="transfer-button">Transferir</button>
        </div>

        <a href="?logout=true">
            <button class="button-logout">Logout</button>
        </a>
    </div>

    <script>
        // Máscaras para CPF e valor
        $("#transfer-cpf").mask("000.000.000-00");

        // Função para consultar o arquivo JSON periodicamente
        function fetchUserData() {
            $.ajax({
                url: 'users.json',
                method: 'GET',
                dataType: 'json',
                success: function(data) {
                    let user = data.find(u => u.cpf === "<?php echo $user['cpf']; ?>");
                    if (user) {
                        var current_balance = parseFloat(user.current_balance);
                        $(".user-info").html(`
                            <strong>Username:</strong> ${user.username}<br>
                            <strong>CPF:</strong> ${user.cpf}<br>
                            <strong>Account Created At:</strong> ${user.created_at}<br>
                            <strong>Current Balance:</strong> R$ ${current_balance.toFixed(2).replace('.', ',')}<br>
                        `);
                    }
                },
                error: function() {
                    toastr.error('Erro ao consultar os dados do usuário.', 'Erro');
                }
            });
        }

        setInterval(fetchUserData, 5000);

        $("#transfer-button").click(function() {
            const cpf = $("#transfer-cpf").val().trim();
            const amount = parseFloat($("#transfer-amount").val().trim());

            if (!cpf || isNaN(amount) || amount <= 0) {
                toastr.error('Preencha todos os campos corretamente!', 'Erro');
                return;
            }

            if (cpf.replace(/\D/g, '') === "<?php echo $user['cpf']; ?>") {
                toastr.error('Você não pode transferir dinheiro para si mesmo.', 'Erro');
                return;
            }

            $.ajax({
                url: 'users.json',
                method: 'GET',
                dataType: 'json',
                success: function(data) {
                    const cpfOnlyNumbers = cpf.replace(/\D/g, '');

                    const user = data.find(u => u.cpf.replace(/\D/g, '') === cpfOnlyNumbers);

                    if (!user) {
                        toastr.error('Usuário não encontrado!', 'Erro');
                        return;
                    }

                    Swal.fire({
                        title: 'Confirmar Transferência',
                        text: `Você deseja transferir R$ ${amount.toFixed(2)} para ${user.username} (${user.cpf})?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sim, Transferir',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {

                            var my_balance = parseFloat(<?php echo $user['current_balance']; ?>)

                            if (my_balance   < amount) {
                                toastr.error('Saldo insuficiente para realizar a transferência.', 'Erro');
                                return;
                            }

                            user.current_balance = (parseFloat(user.current_balance) + amount).toFixed(2);
                            my_balance = (parseFloat(my_balance) - amount).toFixed(2);

                            $.ajax({
                                url: 'update_balance.php',
                                method: 'POST',
                                data: {
                                    userCpf: "<?php echo $user['cpf']; ?>",
                                    recipientCpf: user.cpf,           
                                    userNewBalance: my_balance,
                                    recipientNewBalance: user.current_balance 
                                },
                                success: function(response) {
                                    if (response.success) {
                                        toastr.success(`Transferência de R$ ${amount.toFixed(2)} para ${recipient.username} realizada com sucesso!`, 'Sucesso');
                                        fetchUserData();
                                    } else {
                                        toastr.error('Erro ao atualizar os saldos no servidor.', 'Erro');
                                    }
                                },
                                error: function() {
                                    toastr.error('Erro na requisição ao servidor.', 'Erro');
                                }
                            });
                        }
                    });
                },
                error: function() {
                    toastr.error('Erro ao buscar o destinatário.', 'Erro');
                }
            });
        });

        // Autocomplete para CPF (sugestões ao digitar)
        $("#transfer-cpf").autocomplete({
            source: function(request, response) {
                $.ajax({
                    url: 'users.json', // Modifique conforme a URL do seu arquivo de dados JSON
                    method: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        const filteredData = data.filter(u => u.cpf.includes(request.term));
                        response(filteredData.map(u => u.cpf));
                    }
                });
            },
            minLength: 3, // Mostrar sugestões depois de digitar 3 caracteres
        });
    </script>

</body>
</html>
