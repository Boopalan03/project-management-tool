import Project from '../models/Project.js';
import Task from '../models/Task.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    let query = {};
    // If not Admin, only show projects where user is manager or member
    if (req.user.role !== 'Admin') {
      query = {
        $or: [
          { manager: req.user._id },
          { members: req.user._id }
        ]
      };
    }

    const projects = await Project.find(query)
      .populate('manager', 'name email role department')
      .populate('members', 'name email role department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email role department')
      .populate('members', 'name email role department');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin, Project Manager)
export const createProject = async (req, res) => {
  try {
    const { title, description, members, status, priority, startDate, endDate } = req.body;

    const project = await Project.create({
      title,
      description,
      manager: req.user._id,
      members: members || [],
      status: status || 'Planning',
      priority: priority || 'Medium',
      startDate: startDate || new Date(),
      endDate
    });

    const populated = await Project.findById(project._id)
      .populate('manager', 'name email role department')
      .populate('members', 'name email role department');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

