/***********************
* Minimal usage would look like this:
 
import midWrap from '../middleware/middleware-wrapper.mjs'
import navData from '../middleware/nav-data.mjs'

export const get = midWrap(nav-data, fancy)

async function fancy(req, res) {
  const teams = ['team1', 'team2']
  res.addData({ teams })
  return res
}

*****************/


import midWrap from '../middleware/middleware-wrapper.mjs'
// only needed for type 2 & 3 function style
import enhanceResponse from '../middleware/enhance-response.mjs'

// only needed for type A current middleware array
// import { funcWrapper } from '../middleware/middleware-wrapper.mjs'

// Another middleware added
import navData from '../middleware/nav-data.mjs'


// Type A old style
// export const get = [vanilla, hybrid, explicit, funcWrapper(fancy), send]

// Type B wrap the array
// export const get = midWrap([vanilla, hybrid, explicit, fancy])

// Type C pass middleware as arguments
// export const get = midWrap(vanilla, hybrid, explicit, fancy, navData)
export const get = midWrap(vanilla, hybrid, explicit, fancy)

// Type 1
async function vanilla(req) {
  req.vanilla = 'Type 1'
}

// Type 2
async function hybrid(req) {
  const res = enhanceResponse(req)
  res.addData({ fromVanilla: req.vanilla })
  res.addData({ hybrid: 'Type 2' })
}

// Type 3
async function explicit(req) {
  const res = enhanceResponse(req)
  res.addData({ explicit: 'Type 3' })
}

// Type 4
async function fancy(req, res) {
  res.addData({ fancy: 'Type 4' })
  // return res
}

// End the chain. Only needed for Type A
async function send(req) {
  const response = enhanceResponse(req)
  return response.send()
}


