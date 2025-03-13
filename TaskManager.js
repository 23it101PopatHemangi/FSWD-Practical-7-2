// const { raw } = require('body-parser');
// const express = require('express')
// const app = express()
// const mongoose = require('mongoose')
// require('dotenv').config({ path: __dirname + '/p7.env' });
// const port = 3000
// let taskarr;

// const dbconnect = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URL, {
//         });
//     } catch (error) {
//         console.log("MONGO_URL from .env:", process.env.MONGO_URL);
//         console.log("Error connecting to MongoDB:", error.message);
//     }
// }
// dbconnect();
// const taskSchema = new mongoose.Schema({
//     id: Number,
//     title: String,
//     description: String,
//     status: String,
//     dueDate: Date
// });
// const task = mongoose.model('task', taskSchema);

// // Project: Task Manager API

// // Objective: Build a RESTful API with Express and Mongoose to manage tasks in a MongoDB collection.

// // Tasks
// // Define a Task schema with fields like title, description, status (e.g., "Pending", "Completed"), and dueDate.
// // Set up the following API endpoints:
// // POST /tasks: Add a new task to the taskarrbase.
// // GET /tasks: Retrieve all tasks.
// // GET /tasks/:id: Retrieve a specific task by ID.
// // PUT /tasks/:id: Update task details by ID.
// // DELETE /tasks/:id: Delete a task by ID.
// // Test the API endpoints using Postman or Thunder Client.
// // Use filters to query tasks based on their status or dueDate.
// // Handle basic errors, such as invalid task IDs or missing fields.

// // let taskarr;
// const fetchtasks = async () => {
//     try {
//         const taskarr = await task.find();
//         return taskarr;
//     } catch (error) {
//         console.error("Error fetching tasks:", error);
//     }
// };
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// app.get('/', async function (req, res) {
//     // console.log(fetchtasks());
//     taskarr = await fetchtasks();
//     res.status(200).json(await fetchtasks());
// });

// app.post('/', function (req, res) {
//     // let newItem = {
//     //     id: newId,
//     //     name: req.body.name,
//     //     course: req.body.course,
//     //     roll_no: req.body.roll_no
//     // }
//     const task1 = new task({
//         id: req.body.id,
//         title: req.body.title,
//         description: req.body.description,
//         status: req.body.status,
//         dueDate: req.body.dueDate
//     })
//     task1.save().then(() => console.log('User created successfully'));
//     res.status(201).json({
//         'message': "successfully created"
//     });
// });

// app.put('/:id', async function (req, res) {   
//     taskarr=await fetchtasks();
//     console.log(taskarr);
//     let found = taskarr.find(function (item) {
//         return item.id === parseInt(req.params.id);
//     });
//     if (found) {
//         let filter={id:req.body.id};
//         let updatetaskarr = {
//             id: req.body.id,
//             title: req.body.title,
//             description: req.body.description,
//             status: req.body.status,
//             dueDate: req.body.dueDate
//         };
//         await task.findOneAndUpdate(filter, updatetaskarr);
//         res.status(201).json({ 'message': "taskarr updated" });
//     } else {
//         res.status(404).json({
//             'message': 'unable to insert taskarr because taskarr inserted not matched'
//         });
//     }
// });

// app.delete('/:id', async function (req, res) {
//     taskarr=await fetchtasks();
//     let found = taskarr.find(function (item) {
//         return item.id === parseInt(req.params.id);
//     });
//     if (found) {
//         await task.deleteOne({ id: req.params.id });
//         res.sendStatus(200);
//     } else {
//         res.sendStatus(404);
//     }
// });

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const port = 3000;

// MongoDB Connection
const dbconnect = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is undefined. Check your .env file.");
        }
        await mongoose.connect(process.env.MONGO_URL, {});
        console.log("✅ MongoDB Connected!");
    } catch (error) {
        console.log("❌ Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};
dbconnect();

// Task Schema & Model
const taskSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    status: String,
    dueDate: Date
});
const Task = mongoose.model('Task', taskSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Fetch all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks." });
    }
});

// Create a new task
app.post('/tasks', async (req, res) => {
    try {
        console.log("Received request body:", req.body);  // Debug log

        // Extract values
        const { id, title, description, status, dueDate } = req.body;

        // Validate required fields
        if (!id || !title || !dueDate) {
            return res.status(400).json({ error: "Missing required fields: id, title, or dueDate." });
        }

        // Convert dueDate to a proper Date object
        const task = new Task({
            id,
            title,
            description,
            status: status || "Pending",
            dueDate: new Date(dueDate)
        });

        const savedTask = await task.save();
        res.status(201).json({ message: "Task created successfully", task: savedTask });

    } catch (error) {
        console.error("❌ Error adding task:", error);
        res.status(500).json({ message: "Failed to create task", error: error.message });
    }
});

// Update a task by ID
app.put('/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found." });
        }
        res.status(200).json({ message: "Task updated successfully." });
    } catch (error) {
        res.status(400).json({ error: "Error updating task." });
    }
});

// Delete a task by ID
app.delete('/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ id: parseInt(req.params.id) });
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found." });
        }
        res.status(200).json({ message: "Task deleted successfully." });
    } catch (error) {
        res.status(400).json({ error: "Error deleting task." });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
