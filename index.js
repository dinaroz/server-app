const express = require("express");
const PORT = process.env.PORT || 3000;
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
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

app.use(cors());
//configure body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//configure body-parser ends here
app.use(morgan("dev")); // configire morgan
// define first route
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/serverapp/public/dist/index.html');
});
// app.get('/',  express.static('./public/dist'));

const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});


