import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

interface Global {
  client: MongoClient | undefined;
}

let global: Global = { client: undefined };
export { global };

export async function connectToMongo(): Promise<void> {
  const uri: string = process.env.MONGODB_URI || '';
  const client: MongoClient = new MongoClient(uri);
  client.connect();
  console.log('Mongodb connected');
  global.client = client;
}

export async function closeMongoConnection(): Promise<void> {
  await global.client?.close();
}

export async function getDatabase(): Promise<Db> {
  while (!global.client) {
    await connectToMongo();
  }

  return global.client.db(process.env.MONGODB_NAME);
}
