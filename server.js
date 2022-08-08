const express = require('express')
const http = require("http");
const socketio = require('socket.io');
const path = require("path");
const formatMessage = require("./utils/messages");



//SET UP EXPRESS 
const app = express()
//Create server connection
const server = http.createServer(app);
//Socket connection
const io = socketio(server);
//STATIC PATH
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/chat.html'));
})

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/gameboard.html'));
})

// SOCKET.IO
io.on("connection", (socket) => {
    console.log(io.of("/").adapter);
    socket.on("joinRoom", ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
  
      socket.join(user.room);
  
      // Welcome current user
      socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));
  
      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(botName, `${user.username} has joined the chat`)
        );
  
      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    });
  
    // Listen for chatMessage
    socket.on("chatMessage", (msg) => {
      const user = getCurrentUser(socket.id);
  
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

      // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

//PORT CONECTION
const PORT = process.env.PORT || 8080;
//DATA PARSE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//INITIAL GET REQUEST


//LISTENING FUNCTION
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT)
});