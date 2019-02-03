'use strict'
const { gql } = require('apollo-server-koa')
const {
  getQuiz,
  getQuestions,
  getOptions,
  getSolutions,
} = require('./dbOperations')

const typeDefs = gql`
  type Query {
    quiz(id: Int): [Quiz]
    questions: [Question]
  }

  type Quiz {
    id: Int
    label: String
    questions_order: [Int]
    questions: [Question]
  }

  type Question {
    id: Int
    label: String
    options: [String]
    solutions: [Int]
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    quiz: (_, { id }) => getQuiz(id),
  },

  Quiz: {
    questions: ({ id }) => getQuestions(id),
  },

  Question: {
    options: ({ id }) => getOptions(id),
    solutions: ({ id }) => getSolutions(id),
  },
}

module.exports = { typeDefs, resolvers }
