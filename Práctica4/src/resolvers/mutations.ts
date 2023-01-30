import {Db, ObjectId } from "mongodb";
import { ApolloError } from 'apollo-server'
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt"
import { Receta, Usuario } from "../types";
const saltRound = 10

export const Mutation = {
    logIn: async (parent: any, args: any, context: { client: Db }) => {
        const user = await context.client.collection("R_Users").findOne({ email: args['email'] })
        if (user) {
            //Comprobamos la contraseña encriptada si esta devolvemos el usuario
            const validPass = await bcrypt.compare(args["pwd"], user['pwd']);
            if (validPass) {
                const token = uuidv4();
                await context.client.collection("R_Users").updateOne({ email: args['email'] }, { '$set': { token: token } });
                return user;
            }
            else {
                throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
            }
        }
        else {
            throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
        }
    },
    logOut: async (parent: any, args: any, context: { client: Db, user: Usuario }) => {
        await context.client.collection("R_Users").updateOne({ email: context.user['email'] }, { '$set': { token: null } });
        return context.user;
    },
    signIn: async (parent: any, args: any, context: { client: Db }) => {
        const user = { ...args };
        const user_db = await context.client.collection("R_Users").findOne({ email: user['email'] })
        if (user_db) {
            throw new ApolloError("Already Created", "403");
        }
        else {
            let hasshed_passw = await bcrypt.hash(user.pwd, saltRound);
            user['pwd'] = hasshed_passw;
            context.client.collection("R_Users").insertOne({ email: user['email'], pwd: user['pwd'], token: null })
            return user;
        }

    },
    signOut: async (parent: any, args: any, context: { client: Db,user:Usuario }) => {
        await context.client.collection("R_Users").deleteOne({ _id: context.user._id});
        await context.client.collection("Recetas").deleteMany({author: context.user._id.toString()});
        return "Usuario Borrado"

    },
    addIngredient: async (parent: any, args: { name: string }, context: { client: Db }) => {
        const ingredient_db = await context.client.collection("Ingredientes").findOne({ name: args.name })
        if (ingredient_db) {
            throw new ApolloError("Already Created", "403");
        }
        else {
            const ingrediente = { ...args };
            context.client.collection("Ingredientes").insertOne(ingrediente);
            return ingrediente;
        }

    },
    addRecipe: async (parent: any, args: { name: string, description: string, ingredients: string[] }, context: { client: Db, user: Usuario }) => {
        const receta_db = await context.client.collection("Recetas").findOne({ name: args.name });
        if (receta_db) {
            throw new ApolloError("Already Created", "403");
        }
        else {
            const receta = {
                ...args,
                author: context.user.email
            };
            context.client.collection("Recetas").insertOne(receta);
            return receta;
        }
    },
    updateRecipe: async (parent: any, args: { id: string, ingredients: string[] }, context: { client: Db, user: Usuario }) => {
        const receta_db = await context.client.collection("Recetas").findOne({ author: context.user._id.toString(), _id: new ObjectId(args.id) }) as Receta;
        if (receta_db) {
            const ingredientes = await context.client.collection("Ingredientes").find({ _id: { $in: args.ingredients.map((i: any) => new ObjectId(i)) } }).toArray();
            if (ingredientes) {
                await context.client.collection("Recetas").updateOne({ _id: receta_db._id }, { $push: { ingredients: { $each: args.ingredients } } });
                return "Receta actualizada";
            }
            else {
                throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
            }
        }
        else {
            throw new ApolloError("Something went wrong", "Needs to be your recipe", { status: 403 });
        }

    },
    deleteRecipe: async (parent: any, args: { id: string }, context: { client: Db, user: Usuario }) => {
        //Borramos la receta pedida por id
        await context.client.collection("Recetas").deleteOne({ author: context.user['_id'].toString(), _id: new ObjectId(args.id) })
        return "Receta Borrada";
    },
    deleteIngredient: async (parent: any, args: {id: string}, context: { client: Db}) => {
        await context.client.collection("Ingredientes").deleteOne({_id:new ObjectId(args.id)});
        await context.client.collection("Recetas").deleteMany({ingredients: args.id});
        return "Ingrediente Borrado";

    },
}