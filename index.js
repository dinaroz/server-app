const express = require("express");
const PORT = process.env.PORT || 3000;
const ws = require('ws');

const jsondata = require("./config/data.json");
const app = express();
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
    console.log('Welcome to the app :)');
    socket.on('message', (data) => {
        console.log(data)
        let message;

        try {
            message = JSON.parse(data);
        } catch (e) {
            sendError(socket, 'Wrong format');
            return;
        }
        wsServer.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws.OPEN) {
                switch (message.type) {
                    case 'FETCH-DATA':
                        const payload = JSON.stringify({ "status": "success", "jsonData": JSON.stringify(jsondata) });
                        client.send(payload);
                        break;
                    default:
                        null
                }
            } else {
                sendError(socket, 'Wrong format');
            }
        });
    });
});

const sendError = (socket, message) => {
    const messageObject = {
        type: 'ERROR',
        payload: message,
    };

    socket.send(JSON.stringify(messageObject));
};

app.use(express.static(__dirname + '/serverapp/public/dist'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/serverapp/public/dist/index.html');
});

const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});


