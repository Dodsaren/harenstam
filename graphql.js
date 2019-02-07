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
  updateQuiz,
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
    updateQuiz(input: UpdateQuizInput): UpdateQuizPayload
  }

  input CreateQuestionInput {
    label: String!
    options: [String]!
    solutions: [Int]!
  }

  type CreateQuestionPayload {
    questions: [Question]
  }

  input CreateQuizInput {
    label: String!
    questionIds: [ID]!
    questions_order_type: QuestionsOrderType
  }

  type CreateQuizPayload {
    quiz: Quiz
  }

  input UpdateQuizInput {
    id: ID!
    label: String
    questionIds: [ID]
    questions_order_type: String
  }

  type UpdateQuizPayload {
    quiz: Quiz
  }

  enum QuestionsOrderType {
    ordered
    unordered
    random
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
    updateQuiz: (_, args) => updateQuiz(args.input),
  },

  Quiz: {
    questions: ({ id }) => getQuestionsByQuizId(id),
  },

  Question: {
    options: ({ id }) => getOptions(id),
    solutions: ({ id }) => getSolutions(id),
  },

  CreateQuizPayload: {
    quiz: ({ id }) => getQuiz(id).then(x => x[0]),
  },

  UpdateQuizPayload: {
    quiz: ({ id }) => getQuiz(id).then(x => x[0]),
  },

  CreateQuestionPayload: {
    questions: ({ id }) => getQuestions(id),
  },
}

module.exports = { typeDefs, resolvers }
