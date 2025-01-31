const WebSocket = require('ws');
const crypto = require('crypto');
const https = require('https');
require('colors');

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

        console.log("⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘".red);
        console.log(`> P2P < Server running on port ${port}`.green);
        console.log("⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘".red);
    }

    async connectSocket(socket) {
        this.sockets.push(socket);
        console.log('New Peer connected.'.cyan);
        this.sendBlockchain(socket);
        this.sendListPeers(socket);

        getPublicIp().then(publicIP => {
            const peerAddress = `ws://${publicIP}:6001`;

            if (peerAddress.length > 1) {
                this.notifyPeersOfNewPeer(peerAddress);
            }
        }).catch(console.log);

        socket.on('message', (data) => this.handleMessage(data, socket));
        socket.on('close', () => this.removeSocket(socket));
        socket.on('error', (error) => console.error('Error WebSocket:'.red, error));
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
                    console.log(`Notify > Peer > ${newPeerIp}`.yellow);
                }
            });
        }
    }

    sendBlockchain(socket) {
        console.log('Send blockchain:'.magenta, this.blockchain.chain);
        try {
            if (this.blockchain.chain && this.blockchain.chain.length > 0) {
                const message = {
                    type: 'blockchain',
                    blockchain: this.blockchain.chain
                };
                socket.send(JSON.stringify(message));
            } else {
                console.log('Blockchain NULL.'.red);
            }
        } catch (error) {
            console.error('Error send blockchain:'.red, error);
        }
    }

    sendListPeers(socket) {
        console.log('Send list peers:'.magenta, this.peers);
        try {
            if (this.peers && this.peers.length > 0) {
                const message = {
                    type: 'listpeers',
                    listPeers: this.peers
                };
                socket.send(JSON.stringify(message));
            } else {
                console.log('List peers is invalid.'.red);
            }
        } catch (error) {
            console.error('Error send list peers:'.red, error);
        }
    }

    broadcastBlock(block) {
        console.log('Send new block for network...'.cyan);
        this.sockets.forEach((socket) => {
            console.log('Send block:'.yellow, block);
            socket.send(JSON.stringify({ type: 'newBlock', block }));
        });
    }

    handleMessage(data, socket) {
        console.log('Message received from server:'.cyan, data);
        const message = JSON.parse(data);

        if (message.type === 'peerInactive') {
            const inactivePeer = message.peerIp;
            console.log(`Peer ${inactivePeer} is inactive, removing from list.`);
            const index = this.peers.indexOf(inactivePeer);
            if (index > -1) {
                this.peers.splice(index, 1);
            }
        }

        if (message.type === 'newPeer') {
            const newPeer = message.peerIp;
            console.log(`New peer detected: ${newPeer}`.green);

            if (!this.peers.includes(newPeer)) {
                this.peers.push(newPeer);
                console.log(`Peer ${newPeer} Added to the list.`.green);
            }
        }

        if (message.type === 'listpeers') {
            console.log('List peers received:'.magenta, message.listPeers);
            message.listPeers.slice(0, 3).forEach(peerIp => {
                this.connectToPeer(peerIp);
            });
        }

        if (message.type === 'newBlock') {
            console.log('New block received:'.yellow, message.block);
            this.blockchain.addBlock(message.block.data);
        }

        if (message.type === 'blockchain') {
            if (this.isValidBlockchain(message.blockchain)) {
                if (message.blockchain.length > this.blockchain.chain.length) {
                    console.log('Update blockchain locally...'.cyan);
                    this.blockchain.chain = message.blockchain;
                } else {
                    console.log('Ignored blockchain received!'.red);
                }
            } else {
                console.log('Blockchain received is invalid.'.red);
            }
        }
    }

    connectToPeer(peerAddress) {
        console.log(`Trying to connect: ${peerAddress}`);
        const socket = new WebSocket(peerAddress);
    
        socket.on('open', () => {
            console.log(`Connection successful: ${peerAddress}`);
            this.connectSocket(socket);
        });
    
        socket.on('error', (error) => {
            console.error(`Error connecting to peer: ${peerAddress}`, error);
            this.handleInactivePeer(peerAddress);
        });

        socket.on('timeout', () => {
            console.log(`Connection to ${peerAddress} timed out.`);
            this.handleInactivePeer(peerAddress);
        });
    }
    
    handleInactivePeer(peerAddress) {
        const index = this.peers.indexOf(peerAddress);
        console.log(`Index of ${peerAddress} in peers list: ${index}`);
    
        if (index > -1) {
            this.peers.splice(index, 1);
            console.log(`Peer ${peerAddress} is inactive and removed from the list.`);
            this.notifyPeersOfInactivePeer(peerAddress);
        } else {
            console.log(`Peer ${peerAddress} not found in list.`);
        }
    }

    notifyPeersOfInactivePeer(peerAddress) {
        console.log(`Notifying peers about inactive peer: ${peerAddress}`);
        this.sockets.forEach(socket => {
            if (socket.readyState === WebSocket.OPEN) {
                const message = {
                    type: 'peerInactive',
                    peerIp: peerAddress
                };
                socket.send(JSON.stringify(message));
            }
        });
    }

    removeSocket(socket) {
        const index = this.sockets.indexOf(socket);
        if (index > -1) {
            this.sockets.splice(index, 1);
            console.log('Socket removed from list.');
        }
    
        getPublicIp().then(publicIP => {
            const peerAddress = `ws://${publicIP}:6001`;
            const peerIndex = this.peers.indexOf(peerAddress);
            if (peerIndex > -1) {
                this.peers.splice(peerIndex, 1);
                console.log(`Peer ${peerAddress} removed from the peer list.`);
            }
        }).catch(console.log);
    }

    isValidBlockchain(receivedBlockchain) {
        for (let i = 1; i < receivedBlockchain.length; i++) {
            const currentBlock = receivedBlockchain[i];
            const previousBlock = receivedBlockchain[i - 1];

            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log(`Error: Invalid hash at block ${currentBlock.index}`.red);
                return false;
            }

            if (currentBlock.hash !== this.generateBlockHash(currentBlock)) {
                console.log(`Error: Invalid hash at block ${currentBlock.index}`.red);
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
