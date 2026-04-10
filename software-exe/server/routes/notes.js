import express from 'express';
const router = express.Router();
import Note from '../models/Note.js';

// @desc    Get all notes
// @route   GET /api/notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a note
// @route   POST /api/notes
router.post('/', async (req, res) => {
  const note = new Note({
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags,
  });

  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Update a note
// @route   PATCH /api/notes/:id
router.patch('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (req.body.title != null) note.title = req.body.title;
    if (req.body.content != null) note.content = req.body.content;
    if (req.body.tags != null) note.tags = req.body.tags;
    
    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
