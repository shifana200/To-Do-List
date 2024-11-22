const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // To serve static files like CSS

// Temporary in-memory storage for tasks
let tasks = []; 

// Show the To-Do List
app.get('/', (req, res) => {
    // Render index.ejs and pass the tasks array to it
    res.render('index', { tasks: tasks });
});

// Add a Task
app.post('/add', (req, res) => {
    const newTask = req.body.task;
    tasks.push(newTask);  // Add the new task to the tasks array
    res.redirect('/');  // Redirect to the home page after adding the task
});

// Delete a Task
app.post('/delete', (req, res) => {
    const taskIndex = req.body.index;  // Get the index of the task to delete
    tasks.splice(taskIndex, 1);  // Remove the task from the tasks array
    res.redirect('/');  // Redirect to the home page after deleting the task
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
