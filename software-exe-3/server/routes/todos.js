import express from 'express';
const router = express.Router();
import Todo from '../models/Todo.js';

// @desc    Get all todos for today
// @route   GET /api/todos
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todos = await Todo.find({ date: today });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a todo
// @route   POST /api/todos
router.post('/', async (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    priority: req.body.priority,
  });

  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Update a todo (complete/edit)
// @route   PATCH /api/todos/:id
router.patch('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (req.body.text != null) todo.text = req.body.text;
    if (req.body.priority != null) todo.priority = req.body.priority;
    if (req.body.completed != null) todo.completed = req.body.completed;
    
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
