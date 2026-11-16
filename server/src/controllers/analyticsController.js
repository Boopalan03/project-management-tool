import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Get system and project analytics
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const { projectId } = req.query;

    let projectFilter = {};
    if (projectId) {
      projectFilter = { project: projectId };
    } else if (req.user.role !== 'Admin') {
      const userProjects = await Project.find({
        $or: [{ manager: req.user._id }, { members: req.user._id }]
      }).select('_id');
      const pIds = userProjects.map((p) => p._id);
      projectFilter = { project: { $in: pIds } };
    }

    const totalTasks = await Task.countDocuments(projectFilter);
    const completedTasks = await Task.countDocuments({ ...projectFilter, status: 'Completed' });
    const inProgressTasks = await Task.countDocuments({ ...projectFilter, status: 'In Progress' });
    const inReviewTasks = await Task.countDocuments({ ...projectFilter, status: 'In Review' });
    const todoTasks = await Task.countDocuments({ ...projectFilter, status: 'To Do' });

    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      ...projectFilter,
      dueDate: { $lt: now },
      status: { $ne: 'Completed' }
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Status breakdown for Pie Chart
    const statusData = [
      { name: 'To Do', value: todoTasks, fill: '#64748b' },
      { name: 'In Progress', value: inProgressTasks, fill: '#3b82f6' },
      { name: 'In Review', value: inReviewTasks, fill: '#8b5cf6' },
      { name: 'Completed', value: completedTasks, fill: '#10b981' }
    ];

    // Priority breakdown
    const lowPriority = await Task.countDocuments({ ...projectFilter, priority: 'Low' });
    const medPriority = await Task.countDocuments({ ...projectFilter, priority: 'Medium' });
    const highPriority = await Task.countDocuments({ ...projectFilter, priority: 'High' });
    const critPriority = await Task.countDocuments({ ...projectFilter, priority: 'Critical' });

    const priorityData = [
      { name: 'Low', count: lowPriority },
      { name: 'Medium', count: medPriority },
      { name: 'High', count: highPriority },
      { name: 'Critical', count: critPriority }
    ];

    // Workload by Team Member
    const workloadAggregation = await Task.aggregate([
      { $match: projectFilter },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'assignee'
        }
      },
      {
        $unwind: {
          path: '$assignee',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          userName: { $ifNull: ['$assignee.name', 'Unassigned'] },
          total: 1,
          completed: 1,
          pending: { $subtract: ['$total', '$completed'] }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          completionRate
        },
        statusData,
        priorityData,
        workloadData: workloadAggregation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

