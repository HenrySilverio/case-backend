const express = require('express')
const cors = require('cors')
const UserRouter = require('./routers/UserRouter')

const app = express()

app.use(express.json())

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

app.use('/users', UserRouter)


app.listen(5000)