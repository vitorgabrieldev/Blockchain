const blockchainService = require('../services/blockchainService');
const P2P = require('../utils/p2p');

const p2p = new P2P(blockchainService);

const addBlock = (req, res) => {
    const data = req.body.data;

    if (!data) {
        return res.status(400).send('Data is required to add a block.');
    }

    blockchainService.addBlock(data);
    
    p2p.broadcastBlock(blockchainService.chain[blockchainService.chain.length - 1]);
    
    res.status(200).send({
        message: 'Block added successfully',
        blockchain: blockchainService.chain,
        isValid: blockchainService.validateIntegrity()
    });
};

const getBlockchain = (req, res) => {
    res.status(200).send({
        blockchain: blockchainService.chain,
        isValid: blockchainService.validateIntegrity()
    });
};

const validateBlockchain = (req, res) => {
    const isValid = blockchainService.validateIntegrity();
    res.status(200).send({
        isValid: isValid,
        message: isValid ? 'Blockchain is valid' : 'Blockchain is invalid'
    });
};

module.exports = {
    addBlock,
    getBlockchain,
    validateBlockchain
};
