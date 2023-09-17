const uuid4 = require('uuid').v4;
const sha1 = require('sha1');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AuthController {
  static async signIn(req, res) {
    if (req.headers.authorization) {
      let user = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf8');
      user = { email: user.split(':')[0], password: sha1(user.split(':')[1]) };
      const availavleUser = await dbClient.users.findOne({
        email: { $eq: user.email },
      });
      if (!availavleUser) {
        res.status(401).send({ error: `${user.email} does not exits` });
      } else if (availavleUser.password !== user.password) {
        res.status(401).send({ error: 'Password incorrect' });
      } else {
        const token = uuid4();
        await redisClient.set(`auth_${token}`, availavleUser._id.toString(), 24 * 60 * 60);
        res.status(200).send({ success: token });
      }
    } else {
      res.render('login.html');
    }
  }

  static async signUp(req, res) {
    const { email } = req.body;
    const { password } = req.body;
    const { username } = req.body;

    if (!email) {
      res.status(400).send({ error: 'Missing email' });
    } else if (!password) {
      res.status(400).send({ error: 'Missing password' });
    } else if (!username) {
      res.status(400).send({ error: 'Missing username' });
    } else {
      try {
        const availableUser = await dbClient.users.findOne({ email: { $eq: email } });
        if (availableUser) {
          res.status(400).send({ error: 'Already exist' });
        } else {
          const hashedPassword = sha1(password);
          const newUser = await dbClient.users.insertOne({
            email,
            username,
            password: hashedPassword,
            friends: [],
            friendRequest: [],
            pendingRequests: [],
            notifications: [],
          });
          await dbClient.messages.insertOne({
            ownerId: newUser.insertedId,
            messages: {},
          });
          const token = uuid4();
          await redisClient.set(`auth_${token}`, newUser.insertedId.toString(), 24 * 60 * 60);
          res.status(201).send({ success: token });
        }
      } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
      }
    }
  }

  static async validateUser(req) {
    const token = req.query['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    return userId;
  }

  static async logOut(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      await redisClient.del(`auth_${req.query['x-token']}`);
      res.status(200);
    } else {
      res.status(401).redirect('/signin');
    }
  }
}

module.exports = AuthController;
