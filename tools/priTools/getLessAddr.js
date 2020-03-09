//update from address balance from rich-list.txt
require( '../../db.js' );
var mongoose = require( 'mongoose' );
var Address = mongoose.model('Address');

var  fs  = require("fs");
var rawFilePath = "./fullAddrList.txt";//w 
var content = fs.readFileSync(rawFilePath, "utf8");
var rawAddrList2 = JSON.parse(content);
var rawAddrList = []
for(var i=0; i<rawAddrList2.length; i++){
    if(rawAddrList.indexOf(rawAddrList2[i])==-1){
        rawAddrList.push(rawAddrList2[i]);
    }
}

rawFilePath = "./topAddr100.txt";
content = fs.readFileSync(rawFilePath, "utf8");
var topList = JSON.parse(content);
var lessList = [];
for(var i=0; i<rawAddrList.length; i++){
    if(topList.indexOf(rawAddrList[i])==-1){
        lessList.push(rawAddrList[i]);
    }
}



console.log(rawAddrList.length);
console.log(topList.length);
console.log(lessList.length);
fs.writeFileSync("./lessList.txt", JSON.stringify(lessList), "utf8")
process.exit(0);