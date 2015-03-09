var request = require('hyperquest');
var assert = require('assert');
var fs = require('fs');
var join = require('path').join;
var mkdirp = require('mkdirp');
var dirname = require('path').dirname;
var concat = require('concat-stream');

module.exports = function (opts, cb) {
  assert(opts, 'options required');
  assert(opts.remote, '.remote required');
  assert(opts.destination, '.destination required');

  var id = Math.random().toString(16).slice(2);
  var concurrency = opts.concurrency || 5;

  function connect(){
    request(opts.remote + '/' + id, function(err, res){
      if (err) {
        // TODO
        console.error(err);
        return connect();
      }
      if (res.statusCode == 404) return;
      if (String(res.statusCode)[0] == '5') {
        res.pipe(concat(function(message){
          // TODO
          console.error(new Error(message));
          connect();
        }));
        return;
      }
      var path = res.headers['x-path'];
      var localPath = join(opts.destination, path);
      res.pause();

      // TODO cache
      mkdirp(dirname(localPath), function(err){
        var file = fs.createWriteStream(localPath);
        res.pipe(file);
        file.on('close', connect);
        res.resume();
      });
    });
  }

  for (var i = 0; i < concurrency; i++) connect();
};

