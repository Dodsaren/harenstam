'use strict'
const { gql } = require('apollo-server-koa')
const {
  getQuiz,
  getQuestions,
  getQuestionsByQuizId,
  getOptions,
  getSolutions,
  insertQuestion,
  updateQuestion,
  deleteQuestion,
  createQuiz,
  updateQuiz,
  deleteQuiz,
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
    created: String
  }

  type Question {
    id: ID
    label: String
    options: [String]
    solutions: [Int]
  }

  type Mutation {
    createQuestion(input: CreateQuestionInput): CreateQuestionPayload
    updateQuestion(input: UpdateQuestionInput): UpdateQuestionPayload
    deleteQuestion(input: DeleteQuestionInput): DeleteQuestionPayload
    createQuiz(input: CreateQuizInput): CreateQuizPayload
    updateQuiz(input: UpdateQuizInput): UpdateQuizPayload
    deleteQuiz(input: DeleteQuizInput): DeleteQuizPayload
  }

  type UpdateQuestionPayload {
    question: Question
  }

  input UpdateQuestionInput {
    id: ID!
    label: String
    options: [String]
    optionsSolutions: [Int]
    freetextSolutions: [String]
  }

  input DeleteQuestionInput {
    id: ID!
  }

  type DeleteQuestionPayload {
    success: String
  }

  input DeleteQuizInput {
    id: ID!
  }

  type DeleteQuizPayload {
    success: String
  }

  input CreateQuestionInput {
    label: String!
    options: [String]!
    optionsSolutions: [Int]!
    freetextSolutions: [String]
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
    updateQuestion: (_, args) =>
      updateQuestion(args.input).then(res => ({
        question: res[0],
      })),
    deleteQuestion: (_, args) =>
      deleteQuestion(args.input.id).then(() => ({ success: 'Gick bra' })),
    createQuiz: (_, args) => createQuiz(args.input),
    updateQuiz: (_, args) => updateQuiz(args.input),
    deleteQuiz: (_, args) =>
      deleteQuiz(args.input.id).then(() => ({ success: 'Gick bra' })),
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
