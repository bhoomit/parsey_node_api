var argv = require('yargs').argv;
var _ = require('lodash');
var grpc = require('grpc');
var PORT = argv.p;
var POS_SERVER = argv.s;

console.log("Connecting to Parsey API on %s", POS_SERVER);
var protoDescriptor = grpc.load({root: __dirname+'/api', file:'cali/nlp/parsey_api.proto'});

var service = new protoDescriptor.cali.nlp.ParseyService(POS_SERVER, grpc.credentials.createInsecure());

var url = require('url');

var http = require('http');
http.createServer(function (req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  if(typeof query.q == 'undefined' || query.q == '') {
    console.error("Query empty");
    res.end("Query is empty. Please pass query.");
    return;
  }
  console.log(query);
  service.parse([query.q], function(err, response) {
    if(err){
      res.writeHead(500);
      res.end('Something went wrong!');
      console.error(err)
    }
    try{
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(response));
    }catch(e){
      console.error(e)
      res.writeHead(500);
      res.end('Something went wrong!');
    }
  });
}).listen(PORT, '0.0.0.0');
console.log('Server listening at http://0.0.0.0:%d/', PORT);
console.log('Try GET http://0.0.0.0:%d/?q=<sentence>', PORT)
