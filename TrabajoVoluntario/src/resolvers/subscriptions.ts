import { withFilter } from "graphql-subscriptions"
import {pubSub } from "../pubsub"
import {messageUpdate} from "../functions"



export const Subscription = {
    postMessage: {
      subscribe: withFilter(() => pubSub.asyncIterator("newMessage"), (payload, variables) => {
        if(payload.postMessage.sala === variables.sala) {
          messageUpdate(payload.postMessage);
        }
        return payload.postMessage.sala === variables.sala;
      }),
      },
}