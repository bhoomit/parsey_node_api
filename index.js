var _ = require('lodash');
var grpc = require('grpc');

var protoDescriptor = grpc.load({root: __dirname+'/api', file:'cali/nlp/parsey_api.proto'});

var service = new protoDescriptor.cali.nlp.ParseyService("localhost:9000", grpc.credentials.createInsecure());

var url = require('url');

var http = require('http');
http.createServer(function (req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  if(typeof query.q == 'undefined' || query.q == '') {
    res.end("Query is empty. Please pass query.");
    return;
  }
  service.parse([query.q], function(err, response) {
    try{
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(response));
    }catch(e){
      console.log(e)
      res.writeHead(500);
      res.end('Something went wrong!');
    }
  });
}).listen(9001, '127.0.0.1');
console.log('Server running at http://127.0.0.1:9001/');
console.log('Try GET http://127.0.0.1:9001/?q=<sentence>')
