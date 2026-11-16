import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check project membership or admin
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (
      req.user.role !== 'Admin' &&
      project.manager.toString() !== req.user._id.toString() &&
      !project.members.some((m) => m.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view tasks for this project' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email role department avatar')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: 1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { project: projectId, title, description, status, priority, assignedTo, startDate, dueDate, labels } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Determine current max order in that status column
    const highestOrderTask = await Task.findOne({ project: projectId, status: status || 'To Do' }).sort({ order: -1 });
    const order = highestOrderTask ? highestOrderTask.order + 1 : 0;

    const task = await Task.create({
      project: projectId,
      title,
      description: description || '',
      status: status || 'To Do',
      priority: priority || 'Medium',
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      startDate: startDate || new Date(),
      dueDate: dueDate || null,
      labels: labels || [],
      order
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email role department avatar')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task status (used by Kanban drag-and-drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status, order } = req.body;
    const validStatuses = ['To Do', 'In Progress', 'In Review', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}`
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check project permission
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Associated project not found' });
    }

    const isManager = project.manager.toString() === req.user._id.toString();
    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role !== 'Admin' && !isManager && !isMember && !isAssigned) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update task status' });
    }

    task.status = status;
    if (typeof order === 'number') {
      task.order = order;
    }
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role department avatar')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: `Task status updated to ${status}`,
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task general details
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'name email role department avatar')
      .populate('createdBy', 'name email');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

