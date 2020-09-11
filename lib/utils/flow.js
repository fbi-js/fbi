const readline = require('readline')
const style = require('./style')

/**
 * Terminal interaction
 *
 * @param {string|array} questions
 * @param {string} [customStyle='cyan'] style
 * @returns
 */
function prompt (questions, customStyle = 'cyan') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'OHAI> '
  })
  const prompts = typeof questions === 'string' ? [questions] : questions
  let index = 0
  const answers = []
  const get = () => {
    rl.setPrompt(style[customStyle](prompts[index]))
    rl.prompt()
    index++
  }
  get()

  return new Promise(resolve => {
    rl
      .on('line', answer => {
        answers.push(answer)
        if (index === prompts.length) {
          return rl.close()
        }
        get()
      })
      .on('close', () => {
        resolve(prompts.length > 1 ? answers : answers[0])
      })
  })
}

module.exports = {
  prompt
}
