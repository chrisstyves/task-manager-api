const express = require('express')
const router = new express.Router
const auth = require('../middleware/auth')
const Task = require('../models/task')

// Create a task
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    
    // add owner id to the task, which wasn't included in the request body
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)    
    }
    catch (e) {
        res.status(400).send(e)
    }

    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})

// Get all tasks owned by the authenticated user
// Takes a query param to allow filtering of results:
//   GET /tasks?completed=false
// Also, enable pagination to our results:
//   GET /tasks?limit=10&skip=0
//   where limit = how many results at once
//   where skip = how many results to skip
// Also, allow sorting
//   GET /tasks?sortBy=createdAt_asc (or createdAt:asc)
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if (req.query.completed) {
        // the query param is a string 'true'/'false', not a boolean
        match.completed = req.query.completed === 'true'
    }

    // expecting a query like createdAt:asc
    if (req.query.sortBy) {
        // split into 'createdAt' and 'asc'
        const parts = req.query.sortBy.split(':')
        // create a property in the sort object with name of 'createdAt' with value of -1 or 1
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }
    catch (e) {
        console.log(e)
        res.status(500).send()
    }

    // using promises, scrapped in favor of async/await
    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((e) => {
    //     res.status(500).send()
    // })
})

// Get a task by id
router.get('/tasks/:id', auth, async (req, res) => {
  
    try {
        //const task = await Task.findById(req.params.id) 

        const task = await Task.findOne({ 
            _id: req.params.id, 
            owner: req.user._id 
        })

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    }
    catch (e) {
        console.log(e)
        res.status(500).send()
    }

    // Task.findById(req.params.id).then((task) => {
    //     if (!task) {
    //         return res.status(404).send()
    //     }

    //     res.send(task)
    // }).catch((e) => {
    //     console.log(e)
    //     res.status(500).send()
    // })
    //console.log(req.params)
})

router.patch('/tasks/:id', auth, async (req, res) => {
    
    // only allow certain updates. if it's not on the approved list, reject the request
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed', 'description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if (!isValidOperation) {
        return res.status(400).send({error: "You can't update one of those fields"})
    }

    try {
        const task = await Task.findOne({ 
            _id: req.params.id,
            owner: req.user._id
        })

        // no task with that id?
        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])

        await task.save()

        // things went well
        res.send(task)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        })

        // no task by that id!
        if (!task) {
            return res.status(404).send()
        }

        // looks good
        res.send(task)
    }
    catch (e) {
        res.status(500).send()
    }
})

module.exports = router