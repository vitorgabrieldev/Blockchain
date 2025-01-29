const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3000;

app.use(express.json());  // Middleware to parse JSON bodies

function generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

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

    displayChain() {
        return JSON.stringify(this.chain, null, 4);
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

const myBlockchain = new Blockchain();

// Endpoint to add a new block
app.post('/addBlock', (req, res) => {
    const data = req.body.data;
    if (!data) {
        return res.status(400).send('Data is required to add a block.');
    }

    myBlockchain.addBlock(data);
    res.status(200).send({
        message: 'Block added successfully',
        blockchain: myBlockchain.chain,
        isValid: myBlockchain.validateIntegrity()
    });
});

// Endpoint to view the entire blockchain
app.get('/getBlockchain', (req, res) => {
    res.status(200).send({
        blockchain: myBlockchain.chain,
        isValid: myBlockchain.validateIntegrity()
    });
});

// Endpoint to validate the blockchain's integrity
app.get('/validateBlockchain', (req, res) => {
    const isValid = myBlockchain.validateIntegrity();
    res.status(200).send({
        isValid: isValid,
        message: isValid ? 'Blockchain is valid' : 'Blockchain is invalid'
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Blockchain API running at http://localhost:${port}`);
});
