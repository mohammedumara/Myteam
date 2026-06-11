const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendTaskAssignedEmail, sendStatusChangedEmail } = require('../config/mailer');

exports.getAllTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query.assigned_to = req.user.id;
    }
    const tasks = await Task.find(query)
      .populate('assigned_to', 'name email')
      .populate('assigned_by', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, assigned_to, priority, status, due_date, project } = req.body;
  try {
    // assigned_to is now an array
    const assignedUsers = Array.isArray(assigned_to) ? assigned_to : assigned_to ? [assigned_to] : [];

    const task = new Task({
      title, description, priority, status, due_date, project,
      assigned_to: assignedUsers,
      assigned_by: req.user.id,
    });
    await task.save();

    // Send notification and email to all assigned users
    const assignedByUser = await User.findById(req.user.id);
    for (const userId of assignedUsers) {
      const assignedUser = await User.findById(userId);
      if (assignedUser) {
        await Notification.create({
          user_id: userId,
          title: 'New Task Assigned',
          message: `You have been assigned: "${title}" by ${assignedByUser?.name}`,
          type: 'task_assigned',
          task_id: task._id,
        });
        await sendTaskAssignedEmail(
          assignedUser.email,
          assignedUser.name,
          title,
          assignedByUser?.name || 'Admin',
          due_date,
          priority
        );
      }
    }

    res.json({ message: 'Task created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, status, due_date, progress, project, assigned_to } = req.body;
  try {
    const oldTask = await Task.findById(id);
    const assignedUsers = Array.isArray(assigned_to) ? assigned_to : assigned_to ? [assigned_to] : [];

    await Task.findByIdAndUpdate(id, {
      title, description, priority, status,
      due_date, progress, project,
      assigned_to: assignedUsers,
    });

    const assignedByUser = await User.findById(req.user.id);

    // Notify if status changed
    if (oldTask && oldTask.status !== status) {
      for (const userId of oldTask.assigned_to) {
        const assignedUser = await User.findById(userId);
        if (assignedUser) {
          await Notification.create({
            user_id: userId,
            title: 'Task Status Updated',
            message: `Task "${oldTask.title}" status changed to "${status}"`,
            type: 'status_changed',
            task_id: id,
          });
          await sendStatusChangedEmail(assignedUser.email, assignedUser.name, oldTask.title, status);
        }
      }
    }

    // Notify newly added users
    const oldIds = (oldTask?.assigned_to || []).map(String);
    const newIds = assignedUsers.map(String);
    const newlyAdded = newIds.filter(uid => !oldIds.includes(uid));

    for (const userId of newlyAdded) {
      const assignedUser = await User.findById(userId);
      if (assignedUser) {
        await Notification.create({
          user_id: userId,
          title: 'New Task Assigned',
          message: `You have been assigned: "${title}" by ${assignedByUser?.name}`,
          type: 'task_assigned',
          task_id: id,
        });
        await sendTaskAssignedEmail(
          assignedUser.email,
          assignedUser.name,
          title,
          assignedByUser?.name || 'Admin',
          due_date,
          priority
        );
      }
    }

    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id)
      .populate('assigned_to', 'name email')
      .populate('assigned_by', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};