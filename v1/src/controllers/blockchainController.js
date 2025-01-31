const blockchainService = require('../services/blockchainService');

const addBlock = (req, res, p2p) => {
    const data = req.body.data;

    if (!data) {
        return res.status(400).send('Data is required to add a block.');
    }

    blockchainService.addBlock(data);
    
    // Agora p2p é passado corretamente
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
