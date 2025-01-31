/*----------------------------------
|                                  |
|          Block Class             |
|    Represents a block in the     |
|    blockchain and contains the   |
|    logic for hashing and mining  |
|                                  |
|----------------------------------*/

/*----------------------------------
|  Import Hashing Utility         |
|  This utility function is used  |
|  to generate hashes for blocks |
|----------------------------------*/
const generateHash = require('../utils/hash');

/*----------------------------------
|   Block Class                   |
|   Constructor initializes a block|
|   with properties like index,   |
|   data, previous hash, timestamp|
|----------------------------------*/
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

    /*----------------------------------
    |   Generate Block Hash           |
    |   This method creates the hash  |
    |   for the block using the block |
    |   properties and nonce value    |
    |----------------------------------*/
    generateBlockHash() {
        const data = this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce;
        return generateHash(data);
    }

    /*----------------------------------
    |   Mine the Block                |
    |   The mining process involves   |
    |   trying different nonces until |
    |   the block hash starts with a  |
    |   defined number of leading zeros|
    |----------------------------------*/
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

/*----------------------------------
|   Export the Block Class        |
|   Make the Block class available|
|   for use in other parts of the  |
|   application                   |
|----------------------------------*/
module.exports = Block;
