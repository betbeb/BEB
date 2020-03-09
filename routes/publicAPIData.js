#!u/sr/bin/env node
var http = require("http");
var eth = require("./web3relay").eth;
var filterBlocks = require('./filters').filterBlocks;
var witnessListData = require('./witnessListData');

var totalETZ = "totalETZ";
var health = "health";
var totalcapital = "totalcapital";
var balance = "balance";
var balancemulti = "balancemulti";

var txlist = "txlist";
var txlistinternal = "txlistinternal";
var getminedblocks = "getminedblocks";

var getabi = "getabi";
var getsourcecode = "getsourcecode";

var getstatus = "getstatus";
var gettxreceiptstatus = "gettxreceiptstatus";
var transactionlist = "transactionlist";

var getblockreward = "getblockreward";

var getLogs = "getLogs";

var masterNodeVer = "masterNodeVer";
var masternodeList = "masternodeList";

var eth_blockNumber = "eth_blockNumber";
var eth_getBlockByNumber = "eth_getBlockByNumber";
var eth_getBlockTransactionCountByNumber = "eth_getBlockTransactionCountByNumber";
var eth_getTransactionByHash = "eth_getTransactionByHash";
var eth_getTransactionByBlockNumberAndIndex = "eth_getTransactionByBlockNumberAndIndex";
var eth_getTransactionCount = "eth_getTransactionCount";
var eth_sendRawTransaction = "eth_sendRawTransaction";
var eth_getTransactionReceipt = "eth_getTransactionReceipt";
var eth_call = "eth_call";
var eth_getCode = "eth_getCode";
var eth_getStorageAt  = "eth_getStorageAt ";
var eth_gasPrice = "eth_gasPrice";
var eth_estimateGas = "eth_estimateGas";

var tokensupply = "tokensupply";
var tokenlist = "tokenlist";

var mongoose = require( 'mongoose' );
var Block = mongoose.model('Block');
var Transaction = mongoose.model('Transaction');
var Contract = mongoose.model('Contract');
var LogEvent = mongoose.model('LogEvent');
var Witness = mongoose.model('Witness');

