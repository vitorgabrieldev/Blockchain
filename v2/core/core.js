/*----------------------------------
|                                  |
|         Core Class               |
|   Handles blockchain & P2P       |
|                                  |
|----------------------------------*/

/*----------------------------------
|  Import required modules         |
|----------------------------------*/
const Blockchain = require('./src/models/block');
const P2P = require('./src/utils/p2p');
const blockchainService = require('./src/services/blockchainService');
const config = require('./config/config');

/*----------------------------------
|  Core class definition           |
|----------------------------------*/
class Core {
  /*----------------------------------
  |  Constructor - Initializes      |
  |  blockchain and P2P components  |
  |----------------------------------*/
  constructor() {
    this.blockchain = new Blockchain();
    this.p2p = new P2P(blockchainService);
    this.p2p.listen(6001);
    
    // Connect to an existing peer (e.g., external peer IP)
    if (config.peerPublic.length > 1) {
      this.p2p.connectToPeer(config.peerPublic);
    } else if(config.environment === "development") {
      console.error("ERROR: Host de peer pública não está configurado em 'core/config/config.js'.");
    }
  }

  /*----------------------------------
  |  Get blockchain instance        |
  |----------------------------------*/
  getBlockchain() {
    return this.blockchain;
  }

  /*----------------------------------
  |  Get list of connected peers    |
  |----------------------------------*/
  getPeers() {
    return this.p2p.getPeers();
  }

  /*----------------------------------
  |  Add a new block to the chain   |
  |----------------------------------*/
  addBlock(blockData) {
    return this.blockchain.addBlock(blockData);
  }
}

/*----------------------------------
|  Export the Core class for use   |
|----------------------------------*/
module.exports = Core;
