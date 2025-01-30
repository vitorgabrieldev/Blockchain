const express = require('express');
const bodyParser = require('body-parser');
const blockchainController = require('./src/controllers/blockchainController');
const config = require('./config/config');
const P2P = require('./src/utils/p2p');
const Blockchain = require('./src/models/block');

const app = express();
const port = config.port || 3000;

app.use(bodyParser.json());

const blockchain = new Blockchain();

const p2p = new P2P(blockchain);

p2p.listen(6001);

p2p.connectToPeer('ws://159.203.157.181:6001');

app.post('/addBlock', (req, res) => blockchainController.addBlock(req, res, blockchain, p2p));
app.get('/getBlockchain', (req, res) => blockchainController.getBlockchain(req, res, blockchain));
app.get('/validateBlockchain', (req, res) => blockchainController.validateBlockchain(req, res, blockchain));

app.listen(port, () => {
    console.log(`Blockchain API running at http://localhost:${port}`);
});