function regAddress(address){
   if(address){
       address = address.toLowerCase();
       address = address.replace(/(^\s*)|(\s*$)/g, "");
       address = address.replace(/\"/g, "");
       if(address.indexOf("0x")!=0)
         address = "0x"+address;
   }
   return address;
}


function httpReq(url, cb){
	req = http.request(url, function(res) {
	var respData="";
	res.setEncoding('utf8');
	res.on('data', function(chunk) {
		if(cb)
			respData+=chunk;
		}).on('end', function() {
			if(cb){
				cb(respData);
			}
		}).on('error', function(err) {
			console.log(err.toString());
		});
		});
	req.on('error', function(err){
	console.log(err.toString());
	});
	req.end();
}

var requestParam = function(req, param){
  var p = req.query[param];
  if(!p){//try post method
    p = req.body[param];
  }
  return p;
}

var requestParamInt = function(req, param, defaultNum=0){
  var num = requestParam(req, param);
  if(isNaN(num)){
    return defaultNum;
  }
  return parseInt(num);
}

var requestParamNum = function(req, param, defaultNum=0){
  var num = requestParam(req, param);
  if(isNaN(num)){
    return defaultNum;
  }
  return Number(num);
}


module.exports = function(req, res){
//  console.log("publicAPI:"+req.client.remoteAddress+":"+req.originalUrl);
  res.header('Access-Control-Allow-Origin', '*');
  var respData = {"status":1,"message":"OK","result":""};
    try{
      methodName = req.query.methodName;
      if(!methodName)
        methodName = req.query.action;

      switch(methodName){
        case totalETZ:
          totalBlockNum = eth.blockNumber;
          onlyValue = requestParam(req, "onlyValue");
          value = 196263376+0.45*totalBlockNum;
          if(onlyValue){
            res.write(String(value));
            res.end();
          }else{
            sendData(res, respData, value);
          }
          break;
      	case health:
          res.write("I am ok!");
          res.end();
      	  break;
      	case totalcapital:
          totalBlockNum = eth.blockNumber;
          onlyValue = requestParam(req, "onlyValue");
          value = 196263376+0.45*totalBlockNum;
      	// {"status":0,,"data":{"time":1547621967,"period":86400,"last":"0.113554","open":"0.115308","close":"0.113554","high":"0.118053","low":"0.112","totalcapital":"18122.0096"}}
      	// {"status":1,"message":"OK","result":{"time":1547621967,"etzprice":"0.115308","currencyunit":"USD","totalcapital":"18122.0096"}}
      	  httpReq('http://api.bddfinex.com/market/ticker?market=ETZUSDT',(eventLogList)=>{
             eventLogList = JSON.parse(eventLogList);
             var ret ={};
        		ret.time=eventLogList.time;
        		ret.etzprice=eventLogList.data.last;
        		ret.currencyunit="USD";
        		ret.totalcapital=value*Number(ret.etzprice);
            		sendData(res, respData, ret);
        	})
      	  break;
        case balance:
          address = requestParam(req, "address");
          address = regAddress(address);
          if(address.length <= 18){
            if(address.length==18 && address.indexOf("0x")==0){
              address = address.substr(2);
            }
           Witness.findOne({"witness":address},"miner").exec((err, doc)=>{
              if(err)
                  responseFail(res, respData, err.toString());
              else{
                if(doc){
                  sendData(res, respData, eth.getBalance(doc.miner).toString());
                }else{
                  responseFail(res, respData, "no miner");
                }
              }
            })
          }else{
            sendData(res, respData, eth.getBalance(address).toString());
          }
          break;
        case balancemulti:
          addresses = requestParam(req, "address");
          addresses = addresses.split(",");
          if(addresses.length>20)
            addresses.length = 20;
          var arr = [];
          for(var i=0; i<addresses; i++){
            balanceObj = {"account":addresses[i],"balance":0};
            addresses[i] = regAddress(addresses[i]);
            balanceObj.balance = eth.getBalance(addresses[i]).toString();
            arr.push(balanceObj);
          }
          sendData(res, respData, arr);
          break;
        case txlist:
          address = requestParam(req, "address");
          address = regAddress(address);
          var pageSize = requestParamInt(req, "pageSize", 10);
          var transactionPage = requestParamInt(req, "page", 0);
          if(pageSize>100)
            pageSize = 100;

          transactionFind = Transaction.find({$or: [{"from": address}, {"to": address}]}).sort("-blockNumber").skip(transactionPage*pageSize).limit(pageSize).lean(true);
          transactionFind.exec(function (err, docs) {
            if(err)
              responseFail(res, respData, err.toString());
            else{
              sendData(res, respData, docs);
            }
          });
          break;
        case txlistinternal:
          address = requestParam(req, "address");
          address = regAddress(address);
          var transactionPage = requestParamInt(req, "page", 0);
          var pageSize = requestParamInt(req, "pageSize", 10);
          if(pageSize>100)
            pageSize = 100;
          transactionFind = Transaction.find({$or: [{"from": address}, {"to": address}], input:{$ne:"0x"}}).skip(transactionPage*pageSize).limit(pageSize).lean(true);
          transactionFind.exec(function (err, docs) {
            if(err)
              responseFail(res, respData, err.toString());
            else{
              sendData(res, respData, docs);
            }
          });
          break;
        case getminedblocks:
          address = requestParam(req, "address");
          address = regAddress(address);
          var page = requestParamInt(req, "page", 0);
          var pageSize = requestParamInt(req, "pageSize", 10);
          if(pageSize>100)
            pageSize = 100;

          var blockFind = Block.findOne( { "miner" : address }).skip(page*pageSize).limit(pageSize).lean(true);
          blockFind.exec(function (err, doc) {
              if (err) {
                responseFail(res, respData, err.toString());
              } else {
                sendData(res, respData, doc);
              }
          });
          break;

        case getabi:
          address = requestParam(req, "address");
          address = regAddress(address);
          Contract.findOne({'address':address}, "abi").exec(function(err, doc){
            if(err){
              responseFail(res, respData, err.toString());
            }else if(doc==null){
              respData.result = "";
              responseFail(res, respData, "not exist");
            }else{
              sendData(res, respData, doc.abi);
            }
          });
          break;
        case getsourcecode:
          address = requestParam(req, "address");
          address = regAddress(address);
          Contract.findOne({'address':address}, "sourceCode").exec(function(err, doc){
            if(err){
              responseFail(res, respData, err.toString());
            }else if(doc==null){
              respData.result = "";
              responseFail(res, respData, "not exist");
            }else{
              sendData(res, respData, doc.sourceCode);
            }
          });
          break;
        case getstatus:
          txhash = requestParam(req, "txhash");
          txhash = txhash.toLowerCase();
          txr = eth.getTransactionReceipt(txhash);
          if(txr){
            var data;
            if(txr.status == "0x0")
              data = {"isError":"1","errDescription":"Transaction fail"};
            else
              data = {"isError":"0","errDescription":"success"};
            sendData(res, respData, data);
          }else{
            responseFail(res, respData, "not exist");
          }
          break;
        case gettxreceiptstatus:
          txhash = requestParam(req, "txhash");
          txhash = txhash.toLowerCase();
          txr = eth.getTransactionReceipt(txhash);
          if(txr){
            var data;
            if(txr.status == "0x0")
              data = {"status":"0"};
            else
              data = {"isError":"1"};
            sendData(res, respData, data);
          }else{
            responseFail(res, respData, "not exist");
          }
          break;
        case transactionlist:
          address = requestParam(req, "address");
          address = regAddress(address);
          var transactionPage = requestParamInt(req, "page", 0);
          var pageSize = requestParamInt(req, "pageSize", 10);
          if(pageSize>100)
            pageSize = 100;
          transactionFind = Transaction.find({$or: [{"from": address}, {"to": address}]}).sort("-blockNumber").skip(transactionPage*pageSize).limit(pageSize).lean(true);
          transactionFind.exec(function (err, docs) {
            if(err)
              responseFail(res, respData, err.toString());
            else{
              sendData(res, respData, docs);
            }
          });
          break;
        case getblockreward:
          blockno = Number(requestParam(req, "blockno"));
          if(isNaN(blockno)){
            respData.result = "";
            responseFail(res, respData, "not exist");
          }else{
            blockData = eth.getBlock(blockno);
            if(blockData){
              var resultObj = {"blockReward":0.3375, "blockNumber":blockData.number, "timeStamp":blockData.timestamp ,"blockMiner":blockData.miner};
              sendData(res, respData, resultObj);
            }else{
              respData.result = 0;
              responseFail(res, respData, "not exist");
            }
          }
          break;
	  case getLogs:
            address = requestParam(req, "address");
            address = regAddress(address);
	          txHash = requestParam(req, "txHash");
            fromBlock = requestParamNum(req, "fromBlock", null);
            toBlock = requestParam(req, "toBlock");
            topics = requestParam(req, "topics");
            let topic_oprs = requestParam(req, "topic_oprs");
            data = requestParam(req, "data");
            returnFilters = requestParam(req, "returnFilters");
	          limitNum = requestParam(req, "limit");
            var sortStr = requestParam(req, "sort");
	          if(!fromBlock){
              responseFail(res, respData, "fromBlock is needed");
              return;
            }
            if(!address){
              responseFail(res, respData, "contract address is needed");
              return;
            }
	          findObj = {'address':address};
            if(txHash){
              if(txHash.indexOf("0x")!=0){
                txHash = "0x"+txHash;
              }
              findObj.txHash = txHash;
            }
	          if(fromBlock){
              findObj.blockNumber = {$gte:fromBlock};
            }
            if(toBlock){
	            if(toBlock == "latest")
                toBlock = eth.blockNumber;
              else
                toBlock = Number(toBlock);

              if(findObj.blockNumber)
                findObj.blockNumber.$lte = toBlock;
              else
                findObj.blockNumber = {$lte:toBlock};
            }
            if (topic_oprs && topics) {
              let oprs_arr = topic_oprs.split(",");
              let topicsArr = topics.split(",");
              let or_arr = []
              for(let n=0; n<topicsArr.length; n++){
                topicsArr[n] = topicsArr[n].trim();
                topicsArr[n] = topicsArr[n].toLowerCase();
              }
              for (let i = 0; i < oprs_arr.length; i++) {
                let opr_details = oprs_arr[i].split("_");
                let opr = opr_details.pop();
                if (opr == 'and') {
                  for (let i = 0; i < opr_details.length; i++) {
                    let topic_num = opr_details[i];
                    findObj["topics." + topic_num] = topicsArr[Number(topic_num)];
                  }
                } else if (opr == 'or') {
                  let or_topics = []
                  for (let i = 0; i < opr_details.length; i++) {
                    let topic_num = opr_details[i];
                    let or_topic = {}
                    or_topic["topics." + topic_num] = topicsArr[Number(topic_num)]
                    or_topics.push(or_topic)
                  }
                  or_arr.push({$or: or_topics})
                }
              }
              if (or_arr.length > 0) {
                findObj["$and"] = or_arr
              }
            } else if(topics){
              var topicsArr = topics.split(",");
              for(var n=0; n<topicsArr.length; n++){
                topicsArr[n] = topicsArr[n].trim();
                topicsArr[n] = topicsArr[n].toLowerCase();
                if(topicsArr[n]!="")
                  findObj["topics."+n] = topicsArr[n];
              }
            }
            if(data){
              findObj.data = data;
            }
            var findOP;
            if(returnFilters){
              returnFilters = returnFilters.split(",");
              returnFilters = returnFilters.join(" ");
              findOP = LogEvent.find(findObj, returnFilters).lean(true);
            }
            else
              findOP = LogEvent.find(findObj).lean(true);
	          if(sortStr)
              findOP.sort(sortStr);
            else
              findOP.sort("-blockNumber");
            if(limitNum)
              findOP = findOP.limit(Number(limitNum));

            findOP.exec(function(err, docs){
              if(err){
                responseFail(res, respData, err.toString());
              }else if(docs==null){
                respData.result = "";
                responseFail(res, respData, "no logs");
              }else{
                sendData(res, respData, docs)
              }
            });
            break;

          case eth_blockNumber:
            sendData(res, respData, eth.blockNumber);
            break;
          case eth_getBlockByNumber:
            blockNumber = requestParam(req, "blockNumber");
            if(blockNumber == "latest")
              blockNumber = eth.blockNumber;
            else
              blockNumber = Number(blockNumber);
            sendData(res, respData, eth.getBlock(blockNumber));
            break;
          case eth_getBlockTransactionCountByNumber:
            blockNumber = requestParam(req, "blockNumber");
            sendData(res, respData, eth.getBlockTransactionCount(blockNumber));
            break;
          case eth_getTransactionByHash:
            txhash = requestParam(req, "txhash");
            sendData(res, respData, eth.getTransaction(txhash));
            break;
          case eth_getTransactionByBlockNumberAndIndex:
            blockNumber = requestParam(req, "blockNumber");
            index = requestParamInt(req, "index", 0);
            sendData(res, respData, eth.getTransactionFromBlock(blockNumber, index));
            break;
          case eth_getTransactionCount:
            address = requestParam(req, "address");
            address = regAddress(address);
            sendData(res, respData, eth.getTransactionCount(address));
            break;
          case eth_sendRawTransaction:
            hex = requestParam(req, "hex");
            sendData(res, respData, eth.sendRawTransaction(hex));
            break;
          case eth_getTransactionReceipt:
            txhash = requestParam(req, "txhash");
            sendData(res, respData, eth.getTransactionReceipt(txhash));
            break;
          case eth_call:
            to = requestParam(req, "to");
            data = requestParam(req, "data");
            blockNumber = requestParam(req, "blockNumber");
            sendData(res, respData, eth.call({"to" : to, "data" : data}));
            break;
          case eth_getCode:
            address = requestParam(req, "address");
            address = regAddress(address);
            blockNumber = requestParam(req, "blockNumber");
            sendData(res, respData, eth.getCode(address, blockNumber));
            break;
          case eth_getStorageAt:
            address = requestParam(req, "address");
            address = regAddress(address);
            position = requestParamInt(req, "position");
            blockNumber = requestParam(req, "blockNumber");
            sendData(res, respData, eth.getStorageAt(address, position, blockNumber));
            break;
          case eth_gasPrice:
            sendData(res, respData, eth.gasPrice);
            break;
          case eth_estimateGas:
            var obj = {};
            from = requestParam(req, "from");
            if(from)
              obj.form = from;
            to  = requestParam(req, "to");
            if(to)
              obj.to = to;
            data = requestParam(req, "data");
            if(data)
              obj.data = data;

            sendData(res, respData, eth.estimateGas(obj));
            break;

          case tokensupply:
            contractaddress=requestParam(req, "contractaddress");
            Contract.findOne({'address':contractaddress}, "totalSupply").exec(function(err, doc){
              if(err){
                responseFail(res, respData, err.toString());
              }else if(doc==null){
                respData.result = "";
                responseFail(res, respData, "not exist");
              }else{
                sendData(res, respData, doc.totalSupply);
              }
            });
            break;
          case tokenlist:
            var page = requestParamInt(req, "page", 0);
            var pageSize = requestParamInt(req, "pageSize", 10);
            if(pageSize>100)
              pageSize = 100;
            var contractFind = Contract.find({ERC:{$gt:0}}, "-sourceCode -byteCode").skip(page*pageSize).limit(pageSize).lean(true);
            contractFind.exec(function (err, docs) {
              if(err){
                console.log("tokenlist getList err: ", err);
                responseFail(res, respData, err.toString());
              }else{
                sendData(res, respData, docs);
              }
            });
            break;
          case masterNodeVer:
            var blockFind = Block.find( { "timestamp":{$gt:1535731200}}).lean(true);
            blockFind.exec(function (err, docs) {
                if (err) {
                  responseFail(res, respData, err.toString());
                } else {
                  var keys = [];
                  var vers = [];
                  var percent = {};
                  var total = 0;
                  for(var j=0; j< docs.length; j++){
                    var block = docs[j];
                    if(!block.witness)
                      continue;
                    total++;
                    block = filterBlocks(block);
                    var ind = keys.indexOf(block.witness);
                    var ver = block.extraData.charCodeAt(3)+"."+block.extraData.charCodeAt(4)+"."+block.extraData.charCodeAt(5);
                    if(ind==-1){
                      keys.push(block.witness);
                      vers.push(ver);
                    }else{
                      vers[ind] = ver;
                    }
                    if(percent[ver]){
                      percent[ver]++;
                    }else{
                      percent[ver] = 1;
                    }
                  }
                  var respTable = "<table><tr><td>version</td><td>block num</td><td>percent</td></tr>"
                  for(var k in percent){
                    respTable+="<tr><td>"+k+"</td><td>"+percent[k]+"</td><td>"+100*percent[k]/total+"%</td></tr>"
                  }
                  respTable+="<tr><td> </td><td></td><td></td></tr> <tr><td>witness</td><td>version</td><td></td></tr>"
                  for(var n=0; n<keys.length; n++){
                    respTable+="<tr><td>"+keys[n]+"</td><td>"+vers[n]+"</td><td></td></tr>"
                  }
                  respTable+="</table>";
                  // sendData(res, respData, respTable);
                  res.write(respTable);
                  res.end();

                }
            });
            break;

          case masternodeList:
            var pageSize = requestParamInt(req, "pageSize", 9999999999);
            var transactionPage = requestParamInt(req, "page", 0);
            // if(pageSize>100)
            //   pageSize = 100;

            req.query.listFormat=1;
            req.query.totalPage = 1;
            req.query.page = transactionPage;
            req.query.pageSize = pageSize;
            witnessListData(req, res);
            break;


      }

    } catch (e) {
      responseFail(res, respData, e.toString());
      console.error(e);
    }
};

function sendData(res, respData, result){
  respData.result = result;
  res.write(JSON.stringify(respData));
  res.end();
}

function responseFail(res, respData, msg){
  respData.status = 0;
  respData.message = msg;
  res.write(JSON.stringify(respData));
  res.end();
}

module.exports.getTotalEtz = function(req, res){
  totalBlockNum = eth.blockNumber;
  respData = 196263376+0.45*totalBlockNum;
  res.write(String(respData));
  res.end();
}

module.exports.circulatingetz = function(req, res){
  totalBlockNum = eth.blockNumber;
  respData = 196263376+0.45*totalBlockNum;
  respData = respData*0.5;
  res.write(String(respData));
  res.end();
}

module.exports.getHealth = function(req, res){
  res.write("I am ok!");
  res.end();
}

module.exports.getTotalcapital = function(req, res){
  totalBlockNum = eth.blockNumber;
  onlyValue = requestParam(req, "onlyValue");
  value = 196263376+0.45*totalBlockNum;
  httpReq('http://api.bddfinex.com/market/ticker?market=ETZUSDT',(eventLogList)=>{
	eventLogList = JSON.parse(eventLogList);
 	console.log("eventLogList",eventLogList);
	totalcapital=value*Number(eventLogList.data.last);
  	res.write(String(totalcapital));
  	res.end();
})
}
