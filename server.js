const http = require('http');

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('content-type', 'text/plain');
    res.end('Hello, this is your Node.js server!\n');
});

const port = 3000;
server.listen(port, () => {
    console.log('Server running at http://localhost:${ port }/');
});