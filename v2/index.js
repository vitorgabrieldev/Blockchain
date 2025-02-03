/*----------------------------------
|                                  |
|    Blockchain API Server         |
|                                  |
|----------------------------------*/

/*----------------------------------
|  Import required modules         |
|----------------------------------*/
const express = require('express');
const bodyParser = require('body-parser');
const blockchainController = require('./core/src/controllers/blockchainController');
const Core = require('./core/core');
const config = require('./core/config/config');
const { exec } = require('child_process');
const postCLI = process.argv[2];

/*----------------------------------
|  Initialize core components      |
|----------------------------------*/
const core = new Core();

/*----------------------------------
|  Create Express app instance     |
|----------------------------------*/
const app = express();
const port = postCLI || 8080;

/*----------------------------------
|  Use middleware to parse JSON    |
|----------------------------------*/
app.use(bodyParser.json());

/*----------------------------------
|  Define routes                   |
|----------------------------------*/

/* Add a new block to the blockchain */
app.post('/add-block', (req, res) => blockchainController.addBlock(req, res, core.p2p));

/* Get the entire blockchain */
app.get('/get-chain', (req, res) => blockchainController.getBlockchain(req, res, core.blockchain));

/* Validate the blockchain for integrity */
app.get('/validate-chain', (req, res) => blockchainController.validateBlockchain(req, res, core.blockchain));

/* Get the list of peers connected to the network */
app.get('/get-peers', (req, res) => {
    res.json(core.p2p.getPeers());
});

/*----------------------------------
|  Start the server on the given port |
|----------------------------------*/
app.listen(port, () => {
    if (config.environment === "development") {
        console.log(`Blockchain API running at http://localhost:${port}`);
    }
});
