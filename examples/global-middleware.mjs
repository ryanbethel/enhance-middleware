import {makeGlobalWrap} from 'enhance-middleware'
import navData from './nav-data.mjs'
const manifest = {
  '/': navData,
  '/test': [navData],
  '/$$': [otherStuff, navData],
  '/try/$$': otherStuff,
}
export default manifest

function otherStuff(req, res) {
  res.addData({ otherStuff: 'otherStuff' })
}

export const globeWrap = makeGlobalWrap(manifest)
