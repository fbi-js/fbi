import inquirer from 'inquirer'
import { log, merge } from '../utils'
import cfg from '../config'

function templateQuestions() {
  return new Promise((resolve, reject) => {
    inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'choose',
      choices: ['select a template', 'new template']
    }).then(ans => {
      if (ans.action === 'select a template') { // select
        inquirer.prompt({
          type: 'list',
          name: 'tmpl',
          message: 'choose one',
          choices: ['fbi-template-h5-pc', 'fbi-template-h5-mobile', 'fbi-template-vue', 'fbi-template-react', 'fbi-template-angular']
        }).then(ret => {
          resolve(ret)
        })
      } else { // new
        inquirer.prompt({
          type: 'input',
          name: 'url',
          message: 'where is the template?'
        }).then(ret => {
          resolve(ret)
        })
      }
    })
  })
}

function overwriteQuestions() {
  return new Promise((resolve, reject) => {
    inquirer.prompt({
      type: 'confirm',
      name: 'overwrite',
      default: false,
      message: 'Current folder is a fbi project, do you want overwrite it?'
    }).then(ans => {
      resolve(ans)
    })
  })
}


export default async (ucfg) => {
  merge(cfg, ucfg)

  let data = await templateQuestions()
  log(data)

  if (data.tmpl) {
    if(ucfg){
      let ow = await overwriteQuestions()
      log(ow)
    }
  } else if (data.url) {

  }

}

