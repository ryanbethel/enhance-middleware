import {globeWrap} from '../../middleware/global-middleware.mjs'

export const get = globeWrap(people, places, things)


async function people(req, response) {
  response.addData({ people: 'Sarah' })
}

async function places(req, response) {
  response.addData({ places: 'Canada' })
  // returning response short cuts chain
  return response
}

async function things(req, response) {
  response.addData({ things: 'should not get this' })
}
