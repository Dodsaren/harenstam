'use strict'

const { execute, pool } = require('./database')

function getQuiz(quizId) {
  const q = `SELECT label, id, questions_order, questions_order_type FROM quiz`
  return !quizId ? execute(q) : execute(`${q} WHERE quiz.id = $1`, [quizId])
}

function getQuestions(questionId) {
  const q =
    'SELECT q.label, q.id, q.options, q.solutions, q.category_id FROM question q'
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

function insertQuestion({ label, options, solutions, categoryId }) {
  return execute(
    'INSERT INTO question (label, options, solutions, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [label, options, solutions, categoryId],
  ).then(res => res[0])
}

async function createQuiz({ label, questionIds, questions_order_type }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      'INSERT INTO quiz (label, questions_order, questions_order_type) VALUES($1, $2, $3) RETURNING *',
      [label, questionIds, questions_order_type],
    )
    const quiz = rows[0]
    let i = 2
    await client.query(
      `INSERT INTO quiz_question (quiz_id, question_id) VALUES ${questionIds
        .map(() => `($1, $${i++})`)
        .join(',')} RETURNING *`,
      [quiz.id, ...questionIds],
    )
    await client.query('COMMIT')
    return quiz
  } catch (err) {
    await client.query('ROLLBACK')
    console.log('INSERT QUIZ ERROR:', err)
    return err
  } finally {
    client.release()
  }
}

async function updateQuiz({ id, label, questionIds, questions_order_type }) {
  const quiz = await getQuiz(id)
  if (quiz.length < 1) throw new Error('Quiz not found, abort update')
  const params = [
    decideStringUpdateValue(quiz.label, label),
    decideArrayUpdateValue(quiz.questions_order, questionIds),
    decideStringUpdateValue(quiz.questions_order_type, questions_order_type),
    id,
  ]
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      'UPDATE quiz SET label = $1, questions_order = $2, questions_order_type = $3 WHERE id = $4',
      params,
    )
    let i = 2
    await client.query(
      `INSERT INTO quiz_question (quiz_id, question_id) VALUES ${questionIds
        .map(() => `($1, $${i++})`)
        .join(',')}`,
      [id, ...questionIds],
    )
    i = 2
    await client.query(
      `DELETE FROM quiz_question WHERE quiz_id = $1 AND question_id NOT IN (${questionIds.map(
        () => `$${i++}`,
      )})`,
      [id, ...questionIds],
    )
    await client.query('COMMIT')
    return 'success'
  } catch (err) {
    await client.query('ROLLBACK')
    console.log('ERROR UPDATING QUIZ', err)
    return err
  } finally {
    client.release()
  }
}

function decideArrayUpdateValue(o, n) {
  return n && n.length > 0 ? n : o
}

function decideStringUpdateValue(o, n) {
  return n && o !== n ? n : o
}

module.exports = {
  getQuiz,
  getQuestions,
  getQuestionsByQuizId,
  getOptions,
  getSolutions,
  insertQuestion,
  createQuiz,
  updateQuiz,
}
