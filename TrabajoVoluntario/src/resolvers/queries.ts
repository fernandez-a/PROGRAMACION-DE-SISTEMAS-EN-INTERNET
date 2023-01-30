import { Collection, Db, ObjectId } from "mongodb";
import { ApolloError } from 'apollo-server'
import bcrypt from 'bcrypt'
import { Sala, Message, Usuario } from "../types"
import { v4 as uuidv4 } from 'uuid'


export const Query = {
  logIn: async (parent: any, args: { email: string, usuario: string, password: string }, context: { client: Db }) => {
    const user = await context.client.collection("R_Users").findOne({ email: args.email })
    if (user) {
      //Para comprobar la contraseña encriptada
      const validPass = await bcrypt.compare(args.password, user.password);
      if (validPass) {
        const token = uuidv4();
        await context.client.collection("R_Users").updateOne({ email: args['email'] }, { '$set': { token: token } });
        return ({
          email: user['email'],
          usuario: user['usuario'],
        });
      }
      else {
        throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
      }
    }
    else {
      throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
    }

  },

  logOut: async (parent: any, args: any, context: {user:Usuario, client: Db }) => {
    const user = await context.client.collection("R_Users").findOne({ email: args['email'] })
    if (user) {
      await context.client.collection("R_Users").updateOne({ email: args['email'] }, { '$set': { token: null } });
      return user;
    }
    else {
      throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
    }

  },
  getChats: async (parent: any, args: any, context: { chats: Sala[] }) => {
    if (context.chats.length === 0) {
      throw new ApolloError("No channels to show, create a new channel first", "402");

    }
    else {
      return context.chats.map((i: Sala) => ({
        ...i,
        sala: i.sala,
        users: i.users
      }));
    }
  },
}

// export const Chat = {
//   messages: (_:{messages:Message[]},__:any,context:{messages:Message[]}) => {
//       return context.messages.map(i => ({
//         ...i,
//         user:i.user,
//         message: i.message,
//       }))
//     },
// }
