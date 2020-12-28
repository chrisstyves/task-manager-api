const express = require('express')
const cors = require('cors')

// this just executes the script
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

// lets this API be used from remote URLs
app.use(cors())

// automatically parse incoming JSON to an object
app.use(express.json())

// we refactored all these routes into their own files for maintainability
app.use(userRouter)
app.use(taskRouter)

module.exports = app