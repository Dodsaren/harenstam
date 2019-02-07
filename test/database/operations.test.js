'use strict'

const expect = require('chai').expect
const execSync = require('child_process').execSync

const { pool } = require('../../database/database')
const {
  getQuiz,
  getQuestionsByQuizId,
  createQuiz,
  insertQuestion,
  getQuestions,
  getOptions,
  getSolutions,
  updateQuiz,
} = require('../../database/operations')

Feature('Database operations', () => {
  before(prepareTempDatabase)
  after(dropTempDatabase)

  Scenario('Quiz', () => {
    let quiz
    When('fetching quizzes', async () => {
      quiz = await getQuiz()
    })

    Then('we should get an array of quizzes', () => {
      expect(quiz).to.be.a('array')
    })

    And('a quiz should have the expected properties', async () => {
      expect(quiz[0]).to.have.property('id')
      expect(quiz[0]).to.have.property('label')
      expect(quiz[0]).to.have.property('questions_order')
      expect(quiz[0]).to.have.property('questions_order_type')
    })

    let specificQuiz
    When('fetching a specific quiz', async () => {
      specificQuiz = await getQuiz(1)
    })

    Then('we should get an array of ONE quiz with the correct id', () => {
      expect(specificQuiz).to.be.a('array')
      expect(specificQuiz.length).to.equal(1)
      expect(quiz[0].id).to.equal(1)
    })

    let created
    When('creating a quiz', async () => {
      created = await createQuiz({
        label: 'etikett',
        questionIds: [1, 2, 3],
        questions_order_type: 'random',
      })
    })

    Then('that quiz should be "gettable"', async () => {
      const quiz = await getQuiz(created.id)
      expect(quiz[0]).to.eql({
        id: created.id,
        label: 'etikett',
        questions_order: [1, 2, 3],
        questions_order_type: 'random',
      })
    })

    And('it should have questions', async () => {
      const questions = await getQuestionsByQuizId(created.id)
      expect(questions.length).to.equal(3)
    })

    When('updating a quiz label, questions and order', async () => {
      const update = {
        id: created.id,
        label: 'uppdaterad etikett',
        questionIds: [4, 5, 6],
        questions_order_type: 'ordered',
      }
      await updateQuiz(update)
    })

    Then('that quiz should be updated', async () => {
      const quiz = await getQuiz(created.id)
      expect(quiz[0]).to.eql({
        id: created.id,
        label: 'uppdaterad etikett',
        questions_order: [4, 5, 6],
        questions_order_type: 'ordered',
      })
    })

    And("the quiz's questions should be updated", async () => {
      const questions = await getQuestionsByQuizId(created.id)
      expect(questions.length).to.equal(3)
      expect(questions.map(q => q.id)).to.have.members([4, 5, 6])
    })
  })

  Scenario('Question', () => {
    let questions
    When('fetching questions', async () => {
      questions = await getQuestions()
    })

    Then('we should get an array of questions', () => {
      expect(questions).to.be.a('array')
    })

    And('a question should have the expected properties', () => {
      expect(questions[0]).to.have.property('id')
      expect(questions[0]).to.have.property('label')
      expect(questions[0]).to.have.property('options')
      expect(questions[0]).to.have.property('solutions')
      expect(questions[0]).to.have.property('category_id')
    })

    let specificQuestion
    When('fetching a pecific question by id', async () => {
      specificQuestion = await getQuestions(2)
    })

    Then('we should get an array of ONE question with the correct id', () => {
      expect(specificQuestion.length).to.equal(1)
      expect(specificQuestion[0].id).to.equal(2)
    })

    let created
    When('inserting a question', async () => {
      created = await insertQuestion({
        label: 'fråga',
        options: ['asd', 'rty', 'cvb'],
        solutions: [2],
        categoryId: 1,
      })
    })

    Then('that question should be inserted', async () => {
      const question = await getQuestions(created.id)
      expect(question[0]).to.eql({
        id: created.id,
        label: 'fråga',
        options: ['asd', 'rty', 'cvb'],
        solutions: [2],
        category_id: 1,
      })
    })

    And('it should have options', async () => {
      const options = await getOptions(created.id)
      expect(options).to.eql(['asd', 'rty', 'cvb'])
    })

    And('it should have solutions', async () => {
      const solutions = await getSolutions(created.id)
      expect(solutions).to.eql([2])
    })

    let updated
    When.skip('updating a question', async () => {
      updated = await updateQuestion({
        id: 1,
        label: 'Vad är det för fråga?',
        options: ['En bra', 'En dålig', 'En hyfsad', 'En fantastisk'],
        solutions: [3],
        categoryId: 2,
      })
    })

    Then.skip('that question should be updated', async () => {
      const updatedQuestion = getQuestion(updated.id)
      expect(updatedQuestion).to.eql({
        id: 1,
        label: 'Vad är det för fråga?',
        options: ['En bra', 'En dålig', 'En hyfsad', 'En fantastisk'],
        solutions: [3],
        categoryId: 2,
      })
    })
  })
})

function prepareTempDatabase() {
  // try {
  //   execSync('dropdb testdb')
  // } catch (e) {}
  execSync('createdb testdb')
  execSync('psql -d testdb -f ./test/database/testdb.sql')
}

async function dropTempDatabase() {
  await pool.end()
  execSync('dropdb testdb')
}
