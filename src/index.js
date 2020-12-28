const app = require('./app')

const port = process.env.PORT

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

// file upload example code
// ------------------------
// const multer = require('multer')

// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         // another example is to use regex
//         // file.originalName.match(/\.(doc|docx)$/)
//         if (!file.originalname.endsWith('.pdf')) {
//             // sending back an error
//             return cb(new Error('File must be a PDF'))
//         }
        
//         // everything went fine, file accepted.
//         cb(undefined, true)
//     }
// })

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message })
// })


// middleware function. this is called before the route handler
// without using 'next', it'll hang here forever
// also, it's better to do this in its own file (see middleware folder)
// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })

// Challenge 108: set up middleware for maintenance mode
// app.use((req, res, next) => {
//     res.status(503).send('Sorry, we are down for maintenance. Come back soon!')
// })

// just messing with bcryptjs
// const bcrypt = require('bcryptjs')

//const jwt = require('jsonwebtoken')

//const myFunction = async () => {
    // const password = 'Red12345!'
    // const hashed = await bcrypt.hash(password, 8)

    // console.log(password + ' ' + hashed)

    // if (await bcrypt.compare('nope', hashed)) {
    //     console.log('Yay, a match')
    // }

    // signing a token requires:
    // 1.) a unique identifier
    // 2.) a secret key
    // 3.) (optional) expiration
    // const token = jwt.sign({ _id: 'abc123' }, 'thisismynewpug', { expiresIn: '7 days'})
    // console.log(token)

    // const data = jwt.verify(token, 'thisismynewpug')
    // console.log(data)

    // a token (base64 encoded) is made up of a 
    // 1.) header
    // 2.) payload (contains id above, and 'issed at' encoded date)
    // 3.) signature, used to verify the token
//}

//myFunction()