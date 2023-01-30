import { connectDB } from "./DBConnection"
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import { ApolloServer,ApolloError } from "apollo-server-express";
import { typeDefs } from "./schema"
import { Query } from "./resolvers/queries"
import { Sala, Message, Usuario } from "./types"
import { Mutation } from "./resolvers/mutations"
import { Subscription } from "./resolvers/subscriptions"
import { messages, chats } from "./functions"

const resolvers = {
  Query,
  Mutation,
  Subscription,
};


const run = async () => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const app = express();
  const httpServer = createServer(app);
  const client = await connectDB()
  const validQuery = ["signOut", "LogOut", "LogIn", "Quit", "postMessage", "Join"]
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },

    {
      server: httpServer,
      path: '/graphql'
    }
  );
  const server = new ApolloServer({
    schema,
    context: async ({ req, res }) => {
      if (validQuery.some((q) => req.body.query.includes(q))) {
        if (req.headers['token'] != null) {
          const user = await client.collection("R_Users").findOne({ token: req.headers['token'] })
          if (user) {
            return {
              client,
              user,
              chats,
              messages
            }
          }
          else  throw new ApolloError("Something went wrong", "Bad Input", { status: 400 });
        }
        else throw new ApolloError("Something went wrong", "Bad Input", { status: 400 });
      }
      else {
        return {
          client,
          chats,
        }
      }
    },

    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          }
        };
      }
    }],
  });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = 3000;
  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
    );
  });
}
try {
  run()
} catch (e) {
  console.error(e);
}