import { gql } from 'apollo-server'

export const typeDefs = gql`
    type Ingredient{
        id: ID!
        name: String!
        recipes: [Recipe!]!
    }
    type Recipe{
        id: ID!
        name: String!
        description: String!
        ingredients: [Ingredient!]!
        author: User!
    } 
    type User{
        id: ID!
        email: String!
        token: String
        recipes: [Recipe!]!
    }

  type Query {
    getIngredient(id:String!): Ingredient
    getRecipes(author:String,ingredient:String): [Recipe!]!
    getUser(id: String!):User
    getUsers: [User!]!
    getRecipe(id:String!) : Recipe

  }
  type Mutation {
    logIn(email:String!,pwd:String!):User
    logOut:User
    signIn(email:String!,pwd:String!):User
    signOut:String
    addIngredient(name:String!):Ingredient
    addRecipe(name:String!,description:String!,ingredients: [String!]!):Recipe
    updateRecipe(id:String!, ingredients: [String!]!):String
    deleteRecipe(id:String!):String
    deleteIngredient(id:String!):String
  }
`