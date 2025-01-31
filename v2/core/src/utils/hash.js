/*----------------------------------
|                                  |
|      Hash Generation Utility    |
|   This utility is responsible    |
|   for generating SHA-256 hashes  |
|   based on input data.           |
|                                  |
|----------------------------------*/

/*----------------------------------
|    Import Crypto Module         |
|    The `crypto` module is used  |
|    to generate cryptographic    |
|    hashes using various algorithms|
|    (in this case, SHA-256).      |
|----------------------------------*/
const crypto = require('crypto');

/*----------------------------------
|    Generate Hash Function       |
|    This function generates a    |
|    SHA-256 hash from the input  |
|    `data` and returns it as a   |
|    hexadecimal string.          |
|----------------------------------*/
function generateHash(data) {
    return crypto.createHash('sha256')
        .update(data)
        .digest('hex');
}

/*----------------------------------
|    Export the Function          |
|    Export the `generateHash`    |
|    function so it can be used   |
|    in other modules throughout  |
|    the application.             |
|----------------------------------*/
module.exports = generateHash;
