/**
 * get all Address from TX
 */
require( '../../db.js' );
var etherUnits = require("../../lib/etherUnits.js");
var Web3 = require('web3');
var web3;
var mongoose = require('mongoose');
var Address = mongoose.model('Address');
var Transaction = mongoose.model('Transaction');
var Contract = mongoose.model('Contract');

//==================config===============
var startBlockNumber = -1;//上次采集高度
var topBlockNumber=3833592+1;//本次采集高度
var rpc = "http://localhost:9646";

var contractAddrs =[];
var masternodeAddrs = [];
var addressItems = [];
var pageSize = 100;
var page = 0;

// // init bloom filter
// var bloomFilter = require('../../lib/BloomFilter.js');
// let bFilter = new bloomFilter({
//     nHash:10,
//     nBits:1024*32
// });

function getAddrFromTX(_cbs){
    Address.find({}, "addr -_id").lean(true).sort({"addr":1}).skip(page*pageSize).limit(pageSize).exec(function(err, docs){
        console.log("getAddrFromTX deal page:", page);
        if(err){
            console.log("getAddrFromTX err:", err);
            console.log("deal stop");
            process.exit(9);
            return;
        }
        if(!docs || docs.length==0){
            console.log("all address collect finish");
            console.log("all address Len:", addressItems.length);
            if(_cbs.length>0)//nextInsertBatch;
                _cbs.shift()(_cbs);
            
            return;
        }

        for(var i=0; i<docs.length; i++){
            addressItems.push(docs[i].addr);
        }
        page++;
        getAddrFromTX(_cbs);        
    });
}

var itemBatchSize = 100;
var batchIdex = -1;
var batchItems = [];
var itemIndex = -1;
function nextInsertBatch(){
    batchItems.length = 0;
    batchIdex++;
    console.log("nextInsertBatch index:", batchIdex);
    for(var i=0; i<itemBatchSize; i++){
        itemIndex++;
        if(itemIndex>=addressItems.length){
            break;
        }
        // var addrItem = {"addr":addressItems[itemIndex], "type":2, "balance":0};
        // addrItem.balance = web3.eth.getBalance(addrItem.addr);
        // if(contractAddrs.indexOf(addrItem.addr)>-1){//contract addr
        //     addrItem.type = 1;
        // }else if(masternodeAddrs.indexOf(addrItem.addr>-1)){
        //     addrItem.type = 2;
        // }
        // batchItems.push(addrItem);

        batchItems.push(addressItems[itemIndex]);
    }
    
    if(batchItems.length>0){
        insertDB();
    }else{
        console.log("total items:", addressItems.length);
        console.log("【insert finish !】");
        process.exit(0);
    }
}

function insertDB(){
    console.log("insert db. batchItems len:",batchItems.length);
    if(batchItems.length==0){
        nextInsertBatch();
    }else{
        updateAddr = batchItems.pop();
        var balance = web3.eth.getBalance(updateAddr);
        Address.update(
            {'addr': updateAddr}, 
            // {$setOnInsert: witnessDoc}, 
            // {upsert: true}, 
            {$set:{'balance':Number(etherUnits.toEther(balance, 'wei'))}}, 
            {multi: false, upsert: false}, 
            function (err, data) {
                if(err)
                    console.log(err);
                
                insertDB();
            }
          );
    }
}



function getContractAddrs(_cbs){
    Contract.find({}, "address -_id").exec(function(err, docs){
        if(err){
            console.log("getContractAddrs err:",err);
            process.exit(9);
            return;
        }
        for(var i=0; i<docs.length; i++){
            contractAddrs.push(docs[i].address);
        }
        console.log("contract len:", docs.length);
        if(_cbs.length>0)
            _cbs.shift()(_cbs);
    })
}

function getMasternodeAddrs(_cbs){
    MasternodeAddrs.find({}, "addr -_id").exec(function(err, docs){
        if(err){
            console.log("getMasternodeAddrs err:",err);
            process.exit(9);
            return;
        }
        for(var i=0; i<docs.length; i++){
            masternodeAddrs.push(docs[i].addr);
        }
        console.log("masternodeAddrs len:", docs.length);
        if(_cbs.length>0)
            _cbs.shift()(_cbs);
    })
}

function startDeal(_cbs){
    web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    if(!web3.isConnected()){
        console.log("web3 connect fail !");
        process.exit(9);
        return;
    }
    if(_cbs.length>0)
        _cbs.shift()(_cbs);
}

var cbs = [/*getContractAddrs, getMasternodeAddrs, */getAddrFromTX, nextInsertBatch];
startDeal(cbs);