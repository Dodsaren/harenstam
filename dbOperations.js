'use strict'

const { Pool } = require('pg')

const pool = new Pool()

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

async function execute(query, values = null) {
  try {
    const { rows } = await pool.query(query, values)
    console.log('query', query)
    console.log('rows', rows)
    return rows
  } catch (err) {
    console.log('query', query)
    console.log('ERROR', err)
    return err
  }
}

function getQuiz(quizId) {
  const q = `SELECT label, id, questions_order, questions_order_type FROM quiz`
  return !quizId ? execute(q) : execute(`${q} WHERE quiz.id = $1`, [quizId])
}

function getQuestions(questionId) {
  const q = 'SELECT q.label, q.id FROM question q'
  return !questionId
    ? execute(q)
    : execute(`${q} WHERE q.id = $1`, [questionId])
}

function getQuestionsByQuizId(quizId) {
  return execute(
    `SELECT DISTINCT q.label, q.id
    FROM quiz_question qq
    JOIN quiz qz ON qq.quiz_id = qz.id
    JOIN question q ON qq.question_id = q.id WHERE qz.id = $1`,
    [quizId],
  )
}

function getOptions(questionId) {
  return execute('SELECT q.options FROM question q WHERE q.id = $1', [
    questionId,
  ]).then(res => res[0] && res[0].options)
}

function getSolutions(questionId) {
  return execute('SELECT q.solutions FROM question q WHERE q.id = $1', [
    questionId,
  ]).then(res => res[0] && res[0].solutions)
}

function insertQuestion({ label, options, solutions }) {
  return execute(
    'INSERT INTO question (label, options, solutions) VALUES ($1, $2, $3) RETURNING *',
    [label, options, solutions],
  ).then(res => res[0])
}

async function insertQuiz({ label, questionIds, questions_order_type }) {
  try {
    const rows = await execute(
      'INSERT INTO quiz (label, questions_order, questions_order_type) VALUES($1, $2, $3) RETURNING *',
      [label, questionIds, questions_order_type],
    )
    const id = rows[0].id
    await Promise.all(
      questionIds.map(qid =>
        execute(
          'INSERT INTO quiz_question (quiz_id, question_id) VALUES($1, $2)',
          [id, qid],
        ),
      ),
    )
    console.log(rows[0])
    return rows[0]
  } catch (err) {
    console.log('INSERT QUIZ ERROR:', err)
    return err
  }
}

module.exports = {
  getQuiz,
  getQuestions,
  getQuestionsByQuizId,
  getOptions,
  getSolutions,
  insertQuestion,
  insertQuiz,
}
