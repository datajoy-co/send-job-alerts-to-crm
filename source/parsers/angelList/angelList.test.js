/* eslint-env jest */
const parseAngelListJobAlerts = require('./angelList')
let testEmails = require('./testEmails')

// const focusOn = null
const focusOn = 'October 5, 2020 at 10:58 am'
// const focusOn = 'October 6, 2020 at 3:32 pm'

function shouldFocusOn (testEmail) {
  return testEmail.name === focusOn
}

if (focusOn) {
  testEmails = testEmails.filter(shouldFocusOn)
}

for (const testEmail of testEmails) {
  test(`Should return the expected output for ${testEmail.name} `, () => {
    const output = parseAngelListJobAlerts(testEmail.email)
    expect(output).toEqual(testEmail.expectedOutput)
  })
}
