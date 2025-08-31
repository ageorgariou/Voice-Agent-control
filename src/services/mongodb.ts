import { MongoClient, ServerApiVersion, Db, Collection, Document } from 'mongodb';

class MongoDBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor() {
    const uri = import.meta.env.MONGODB_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
  }

  async connect(): Promise<void> {
    if (!this.client) {
      throw new Error('MongoDB client is not initialized');
    }

    try {
      await this.client.connect();
      const dbName = import.meta.env.MONGODB_DB_NAME || process.env.MONGODB_DB_NAME || 'voice_agent_db';
      this.db = this.client.db(dbName);
      
      // Test the connection
      await this.db.command({ ping: 1 });
      console.log('Successfully connected to MongoDB!');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getCollection<T extends Document = Document>(collectionName: string): Collection<T> {
    return this.getDatabase().collection<T>(collectionName);
  }

  async ensureConnection(): Promise<void> {
    if (!this.db) {
      await this.connect();
    }
  }
}

// Create a singleton instance
export const mongoService = new MongoDBService();

// Auto-connect when the module is imported
mongoService.connect().catch(console.error);

export default mongoService;
