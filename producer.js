var connect = require('amqp').createConnection();
var EventEmitter = require("events").EventEmitter;
var readline = require('readline');

var ee = new EventEmitter();
var messages = [];
var rl = readline.createInterface(process.stdin, process.stdout),
    prefix = 'FQ (type `q` for exit)> ';

rl.on('line', function(line) {
  switch(line.trim()) {
    case 'q':
      bye();
      break;
    default:
      console.log('I\'m sending `' + line.trim() + '` to queue `hello`');
      messages.push(line.trim());
      ee.emit("sendmessage");
      break;
  }
  rl.setPrompt(prefix, prefix.length);
  rl.prompt();
}).on('close', function() {
  bye();
});

function bye () {
  console.log('Bye bye');
  process.exit(0);
}

console.log(prefix + 'Start sending some message.');
rl.setPrompt(prefix, prefix.length);
rl.prompt();


connect.on('ready', function() {
    var ex = connect.exchange();
    var q = connect.queue('hello');
    q.on('queueDeclareOk', function(args) {
        q.bind('#');
        q.on('queueBindOk', function() {
          ex.publish('hello', 'start messaging...', {});
        });

        ee.on("sendmessage", function () {
          messages.forEach(function(message) {
              ex.publish('hello', message, {});
          });
        });

    });
});
