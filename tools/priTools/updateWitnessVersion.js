require( '../../db.js' );
var mongoose = require('mongoose');
var Witness = mongoose.model('Witness');
var Block = mongoose.model('Block');

var hex2ascii = function (hexIn) {
    var hex = hexIn.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

async function test(){
  let witnesses = await Witness.aggregate([{$lookup:{from:"blocks",localField:"lastCountTo",foreignField:"number",as: "block"}}]).exec()
  for (var i = 0; i < witnesses.length; i++) {
    let extraData = hex2ascii(witnesses[i].block[0].extraData);
    if (extraData && extraData.length > 5) {
      // console.log(extraData);
      let version = extraData.charCodeAt(3)+"."+extraData.charCodeAt(4)+"."+extraData.charCodeAt(5);
      // console.log(witnesses[i].witness, version);
      // console.log(witnesses[i].witness, version);
      await Witness.update({"witness":witnesses[i].witness},
        {$set:{"version": version}}
      ).exec()
    }
  }
  console.log("finished");
}

test()
