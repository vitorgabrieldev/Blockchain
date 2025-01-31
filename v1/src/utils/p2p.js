const WebSocket = require('ws');
const crypto = require('crypto');
const https = require('https');
const { Socket } = require('dgram');

function getPublicIp() {
    return new Promise((resolve, reject) => {
        https.get('https://api.ipify.org?format=json', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data).ip));
        }).on('error', reject);
    });
}

class P2P {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.sockets = [];
        this.peers = [];    
    }

    listen(port) {
        const server = new WebSocket.Server({ port });
        server.on('connection', (socket) => {
            this.connectSocket(socket);
        });

        console.log(`P2P Server running on port ${port}`);
    }

    async connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Novo nó conectado.');
        this.sendBlockchain(socket);
        this.sendListPeers(socket);

        getPublicIp().then(publicIP => {
            const peerAddress = `ws://${publicIP}:6001`;

            if (peerAddress.length > 1) {
                this.notifyPeersOfNewPeer(peerAddress);
            }
        }).catch(console.log);
    
        socket.on('message', (data) => {
            console.log('Mensagem recebida do servidor:', data);
            const message = JSON.parse(data);
    
            if (message.type === 'newPeer') {
                const newPeer = message.peerIp;
                console.log(`Novo peer detectado: ${newPeer}`);
                
                if (!this.peers.includes(newPeer)) {
                    this.peers.push(newPeer);
                    console.log(`Peer ${newPeer} adicionado à lista.`);
                    console.log(this.peers);
                }
            }

            if (message.type === 'listpeers') {
                console.log('Lista de peers recebida:', message.listPeers);
        
                message.listPeers.forEach(peerIp => {
                    this.connectToPeer(peerIp);
                });
            }

            if (message.type === 'newBlock') {
                console.log('Novo bloco recebido:', message.block);
                this.blockchain.addBlock(message.block.data);
            }
    
            if (message.type === 'blockchain') {
                console.log('Blockchain recebida:', message.blockchain);
    
                if (this.isValidBlockchain(message.blockchain)) {
                    if (message.blockchain.length > this.blockchain.chain.length) {
                        console.log('Blockchain recebida é mais longa. Atualizando...');
                        this.blockchain.chain = message.blockchain;
                    } else {
                        console.log('Blockchain recebida não é mais longa. Ignorando.');
                    }
                } else {
                    console.log('Blockchain recebida é inválida. Ignorando.');
                }
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
    
    notifyPeersOfNewPeer(newPeerIp) {
        if (newPeerIp && this.sockets.length > 0) {
            this.sockets.forEach(socket => {
                if (socket.readyState === WebSocket.OPEN) {
                    const message = {
                        type: 'newPeer',
                        peerIp: newPeerIp
                    };
    
                    socket.send(JSON.stringify(message));
                    console.log(`Notificando peer ${newPeerIp}`);
                }
            });
        }
    }
    

    sendBlockchain(socket) {
        console.log('Enviando blockchain:', this.blockchain.chain);
        try {
            if (this.blockchain.chain && this.blockchain.chain.length > 0) {
                const message = {
                    type: 'blockchain',
                    blockchain: this.blockchain.chain
                };
                socket.send(JSON.stringify(message));
            } else {
                console.log('Blockchain não está inicializada ou está vazia.');
            }
        } catch (error) {
            console.error('Erro ao enviar a blockchain:', error);
        }
    }

    sendListPeers(socket) {
        console.log('Enviando lista de peers:', this.peers);
        try {
            if (this.peers && this.peers.length > 0) {
                const message = {
                    type: 'listpeers',
                    listPeers: this.peers
                };
                socket.send(JSON.stringify(message));
            } else {
                console.log('Lista de nós está vazia ou não existe.');
            }
        } catch (error) {
            console.error('Erro ao enviar a lista de nós:', error);
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

    isValidBlockchain(receivedBlockchain) {
        for (let i = 1; i < receivedBlockchain.length; i++) {
            const currentBlock = receivedBlockchain[i];
            const previousBlock = receivedBlockchain[i - 1];

            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log(`Erro: Hash anterior inválido no bloco ${currentBlock.index}`);
                return false;
            }

            if (currentBlock.hash !== this.generateBlockHash(currentBlock)) {
                console.log(`Erro: Hash inválido no bloco ${currentBlock.index}`);
                return false;
            }
        }
        return true;
    }

    generateBlockHash(block) {
        const data = block.index + block.timestamp + JSON.stringify(block.data) + block.previousHash + block.nonce;

        return crypto.createHash('sha256').update(data).digest('hex');
    }

    getPeers() {
        return this.peers;
    }
}

module.exports = P2P;
