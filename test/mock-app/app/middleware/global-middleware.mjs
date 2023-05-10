import {makeGlobalWrap} from 'enhance-middleware'
import navData from './nav-data.mjs'
const manifest = {
  '/': navData,
  '/test': [navData],
  '/$$': [otherStuff, navData],
  '/try/$$': otherStuff,
}

function otherStuff(req, res) {
  res.json = {...(res.json || {}), otherStuff: 'otherStuff' }
}

export default makeGlobalWrap(manifest)
