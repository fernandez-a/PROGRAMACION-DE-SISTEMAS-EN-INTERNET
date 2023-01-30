import { Db, ObjectId } from "mongodb";
import { ApolloError } from 'apollo-server-express'
import { pubSub } from "../pubsub"
import dotenv from "dotenv";
import { MATCH } from "../types";
import { subscribe } from "graphql";
dotenv.config()
const collection = process.env.DB_COLLECTION;

export const Mutation = {
    startMatch: async (parent: any, args: { team1: string, team2: string }, context: { client: Db }) => {
        const partido = await context.client.collection(`${collection}`).findOne({ equipo1: args.team1, equipo2: args.team2 }) as MATCH;
        const partido_reves = await context.client.collection(`${collection}`).findOne({ equipo1: args.team2, equipo2: args.team1}) as MATCH;
        if ((partido_reves || partido) && (partido.finalizado === false || partido_reves.finalizado === false)) {
            throw new ApolloError("Match already started", "442")
        }
        else {
            await context.client.collection(`${collection}`).insertOne({ equipo1: args.team1, equipo2: args.team2, resultado: "0-0", minuto: 0, finalizado: false });
            const new_partido = await context.client.collection(`${collection}`).findOne({ equipo1: args.team1, equipo2: args.team2 }) as MATCH;
            return new_partido;
        }
    },
    setMatchData: async (parent: any, args: { id: string, resultado: string, minuto: number, ended: boolean }, context: { client: Db }) => {
        const valid_id = new ObjectId(args.id);
        const partido = await context.client.collection(`${collection}`).findOne({ _id: valid_id }) as MATCH
        const resultado = partido.resultado.split("-");
        const new_resultado = args.resultado.split("-");
        if (partido) {
            if (partido.finalizado === true) {
                pubSub.publish("newMatch", {
                    subscribeMatch: {
                        ...partido
                    }
                });
                return partido;
            }         
            else if ((new_resultado[0] > resultado[0] || new_resultado[1] > resultado[1]) || (args.minuto > partido.minuto)) {
                await context.client.collection(`${collection}`).updateOne({ _id: valid_id }, { '$set': {resultado: args.resultado,minuto:args.minuto,finalizado:args.ended}}); 
                const updated_match = await context.client.collection(`${collection}`).findOne({ _id: valid_id }) as MATCH
                pubSub.publish("newMatch", {
                    subscribeMatch: {
                        ...updated_match
                    }
                });
                return updated_match;
            }
            else {
                throw new ApolloError("Bad Input","404");
            }
        }
        else {
            throw new ApolloError("Not found", "404");
        }
    }
}
