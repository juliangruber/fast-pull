#!/usr/bin/env node

var pull = require('../client');
var argv = require('minimist')(process.argv.slice(2));
var assert = require('assert');

var opts = {
  destination: argv.destionation || argv.d || process.cwd(),
  remote: argv.remote || argv.r || argv._[0]
};

pull(opts, function(){
  console.log('done');
});
