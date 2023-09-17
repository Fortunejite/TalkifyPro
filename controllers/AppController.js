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
        res.status(200).send({ messages: await dbClient.messages.find({ users: [user.user.username, name] }) });
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
        const { name } = req.params;
        const { message } = req.body;
        const date = new Date();
        const data = {
          message,
          time: date.toDateString(),
          users: [user.user.username, name],
          sent_by: user.username,
        };
        await dbClient.messages.insertOne(data);
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
