const fs = require('fs')
const path = require('path')

const getDirectories = source =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

function getTestEmail (testEmailFolderName) {
  function getPathToTestEmailFile (fileName) {
    return path.join(__dirname, testEmailFolderName, fileName)
  }

  function readTestEmailFile (fileName) {
    const pathToFile = getPathToTestEmailFile(fileName)
    return fs.readFileSync(pathToFile, { encoding: 'utf-8' })
  }

  const bodyHtml = readTestEmailFile('body.html')
  const bodyPlainText = readTestEmailFile('body.txt')
  const expectedOutput = require(`./${testEmailFolderName}/expectedOutput.js`)

  return {
    name: testEmailFolderName,
    email: {
      bodyHtml,
      bodyPlainText
    },
    expectedOutput
  }
}

// const testEmailsPath = path.join(__dirname, 'testEmails')
const testEmailFolders = getDirectories(__dirname)
const testEmails = testEmailFolders.map(getTestEmail)
// console.log(testEmails)

module.exports = testEmails
