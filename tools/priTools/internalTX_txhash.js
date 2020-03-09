//update from address balance from rich-list.txt
require( '../../db.js' );
var Web3 = require('web3');
var etherUnits = require("../../lib/etherUnits.js");
var BigNumber = require('bignumber.js');
var mongoose = require( 'mongoose' );
var Transaction = mongoose.model('Transaction');
var InerTransaction = mongoose.model('InerTransaction');
var fromBlock = 1;
var toBlock = 8204323;//查询结束区块（不包含本身）
var txhashList = [];
var internalPage = 0;
var pageSize = 500;
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9646"));


function quereyTX(){//
    var transactionFind = Transaction.find({blockNumber:{$lt:toBlock, $gt:fromBlock}, input:{$ne:"0x"}}, "hash blockNumber timestamp").sort({"blockNumber":1}).skip(internalPage*pageSize).limit(pageSize).lean(true);
    transactionFind.exec((err, docs)=>{
        if(err!=null || docs.length==0){
            finish();
            return;
        }
        txhashList.length = 0;
        for(var i=0; i<docs.length; i++){
            txhashList.push({"hash":docs[i].hash, "blockNumber":docs[i].blockNumber, "timestamp":docs[i].timestamp});
        }
        getInternalTx();
    })
}

function getInternalTx(){
    if(txhashList.length==0){//采集数据库里下一页的交易的内部交易
        internalPage++;
        console.log("采集进度,internalPage：",internalPage);
        quereyTX();
        return;
    }
    if(txhashList.length % 100 == 0){
        console.log(txhashList.length);
    }
    var txObj = txhashList.shift();
    var receiptData = web3.eth.getTransactionReceipt(txObj.hash);
    //跳过异常
    if(!receiptData || !receiptData.intxs || receiptData.intxs.length==0){
        setTimeout(getInternalTx, 200);
        return;
    }
    
    //插入数据库
    var innerTxItems = [];
    for(var i=0; i<receiptData.intxs.length; i++){
        innerTxItems.push({"hash":receiptData.transactionHash,"from":receiptData.intxs[i].from, "to":receiptData.intxs[i].to, "value":etherUnits.toEther(receiptData.intxs[i].value, 'wei'), 
        "blockNumber":txObj.blockNumber, "timestamp":txObj.timestamp})
    }
    InerTransaction.collection.insert(innerTxItems, function( err, tx ){
        if ( typeof err !== 'undefined' && err ) {
            if (err.code == 11000) {
                console.log('Skip: Duplicate key ' + err);
            } else {
                console.log('innerTxs Error: Aborted due to error: ' + err);
            }
        } else{
            //console.log('DB successfully written for innerTxs ' + tx.toString() );
        }
        setTimeout(getInternalTx, 200);
    });    
}

function finish(){
    console.log("[finish]");
    process.exit(0);
}

function countTX(){
    var transactionFind = Transaction.count({blockNumber:{$lt:blockHeight}, input:{$ne:"0x"}});
    transactionFind.exec((err, num)=>{
        console.log("total innerTx:", num);
    })
}

// countTX();
quereyTX();