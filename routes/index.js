const AuthController = require('../controllers/AuthController');

const UserController = require('../controllers/UsersController');

const AppController = require('../controllers/AppController');

const includeRoutes = (app) => {
  app.get('/signin', AuthController.signIn);
  app.get('/logout', AuthController.logOut);
  app.post('/signup', AuthController.signUp);
  app.get('/notifications', UserController.getNotifications);
  app.get('/users', UserController.showUsers);
  app.post('/api/v1/sendRequest', UserController.sendRequest);
  app.post('/api/v1/acceptFriend', UserController.acceptRequest);
  app.post('/api/v1/rejectFriend', UserController.rejectRequest);
  app.get('/', AppController.homePage);
  app.get('/api/v1/chat/:name', AppController.getChat);
  app.post('/api/v1/chat/:name/send', AppController.sendMessage);
  app.get('/profile/:name', UserController.getProfile);
};

module.exports = includeRoutes;
