const Socket = require('socket.io');
const express = require('express');
const nunjucks = require('nunjucks');
const includeRoutes = require('./routes/index');

const app = express();
// Configure Nunjucks as the template engine
nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
includeRoutes(app);

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Listening on port 8000');
});

const io = Socket(server, {
  cors: {
    origin: 'http://localhost:8000',
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on('connection', (socket) => {
  global.chatSocket = socket;
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-recieved', data.msg);
    }
  })
});
module.exports = { app, server };
