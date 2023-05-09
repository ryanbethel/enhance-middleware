export default function enhanceResponse(req) {
  let response = {}
  if (req.hasOwnProperty('enhanceResponse')) {
    response = req.enhanceResponse
  }
  else {
    req.enhanceResponse = response
    if (req.hasOwnProperty('session')) {
      req.enhanceResponse.session = { ...req.session }
    }
  }

  // Session helpers
  response.getSession = function() { return response.session }
  response.setSession = function(obj) {
    response.session = { ...obj }
    return response
  }
  response.clearSession = function() {
    response.session = {}
    return response
  }
  response.deleteSession = function(key) {
    if (key === undefined) throw new Error('no properties to remove')
    const isArray = Array.isArray(key)
    if (isArray) {
      key.forEach(k => delete response.session[k])
    }
    else {
      delete response.session[key]
    }
    return response
  }
  response.addSession = function(obj) {
    response.session = { ...response.session, ...obj }
    return response
  }
  // Location helpers
  response.setLocation = function(path) {
    response.location = path
    return response
  }
  response.clearLocation = function() {
    delete response.location
    return response
  }
  // Json/Data helpers
  response.getData = function() { return response.json }
  response.setData = function(obj) {
    response.json = { ...obj }
    return response
  }
  response.clearData = function() {
    response.json = {}
    return response
  }
  response.deleteData = function(key) {
    const isArray = Array.isArray(key)
    if (isArray) {
      key.forEach(k => delete response.json[k])
    }
    else {
      delete response.json[key]
    }
    return response
  }
  response.addData = function(obj) {
    response.json = { ...response.json, ...obj }
    return response
  }
  // Load  multiple properties
  response.load = function(obj) {
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        response[key] = obj[key]
      }
    }
    return response
  }

  response.send = function() {
    const {
      getSession,
      setSession,
      clearSession,
      deleteSession,
      addSession,
      setLocation,
      clearLocation,
      getData,
      setData,
      clearData,
      deleteData,
      addData,
      load,
      send,
      ...rest } = response

    return rest
  }

  return response
}
