// Sets up the mongoDB connection
// ------------------------------
const mongoose = require('mongoose')

const connectionURL = process.env.MONGODB_URL
const databaseName = 'task-manager-api'

mongoose.connect(connectionURL + '/' + databaseName, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// User and Task have moved to their own files in ../models

// const me = new User({
//     name: 'Christopher St. Yves   ',
//     email: 'Cstyves@GMAIL.COM',
//     password: '123456'
// })

// // this should fail
// //const me = new User({})

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })

// const task = new Task({
//     description: '    clean up'
// })

// task.save().then(() => {
//     console.log(task)
// })