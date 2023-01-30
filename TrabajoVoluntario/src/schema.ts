import {gql } from 'apollo-server'

export const typeDefs = gql`
    type User{
        id: ID!
        usuario: String!
        email: String!
    }

    type Chat {
      sala: String!
      users: [String]!
    }


    type Message{
      user: String!
      message: String!
    }

  type Query {
    logIn(email:String!,password:String!):User!
    logOut:User!
    getChats:[Chat!]
    

  }
  type Mutation {
    signIn(email:String!,usuario:String!,password:String!):User
    signOut:String!
    postMessage(message:String!):Message!
    Join(sala:String!):[Message!]!
    Quit(sala:String!):String!
  }

  type Subscription {
    postMessage(sala:String!):Message
  }
`