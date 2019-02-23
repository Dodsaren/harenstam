'use strict'

const chai = require('chai')
const expect = chai.expect
const chaiExclude = require('chai-exclude')
const execSync = require('child_process').execSync
const { pool } = require('../../src/database/database')
const {
  getQuiz,
  getQuestionsByQuizId,
  createQuiz,
  insertQuestion,
  getQuestions,
  getOptions,
  getOptionSolutions,
  getFreetextSolutions,
  updateQuiz,
  updateQuestion,
  deleteQuiz,
  deleteQuestion,
} = require('../../src/database/operations')

chai.use(chaiExclude)

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
      expect(quiz[0]).to.have.property('created')
      expect(quiz[0]).to.have.property('updated')
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

    Then('that quiz should have been created', async () => {
      const quiz = await getQuiz(created.id)
      expect(quiz[0])
        .excluding(['created'])
        .to.eql({
          id: created.id,
          label: 'etikett',
          questions_order: [1, 2, 3],
          questions_order_type: 'random',
          updated: null,
        })
      expect(quiz[0].created).to.be.a('date')
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
      expect(quiz[0])
        .excluding(['updated'])
        .to.eql({
          id: created.id,
          label: 'uppdaterad etikett',
          questions_order: [4, 5, 6],
          questions_order_type: 'ordered',
          created: quiz[0].created,
        })
      expect(quiz[0].updated).to.be.a('date')
    })

    And("the quiz's questions should be updated", async () => {
      const questions = await getQuestionsByQuizId(created.id)
      expect(questions.length).to.equal(3)
      expect(questions.map(q => q.id)).to.have.members([4, 5, 6])
    })

    When('updating a part of a quiz', async () => {
      await updateQuiz({
        id: created.id,
        questions_order_type: 'unordered',
      })
    })

    Then(
      'only that part and the updated timestamp field should be updated',
      async () => {
        const quiz = await getQuiz(created.id)
        expect(quiz[0])
          .excluding(['updated', 'created'])
          .to.eql({
            id: created.id,
            label: 'uppdaterad etikett',
            questions_order: [4, 5, 6],
            questions_order_type: 'unordered',
          })
        expect(quiz[0].updated).to.not.equal(created.updated)
      },
    )

    When('deleting a quiz', async () => {
      await deleteQuiz(created.id)
    })

    Then('it should be deleted', async () => {
      const quiz = await getQuiz(created.id)
      expect(quiz.length).to.equal(0)
    })

    And("that quiz's relations should be deleted", async () => {
      const relatedQuestions = await getQuestionsByQuizId(created.id)
      expect(relatedQuestions.length).to.equal(0)
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
      const q = questions[0]
      expect(q).to.have.property('id')
      expect(q).to.have.property('label')
      expect(q).to.have.property('options')
      expect(q).to.have.property('options_solutions')
      expect(q).to.have.property('free_text_solutions')
      expect(q).to.have.property('category_id')
      expect(q).to.have.property('created')
      expect(q).to.have.property('updated')
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
        options_solutions: [2],
        free_text_solutions: ['Karl Gustav', 'Silvia'],
        categoryId: 1,
      })
    })

    Then('that question should be inserted', async () => {
      const question = await getQuestions(created.id)
      expect(question[0])
        .excluding('created')
        .to.eql({
          id: created.id,
          label: 'fråga',
          options: ['asd', 'rty', 'cvb'],
          options_solutions: [2],
          category_id: 1,
          free_text_solutions: ['Karl Gustav', 'Silvia'],
          updated: null,
        })
      expect(question[0].created).to.be.a('date')
    })

    And('it should have options', async () => {
      const options = await getOptions(created.id)
      expect(options).to.eql(['asd', 'rty', 'cvb'])
    })

    And('it should have option solutions', async () => {
      const solutions = await getOptionSolutions(created.id)
      expect(solutions).to.eql([2])
    })

    And('it should have free text solutions', async () => {
      const solutions = await getFreetextSolutions(created.id)
      expect(solutions).to.eql(['Karl Gustav', 'Silvia'])
    })

    let updated
    When('updating a question', async () => {
      updated = await updateQuestion({
        id: created.id,
        label: 'Vad är det för fråga?',
        options: ['En bra', 'En dålig', 'En hyfsad', 'En fantastisk'],
        optionsSolutions: [3],
        freetextSolutions: ['Kalle Karlsson'],
        categoryId: 2,
      })
    })

    Then('that question should be updated', async () => {
      const updatedQuestion = await getQuestions(updated[0].id)
      expect(updatedQuestion[0])
        .excluding(['updated', 'created'])
        .to.eql({
          id: created.id,
          label: 'Vad är det för fråga?',
          options: ['En bra', 'En dålig', 'En hyfsad', 'En fantastisk'],
          options_solutions: [3],
          free_text_solutions: ['Kalle Karlsson'],
          category_id: 2,
        })
      expect(updatedQuestion[0].updated).to.be.a('date')
    })

    When('deleting a question', async () => {
      await deleteQuestion(1)
    })

    Then('that question should be deleted', async () => {
      const q = await getQuestions(1)
      expect(q.length).to.equal(0)
    })

    And('it should no longer be in the relations table', async () => {
      const { rows } = await pool.query(
        'SELECT * FROM quiz_question WHERE question_id = $1',
        [1],
      )
      expect(rows.length).to.equal(0)
    })
  })
})

function prepareTempDatabase() {
  execSync('createdb testdb')
  execSync('psql -d testdb -f ./test/database/testdb.sql')
}

async function dropTempDatabase() {
  await pool.end()
  execSync('dropdb testdb')
}
