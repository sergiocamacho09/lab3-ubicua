const nodeFetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { json } = require("express");
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
let userObject = null;
//let messageList = [];

//app.use(express.static('www'));

io.on("connection", function (socket) {
  socket.on("newUser", (name) => {
    console.log("nuevo usuario: " + name + " en el socket " + socket.id);
    userObject = { name: name, id: socket.id };
    usersConnected.push(userObject);
    console.log(usersConnected);
  });

  socket.on("usersConnected", () => {
    socket.emit("userList", usersConnected);
  })

  socket.on("message_evt", (name, msg) => {
    //messageList.push({user: name , msg: msg});
    io.sockets.emit("message_evt", { name, msg });
  });

  socket.on("message_evt_private", (id, room, myId, msg) => {
    io.to(id).emit("message_evt_private", { room, from: myId, msg });
    io.to(myId).emit("message_evt_private_mine", { room, from: myId, msg });
  })

  socket.on("globalChat", (actualPage, name) => {
    socket.emit("inGlobalChat", actualPage, name);
  });

  socket.on("goHomePage", ()=>{
    console.log("Entra");
    socket.emit("isTrivial", false);
  })

  socket.on("disconnect", () => {
    console.log("Usuario desconectado del socket: " + socket.id);
    for (var i = 0; i < usersConnected.length; i++) {
      if (usersConnected[i].id === socket.id) {
        usersConnected.splice(i, 1);
      }
    }
  })

});


setInterval(function () {
  if (usersConnected.length > 0) {
    var selectUser = Math.floor(Math.random() * (usersConnected.length));
    let trivial = nodeFetch("https://opentdb.com/api.php?amount=1&category=29&difficulty=easy&type=multiple");

    trivial.then(res => res.json()).then(json => {
      
      io.to(usersConnected[selectUser].id).emit("trivial", json);
    })
  }
}, 70000);

server.listen(3001, () => console.log('server started'));