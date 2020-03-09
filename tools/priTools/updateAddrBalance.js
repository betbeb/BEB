//update from address balance from rich-list.txt
require( '../../db.js' );
var etherUnits = require("../../lib/etherUnits.js");
var Web3 = require('web3');

var mongoose = require( 'mongoose' );
var Address = mongoose.model('Address');

var  fs  = require("fs");
var rawFilePath = "./lessList.txt";//w 
var content = fs.readFileSync(rawFilePath, "utf8");
var rawAddrList = JSON.parse(content);//[addr,balance,addr,balance,...]
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9646"));

var index = -1;
var insertNum = 0;
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
    balance = Number(etherUnits.toEther(balance, 'wei'))
    Address.updateOne(
        {'addr': rawAddrList[index]}, 
        // {$setOnInsert: witnessDoc}, 
        // {upsert: true}, 
        {$set:{'balance':balance}}, 
        {multi: false, upsert: true}, 
        function (err, data) {
            if(err){
                console.log("Address.update err:", err);
                console.log("index:",index);
                finish();
                return;
            }
            insertNum++;
            setTimeout(updateNext, 150);
            
        }
);

//插入列表在数据库中不存在的新记录
    // Address.findOne({"addr":rawAddrList[index]}, (err, res)=>{
    //     if(err){
    //         console.log("index:",index);
    //         console.log("updateNext err: ", err);
    //         finish();
    //         return;
    //     }
    //     if(res==null){
    //         Address.collection.insertOne({"addr":rawAddrList[index], "type":0, "balance":rawAddrList[index+1]}, (insertErr, res)=>{
    //             if(insertErr){
    //                 console.log("index:",index);
    //                 console.log("insert err: ", insertErr);
    //                 finish();
    //                 return;
    //             }
    //             insertNum++;
    //             updateNext();
    //         })            
    //     }else{
    //         updateNext();
    //     }
    // });

}

function finish(){
    console.log("insertNum:", insertNum);
    console.log("update finish !");
    process.exit(0);
}

updateNext();