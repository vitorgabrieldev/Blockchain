/*----------------------------------
|                                  |
|      Blockchain Controller       |
|    Handles the logic for the     |
|     blockchain endpoints         |
|                                  |
|----------------------------------*/

/*----------------------------------
|  Import blockchain service      |
|  to interact with the blockchain|
|----------------------------------*/
const blockchainService = require('../services/blockchainService');

/*----------------------------------
|   Add Block to Blockchain       |
|   Validates and adds a new block|
|----------------------------------*/
const addBlock = (req, res, p2p) => {
    const data = req.body.data;

    if (!data) {
        return res.status(400).send('Data is required to add a block.');
    }

    addBlockToBlockchain(data);
    broadcastBlockToPeers(p2p);
    sendAddBlockResponse(res);
};

/*----------------------------------
|   Add Block to the Blockchain   |
|   Helper function to add the    |
|   block and validate the chain  |
|----------------------------------*/
const addBlockToBlockchain = (data) => {
    blockchainService.addBlock(data);
};

/*----------------------------------
|   Broadcast the Block to Peers  |
|   Helper function to broadcast  |
|   the new block to all peers    |
|----------------------------------*/
const broadcastBlockToPeers = (p2p) => {
    const lastBlock = blockchainService.chain[blockchainService.chain.length - 1];
    p2p.broadcastBlock(lastBlock);
};

/*----------------------------------
|   Send Response After Adding    |
|   Block                        |
|----------------------------------*/
const sendAddBlockResponse = (res) => {
    res.status(200).send({
        message: 'Block added successfully',
        blockchain: blockchainService.chain,
        isValid: blockchainService.validateIntegrity()
    });
};

/*----------------------------------
|   Get Blockchain Data           |
|   Retrieves the blockchain and  |
|   checks its validity           |
|----------------------------------*/
const getBlockchain = (req, res) => {
    res.status(200).send({
        blockchain: blockchainService.chain,
        isValid: blockchainService.validateIntegrity()
    });
};

/*----------------------------------
|   Validate Blockchain Integrity |
|   Check the integrity of the    |
|   blockchain and return the result|
|----------------------------------*/
const validateBlockchain = (req, res) => {
    const isValid = blockchainService.validateIntegrity();
    res.status(200).send({
        isValid: isValid,
        message: isValid ? 'Blockchain is valid' : 'Blockchain is invalid'
    });
};

/*----------------------------------
|   Export the controller methods |
|----------------------------------*/
module.exports = {
    addBlock,
    getBlockchain,
    validateBlockchain
};
