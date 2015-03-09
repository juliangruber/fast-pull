#!/usr/bin/env node

var serve = require('../server');
var http = require('http');
var argv = require('minimist')(process.argv.slice(2));

var port = argv.port || argv.p || 8000;
var dir = argv.dir || argv.d || argv._[0] || '.';

var server = http.createServer(serve(dir));
server.listen(port, function(){
  console.log('Serving %s at http://localhost:%s/', dir, port);
});
