# Blockchain - V2 Project

![Blockchain Image](docs/blockchain.jpg)

## Project Overview

The **Blockchain - V2** project is an enhanced decentralized blockchain system designed to integrate **Artificial Intelligence (AI)** for optimization and analysis. It expands upon the **Blockchain - V1**, which primarily focused on building the core functionalities like peer-to-peer networking, block validation, and synchronization.

This version introduces cutting-edge features such as **AI optimization** for energy consumption, **smart contract automation**, and **predictive analytics** for blockchain behavior.

## Timeline: Blockchain Versions

### Blockchain - V2 (Current Version)

- **Key Features**:
  - Integration of **AI** for energy consumption optimization.
  - Implementation of **smart contracts** for transaction automation.
  - **Predictive analytics** using machine learning models.
  - Optimized **consensus mechanisms** (e.g., Proof of Stake).
  - Scalability improvements for supporting decentralized applications (dApps).

### Blockchain - V1 (Previous Version)

- **Key Features**:
  - **Peer-to-peer (P2P) network** with decentralized nodes.
  - **Block creation and validation** mechanism based on a standard consensus protocol.
  - **Peer synchronization** and management for a stable network.
  - Core blockchain functionality: adding blocks to the chain, validating transactions, and maintaining consistency across nodes.

## V2 Features

### AI Integration

The AI component focuses on optimizing the blockchain's energy consumption by analyzing the network's behavior and predicting future resource needs. This feature aims to reduce the energy consumption of **Proof of Work** or **Proof of Stake** processes by adapting the network's behavior intelligently.

### Smart Contracts

In **V2**, smart contracts will automate transactions and enforce rules within the blockchain, eliminating the need for intermediaries. These contracts will be used for various applications, such as token transfers, agreements, and conditional execution.

### Consensus Mechanism Optimization

The V2 blockchain introduces a more energy-efficient consensus mechanism that could be based on **Proof of Stake (PoS)** or a **hybrid model** with AI-driven decision-making to adjust parameters based on network demand.

### Predictive Analytics

AI models will analyze transaction data and blockchain metrics to predict network congestion, energy spikes, and potential security risks. This will help in proactive decision-making for optimizing blockchain performance.

### Learn More About Blockchain and AI:

1. **IBM Blockchain**: 
   - Learn how blockchain technology is transforming industries and how it can be applied to various sectors, from financial services to supply chains.
   - [Explore IBM Blockchain](https://www.ibm.com/think/topics/blockchain?mhsrc=ibmsearch_a&mhq=blockchain)

2. **IBM Blockchain and AI**: 
   - Discover how AI can enhance blockchain solutions by providing predictive analytics, improving efficiency, and enabling automated decision-making.
   - [Explore Blockchain and AI by IBM](https://www.ibm.com/think/topics/blockchain-ai)


<br><br>

## Prerequisites
Ensure you have the following installed on your system:

| Technology | Description | Download Link |
|------------|-------------|---------------| 
|Node.js (v18 LTS Recommended)| JavaScript runtime required to execute the blockchain system. | [Download](https://nodejs.org/pt/blog/release/v18.12.0) |

**Clone the Repository:**
```
git clone https://github.com/vitorgabrieldevk/Blockchain.git
cd Blockchain
```

**Install Dependencies:**
```
npm install
```
ou
```
yarn install
```

#

> 💡 **Note:** Regardless of whether you are going to use the v1 or v2 model, you will need to have an instance/peer already running on the blockchain.

### Configuring the first instance:

**V1**
  **index.js will have the function:**
```
  p2p.connectToPeer('ws://00.000.000.000:6001');
```

> 📌 **INFO:** Comment or remove it from the code to start the first instance!

**And then in the next instance created, pass the IP of the first one with the prefix ws:// and the pre-configured port (by default: 6001) into the function.**

### **Within the v2 model, just remove the PeerPublic value within the file:**
```
  /v2/core/config/config.js
```

> 📌 **INFO:** The reason it is necessary to remove it in the first instance is because using this IP it connects to the peer network, but since it is the first peer to create the network, there is no way to connect yet.

#

**Running Blockchain - V1**
```
cd v1
node index.js
```

**Running Blockchain - V2**
```
cd v2
node index.js
```

### Endpoints:

## API Endpoints  

> 📌 **INFO:** Endpoint rules and parameters can change, consult directly in the route definition files.!

**V1:**

| Method | Endpoint | Description |
|--------|---------|-------------|
| **POST** | `/addBlock` | Adds a new block to the blockchain. |
| **GET** | `/getBlockchain` | Retrieves the full blockchain. |
| **GET** | `/validateBlockchain` | Validates the integrity of the blockchain. |
| **GET** | `/peers` | Returns the list of peers connected to the network. |

**V2:**

| Method | Endpoint | Description |
|--------|---------|-------------|
| **POST** | `/add-block` | Adds a new block to the blockchain. |
| **GET** | `/get-chain` | Retrieves the full blockchain. |
| **GET** | `/validate-chain` | Validates the integrity of the blockchain. |
| **GET** | `/get-peers` | Returns the list of peers connected to the network. |