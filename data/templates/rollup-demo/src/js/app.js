import Modal from './Modal'
import '../css/app.css'

async function init() {

  console.log('app')

  const txt = await red()
  console.log(txt)

  const modal = new Modal('pop modal')
  modal.init()

  window.setTimeout(() => {
    document.body.style.visibility = 'visible'
  }, 500)

}

function red() {
  return new Promise((resolve, reject) => {
    resolve('red')
  })
}

init()