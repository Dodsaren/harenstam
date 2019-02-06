'use strict'
const { gql } = require('apollo-server-koa')
const {
  getQuiz,
  getQuestions,
  getQuestionsByQuizId,
  getOptions,
  getSolutions,
  insertQuestion,
  createQuiz,
} = require('./database/operations')

const typeDefs = gql`
  type Query {
    quiz(id: ID): [Quiz]
    questions(id: ID): [Question]
  }

  type Quiz {
    id: ID
    label: String
    questions_order: [Int]
    questions_order_type: String
    questions: [Question]
  }

  type Question {
    id: ID
    label: String
    options: [String]
    solutions: [Int]
  }

  type Mutation {
    createQuestion(input: CreateQuestionInput): CreateQuestionPayload
    createQuiz(input: CreateQuizInput): CreateQuizPayload
  }

  input CreateQuestionInput {
    label: String
    options: [String]
    solutions: [Int]
  }

  type CreateQuestionPayload {
    questions: [Question]
  }

  input CreateQuizInput {
    label: String
    questionIds: [ID]
    questions_order_type: QuestionsOrderType
  }

  enum QuestionsOrderType {
    ordered
    unordered
    random
  }

  type CreateQuizPayload {
    quiz: [Quiz]
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    quiz: (_, { id }) => getQuiz(id),
    questions: (_, { id }) => getQuestions(id),
  },

  Mutation: {
    createQuestion: (_, args) => insertQuestion(args.input),
    createQuiz: (_, args) => createQuiz(args.input),
  },

  Quiz: {
    questions: ({ id }) => getQuestionsByQuizId(id),
  },

  Question: {
    options: ({ id }) => getOptions(id),
    solutions: ({ id }) => getSolutions(id),
  },

  CreateQuizPayload: {
    quiz: ({ id }) => getQuiz(id),
  },

  CreateQuestionPayload: {
    questions: ({ id }) => getQuestions(id),
  },
}

module.exports = { typeDefs, resolvers }
