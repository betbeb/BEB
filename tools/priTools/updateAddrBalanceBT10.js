//update from address balance from rich-list.txt
require('../../lib/consoleTimestamp.js');
require( '../../db.js' );
var etherUnits = require("../../lib/etherUnits.js");
var Web3 = require('web3');

var mongoose = require( 'mongoose' );
var Address = mongoose.model('Address');

var  fs  = require("fs");
var rawFilePath = "./rich-list-10.txt";//w 
var content = fs.readFileSync(rawFilePath, "utf8");
var rawAddrList = JSON.parse(content);//[addr,balance,addr,balance,...]
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9646"));

var index = -2;
var insertNum = 0;
function updateNext(){
    index+=2;
    if(index%100==0){
        console.log("update index:", index);
    }
    if(index>=rawAddrList.length){
        finish();
        return;
    }

    var balanceInList = rawAddrList[index+1];
    //数据库中地址的balance不等于balanceInList，并且balanceInList大于10，则从节点更新balance
    Address.findOne({"addr":rawAddrList[index]}, "-_id balance").exec((err,doc)=>{
        if(err){
            console.log("Address.findOne err:", err);
            console.log("index:",index);
            finish();
            return;
        }
        if(!doc || Number(etherUnits.toEther(doc.balance, 'wei')) != balanceInList){
            //更新列表中存在的地址
            var balance = web3.eth.getBalance(rawAddrList[index]);
            if(balance<10000000000000000000){
                updateNext();
                return;
            }

            Address.updateOne(
                {'addr': rawAddrList[index]}, 
                {$set:{'balance':Number(etherUnits.toEther(balance, 'wei'))}}, 
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
        }else{
            updateNext();
        }
    })
            


}

function finish(){
    console.log("insertNum:", insertNum);
    console.log("update finish !");
    process.exit(0);
}

updateNext();