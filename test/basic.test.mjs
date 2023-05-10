import test from 'tape'
import url from 'url'
import path from 'path'
import sandbox from '@architect/sandbox'
import { get } from 'tiny-json-http'

const baseUrl = 'http://localhost:3333'
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const mockDir = path.join(__dirname, '..', 'test', 'mock-app')

test(`Start local server`, async t => {
  await sandbox.start({ quiet: true, cwd: mockDir })
  t.pass('local server started')
  t.end()
})

test('local middleware work', async t => {
  const result = await get({ url: baseUrl + '/' })
  const expected = {people:'Sarah',places:'Canada'}
  t.deepEqual(result.body,expected, 'local middleware')
  t.end()
})

test('global middleware work', async t => {
  const result = await get({ url: baseUrl + '/foo/bar' })
  t.equal(result.body.path,"/foo/bar", 'global middleware')
  t.end()
})

test('async middleware work', async t => {
  const result = await get({ url: baseUrl + '/async-test' })
  const expected = {one:'1'}
  t.deepEqual(result.body,expected, 'async middleware')
  t.end()
})

test('Shut down local server', async t => {
  await sandbox.end()
  t.pass('Shut down Sandbox')
  t.end()
}) === 'one'
