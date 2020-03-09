require( '../../db.js' );
const fs = require('fs');
var mongoose = require('mongoose');
var Address = mongoose.model('Address');
// var web3 = require('./../../routes/web3relay').web3;
var Web3 = require('web3');
var rpc = "http://localhost:9646";
var web3 = new Web3(new Web3.providers.HttpProvider(rpc));

async function test(num){
  num = Number(num);
  let addresses = await Address.find({}).limit(num * 30).sort({balance:-1}).exec();
  let result = new Array(num+1);
  result.fill({addr:"",balance:0});
  for (let i = 0; i < addresses.length; i++) {
    let balance = web3.eth.getBalance(addresses[i].addr);
    balance = web3.fromWei(balance, "ether");
    let balancenum = Number(balance)
    result[num] = {addr:addresses[i].addr,balance:balancenum};
    console.log(i);
    for (let i = result.length - 1; i > 0; i--) {
      if (result[i].balance > result[i-1].balance) {
        let temp = result[i];
        result[i] = result[i-1];
        result[i-1] = temp
      } else {
        break;
      }
    }
    // console.log(addresses[i].addr, balancenum);
  }
  for (var i = 0; i < result.length; i++) {
    result[i]
    fs.appendFileSync('rich.txt', `${result[i].addr}  ${result[i].balance}
`);
  }
  console.log('finished');
}

test(process.argv[2])
