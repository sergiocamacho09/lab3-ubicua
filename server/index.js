const express = require('express');
const app = express();
const server = require("http").Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let usersConnected = [];
let messageList = [];

//app.use(express.static('www'));

io.on("connection", function (socket) {
  socket.on("newUser", (data) => {
    console.log("nuevo usuario: " + data);
    usersConnected.push(data);
    console.log(usersConnected);
  });

  socket.on("usersConnected", () =>{
    socket.emit("userList", usersConnected);
  })

  socket.on("message_evt",(name, msg) => {
    messageList.push({user: name , msg: msg});
    socket.broadcast.emit("message_evt", messageList);
  });

});

server.listen(3000, () => console.log('server started'));