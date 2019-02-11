'use strict'

const { execute, pool } = require('./database')

function getQuiz(quizId) {
  const q = `SELECT
      label,
      id,
      questions_order,
      questions_order_type,
      created,
      updated
    FROM quiz`
  return !quizId ? execute(q) : execute(`${q} WHERE quiz.id = $1`, [quizId])
}

function getQuestions(questionId) {
  const q = `SELECT
      label,
      id,
      options,
      options_solutions,
      free_text_solutions,
      category_id,
      created,
      updated
    FROM question`
  return !questionId ? execute(q) : execute(`${q} WHERE id = $1`, [questionId])
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
  return execute(`SELECT q.options_solutions FROM question q WHERE q.id = $1`, [
    questionId,
  ]).then(res => res[0] && res[0].options_solutions)
}

function insertQuestion({
  label,
  options,
  options_solutions,
  free_text_solutions,
  categoryId,
}) {
  return execute(
    `INSERT INTO question (
      label,
      options,
      options_solutions,
      free_text_solutions,
      category_id,
      created
    ) VALUES ($1, $2, $3, $4, $5, current_timestamp) RETURNING *`,
    [label, options, options_solutions, free_text_solutions, categoryId],
  ).then(res => res[0])
}

async function createQuiz({ label, questionIds, questions_order_type }) {
  const query = `
    WITH qz AS (
      INSERT INTO quiz (label, questions_order, questions_order_type, created)
      VALUES($1, $2, $3, current_timestamp)
      RETURNING id
    )
    INSERT INTO quiz_question (quiz_id, question_id)
		  SELECT qz.id, q_id FROM qz, unnest($2) q_id
			RETURNING (SELECT qz.id from qz)
    `
  return execute(query, [label, questionIds, questions_order_type]).then(
    res => res[0],
  )
}

async function updateQuestion({
  id,
  label,
  options,
  optionsSolutions,
  freetextSolutions,
  categoryId,
}) {
  const q = await getQuestions(id).then(res => res[0])
  if (!q) throw new Error('Question not found, abort update')
  return execute(
    `UPDATE question SET 
    label = $1,
    options = $2,
    options_solutions = $3,
    free_text_solutions = $4,
    category_id = $5,
    updated = current_timestamp
    WHERE id = $6 RETURNING *`,
    [
      label || q.label,
      decideArrayUpdateValue(q.options, options),
      decideArrayUpdateValue(q.options_solutions, optionsSolutions),
      decideArrayUpdateValue(q.free_text_solutions, freetextSolutions),
      categoryId || q.category_id,
      id,
    ],
  )
}

async function updateQuiz({ id, label, questionIds, questions_order_type }) {
  const quiz = await getQuiz(id).then(res => res[0])
  if (!quiz) throw new Error('Quiz not found, abort update')
  const params = [
    label || quiz.label,
    decideArrayUpdateValue(quiz.questions_order, questionIds),
    questions_order_type || quiz.questions_order_type,
    id,
  ]
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      `UPDATE quiz
      SET label = $1,
      questions_order = $2,
      questions_order_type = $3,
      updated = current_timestamp
      WHERE id = $4`,
      params,
    )
    await client.query(
      `INSERT INTO quiz_question (quiz_id, question_id)
      SELECT $1, q_id FROM unnest($2::int[]) q_id`,
      [id, questionIds],
    )
    await client.query(
      `DELETE FROM quiz_question WHERE quiz_id = $1 
      AND NOT question_id = ANY($2)`,
      [id, questionIds],
    )
    await client.query('COMMIT')
    return { id }
  } catch (err) {
    await client.query('ROLLBACK')
    console.log('ERROR UPDATING QUIZ', err)
    return err
  } finally {
    client.release()
  }
}

function deleteQuiz(id) {
  return execute('DELETE FROM quiz WHERE id = $1', [id])
}

function deleteQuestion(id) {
  return execute('DELETE FROM question WHERE id = $1', [id])
}

function decideArrayUpdateValue(o, n) {
  return n && n.length > 0 ? n : o
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
  updateQuestion,
  deleteQuiz,
  deleteQuestion,
}
