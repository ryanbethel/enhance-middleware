import navData from './nav-data.mjs'
const manifest = {
  // '/': navData
  '/': [navData],
  // '/$$': [otherStuff, navData],
  // '/try/$$': otherStuff,
}
export default manifest

function otherStuff(req, res) {
  res.addData({ otherStuff: 'otherStuff' })
}


