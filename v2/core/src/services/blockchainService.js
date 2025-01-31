/*----------------------------------
|                                  |
|         Blockchain Class         |
|    Manages the blockchain chain, |
|    including adding blocks,      |
|    validating integrity, and     |
|    creating the genesis block.   |
|                                  |
|----------------------------------*/

/*----------------------------------
|    Import Block Model           |
|    The Block model is used to   |
|    create and manage blocks in  |
|    the blockchain.              |
|----------------------------------*/
const config = require('../../config/config');
const Block = require('../models/block');

/*----------------------------------
|   Blockchain Class              |
|   This class handles the entire |
|   blockchain, including the    |
|   chain array, adding blocks,  |
|   validating integrity, and    |
|   generating the genesis block. |
|----------------------------------*/
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = config.difficulty;                  
    }

    /*----------------------------------
    |    Create Genesis Block        |
    |    This method creates the first |
    |    block in the blockchain, the  |
    |    "genesis" block. The previous |
    |    hash is set to '0' since there |
    |    is no block before it.        |
    |----------------------------------*/
    createGenesisBlock() {
        return new Block(0, 'Genesis Block', '0');
    }

    /*----------------------------------
    |    Add Block to Blockchain     |
    |    This method adds a new block |
    |    to the blockchain. It mines  |
    |    the block and appends it to |
    |    the chain.                   |
    |----------------------------------*/
    addBlock(data) {
        const previousBlock = this.chain[this.chain.length - 1];
        const newBlock = new Block(previousBlock.index + 1, data, previousBlock.hash);
        newBlock.mineBlock();
        this.chain.push(newBlock);
    }

    /*----------------------------------
    |    Validate Blockchain Integrity|
    |    This method checks the integrity|
    |    of the blockchain by verifying |
    |    that each block's previous hash|
    |    matches the hash of the previous|
    |    block and that each block's hash|
    |    is correctly generated.       |
    |----------------------------------*/
    validateIntegrity() {
        for (let i = 1; i < this.chain.length; i++) {
            let currentBlock = Object.assign(new Block(), this.chain[i]);
            let previousBlock = this.chain[i - 1];

            if (currentBlock.previousHash !== previousBlock.hash) return false;
            if (currentBlock.hash !== currentBlock.generateBlockHash()) return false;
        }
        return true;
    }
}

/*----------------------------------
|   Initialize Blockchain         |
|   Create a new instance of the  |
|   Blockchain class. This can be |
|   used to start a new blockchain|
|----------------------------------*/
const blockchain = new Blockchain();

/*----------------------------------
|   Export the Blockchain Instance|
|   Export the blockchain instance|
|   so it can be used in other parts|
|   of the application.           |
|----------------------------------*/
module.exports = blockchain;
