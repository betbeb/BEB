var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var Block = new Schema(
{
    "number": {type: Number, index: {unique: true}},
    "hash": String,
    "parentHash": String,
    "nonce": String,
    "sha3Uncles": String,
    "logsBloom": String,
    "transactionsRoot": String,
    "stateRoot": String,
    "receiptRoot": String,
    "miner": String,
    "difficulty": String,
    "totalDifficulty": String,
    "size": Number,
    "extraData": String,
    "gasLimit": Number,
    "gasUsed": Number,
    "timestamp": {type: Number, index: true},
    "uncles": [String],
    "txs": [String],//same with transactions
    "witness": {type: String, index: true}
});

//master node Info
var Witness = new Schema(
    {
        "blocksNum": Number,//mine block count
        "lastCountTo": Number,//block height
        "witness": {type: String, index: {unique: true}},
        "version": {type: String, index: true},
        "status":Boolean,
        "hash":String,
        "reward":Number,
        "miner":String,
        "timestamp": Number

    });

var Contract = new Schema(
{
    "address": {type: String, index: {unique: true}},
    "blockNumber": Number,
    "ERC":{type: Number, index: true},//0:normal contract 2:ERC20, 3:ERC223
    "creationTransaction": String,
    "contractName": String,
    "tokenName": String,
    "symbol": String,
    "owner": String,
    "decimals": Number,
    "totalSupply": Number,
    "balance": Number,
    "compilerVersion": String,
    "optimization": Boolean,

    "description": String,
    "logoUrl": String,
    "timestamp": Number,

    "sourceCode": String,
    "abi": String,
    "byteCode": String
}, {collection: "Contract"});

var Transaction = new Schema(
{
    "hash": {type: String, index: {unique: true}},
    "nonce": Number,
    "blockHash": String,
    "blockNumber": {type: Number, index: true},
    "transactionIndex": Number,
    "status":Number,
    "from": {type: String, index: true},
    "to": {type: String, index: true},
    "value": String,
    "gas": Number,
    "contractAddress":String,
    "gasUsed":Number,
    "gasPrice": String,
    "timestamp": {type: Number, index: true},
    "input": String,
    "witness": String
});

var InerTransaction = new Schema(
    {
        "hash": {type: String},
        "from": {type: String, index: true},
        "to": {type: String, index: true},
        "value": String,
        "timestamp": Number,
        "blockNumber": {type: Number}
    });

var TokenTransfer = new Schema(
    {
        "transactionHash": {type: String, index: {unique: true}},
        "blockNumber": Number,
        "methodName": String,
        "amount": Number,
        "contractAdd": String,
        "to": String,
        "from": String,
        "timestamp": Number
    });
mongoose.model('TokenTransfer', TokenTransfer);
var TokenTransferClass = mongoose.model('TokenTransfer');


var LogEvent = new Schema(
    {
        "address": {type: String, index: true},
        "txHash": {type: String, index: true},
        "blockNumber": {type: Number, index: true},
        "contractAdd": String,//same with address
        "timestamp": Number,
        "methodName": String,
        "eventName": String,
        "from": String,
        "to": String,
        "logIndex": Number,
        "topics": Array,
        "data": String,

        "gasUsed":Number,
        "gasPrice": Number
    });
mongoose.model('LogEvent', LogEvent);

//all address
var Address = new Schema(
    {
        "addr": {type: String, index: {unique: true}},
        "type": {type: Number, index: true},//0:normal 1:contract 2:masternode
        "balance": Number
    });
mongoose.model('Address', Address);

mongoose.model('Block', Block);
mongoose.model('Contract', Contract);
mongoose.model('Transaction', Transaction);
mongoose.model('InerTransaction', InerTransaction);
mongoose.model('Witness', Witness);
module.exports.Block = mongoose.model('Block');
module.exports.Contract = mongoose.model('Contract');
module.exports.Transaction = mongoose.model('Transaction');
module.exports.InerTransaction = mongoose.model('InerTransaction');
module.exports.TokenTransfer = TokenTransferClass;
module.exports.Witness = Witness;
module.exports.LogEvent = mongoose.model('LogEvent');
module.exports.Address = mongoose.model('Address');

// mongoose.connect( 'mongodb://localhost/blockDB' );
mongoose.connect('mongodb://127.0.0.1:27017/blockDB',{useMongoClient:true})
mongoose.Promise = global.Promise;
mongoose.set('debug', false);
