import ExpiryMap from 'expiry-map'
import Browser from 'webextension-polyfill'

const cache = new ExpiryMap(10 * 1000)

const KEY_ACCESS_TOKEN = 'accessToken'

async function load() {
  let error = 0
  let html = ''
  if (cache.get(KEY_ACCESS_TOKEN)) {
    error = 0
  } else {
    const resp = await fetch('https://chat.openai.com/api/auth/session')
    if (resp.status === 403) {
      error = 'cloudflare' //throw new Error('CLOUDFLARE')
    } else {
      const data = await resp.json().catch(() => ({}))
      if (!data.accessToken) {
        error = 'unauthorized' //throw new Error('UNAUTHORIZED')
      }
    }
  }
  if (error == 'cloudflare') {
    html = `
            Please login and pass Cloudflare check at
            <a href="https://chat.openai.com" target="_blank" rel="noreferrer">
            chat.openai.com
            </a>
        `
  } else if (error == 'unauthorized') {
    html = `
            Please login at <a href="https://chat.openai.com" target="_blank" rel="noreferrer">
            chat.openai.com
            </a> first
        `
  }
  if (!error)
    html = `<iframe scrolling="no" src="https://chat.openai.com/chat" frameborder="0" style="width: 100%;height:580px;"></iframe>`
  return html
}
// console.log('Error', '123');

;(async function () {
  let html = await load()
  document.getElementById('iframe').innerHTML = html
})()

document.getElementsByClassName('setting')[0].onclick = function () {
  console.log('Setting')

  Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
}
