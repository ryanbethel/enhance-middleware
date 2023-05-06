// import midWrap from '../middleware/middleware-wrapper.mjs'
// only needed for type 2 & 3 function style
import enhanceResponse from '../middleware/enhance-response.mjs'
// only needed for type 2 & 3
import { funcWrapper } from '../middleware/middleware-wrapper.mjs'
import navData from '../middleware/nav-data.mjs'

/***********************
* Minimal implementation would look like:
 
import midWrap from '../middleware/middleware-wrapper.mjs'
import nav-data from '../middleware/nav-data.mjs'

export const get = midWrap(nav-data, fancy)

async function fancy(req, res) {
  const teams = ['team1', 'team2']
  res.addData({ teams })
  return res
}

*****************/

// Type A old style
// export const get = [vanilla, hybrid, explicit, send]
export const get = [vanilla, hybrid, explicit, navData, funcWrapper(fancy), send]
// Type B wrap the array
// export const get = midWrap([vanilla, hybrid, explicit, fancy])
// Type C pass middleware as arguments
// export const get = midWrap(vanilla, hybrid, explicit, fancy)

// Type 1
async function vanilla(req) {
  req.myThing = 'myThing'
}

// Type 2
async function hybrid(req) {
  const res = enhanceResponse(req)
  res.addData({ myThing: req.myThing })
}

// Type 3
async function explicit(req) {
  const res = enhanceResponse(req)
  const stuff = { stuff: 'for' }
  res.addData({ stuff })
}

// Type 4
async function fancy(req, res) {
  const teams = ['team1', 'team2']
  res.addData({ teams })
  // return res
}

// End the chain. Only needed for Type A
async function send(req) {
  const response = enhanceResponse(req)
  return response.send()
}


