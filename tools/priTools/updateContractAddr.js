//update from address balance from rich-list.txt
require('../../lib/consoleTimestamp.js');
require( '../../db.js' );
var etherUnits = require("../../lib/etherUnits.js");
var Web3 = require('web3');

var mongoose = require( 'mongoose' );
var Address = mongoose.model('Address');
var Contract = mongoose.model('Contract');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9646"));
var contractAddrs = [];

var index = -1;
var insertNum = 0;
function updateNext(){
    index+=1;
    if(index%10==0){
        console.log("update index:", index);
    }
    if(index>=contractAddrs.length){
        finish();
        return;
    }

    
    //更新合约地址的type和balance
    var balance = web3.eth.getBalance(contractAddrs[index]);
    Address.updateOne(
        {'addr': contractAddrs[index]}, 
        {$set:{'type':1, 'balance':Number(etherUnits.toEther(balance, 'wei'))}}, 
        {multi: false, upsert: true}, 
        function (updateErr, data) {
            if(updateErr){
                console.log("Address.update err:", updateErr);
                console.log("index:",index);
                finish();
                return;
            }
            insertNum++;
            setTimeout(updateNext, 150);
        }
    );
            


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

function finish(){
    console.log("insertNum:", insertNum);
    console.log("update finish !");
    process.exit(0);
}

getContractAddrs([updateNext]);