const Socket = require('socket.io');
const express = require('express');
const nunjucks = require('nunjucks');
const includeRoutes = require('./routes/index');
const dbClient = require('./utils/db');

const app = express();
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

function getKeyByValue(map, searchValue) {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) {
      return key;
    }
  }
  return null; // Return null if the value is not found in the map
}

global.onlineUsers = new Map();
global.onlineUsersGroup = new Map();
io.on('connection', (socket) => {
  global.chatSocket = socket;
  socket.on('add-user', async (user) => {
    await dbClient.users.updateOne({ username: user }, { $set: { isActive: true } })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line no-undef
    onlineUsers.set(user, socket.id);
  });

  socket.on('add-user-group', async (user) => {
    // eslint-disable-next-line no-undef
    onlineUsersGroup.set(user, socket.id);
  });

  socket.on('send-msg', (data) => {
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit('msg-recieved', data);
    }
  });

  socket.on('send-group-msg', async (data) => {
    const { members } = await dbClient.groups.findOne({ _id: data.id });
    for (const member of members) {
      if (member === data.sender) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const sendUserSocket = global.onlineUsersGroup.get(member);
      if (sendUserSocket) {
        io.to(sendUserSocket).emit('group-msg-recieved', data);
      }
    }
  });

  socket.on('disconnect', async () => {
    const user = getKeyByValue(global.onlineUsers, socket.id);
    if (user) {
      if (global.onlineUsers.has(user)) {
        global.onlineUsers.delete(user);
      }
      await dbClient.users.updateOne({ username: user }, { $set: { isActive: false } });
    }
  });
});
module.exports = { app, server };
