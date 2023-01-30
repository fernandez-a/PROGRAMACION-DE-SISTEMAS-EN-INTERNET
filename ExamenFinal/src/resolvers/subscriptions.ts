import { withFilter } from "graphql-subscriptions"
import { Db, ObjectId } from "mongodb";
import { pubSub } from "../pubsub"



export const Subscription = {
  subscribeMatch: {
    subscribe: withFilter(() => pubSub.asyncIterator("newMatch"), (payload, variables) => {
      if (payload.subscribeMatch._id.toString() === variables.id) {
        return payload;
      }
      return payload.subscribeMatch._id.toString() === variables.id;
    }),
  },
}