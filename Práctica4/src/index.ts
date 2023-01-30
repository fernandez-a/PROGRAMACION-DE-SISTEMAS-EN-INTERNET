import { connectDB } from "./DBConnection"
import {ApolloServer } from 'apollo-server'
import { typeDefs } from "./schema"
import { Query, Recipe, User, Ingredient } from "./resolvers/queries"
import { Mutation } from "./resolvers/mutations"
import { Usuario } from "./types";

const saltRounds = 10;
const resolvers = {
  Query,
  Mutation,
  Recipe,
  User,
  Ingredient
};

const run = async () => {
  const client = await connectDB()
  const validQuery = ["SignOut", "LogOut", "addIngredient", "deleteIngredient", "addRecipe", "updateRecipe", "deleteRecipe"]
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, res }) => {
      if (validQuery.some((q) => req.body.query.includes(q))) {
        if (req.headers.token != null) {
          const user = await client.collection("R_Users").findOne({ token: req.headers['token'] }) as Usuario;
          if (user) {
            return {
              client,
              user,
            }
          }
          else res.sendStatus(403);
        }
        else res.sendStatus(403);
      }
      else {
        return {
          client,
        }
      }
    },
  });
  server.listen(4000).then(() => {
    console.log(`🚀  Server ready on 4000 `);
  });
}
try {
  run()
} catch (e) {
  console.error(e);
}