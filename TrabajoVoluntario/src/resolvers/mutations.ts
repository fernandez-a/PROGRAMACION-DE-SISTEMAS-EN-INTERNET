import {Collection, Db } from "mongodb";
import { ApolloError } from 'apollo-server-express'
import { pubSub } from "../pubsub"

import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt"
import dotenv from "dotenv";
import { Sala, Message, Usuario } from "../types";
import { deleteChannel } from "../functions";
dotenv.config()
const collection = process.env.DB_COLLECTION;
const saltRound = 10



export const Mutation = {
    signOut: async (parent: any,args:any, context: { user:Usuario,client:Db}) => {
        try {
            await context.client.collection(`${collection}`).findOneAndDelete({ token: context.user.token })
            return `The user ${context.user.usuario} has been deleted successfully`
        } catch  {
            throw new ApolloError("Something bad happend", "402");
        }
        
    },
    signIn: async (parent: any, args: { email: string, usuario: string, password: string }, context: { client: Db }) => {
        const user = { ...args };
        const user_db = await context.client.collection(`${collection}`).findOne({ email: user.email ,usuario: user.usuario})
        if (user_db) {
            throw new ApolloError("Already Created", "403");
        }
        else {
            let hasshed_passw = await bcrypt.hash(user.password, saltRound);
            user['password'] = hasshed_passw;
            context.client.collection(`${collection}`).insertOne({ email: user.email, usuario: user.usuario, password: user.password, token: null })
            return user;
        }

    },
    postMessage: async (parent: any, args: { message: string }, context: { user: Usuario, chats: Sala[] }) => {
        context.chats.some((chat) => {
            if (chat.users.includes(context.user.usuario)) {
                pubSub.publish("newMessage", {
                    postMessage: {
                        sala: chat.sala,
                        user: context.user.usuario,
                        message: args.message
                    }
                });
            }
            else {
                throw new ApolloError("Needs to be in the channel", "402");
            }
        })
        return {
            ...args,
            user: context.user.usuario,
            message: args.message
        }
    },

    Join: async (parent: any, args: { sala: string }, context: { user: Usuario, chats: Sala[], messages: Message[] }) => {
        let chat2 = {
            sala: args.sala,
            users: [context.user.usuario]
        } as Sala
        if (context.chats.length !== 0) {
            if (context.chats.some(ch => ch.sala === args.sala)) {
                const channel = context.chats.find(ch => ch.sala == args.sala);
                if (!channel) {
                    context.chats.push(chat2);
                    throw new ApolloError("Channel does not exist, we create that new channel", "402");
                }
                else {
                    if (channel.users.includes(context.user.usuario)) {
                        throw new ApolloError("Already on that channel", "402");
                    }
                    else {
                        channel.users.push(context.user.usuario);
                    }
                }
            }
            else {
                context.chats.push(chat2);
            }
        }
        else {
            context.chats.push(chat2);
        }
        if (context.messages.some(message => message.sala === args.sala)) {
            return context.messages;
        }
        else {
            return [];
        }
    },
    Quit: async (parent: any, args: { sala: string }, context: { user: Usuario, chats: Sala[] }) => {
        if (context.chats.some((chat) => chat.sala == args.sala)) {
            let channel = context.chats.find(ch => ch.sala === args.sala);
            if (!channel) {
                throw new ApolloError(`Channel ${args.sala} does not exist`, "402");
            }
            else {
                if (!channel.users.includes(context.user.usuario)) {
                    throw new ApolloError(`No user detected in channel ${args.sala}`, "402");
                }
                else {
                    channel.users = channel.users.filter(user => user !== context.user.usuario)
                    if (channel.users.length === 0) {
                        deleteChannel(channel.sala);
                        return `Channel ${args.sala} deleted no users`;
                    }
                    else {
                        return `User ${context.user.usuario} deleated from channel ${args.sala}`;
                    }
                }
            }
        }
        else {
            throw new ApolloError(`Channel ${args.sala} does not exist, create it first`, "402");

        }

    }
}
