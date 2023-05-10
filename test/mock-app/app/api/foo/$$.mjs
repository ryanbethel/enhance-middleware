import globalWrap from '../../middleware/global-middleware.mjs'

export const get = globalWrap(people, places, things)


async function people(req, response) {
  response.json = {...(response.json || {}),  people: 'Sarah' }
}

async function places(req, response) {
  response.json = {...(response.json || {}),   places: 'Canada' }
  // returning response short cuts chain
  return response
}

async function things(req, response) {
  response.json = {...(response.json || {}),    things: 'should not get this' }
}
