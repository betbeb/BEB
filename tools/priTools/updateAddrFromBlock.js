//update from address balance from rich-list.txt
require( '../../db.js' );
var etherUnits = require("../../lib/etherUnits.js");
var Web3 = require('web3');
var mongoose = require( 'mongoose' );
var Address = mongoose.model('Address');
var Block = mongoose.model('Block');
var Transaction = mongoose.model('Transaction');
var Contract = mongoose.model('Contract');

var index = -1;
var insertNum = 0;

var fromBlock = 4438399;
var toBlock = 4619223;
var addrList = [];
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9646"));

function grabeMiner(){
    Block.find({"number":{$gt:fromBlock, $lt:toBlock}}, "miner").exec((err, docs)=>{
        if(err){
            console.log(err);
            return;
        }
        for(var i=0; i<docs.length; i++){
            if(addrList.indexOf(docs[i].miner) == -1){
                addrList.push(docs[i].miner);
            }
        }
        console.log("grabeMiner addrList len:",addrList.length);
        grabeAddrFromTX();
    })
}

function grabeAddrFromTX(){
    Transaction.find({"blockNumber":{$gt:fromBlock, $lt:toBlock}, "value":{$gt:0}}, "from to").exec((err, docs)=>{
        if(err){
            console.log(err);
            return;
        }
        for(var i=0; i<docs.length; i++){
            if(addrList.indexOf(docs[i].from) == -1){
                addrList.push(docs[i].from);
            }
            if(addrList.indexOf(docs[i].to) == -1){
                addrList.push(docs[i].to);
            }
        }
        console.log("grabeAddrFromTX addrList len:",addrList.length);
        grabeAddrFromContract();
    })
}

function grabeAddrFromContract(){
    Contract.find({"blockNumber":{$gt:fromBlock, $lt:toBlock}}, "address").exec((err, docs)=>{
        if(err){
            console.log(err);
            return;
        }
        for(var i=0; i<docs.length; i++){
            if(addrList.indexOf(docs[i].address) == -1){
                addrList.push(docs[i].address);
            }
        }
        console.log("grabeAddrFromContract addrList len:",addrList.length);
        updateNext();
    })
}


function updateNext(){
    index+=1;
    if(index%100==0){
        console.log("update index:", index);
    }
    if(index>=addrList.length){
        finish();
        return;
    }
    if(!addrList[index]){
        updateNext();
    }

    
    //更新列表中存在的地址
    var balance = web3.eth.getBalance(addrList[index]);
    Address.updateOne(
        {'addr': addrList[index]}, 
        // {$setOnInsert: witnessDoc}, 
        // {upsert: true}, 
        {$set:{'balance':Number(etherUnits.toEther(balance, 'wei'))}}, 
        {multi: false, upsert: true}, 
        function (err, data) {
            if(err){
                console.log("Address.update err:", err);
                console.log("index:",index);
                updateNext();
                return;
            }
            insertNum++;
            setTimeout(updateNext, 150);
        }
    );

}

function finish(){
    console.log("insertNum:", insertNum);
    console.log("update finish !");
    process.exit(0);
}

grabeMiner();