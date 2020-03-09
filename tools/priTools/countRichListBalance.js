//update from address balance from rich-list.txt
require( '../../db.js' );
var mongoose = require( 'mongoose' );
var Address = mongoose.model('Address');

var  fs  = require("fs");
var rawFilePath = "./rich-list-100.txt";//w 
var content = fs.readFileSync(rawFilePath, "utf8");
var rawAddrList = JSON.parse(content);//[addr,balance,addr,balance,...]

var totalETZ = 0;
for(var i=0; i<rawAddrList.length; i+=2){
    totalETZ+=rawAddrList[i+1];
}
console.log("totalETZ:",totalETZ);