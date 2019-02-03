'use strict'

const { Pool } = require('pg')

const pool = new Pool()

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

async function execute(query) {
  try {
    const { rows } = await pool.query(query)
    return rows
  } catch (err) {
    console.log('ERROR', err)
    return err
  }
}

function getQuiz(quizId) {
  const q = `SELECT label, id, questions_order FROM quiz`
  return !quizId ? execute(q) : execute(`${q} WHERE quiz.id = ${quizId}`)
}

function getQuestions(quizId) {
  const q = `SELECT DISTINCT q.label, q.id
  FROM quiz_questions qq
  JOIN quiz qz ON qq.quiz_id = qz.id
  JOIN questions q ON qq.question_id = q.id`
  return !quizId ? execute(q) : execute(`${q} WHERE qz.id = ${quizId}`)
}

async function getOptions(questionId) {
  return execute(
    `SELECT q.options FROM questions q WHERE q.id = ${questionId}`,
  ).then(res => res[0].options)
}

function getSolutions(questionId) {
  return execute(
    `SELECT q.solutions FROM questions q WHERE q.id = ${questionId}`,
  ).then(res => res[0].solutions)
}

module.exports = {
  getQuiz,
  getQuestions,
  getOptions,
  getSolutions,
}
