import { pathToRegexp } from 'path-to-regexp';

export default function midWrap(...chain) {
  const funcChain = Array.isArray(chain[0]) ? chain[0] : chain
  function startChain(req) {
    req.enhanceResponse = {}
    req.enhanceResponse.session = { ...(req.session || {}) }
  }
  function endChain(req) { return req.enhanceResponse }
  const newChain = funcChain.map(fun => funkWrap(fun))
  return [startChain, ...newChain, endChain]
}

export function funkWrap(func) {
  return function(req) {
    return func(req, req?.enhanceResponse)
  }
}

/***********************************************************************
* Global Middleware
* **********************************************************************/

export function makeGlobalWrap(globalManifest){

  function globalHandler(req) {
    const regexPaths = Object.keys(globalManifest).sort(sorter).map(path => {
      const regex = pathToRegexp(clean(path));
      return { regex, middleware: globalManifest[path] };
    });
    const match = regexPaths.find(path => path.regex.exec(req.path))?.middleware
    if (Array.isArray(match)) {
      return ((req) => {
        for (let i = 0; i < match.length; i++) {
          const result = funkWrap(match[i])(req)
          if (result) return result;
        }
      })(req)
    } else if (match) {
      return funkWrap(match)(req)
    } 
  }

  return function globalWrap(...chain){
    const funcChain = Array.isArray(chain[0]) ? chain[0] : chain
    return midWrap([globalHandler, ...funcChain])
  }
}

function clean(path) {
  return path.replace(/(\/?)\$\$\/?$/, '$1(.*)') 
    .replace(/\/\$(\w+)/g, '/:$1')
    .replace(/\/+$/, '')
}

function sorter(a, b) {
  function pathPartWeight(str) {
    if (str === '$$') return 'A'
    if (str.startsWith('$')) return 'B'
    return 'C'
  }
  function totalWeightByPosition(str) {
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
