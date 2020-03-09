//add timestamp for console.log()
module.exports = (function() { //add timestamp to console.log and console.error(from http://yoyo.play175.com)
    var date = new Date();
  
    function timeFlag() {
        date.setTime(Date.now());
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        return '[' + ((m < 10) ? '0' + m : m) + '-' + ((d < 10) ? '0' + d : d) +
            ' ' + ((hour < 10) ? '0' + hour : hour) + ':' + ((minutes < 10) ? '0' + minutes : minutes) +
            ':' + ((seconds < 10) ? '0' + seconds : seconds) + '.' + ('00' + milliseconds).slice(-3) + '] ';
    }
    var log = console.log;
    console.error = console.log = function() {
        var prefix = ''; //cluster.isWorker ? '[WORKER '+cluster.worker.id + '] ' : '[MASTER]';
        if (typeof(arguments[0]) == 'string') {
            var first_parameter = arguments[0]; //for this:console.log("%s","str");
            var other_parameters = Array.prototype.slice.call(arguments, 1);
            log.apply(console, [prefix + timeFlag() + first_parameter].concat(other_parameters));
        } else {
            var args = Array.prototype.slice.call(arguments);
            log.apply(console, [prefix + timeFlag()].concat(args));
        }
    }
  })();
