import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config()

export const connectDB = async (): Promise<Db> => {

  const dbName = process.env.DB_NAME;
  const usr = process.env.DB_USERNAME;
  const pwd = process.env.DB_PASSWORD
  const cluster = process.env.DB_CLUSTER
  const mongouri: string = `mongodb+srv://${usr}:${pwd}${cluster}/myFirstDatabase?retryWrites=true&w=majority`;
  const client = new MongoClient(mongouri);

  try {
    await client.connect();
    console.info("MongoDB connected");
    return client.db(dbName);
  } catch (e) {
    throw e;
  }
};
