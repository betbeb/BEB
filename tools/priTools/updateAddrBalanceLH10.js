//update from address balance from rich-list.txt
require( '../../db.js' );
var etherUnits = require("../../lib/etherUnits.js");
var Web3 = require('web3');

var mongoose = require( 'mongoose' );
var Address = mongoose.model('Address');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9646"));
var rawAddrList = [];
var index = -1;
var insertNum = 0;

function getAddrLH10(){
    Address.find({"balance":{$lt:10}}, "-_id addr").exec((err, docs)=>{
        if(err){
            console.log(err);
            process.exit(9);
            return;
        }
        for(var i=0; i<docs.length; i++){
            rawAddrList.push(docs[i].addr);
        }

        updateNext();
    })
}

function updateNext(){
    index+=1;
    if(index%100==0){
        console.log("update index:", index);
    }
    if(index>=rawAddrList.length){
        finish();
        return;
    }

    
    //更新列表中存在的地址
    var balance = web3.eth.getBalance(rawAddrList[index]);
    Address.updateOne(
        {'addr': rawAddrList[index]}, 
        {$set:{'balance':Number(etherUnits.toEther(balance, 'wei'))}}, 
        {multi: false, upsert: false}, 
        function (err, data) {
            if(err){
                console.log("Address.update err:", err);
                console.log("index:",index);
                finish();
                return;
            }
            insertNum++;
            setTimeout(updateNext, 120);
            // updateNext();
        }
    );

}

function finish(){
    console.log("insertNum:", insertNum);
    console.log("update finish !");
    process.exit(0);
}

getAddrLH10();