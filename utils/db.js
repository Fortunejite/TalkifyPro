const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    // Create a MongoDB client
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.db = process.env.DB_DATABASE || 'Chat';
    this.url = `mongodb://${this.host}:${this.port}/${this.db}`;
    this.client = new MongoClient(this.url);
    // Connect to the MongoDB database
    this.client.connect((err) => {
      if (err) console.log(err);
      // Select the database and collection
      this.db = this.client.db(this.db);
      this.users = this.db.collection('users');
      this.messages = this.db.collection('files');
    });
  }

  isAlive() {
    return !!this.client && !!this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    return this.users.countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
