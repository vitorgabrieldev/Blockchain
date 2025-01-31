const generateHash = require('../utils/hash');

class Block {
    constructor(index, data, previousHash = '', timestamp = Date.now(), difficulty = 3) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.difficulty = difficulty;
        this.hash = this.generateBlockHash();
        this.nonce = 0;
    }

    generateBlockHash() {
        const data = this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce;
        return generateHash(data);
    }

    mineBlock() {
        let hash = this.generateBlockHash();
        console.log(`Mining Block ${this.index}...`);

        while (!hash.startsWith('0'.repeat(this.difficulty))) {
            this.nonce++;
            hash = this.generateBlockHash();
        }

        this.hash = hash;
        console.log(`Block ${this.index} mined successfully! Hash: ${hash}`);
    }
}

module.exports = Block;
