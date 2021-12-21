// Firstly, we create a Express server then use it to initialize a socket.io server

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./helper/formatDate')
const {
  getActiveUser,
  exitRoom,
  newUser,
  getIndividualRoomUsers
} = require('./helper/userHelper');

const app = express(); // calls for the module and line
const server = http.createServer(app); // calls for the calls for http module. It creates the server using the express module. 
const io = socketio(server); // 

  // with the socket server instance initialized, we can now emit and listen to events between the server and client. In our code, we started by listening to a joinRoom event from the client. This event handles the following: A new client joining a room/The general message broadcasted when new users connect/Current users in a room.

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// this block will run when the client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = newUser(socket.id, username, room);

    socket.join(user.room);

    // General welcome
    socket.emit('message', formatMessage("WebCage", 'Messages are limited to this room! '));

    // Broadcast everytime users connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage("WebCage", `${user.username} has joined the room`)
      );

    // Current active users and room name
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getIndividualRoomUsers(user.room)
    });
  });

 // Next, the server listens for the client messages. Here, the server emits the client message to the current room. Note: Rooms are server-only. 

  // Listen for client message
  socket.on('chatMessage', msg => {
    const user = getActiveUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

 // We run this when client exit a room. It will remove the current user from the room and update the list of active users

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = exitRoom(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage("WebCage", `${user.username} has left the room`)
      );

      // Current active users and room name
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getIndividualRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));