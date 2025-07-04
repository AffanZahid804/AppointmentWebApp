const mongoose = require('mongoose');

/**
 * Database configuration and connection management
 */
class Database {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  /**
   * Connect to MongoDB with advanced configuration
   */
  async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-system';
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maximum number of connections in the pool
        serverSelectionTimeoutMS: 5000, // Timeout for server selection
        socketTimeoutMS: 45000, // Timeout for socket operations
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
        autoIndex: true, // Build indexes
        autoCreate: true, // Create collections if they don't exist
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true, // Retry write operations
        w: 'majority', // Write concern
        readPreference: 'primary', // Read preference
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(mongoURI, options);
      
      this.isConnected = true;
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${this.connection.connection.name}`);
      console.log(`🔗 Host: ${this.connection.connection.host}`);
      console.log(`🚀 Port: ${this.connection.connection.port}`);
      
      // Set up connection event listeners
      this.setupEventListeners();
      
      return this.connection;
      
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Setup MongoDB connection event listeners
   */
  setupEventListeners() {
    const db = mongoose.connection;

    // Connection events
    db.on('connected', () => {
      console.log('🟢 MongoDB connection established');
      this.isConnected = true;
    });

    db.on('error', (error) => {
      console.error('🔴 MongoDB connection error:', error);
      this.isConnected = false;
    });

    db.on('disconnected', () => {
      console.log('🟡 MongoDB connection disconnected');
      this.isConnected = false;
    });

    db.on('reconnected', () => {
      console.log('🟢 MongoDB connection reestablished');
      this.isConnected = true;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.close();
      process.exit(0);
    });
  }

  /**
   * Close database connection
   */
  async close() {
    try {
      if (this.isConnected && mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
        this.isConnected = false;
      }
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }

  /**
   * Health check for database
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          message: 'Database is not connected'
        };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        message: 'Database is responding',
        details: this.getConnectionStatus()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Database health check failed',
        error: error.message
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      const stats = await mongoose.connection.db.stats();
      
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize,
        fileSize: stats.fileSize
      };
      
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Create database indexes for better performance
   */
  async createIndexes() {
    try {
      console.log('🔧 Creating database indexes...');
      
      // User indexes
      await mongoose.model('User').createIndexes();
      
      // Appointment indexes
      await mongoose.model('Appointment').createIndexes();
      
      console.log('✅ Database indexes created successfully');
      
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  }

  /**
   * Drop all collections (for testing/development)
   */
  async dropAllCollections() {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot drop collections in production');
      }

      const collections = await mongoose.connection.db.collections();
      
      for (const collection of collections) {
        await collection.drop();
      }
      
      console.log('🗑️ All collections dropped');
      
    } catch (error) {
      console.error('❌ Error dropping collections:', error);
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

module.exports = database; 