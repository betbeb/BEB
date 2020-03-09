require( '../../db.js' );

var mongoose = require( 'mongoose' );
var Block     = mongoose.model( 'Block' );
var Transaction = mongoose.model( 'Transaction' );
var LogEvent = mongoose.model('LogEvent');
var Witness = mongoose.model('Witness');
var Address = mongoose.model('Address');
var Contract = mongoose.model('Contract');
var TokenTransfer = mongoose.model('TokenTransfer');
var InerTransaction = mongoose.model('InerTransaction');

//删除指定Transaction
// Transaction.collection.deleteOne({'hash':'0x30c0291c1d311360fe778544d1cabc0b6547cac6bc8d9b200793713bea168bed'},function(err){console.log(err)});
// Transaction.collection.deleteOne({'hash':'0xb8e1087aac24e15a3b69bbc11abc885fc2ad1c1222b41f4dcd10b009527430ce'},function(err){console.log(err)});
// Transaction.collection.deleteOne({'hash':'0xa622d37d71cb0bb11659ab47757d23bfee325a836529c84f5f7814a3512ed41d'},function(err){console.log(err)});

//删除指定Contract
// Contract.collection.deleteOne({'address':'0xe7070707fcf115557fa4d0f4410d4964d5b25ebb'},function(err){console.log(err)});

//删除制定TokenTransfer
// TokenTransfer.collection.deleteOne({'hash':'0x30c0291c1d311360fe778544d1cabc0b6547cac6bc8d9b200793713bea168bed'},function(err){console.log(err)});

//删除指定区块的所有记录
var removeSomeBlock = function(blockNumber){
    Block.collection.remove({"number":blockNumber}, function(err){console.log(err)});
    Transaction.collection.remove({"blockNumber":blockNumber}), function(err){console.log(err)};
    TokenTransfer.collection.remove({"blockNumber":blockNumber}, function(err){console.log(err)});
    Contract.collection.remove({"blockNumber":blockNumber}, function(err){console.log(err)});
    LogEvent.collection.remove({"blockNumber":blockNumber}, function(err){console.log(err)});
    InerTransaction.collection.remove({"blockNumber":blockNumber}, function(err){console.log(err)});
}

var clearDB= function(){
//全部清除
    Transaction.collection.remove({});
    TokenTransfer.collection.remove({});
    Contract.collection.remove({});
    Block.collection.remove({});
    LogEvent.collection.remove({});
    Address.collection.remove({})
    InerTransaction.collection.remove({})
}

// removeSomeBlock(5607035);
// clearDB();