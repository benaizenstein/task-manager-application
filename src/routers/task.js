const express = require("express");
const router = new express.Router()
const auth = require("../middleware/auth");
const Task = require('../models/task')



router.get("/tasks", auth ,async (req, res) => {
    const match ={}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === "true"
    }
    if(req.query.sortBy){
        console.log(req.query.sortBy)
       const parts = req.query.sortBy.split(':')
       sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({path: 'tasks',match,options:{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }})
        res.send(req.user.tasks);
    } catch (e) {
        return res.status(500).send(e);
    }
});


router.get("/tasks/:id",auth ,async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id,owner:req.user._id});

        if (!task) {
            res.status(404);
            return res.send("task dosent exist");
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});


router.post("/tasks", auth,async (req, res) => {
    const task = new Task({...req.body,owner:req.user._id});
    
    try {
        await task.save();
        console.log("task added successfully");
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.patch("/tasks/:id",auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdated = ["description","completed"];
    const isValidOperation = updates.every((update) => allowedUpdated.includes(update));
    if (!isValidOperation) {
        return res.status(400).send("Invalid task update!");
    }
    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        
        if (!task) {
            return res.status(404).send("task dosent exist");
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        console.log("task updated successfully");
        // res.status(201);
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});



router.delete("/tasks/:id",auth,async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});
        if (!task) {
            return res.status(404).send("task dosent exist");
        }
        console.log("task deleted successfully");
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});
module.exports = router