// Import necessary modules and utilities
const uuid4 = require('uuid').v4; // uuid4 generates unique IDs
const sha1 = require('sha1'); // sha1 is a cryptographic hashing function
const redisClient = require('../utils/redis'); // redisClient is a Redis database client utility
const dbClient = require('../utils/db'); // dbClient is a MongoDB database client utility

// Define the AuthController class
class AuthController {
  // Controller for user sign-in
  static async signIn(req, res) {
    if (req.headers.authorization) {
      // Extract user credentials from the request headers
      let user = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf8');
      user = { email: user.split(':')[0], password: sha1(user.split(':')[1]) };
      // Check if the user exists in the database
      const availavleUser = await dbClient.users.findOne({
        email: { $eq: user.email },
      });
      if (!availavleUser) {
        // Return an error if the user does not exist
        res.status(401).send({ error: `${user.email} does not exits` });
      } else if (availavleUser.password !== user.password) {
        // Return an error if the password is incorrect
        res.status(401).send({ error: 'Password incorrect' });
      } else {
        // Generate a unique token for the authenticated user
        const token = uuid4();
        // Store the token in the Redis database with a 24-hour expiration time
        await redisClient.set(`auth_${token}`, availavleUser._id.toString(), 24 * 60 * 60);
        // Return the token as a success response
        res.status(200).send({ success: token });
      }
    } else {
      // Render the login page if no authorization header is present
      res.render('login.html');
    }
  }

  // Controller for user sign-up
  static async signUp(req, res) {
    // Extract user data from the request body
    const { email } = req.body;
    const { password } = req.body;
    const { username } = req.body;
    const imageData = req.file ? req.file.buffer : null;

    // Validate user data
    if (!email) {
      res.status(400).send({ error: 'Missing email' });
    } else if (!password) {
      res.status(400).send({ error: 'Missing password' });
    } else if (!username) {
      res.status(400).send({ error: 'Missing username' });
    } else {
      try {
        // Check if the user already exists in the database
        const availableUser = await dbClient.users.findOne({ email: { $eq: email } });
        if (availableUser) {
          // Return an error if the user already exists
          res.status(400).send({ error: 'Already exist' });
        } else {
          // Hash the user's password and insert the user data into the database
          const hashedPassword = sha1(password);
          const newUser = await dbClient.users.insertOne({
            email,
            username,
            password: hashedPassword,
            friends: [],
            friendRequest: [],
            pendingRequests: [],
            notifications: [],
            groups: {},
            avatar: imageData,
            isActive: false,
          });
          // Create a new message history for the user
          await dbClient.messages.insertOne({
            ownerId: newUser.insertedId,
            messages: {},
          });
          // Generate a unique token for the authenticated user
          const token = uuid4();
          // Store the token in the Redis database with a 24-hour expiration time
          await redisClient.set(`auth_${token}`, newUser.insertedId.toString(), 24 * 60 * 60);
          // Return the token as a success response
          res.status(201).send({ success: token });
        }
      } catch (error) {
        // Handle internal server errors
        res.status(500).send({ error: 'Internal server error' });
      }
    }
  }

  // Controller for validating user authentication
  static async validateUser(req) {
    // Extract the authentication token from the request query parameters
    const token = req.query['x-token'];
    // Get the user ID associated with the token from the Redis database
    const userId = await redisClient.get(`auth_${token}`);
    return userId;
  }

  // Controller for user log-out
  static async logOut(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      // Delete the authentication token from the Redis database
      await redisClient.del(`auth_${req.query['x-token']}`);
      // Redirect to the sign-in page
      res.status(200).redirect('/signin');
    } else {
      // Redirect to the sign-in page if the user is not authenticated
      res.status(401).redirect('/signin');
    }
  }
}

// Export the AuthController class
module.exports = AuthController;
