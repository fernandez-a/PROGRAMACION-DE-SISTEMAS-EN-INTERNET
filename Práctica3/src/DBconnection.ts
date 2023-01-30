import { Db, MongoClient } from "mongodb";

export const connectDB = async (): Promise<Db> => {
  const dbName: string = "Coworking";
  const usr = "PabloH";
  const pwd = "4qnllAE0";
  const mongouri: string = `mongodb+srv://${usr}:${pwd}@cluster0.g6dfr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
  const client = new MongoClient(mongouri);

  try {
    await client.connect();
    console.info("MongoDB connected");
    return client.db(dbName);
  } catch (e) {
    throw e;
  }
};
