import enhanceResponse from './enhance-response.mjs'
import globalMiddleware from './global-middleware.mjs'
import { pathToRegexp } from 'path-to-regexp';



export default function chainWrapper(...chain) {
  const funcChain = Array.isArray(chain[0]) ? chain[0] : chain
  function global(req) {
    const funks = resolvePath(req.path)?.middleware
    if (!funks || !funks?.length) {
      return
    } else if (Array.isArray(funks)) {
      return ((req) => {
        for (let i = 0; i < funks.length; i++) {
          const result = funcWrapper(funks[i])(req);
          if (result) return result
        }
      })(req)
    } else {
      return funcWrapper(funks)(req)
    }
  }
  async function sendIt(req, response) { return response.send() }
  const newChain = funcChain.map(fun => funcWrapper(fun))
  return [global, ...newChain, funcWrapper(sendIt)]
}

export function funcWrapper(func) {
  return function(req) {
    const resp = enhanceResponse(req)
    let result = func(req, resp)
    if (result?.send && ((typeof result.send) === 'function')) {
      return result.send()
    } else {
      return result
    }
  }
}


// Convert the paths into regular expressions using pathToRegexp.
const regexPaths = Object.keys(globalMiddleware).sort(sorter).map(path => {
  const keys = [];
  // const regex = pathToRegexp(path, keys);
  const regex = pathToRegexp(clean({ pathTmpl: path, base: '', fileNameRegEx: '' }), keys);
  return { regex, keys, middleware: globalMiddleware[path] };
});


// Function to resolve a given URL path by specificity.
function resolvePath(urlPath) {
  for (const { regex, keys, middleware } of regexPaths) {
    const match = regex.exec(urlPath);
    if (match) {
      const params = keys.reduce((acc, key, index) => {
        acc[key.name] = match[index + 1];
        return acc;
      }, {});
      return { middleware, params };
    }
  }
  return null;
}

function clean({ pathTmpl, base, fileNameRegEx }) {
  return pathTmpl.replace(base, '')
    .replace(fileNameRegEx, '')
    .replace(/(\/?)\$\$\/?$/, '$1(.*)') // $$.mjs is catchall
    .replace(/\/\$(\w+)/g, '/:$1')
    .replace(/\/+$/, '')
}

/** helper to sort routes from least ambiguous to most */
function sorter(a, b) {
  // Sorting is done by assinging letters to each part of the path
  // and then using alphabetical ordering to sort on.
  // They are sorted in reverse alphabetical order so that
  // extra path parts at the end will rank higher when reversed.
  function pathPartWeight(str) {
    // assign a weight to each path parameter
    // catchall='A' < dynamic='B' < static='C' < index='D'
    if (str === '$$.mjs' || str === '$$.html') return 'A'
    if (str.startsWith('$')) return 'B'
    if (!(str === 'index.mjs' || str === 'index.html')) return 'C'
    if (str === 'index.mjs' || str === 'index.html') return 'D'
    // if (str === '*') return 'A'
    // if (str.startsWith(':')) return 'B'
    // return 'C'
  }

  function totalWeightByPosition(str) {
    // weighted by position in the path
    // /highest/high/low/lower/.../lowest
    // return result weighted by type and position
    // * When sorted in reverse alphabetical order the result is as expected.
    // i.e. /index.mjs = 'D'
    // i.e. /test/index.mjs = 'CD'
    // i.e. /test/this.mjs = 'CC'
    // i.e. /test/$id.mjs = 'CB'
    // i.e. /test/$$.mjs = 'CA'
    return str.split('/').reduce((prev, curr) => {
      return (prev + (pathPartWeight(curr)))
    }, '')
  }

  const aWeight = totalWeightByPosition(a)
  const bWeight = totalWeightByPosition(b)

  let output
  if (aWeight < bWeight) output = 1
  if (aWeight > bWeight) output = -1
  if (aWeight === bWeight) output = 0

  return output

}

