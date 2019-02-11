require('dotenv').config()
const Koa = require('koa')
const { ApolloServer } = require('apollo-server-koa')
const { typeDefs, resolvers } = require('./src/graphql')

const app = new Koa()

const server = new ApolloServer({ typeDefs, resolvers })

server.applyMiddleware({ app })

const port = 3000
const host = 'localhost'

app.listen(port, host, () =>
  console.log(`🚀 Server ready at http://${host}:${port}${server.graphqlPath}`),
)
