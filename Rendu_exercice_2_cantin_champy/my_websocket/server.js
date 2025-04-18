// server.js (serveur HTTP + WebSocket)
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
        } else {
            res.writeHead(200);
            res.end(content);
        }
    });
});

const wss = new WebSocket.Server({ server });

wss.on('connection', socket => {
    socket.send('Bienvenue dans le chat !');
    // récupère le message envoyé par le client via socket.send
    socket.on('message', msg => {
        // affiche le message pour chaque client
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    });
});

server.listen(3000, () => {
    console.log('Serveur en écoute sur http://localhost:3000');
});


