const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('manager', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    // Add task counts to each project
    const projectsWithStats = await Promise.all(projects.map(async (p) => {
      const tasks = await Task.find({ project: p.name });
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const progress = tasks.length > 0 ? Math.round(completedTasks / tasks.length * 100) : 0;
      return {
        ...p.toObject(),
        taskCount: tasks.length,
        completedCount: completedTasks,
        progress,
      };
    }));

    res.json(projectsWithStats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      manager: req.user.id,
    });
    await project.save();
    res.json({ message: 'Project created successfully', project });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Project updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;