import { Db, ObjectId } from "mongodb";
import { ApolloError } from 'apollo-server'
import { Usuario, Receta } from "../types"


export const Query = {
  getRecipes: async (parent: any, args: { author: string, ingredient: string }, context: { client: Db }) => {
    if (args.author != null) {
      const recipes_author = await context.client.collection("Recetas").find({ author: args.author }).toArray();
      if (recipes_author.length != 0) {
        return recipes_author.map(r => ({
          ...r,
          id: r._id.toString(),
        }))
      }
      else {
        throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
      }
    }
    else if (args.ingredient != null) {
      const recipes_ingredient = await context.client.collection("Recetas").find({ ingredients: args.ingredient }).toArray()
      if (recipes_ingredient.length != 0) {
        return recipes_ingredient.map(r => ({
          ...r,
          id: r._id.toString()
        }))
      }
      else {
        throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
      }
    }
    else if (args.ingredient != null && args.author != null) {
      const recetas_db = await context.client.collection("Recetas").find({ ingredients: args.ingredient, author: args.author }).toArray()
      if (recetas_db.length != 0) {
        return recetas_db.map(r => ({
          ...r,
          id: r._id.toString()
        }))
      }
      else {
        throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
      }
    }
    else {
      const recetas = await context.client.collection("Recetas").find().toArray();
      return recetas.map(r => ({
        ...r,
        id: r._id.toString()
      }))
    }
  },
  getRecipe: async (_: any, args: { id: string }, context: { client: Db }) => {
    const valid_id = new ObjectId(args.id);
    const recipe = await context.client.collection("Recetas").findOne({ _id: valid_id }) as Receta;
    if(recipe) {
      return {
        ...recipe,
        id: args.id
      }
    }
    else{
      throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
    }
    
  },
  getIngredient: async (_: any, args: { id: string }, context: { client: Db }) => {
    const valid_id = new ObjectId(args.id);
    const ingredient = await context.client.collection("Ingredientes").findOne({ _id: valid_id }) as Receta;
    return {
      ...ingredient,
      id: args.id
    }
  },
  getUser: async (parent: any, args: { id: string }, context: { client: Db }) => {
    const valid_id = new ObjectId(args.id);
    const user = await context.client.collection("R_Users").findOne({ _id: valid_id });
    console.log(user)
    if (user) {
      return {
        ...user,
        id: args.id
      }
    }
    else {
      throw new ApolloError("Something went wrong", "Bad Input", { status: 403 });
    }
  },

  getUsers: async (parent: any, args: any, context: { client: Db }) => {
    const users = await context.client.collection("R_Users").find().toArray();
    return users.map(i => ({
      ...i,
      id: i._id
    }));
  }
}
export const User = {
  recipes: async (parent: { id: string }, args: any, context: { client: Db }) => {
    const recetas = await context.client.collection("Recetas").find({ author: parent.id }).toArray();
    return recetas;
  }
}

export const Recipe = {
  ingredients: async (parent: { id: string, ingredients: string[] }, args: any, context: { client: Db }) => {
    const ingredientes = await context.client.collection("Ingredientes").find({ _id: { $in: parent.ingredients.map(i => new ObjectId(i)) } }).toArray();
    return ingredientes.map(r => ({
      ...r,
      id: r._id.toString()
    }))
  },
  author: async (parent: { author: string }, args: any, context: { client: Db }) => {
    const user = await context.client.collection("R_Users").findOne({ _id: new ObjectId(parent.author) }) as Usuario
    return {
      ...user,
      id: user._id
    };
  }
}

export const Ingredient = {
  recipes: async (parent: { id: string }, args: any, context: { client: Db }) => {
    const recetas = await context.client.collection("Recetas").find({ ingredients: parent.id }).toArray();
    return recetas.map(r => ({
      ...r,
      id: r._id.toString()
    }));
  }
}