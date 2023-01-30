import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config()

export const connectDB = async (): Promise<Db> => {
  const mongouri: string = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/myFirstDatabase?retryWrites=true&w=majority`;
  const client = new MongoClient(mongouri);

  try {
    await client.connect();
    console.info("MongoDB connected");
    return client.db(process.env.DB_NAME);
  } catch (e) {
    throw e;
  }
};
