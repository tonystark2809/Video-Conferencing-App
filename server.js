const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

console.log("Started the server");

//room.ejs - embedded js basically html
//helps bring the variables from backend to frontend

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`); // redirecting to a unique room id using uuidv4 
})


app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room}); 
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log(`user with ${userId} connected to room ${roomId}`);
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        });
    });
});

server.listen(process.env.PORT || 3030); // Since we are going to use WEBRTC for peer to peer