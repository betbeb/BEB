//给console.log()增加时间戳
(function() { //add timestamp to console.log and console.error(from http://yoyo.play175.com)
    var date = new Date();
  
    function timeFlag() {
        date.setTime(Date.now());
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        return '[' + ((m < 10) ? '0' + m : m) + '-' + ((d < 10) ? '0' + d : d) +
            ' ' + ((hour < 10) ? '0' + hour : hour) + ':' + ((minutes < 10) ? '0' + minutes : minutes) +
            ':' + ((seconds < 10) ? '0' + seconds : seconds) + '.' + ('00' + milliseconds).slice(-3) + '] ';
    }
    var log = console.log;
    console.error = console.log = function() {
        var prefix = ''; //cluster.isWorker ? '[WORKER '+cluster.worker.id + '] ' : '[MASTER]';
        if (typeof(arguments[0]) == 'string') {
            var first_parameter = arguments[0]; //for this:console.log("%s","str");
            var other_parameters = Array.prototype.slice.call(arguments, 1);
            log.apply(console, [prefix + timeFlag() + first_parameter].concat(other_parameters));
        } else {
            var args = Array.prototype.slice.call(arguments);
            log.apply(console, [prefix + timeFlag()].concat(args));
        }
    }
  })();
  
  /**
 * collect transactions, Token Contracts info from blockchain . write to db
 */
require( '../../db.js' );
var etherUnits = require("../../lib/etherUnits.js");
var BigNumber = require('bignumber.js');
var fs = require('fs');
var Web3 = require('web3');
var web3;
var mongoose = require( 'mongoose' );
var Block     = mongoose.model( 'Block' );
var Transaction     = mongoose.model( 'Transaction' );
var Contract     = mongoose.model( 'Contract' );
var TokenTransfer = mongoose.model( 'TokenTransfer' );
var Address = mongoose.model( 'Address' );
var LogEvent = mongoose.model( 'LogEvent' );
var Witness = mongoose.model( 'Witness' );

const SMART_ERCABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"}/*,{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}*/];
const ERC20ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"}];
const ERC20_METHOD_DIC = {"0xa9059cbb":"transfer", "0xa978501e":"transferFrom"};
const socailAddr = "0x4761977f757e3031350612d55bb891c8144a414b";//社区自治奖励地址
const METHOD_DIC = {
    "0x930a61a57a70a73c2a503615b87e2e54fe5b9cdeacda518270b852296ab1a377":"Transfer(address,address,uint)",
    "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b":"transfer(address,uint256)",
    "0xa978501e4506ecbd340f6e45a48ac5bd126b1c14f03f2210837c8e0b602d4d7b":"transferFrom(address,address,uint)",
    "0x086c40f692cc9c13988b9e49a7610f67375e8373bfe7653911770b351c2b1c54":"approve(address,uint)",
    "0xf2fde38b092330466c661fc723d5289b90272a3e580e3187d1d7ef788506c557":"transferOwnership(address)",
    "0x3bc50cfd0fe2c05fb67c0fe4be91fb10eb723ba30ea8f559d533fcd5fe29be7f":"Released(address,uint)",
    "0xb21fb52d5749b80f3182f8c6992236b5e5576681880914484d7f4c9b062e619e":"Released(address indexed, uint indexed)"
};

var  fs  = require("fs");
var rawFilePath = "./blockWitness.txt";
var content = fs.readFileSync(rawFilePath, "utf8");
var witnessMap = JSON.parse(content);//{blockNumber:witness}

//modify according to your actual situation.
var config3 = {
    "httpProvider":"http://localhost:9646",
    // "httpProvider":"http://etzrpc.org:80",
    "patchStartBlocks":7595453,//contain patchStartBlocks
    "patchEndBlocks":7690561+1,//"latest",//5485123,//600//not contain patchEndBlocks
    "quiet": true,
    "terminateAtExistingDB": false
};




var grabBlock3 = function() {
    var desiredBlockHashOrNumber = currentBlock;

        Block.findOne({"number":desiredBlockHashOrNumber}).lean(true).exec((error, blockData)=>{
            if(blockData.witness){
                tryNextBlock();
                return;
            }
            blockData.witness = witnessMap[blockData.number+""];
            if(!blockData.witness){
                tryNextBlock();
                return;
            }
            if(error) {
                console.log('Warning: error on getting block with hash/number: ' + desiredBlockHashOrNumber + ': ' + error);
                tryNextBlock();
            }
            else if(blockData == null) {
                console.log('Warning: null block data received from the block with hash/number: ' + desiredBlockHashOrNumber);
                tryNextBlock();
            }
            else {
                if('terminateAtExistingDB' in config3 && config3.terminateAtExistingDB === true) {
                    
                }
                else {
                    writeBlockToDB3(blockData);
                }
                if (!('skipTransactions' in config3 && config3.skipTransactions === true))
                    writeTransactionsToDB3(blockData);
                else{
                    tryNextBlock();
                }
            }
        });
}


var updateNum = 0;
var writeBlockToDB3 = function(blockData) {
    //update witness reward
    Witness.update({"witness":blockData.witness},
    {$set:{"lastCountTo":blockData.number, "hash":blockData.hash, "miner":blockData.miner, "timestamp":blockData.timestamp, "status":true}, 
    $inc:{"blocksNum":1, "reward":0.3375}},
    {upsert: true},
    function (err, data) {
        if(err)
            console.log("err:", err);
        Block.update(
            {"number":blockData.number},
            {$set:{"witness":blockData.witness}},
            {upsert: false},
            function (uErr, uData) {
                updateNum++;
                if(updateNum %100==0)
                    console.log(blockData.number, ":", blockData.witness);
            }
        )
    }
    );
}


/**
    Break transactions out of blocks and write to DB
**/
var pingTXAddr = "0x000000000000000000000000000000000000000a";
var pingTXValue = "0";
var writeTransactionsToDB3 = function(blockData) {
    var n = 0;
    if (blockData.txs && blockData.txs.length > 0) {
        for(var i=0; i<blockData.txs.length; i++){
            Transaction.update({"blockNumber":blockData.number},
            {$set:{"witness":blockData.witness}},
            {upsert: false},
            function(err, data){
                n++;
                if(n==blockData.txs.length){
                    tryNextBlock();
                }
            }) 
        }
              
    }else{
         //patch next block recursively
         tryNextBlock();
    }
}

/*
  Patch Missing Blocks
*/
var patchBlocks3 = function() {
    currentBlock = config3.patchEndBlocks+1;
    console.log("topBlock:",currentBlock);
    tryNextBlock();
}

var sleepFlag = 0;
var tryNextBlock = function() {
    currentBlock--
    sleepFlag++;
    //console.log("block number:", currentBlock);
    if(currentBlock>=config3.patchStartBlocks){
        if(sleepFlag>3){
            sleepFlag = 0;
            setTimeout(grabBlock3, 100);
        }else{
            grabBlock3();
        }
        
    }else{
        console.log("【finish path !】:", config3.patchEndBlocks);
        console.log("update num:",updateNum);
        mongoose.disconnect();
    }

}

var currentBlock;

patchBlocks3();
