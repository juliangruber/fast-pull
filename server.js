var fs = require('fs');
var readdir = require('recursive-readdir');
var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var resolve = require('path').resolve;
var relative = require('path').relative;

module.exports = function(dir) {
  var clients = {};

  return function(req, res){
    var id = req.url.slice(1);
    if (!id) {
      res.statusCode = 404;
      return res.end('not found');
    }

    var client = clients[id];

    if (!client) {
      client = clients[id] = new Client(dir);
      client.once('error', function(err){
        res.statusCode = 500;
        return res.end(err.toString());
      });
    }

    client.ready(function(){
      var path = client.next();
      if (!path) {
        // TODO clean up savely
        res.statusCode = 404;
        return res.end('all done');
      }
      res.setHeader('x-path', relative(dir, path));
      fs.createReadStream(path).pipe(res);
    });
  }
};

function Client(dir){
  Emitter.call(this);
  this.files = null;
  this.loading = true;
  this.load(dir);
}

inherits(Client, Emitter);

Client.prototype.load = function(dir){
  var self = this;
  readdir(dir, function(err, files){
    if (err) self.emit('error', err);
    self.files = files;
    self.loading = false;
    self.emit('loaded');
  });
};

Client.prototype.next = function(){
  return this.files.pop();
};

Client.prototype.ready = function(fn){
  if (!this.loading) return setImmediate(fn);
  this.once('loaded', fn);
};

