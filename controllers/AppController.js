/* eslint-disable max-len */
const AuthController = require('./AuthController');
const dbClient = require('../utils/db');
const UserController = require('./UsersController');

class AppController {
  static async homePage(req, res) {
    try {
      if (req.query['x-token'] && await AuthController.validateUser(req)) {
        const id = await AuthController.validateUser(req);
        const user = await UserController.getMe(id);
        res.status(200).render('chat.html', { friends: user.friends, user: user.username });
      } else {
        res.status(401).redirect('/signin');
      }
    } catch (error) {
      // Handle the promise rejection error here
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

  static async getChat(req, res) {
    try {
      if (req.query['x-token'] && await AuthController.validateUser(req)) {
        const user = await UserController.getMe(await AuthController.validateUser(req));
        const { name } = req.params;
        const { isActive } = dbClient.users.findOne({ username: name });
        const { messages } = await dbClient.messages.findOne({ ownerId: user._id });
        const msg = messages[name];
        res.status(200).send({ msg, stats: isActive });
      } else {
        res.status(401).redirect('/signin');
      }
    } catch (error) {
      // Handle the promise rejection error here
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

  static async sendMessage(req, res) {
    try {
      if (req.query['x-token'] && await AuthController.validateUser(req)) {
        const user = await UserController.getMe(await AuthController.validateUser(req));
        const userMessage = await dbClient.messages.findOne({ ownerId: user._id });
        const { name } = req.params;
        const { message } = req.body;
        const date = new Date();
        const user2 = await dbClient.users.findOne({ username: name });
        const user2Message = await dbClient.messages.findOne({ ownerId: user2._id });
        const data = {
          message,
          time: date.toDateString(),
          sent_by: user.username,
        };
        userMessage.messages[name].push(data);
        user2Message.messages[user.username].push(data);
        await dbClient.messages.updateOne({ ownerId: user._id }, { $set: { messages: userMessage.messages } });
        await dbClient.messages.updateOne({ ownerId: user2._id }, { $set: { messages: user2Message.messages } });
        res.status(201).send(data);
      } else {
        res.status(401).send({ error: 'Unauthorized' });
      }
    } catch (error) {
      // Handle the promise rejection error here
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = AppController;
