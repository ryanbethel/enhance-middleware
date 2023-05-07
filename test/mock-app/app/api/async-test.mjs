import midWrap from 'enhance-middleware'

export const get = midWrap(middle)


async function middle(req, response) {
  await new Promise(resolve => setTimeout(resolve, 10));
  response.addData({ one: '1' })
}

