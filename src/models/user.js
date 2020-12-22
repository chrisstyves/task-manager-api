const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email not valid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            // custom validation routine
            if (value < 0) {
                throw new Error('Age must be at least 0')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        validate(value) {
            if (value.includes('password')) {
                throw new Error('password cannot have "password" in it')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// not actually stored in the DB, this is establishing a relationship
// between schema. it's for Mongoose to figure out who owns what and
// how they're related
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        // in cases like these, better to provide a generic error message
        // so intruders have less information to work with.
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// an instance method. not on the User model, but on a specific user
userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET)
    
    this.tokens = this.tokens.concat({ token })
    await this.save()

    return token
}

// drops certain sensitive fields from the user in responses to the client
userSchema.methods.toJSON = function () {
    const userObject = this.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// Middleware - Hash the password before saving
// can't use an arrow function here because we need the 'this' pointer, 
// and arrow functions don't bind the 'this' pointer
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    // console.log('just before saving')
    
    // without this call, it will hang forever
    next()
})

// Middleware - Delete all of a user's task when a user is deleted
userSchema.pre('remove', async function (next) {
    await Task.deleteMany({ owner: this._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User