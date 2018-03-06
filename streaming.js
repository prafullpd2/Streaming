var http = require('http');
var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

var PORT = process.env.OPENSHIFT_NODEJS_PORT || 8080|| process.env.PORT||3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'))
  });

app.get('/video', function (req,res) {
    const link = 'assets/sample.mkv';
    //const link = path.join(__dirname, 'assets/sample.mp4');
    const stat = fs.statSync(link);
    const fileSize = stat.size;
    const range = req.headers.range;
    console.log("range : ",range);

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(link, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
        console.log('Piping',parts,start,end,chunksize);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(link).pipe(res)
        console.log('in else part');
    }


});
//process.env.PORT

app.listen(PORT, server_ip_address, function () {
    console.log('Listening on server '+server_ip_address+' on port '+PORT);
  })