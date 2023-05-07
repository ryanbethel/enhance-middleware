# Enhance Middleware

A middleware wrapper for the enhance html first framework. 
Includes:
- Global middleware handlers
- Response for data passing between middleware
- Helpers for sessions
- Helpers for data passing across middleware

## *Experimental*

This package is a work in progress. 
The API will likely change.
The goal is to test ideas and patterns for middleware to support Enhance.

## Getting Started
1. `npm i enhance-middleware`

## Basic Usage

```JavaScript
//app/api/index.mjs
import midWrap from 'enhance-middleware'
export const get = midWrap(one, two)

async function one (req,response) {
  response.addData({first:true})
}

async function two (req,response) {
  return response.addData({second:true})
}
```

## Global Middleware Usage
```JavaScript
//app/middleware/global-middleware.mjs
import {makeGlobalWrap} from 'enhance-middleware'
import otherStuff from './other-stuff.mjs'
const manifest = {
  '/': navData
  '/$$': [navData, accountData],
  '/special/route': otherStuff,
}

function navData(req,response){
  response.addData({path:req.path})
}
function accountInfo(req, response) {
  const session = response.getSession()
  response.addData({ authorized: session?.authorized ? session?.authorized : false })
}

export const globeWrap = makeGlobalWrap(manifest)
```


```JavaScript
//app/api/index.mjs
import globeWrap from '../middleware/global-middleware.mjs'
export const get = globeWrap(one, two)

async function one (req,response) {
  response.addData({first:true})
}

async function two (req,response) {
  return response.addData({second:true})
}
```

## API 
The primary API for `enhance-middleware` is the response helpers exposed in the handler response object.

Each of these methods (except for getSession and getData) returns the response object so they can be chained together.

### Session Helpers
- `getSession()`: Get the current session object.
- `setSession(newSession)`: Set a new obect as the outgoing session.
- `clearSession()`: Clear the session.
- `deleteSession(keys)`: Delete selected keys from the session. Takes a single string key, or an Array of strings of keys to remove.
- `addSession(obj)`: Add an object to the session by spreading it into the current session. 

### Redirect Location Helpers
- `setLocation(path)`: Set a redirect location for the response. 
- `clearLocation()`: Clear any redirect path that has been set for the response.

### Data/JSON Helpers
- `getData()`: Get the `json` data that has been set on the response.
- `setData(obj)`: Set a new object as the `json` data for the response. 
- `clearData()`: Clear any `json` data set for the response.
- `deleteData(keys)`: Delete and remove selected keys from the response. Accepts a string for a single key or an array of strings.
- `addData(obj)`: Add an object to `json` data by spreading it into the existing data.

### Send Response
- `send()`: Removes the methods like `getData` etc. from the response object and returns the clean response. This is handled internally by the wrapper function and does not need to be explicitly called in most situations.

## What it does
Enhance-middleware is consumed as a wrapper function used in any Enhance API route.
1. Creates a response object with helpers
2. Adds that object to handlers 
3. Injects global middleware for matching routes
To use the global middleware the manifest of middleware is passed to a fuction that returns a new wrapper with the global middleware injected.
There is an alternate usage to wrap just a single middlware function without using the chain wrapper or the global middleware.


### Backward Compatible
Enhance middleware is backward compatible with normal enhance API route handlers.
They can be used together. 

```JavaScript
//app/api/index.mjs
import midWrap from 'enhance-middleware'
export const get = midWrap([one, two])

async function one (req) {
  console.log('hi from one')
  req.first = true
}

async function two (req) {
  console.log('hi from two')
  const second = false

  return { json: [req.first, second] }
}

```


### Alternate usage

## Background / What problem does this solve

### Session spreading
Managing sessions requires a lot of bookeeping. 
The user session may be used for multiple things at the same time. 
It may contain a authenticated account, shopping cart, and form data. 
A normal operation may require removing specific session keys, adding other keys, and passing along unknown keys used elsewhere.
This is usually handled by spreading data on or off while creating new copies of the session.

```JavaScript
async function form (req) {
 if (req.session.problems) {
  let { problems, book, ...newSession } = req.session
  return {
    session:newSession,
    json: { problems, book }
  }
}
```

### No API for passing data between Middleware
The array form of API routes allows passing multiple handlers in a chain.
These handlers each have access to the request object. 
Any handler in the chain can send terminate by returning the response.
The only way to pass data along is to hang it on the request and then pull it off again in the next middleware.
This makes it difficult to share middleware accross projects without consistent patterns for how to handle this passing.
It can be easy to lose data if whatever middleware returns a response misses pulling off passed data and adding it to that response.

```JavaScript
export let get = [one, two]

async function one (req) {
  console.log('hi from one')
  req.first = true
}

async function two (req) {
  console.log('hi from two')
  const second = false

  return { json: [req.first, second] }
}
```

### Global nav data and authentication data
Global middleware is usually not the best abstraction for handling most problems. 
Most middleware solutions only apply to a subset of routes.
In that case it is usually best to explicitly add them to those routes rather than apply a blanket solution and have to remove it in some places.
There are two noteworthy exceptions to this general rule. 
Passing navigation data to routes so that the navigation menu can highlight where you are is a good use of global middleware.
An authetication gaurd function that blocks certain routes enitirely for unauthenticated users is a good use of individually applied middleware.
But passing account information to routes so that pages can be rendered specifically for a user is another good use for global middleware.





