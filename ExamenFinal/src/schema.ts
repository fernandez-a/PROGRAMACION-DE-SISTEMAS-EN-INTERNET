import {gql } from 'apollo-server'

export const typeDefs = gql`
    type Partido{
        id: ID!
        equipo1:String!,
        equipo2:String!,
        resultado:String!,
        minuto:Int!,
        finalizado:Boolean!
  }

  type Query {
    listMatches:[Partido!]!
    getMatch(id:String!):Partido!
  }
  type Mutation {
    setMatchData(id:String!,resultado:String,minuto:Int,ended:Boolean):Partido!
    startMatch(team1:String,team2:String!):Partido!
  }

  type Subscription {
    subscribeMatch(id:String!):Partido
  }
`