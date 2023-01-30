import { Collection, Db, ObjectId } from "mongodb";
import { ApolloError } from 'apollo-server'
import { MATCH } from "../types"
import dotenv from "dotenv"


dotenv.config()
const collection = process.env.DB_COLLECTION
export const Query = {
  listMatches: async (parent: any, args: any, context: { client: Db }) => {
    const partidos = await context.client.collection(`${collection}`).find().toArray() as MATCH[];
    return partidos.filter((partidos) => partidos.finalizado != true);
  },
  getMatch: async (parent: any, args: { id: string }, context: { client: Db }) => {
    const valid_id = new ObjectId(args.id);
    const partido = await context.client.collection(`${collection}`).findOne({ _id: valid_id }) as MATCH;
    if (partido) {
      return partido;
    }
    else {
      throw new ApolloError("Not found", "404");
    }
  }
}

