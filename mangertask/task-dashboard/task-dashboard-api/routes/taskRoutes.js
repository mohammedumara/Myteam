const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
} = require('../controllers/taskController');

router.get('/', auth, getAllTasks);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);
router.get('/:id', auth, getTaskById);

module.exports = router;