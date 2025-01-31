const express = require('express');
const bodyParser = require('body-parser');
const blockchainController = require('./src/controllers/blockchainController');
const blockchainService = require('./src/services/blockchainService');
const config = require('./config/config');
const P2P = require('./src/utils/p2p');
const Blockchain = require('./src/models/block');

const app = express();
const port = config.port || 3000;

app.use(bodyParser.json());

const blockchain = new Blockchain();

const p2p = new P2P(blockchainService);
p2p.listen(6001);

p2p.connectToPeer('ws://159.203.157.181:6001');

app.post('/addBlock', (req, res) => blockchainController.addBlock(req, res, p2p));
app.get('/getBlockchain', (req, res) => blockchainController.getBlockchain(req, res, blockchain));
app.get('/validateBlockchain', (req, res) => blockchainController.validateBlockchain(req, res, blockchain));
app.get('/peers', (req, res) => {
    res.json(p2p.getPeers());
});

app.listen(port, () => {
    console.log(`Blockchain API running at http://localhost:${port}`);
});
