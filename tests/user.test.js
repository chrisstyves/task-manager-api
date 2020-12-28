const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, userOneId, setupDatabase } = require('./fixtures/db')

// running tests such as signing up a new user would only successfully run once
// with jest's setup/teardown methods such as this one. this lets us start with
// a clean database environment
beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Christopher',
        email: 'chris@testing.com',
        password: 'Rawhide12345!'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    
    //this checks just one field in the document
    // expect(response.body.user.name).toBe('Christopher')
    
    // this checks a number of things in the document
    expect(response.body).toMatchObject({
        user: {
            name: 'Christopher',
            email: 'chris@testing.com'
        },
        token: user.tokens[0].token
    })
    
    // Assert that password wasn't stored as plain text
    expect(user.password).not.toBe('Rawhide12345!')
})

test('Should login an existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    // Assert the token in response matches a 2nd token in the db
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login a nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: "junk@junk.com",
        password: "qwert12345!"
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

        // Assert that the database was changed correctly
        const user = await User.findById(userOneId)
        expect(user).toBeNull()
})

test('Should note delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

// because we run beforeEach() after each test, it doesn't matter that the
// preceding tests deleted the user that is being used here
test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    // was binary data saved to db?
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update a valid user field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "Blood Donor"
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Blood Donor')
})

test('Should not update an invalid user field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            bloodType: "A+"
        })
        .expect(400)

    // this is overkill
    const user = await User.findById(userOneId)
    expect(user.bloodType).toBe(undefined)
})

//
// More User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated