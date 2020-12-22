const express = require('express')
const router = new express.Router
const auth = require('../middleware/auth')
const User = require('../models/user')
const multer = require('multer')
const sharp = require('sharp')

router.get('/test', (req, res) => {
    res.send('From a new file')
})

// Create a user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()

        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }

    // this is fine too, just using promise chaining instead of async/await
    // --------------------------------------------------------------------
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })

    // console.log(req.body)
    // res.send('testing!')
})

// Log a user in
router.post('/users/login', async (req, res) => {
    try {
        // our own method on the User model
        const user = await User.findByCredentials(req.body.email, req.body.password)
        // again, our own method, this time for an instance of a user
        const token = await user.generateAuthToken()

        res.send({ user, token })
    } 
    catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Challenge 111: Logout all sessions for a user
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Get a user's info (if they're authenticated)
router.get('/users/me', auth, async (req, res) => {
    
    // 'user' is added by us in the middleware function
    res.send(req.user)

    // Get all users
    // {} matches all Users in db    
    // This won't be an endpoint we actually support, because we won't 
    // allow users to see a user list. replacing with /users/me
    //
    // try {
    //     const users = await User.find({})
    //     res.send(users)
    // } catch (e) {
    //     res.status(500).send()
    // }
})

// Get a user by id
// router.get('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id)

//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)

//     } catch (e) {
//         res.status(500).send()
//     }
    
//     // User.findById(req.params.id).then((user) => {
//     //     if (!user) {
//     //         return res.status(404).send()
//     //     }

//     //     res.send(user)
//     // }).catch((e) => {
//     //     console.log(e)
//     //     res.status(500).send()
//     // })
//     //console.log(req.params)
// })

// update a user
router.patch('/users/me', auth, async (req, res) => {
    
    // only allow certain updates. if it's not on the approved list, reject the request
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if (!isValidOperation) {
        return res.status(400).send({error: "You can't update one of those fields"})
    }

    try {
        //const user = await User.findById(req.params.id)
        const user = req.user

        updates.forEach((update) => user[update] = req.body[update])

        await user.save()

        // this method bypasses mongoose, which is a problem if we want to run mongoose middleware functions (Lesson 104)
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        // no user with that id
        // if (!user) {
        //     return res.status(404).send()
        // }

        // things went well
        res.send(user)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

// delete a user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    }
    catch (e) {
        res.status(500).send()
    }
})

// upload an avatar for the authenticated user
// we had 'dest: avatars' when saving the upload to a local directory,
// but that's no good for deployment. without this property, multer will
// pass the data to the request (in req.file)
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            // sending back an error
            return cb(new Error('File must be a JPG, JPEG, or PNG'))
        }
        
        // everything went fine, file accepted.
        cb(undefined, true)
    }
})

// this endpoint has a 2nd arg in the route handler to customize what
// we are sending back in lieu of the raw error output (in this case
// we just send back a clean JSON error)
//
// this also has an example of multiple middleware functions being used.
// just add them both as args, in the order that you want them to run
// (so we're running authentication before handling the upload)
//
// view binary data in the browser using an <img src="data:image/jpg;base64,binarybufferbinarybufferbinarybuffer">
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        // use the 'sharp' library to resize/crop the image
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer()
        
        // buffer is the binary data for the file
        req.user.avatar = buffer

        await req.user.save()
        res.send()
    }
    catch (e) {
        res.status(500).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// delete the authenticated user's avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    }
    catch (e) {
        res.status(400).send()
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch (e) {
        res.status(404).send()
    }
})

module.exports = router