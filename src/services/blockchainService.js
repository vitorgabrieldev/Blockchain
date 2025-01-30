const Block = require('../models/block');

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
    }

    createGenesisBlock() {
        return new Block(0, 'Genesis Block', '0');
    }

    addBlock(data) {
        const previousBlock = this.chain[this.chain.length - 1];
        const newBlock = new Block(previousBlock.index + 1, data, previousBlock.hash);
        newBlock.mineBlock();
        this.chain.push(newBlock);
    }

    validateIntegrity() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.previousHash !== previousBlock.hash) return false;
            if (currentBlock.hash !== currentBlock.generateBlockHash()) return false;
        }
        return true;
    }
}

const blockchain = new Blockchain();

module.exports = blockchain;
