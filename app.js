#!/usr/bin/env node
//add timestamp for console.log()
// (function() { //add timestamp to console.log and console.error(from http://yoyo.play175.com)
//     var date = new Date();
//
//     function timeFlag() {
//         date.setTime(Date.now());
//         var m = date.getMonth() + 1;
//         var d = date.getDate();
//         var hour = date.getHours();
//         var minutes = date.getMinutes();
//         var seconds = date.getSeconds();
//         var milliseconds = date.getMilliseconds();
//         return '[' + ((m < 10) ? '0' + m : m) + '-' + ((d < 10) ? '0' + d : d) +
//             ' ' + ((hour < 10) ? '0' + hour : hour) + ':' + ((minutes < 10) ? '0' + minutes : minutes) +
//             ':' + ((seconds < 10) ? '0' + seconds : seconds) + '.' + ('00' + milliseconds).slice(-3) + '] ';
//     }
//     var log = console.log;
//     console.error = console.log = function() {
//         var prefix = ''; //cluster.isWorker ? '[WORKER '+cluster.worker.id + '] ' : '[MASTER]';
//         if (typeof(arguments[0]) == 'string') {
//             var first_parameter = arguments[0]; //for this:console.log("%s","str");
//             var other_parameters = Array.prototype.slice.call(arguments, 1);
//             log.apply(console, [prefix + timeFlag() + first_parameter].concat(other_parameters));
//         } else {
//             var args = Array.prototype.slice.call(arguments);
//             log.apply(console, [prefix + timeFlag()].concat(args));
//         }
//     }
// })();

require( './db' );

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();
app.set('port', process.env.PORT || 8080);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// app libraries
global.__lib = __dirname + '/lib/';

//allow custom header and CORS
app.all('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    
    if (req.method == 'OPTIONS') {
      res.send(200); /让options请求快速返回/
    }
    else {
      next();
    }
  });

// client

app.get('/', function(req, res) {
  res.render('index');
});
require('./routes')(app);

// let angular catch them
app.use(function(req, res) {
  res.render('index');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//var io = require('socket.io')(http);
// web3socket(io);

var http = require('http').Server(app);
http.listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
