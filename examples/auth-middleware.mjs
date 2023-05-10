export function authRedirect(redirect) {
  return function(req, res) {
    if (!res.session?.authorized) {
      res.session = {...(res.session || {}), redirectAfterAuth: redirect}
      res.location = '/login'
      return res
    }
    else {
      res.json = {...res.json, authorized: res.session.authorized }
    }
  }
}

export function accountInfo(req, res) {
  res.json = res.json || {}
  const authorized = res.session?.authorized ? res.session?.authorized : false 
  res.json = {...res.json, authorized }
}

export function auth(req, res) {
  if (!res.session?.authorized) {
    res.location = '/login'
    return res
  }
  else {
    res.json = {...(res.json || {}), authorized: res.session.authorized }
  }
}

export function checkRole(role) {
  return function(req, res) {
    const userRoles = res.session?.authorized?.roles
    if (!role || !userRoles?.includes(role)) {
      res.location = '/'
      return res
    }
  }
}

