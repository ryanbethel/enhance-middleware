# Enhance Middleware

A middleware wrapper for the enhance html first framework. 
Includes:
- Global middleware handlers
- Response for data passing between middleware

## *Experimental*

This package is a work in progress. 
The API will likely change.
The goal is to test ideas and patterns for middleware to support Enhance.

## Getting Started

First install the package with `npm i enhance-middleware`. 
Use this wrapper in API routes to give an optional response second argument. 
This response has helper methods for passing data from one middleware to the next. 
It is fully backward compatible with previous function signature.
This may be used together with old style API handlers.


## Basic Usage

```JavaScript
//app/api/index.mjs
import midWrap from 'enhance-middleware'
export const get = midWrap(one, two)

async function one (req,response) {
  response.json = { ...(response.json || {}), first:true }
}

async function two (req,response) {
  response.json = { ...(response.json || {}), second:true }
  return response
}
// { first:true, second:true }
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
  response.json = {...(response.json || {}), path:req.path }
}

function accountInfo(req, response) {
  const session = response.session
  response.json = {...(response.json || {}), authorized: session?.authorized ? session?.authorized : false }
}

export const globeWrap = makeGlobalWrap(manifest)
```


```JavaScript
//app/api/index.mjs
import globeWrap from '../middleware/global-middleware.mjs'
export const get = globeWrap(one, two)

async function one (req,response) {
  response.json = {...(response.json || {}), first:true }
}

async function two (req,response) {
  response.json = {...(response.json || {}), second:true}
}
// { path:'/', authorized:{user:'janedoe'}, first:true, second:true }
```

## Example with form problems

```JavaScript
// app/api/books.mjs

export async function get(req) {
  const { problems, book, ...newSession } = req.session
  if (problems) {
    return {
      session: newSession,
      json: { problems, book }
    }
  }
  return {
    session: newSession,
  }
}

export async function post(req) {
  const session = req.session
  let { problems: removedProblems, book: removedBook, ...newSession } = session

  let { problems, book } = await validate(req)

  if (problems) {
    return {
      session: { ...newSession, problems, formData },
      location: '/books'
    }
  }

  await setData()
  return {
    session: newSession,
    location: '/success'
  }
}
```

```JavaScript
// app/api/books.mjs

export async function get(req,response) {
  const { problems, book } = response.session
  if (problems) {
    return response.setData({problems,book}).deleteSession(['problems', 'book']) 
  }
  return response
}

export async function post(req) {
  const session = req.session
  let { problems: removedProblems, book: removedBook, ...newSession } = session

  let { problems, book } = await validate(req)

  if (problems) {
    return {
      session: { ...newSession, problems, formData },
      location: '/books'
    }
  }

  await setData()
  return {
    session: newSession,
    location: '/success'
  }
}
```

## What it does
Enhance-middleware is consumed as a wrapper function used in any Enhance API route.
1. Creates a response object
2. Adds that object to handlers 
3. Injects global middleware for matching routes
To use the global middleware the manifest of middleware is passed to a fuction that returns a new wrapper with the global middleware injected.
There is an alternate usage to wrap just a single middlware function without using the chain wrapper or the global middleware.

### Backward Compatible
Enhance middleware is backward compatible with normal enhance API route handlers.
They can be used together. 
Code below shows the midWrap function used with old style handlers.  
This works as expected with on changes required.
This makes the approach incrementally adoptable.
If a new style middleware or global middleware is added the midWrap function can be added without changing anything else.

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


### Partial adoption / alternative usage

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





