import { connectDB } from "./DBConnection"
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import { ApolloServer,ApolloError } from "apollo-server-express";
import { typeDefs } from "./schema"
import { Query } from "./resolvers/queries"
import { Mutation } from "./resolvers/mutations"
import { Subscription } from "./resolvers/subscriptions"

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
      return {
        client
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