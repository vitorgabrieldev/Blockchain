const WebSocket = require('ws');

class P2P {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.sockets = [];
    }

    listen(port) {
        const server = new WebSocket.Server({ port });
        server.on('connection', (socket) => {
            this.connectSocket(socket);
        });

        console.log(`P2P Server running on port ${port}`);
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Novo nó conectado.');

        this.sendBlockchain(socket);

        socket.on('message', (data) => {
            console.log('Mensagem recebida do servidor:', data);
            const message = JSON.parse(data);
        
            if (message.type === 'newBlock') {
                console.log('Novo bloco recebido:', message.block);
                this.blockchain.addBlock(message.block.data);
            }
        });

        socket.on('close', () => {
            console.log('Conexão com o nó fechada.');
            this.removeSocket(socket);
        });

        socket.on('error', (error) => {
            console.error('Erro de conexão WebSocket:', error);
        });
    }

    sendBlockchain(socket) {
        console.log('Enviando blockchain:', this.blockchain.chain);
        try {
            if (this.blockchain.chain && this.blockchain.chain.length > 0) {
                socket.send(JSON.stringify(this.blockchain.chain));
            } else {
                console.log('Blockchain não está inicializada ou está vazia.');
            }
        } catch (error) {
            console.error('Erro ao enviar a blockchain:', error);
        }
    }

    broadcastBlock(block) {
        console.log('Transmitindo novo bloco para os nós...');
        this.sockets.forEach((socket) => {
            console.log('Enviando bloco:', block);
            socket.send(JSON.stringify({ type: 'newBlock', block }));
        });
    }

    handleMessage(message, socket) {
        if (message.type === 'newBlock') {
            console.log('Recebido bloco:', message.block);
            this.blockchain.addBlock(message.block.data);   
        }
    }

    connectToPeer(peerAddress) {
        console.log(`Tentando conectar ao nó: ${peerAddress}`);
        const socket = new WebSocket(peerAddress);
        
        socket.on('open', () => {
            console.log(`Conectado ao nó: ${peerAddress}`);
            this.connectSocket(socket);
        });

        socket.on('error', (error) => {
            console.error('Erro ao conectar ao nó:', error);
        });
    }

    removeSocket(socket) {
        const index = this.sockets.indexOf(socket);
        if (index > -1) {
            this.sockets.splice(index, 1);
        }
    }
}

module.exports = P2P;
