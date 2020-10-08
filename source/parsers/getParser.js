module.exports = async function getParser (params) {
  if (params.type === 'email' && params.bodyPlainText.includes('AngelList')) {
    return require('./angelList/angelList.js')
  }
}
