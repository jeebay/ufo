var http = require('http'); //includes the http package 
var url = require('url'); //includes the url package
var fs = require('fs');

//start the server
var server = http.createServer().listen(3000);//listens for traffic on port 3000

//create an HTTP server that expects both request and response objects
//as the two arguments to a callback 
server.on('request', function(request, response){ 
    var urlObj = url.parse(request.url); 
    var path = urlObj.pathname;

    if (urlObj.query) {
        var queryArray = urlObj.query.split('&').map(function(searchQuery){
            return searchQuery.split('=');
        }); //dissect the url 
        queryArray.forEach(function(query){
            if (query[0] === "location") {
                query[1] = query[1].replace(/\,/,', ');
            }
        });
    }

    console.log(queryArray);

    if(path==="/" && !(urlObj.query)){
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write('<!DOCTYPE html><html lang="en"><head></head>');
        response.write('<body><h1>You\'ve arrived to the UFO sightings API</h1></body>');
        response.write('<p>You search by location, date, shape and id</p>');
        response.write('<p>Ex. /?location=Henderson,NV&shape=Sphere&date=7-17-2015&id=2</p>')
        response.write('</html>');
        response.end();
    }else if (path==="/" && urlObj.query){
        var sightingsText = fs.readFileSync("newsightings.json",'utf8');
        var sightingsDB = JSON.parse(sightingsText);
        var matchList = [];
        
        console.log(sightingsDB.length);
        
        sightingsDB.forEach(function(sighting){
            var matches = 0;
            for (var i = 0; i < queryArray.length; i++) {
                var queryTerm = queryArray[i][0];
                if (sighting[queryTerm]===queryArray[i][1]) {
                    matches++;
                    console.log(matches);
                }
            }
            if (matches === queryArray.length) {
                matchList.push(sighting);
            }
        });
        if (matchList.length > 0) {
            response.writeHead(200, { 'Content-Type': 'text/json' });
            response.write(JSON.stringify(matchList));
            response.end();
        } else {
            response.writeHead(400, { 'Content-Type': 'text/html' });
            response.write('Bad Request');
            response.end();    
        }
    }
    else{
        response.writeHead(400, { 'Content-Type': 'text/html' });
        response.write('Bad Request');
        response.end();
    }

});