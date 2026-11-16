import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder]: Clearing old records...');
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    console.log('[Seeder]: Creating demo users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@codec.com',
      password: 'password123',
      role: 'Admin',
      department: 'Management'
    });

    const pm = await User.create({
      name: 'Sarah Connor (PM)',
      email: 'pm@codec.com',
      password: 'password123',
      role: 'Project Manager',
      department: 'Product Delivery'
    });

    const dev1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex@codec.com',
      password: 'password123',
      role: 'Team Member',
      department: 'Frontend'
    });

    const dev2 = await User.create({
      name: 'David Kim',
      email: 'david@codec.com',
      password: 'password123',
      role: 'Team Member',
      department: 'Backend'
    });

    const now = new Date();
    const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

    console.log('[Seeder]: Creating sample SaaS project...');
    const project = await Project.create({
      title: 'CloudOps Platform 2.0',
      description: 'Enterprise workflow management & automated microservices monitoring system.',
      manager: pm._id,
      members: [dev1._id, dev2._id],
      status: 'In Progress',
      priority: 'High',
      startDate: now,
      endDate: addDays(now, 35)
    });

    console.log('[Seeder]: Creating realistic tasks with timeline & progress data...');
    await Task.create([
      {
        project: project._id,
        title: 'Requirements Gathering & Scope Definition',
        description: 'Interview stakeholders and document software specifications.',
        status: 'Completed',
        priority: 'Medium',
        assignedTo: pm._id,
        createdBy: pm._id,
        startDate: addDays(now, -10),
        dueDate: addDays(now, -5),
        progress: 100,
        order: 0,
        labels: ['Planning', 'Specs']
      },
      {
        project: project._id,
        title: 'Initial workspace repository & CI environment',
        description: 'Setup Git directory and initialize backend and frontend packages.',
        status: 'Completed',
        priority: 'Low',
        assignedTo: dev1._id,
        createdBy: pm._id,
        startDate: addDays(now, -6),
        dueDate: addDays(now, -1),
        progress: 100,
        order: 1,
        labels: ['DevOps']
      },
      {
        project: project._id,
        title: 'Setup MongoDB indexing and data models',
        description: 'Define Mongoose schemas with compound indexes for optimal querying.',
        status: 'In Progress',
        priority: 'Medium',
        assignedTo: dev2._id,
        createdBy: pm._id,
        startDate: addDays(now, -2),
        dueDate: addDays(now, 6),
        progress: 65,
        order: 2,
        labels: ['Database', 'Mongoose']
      },
      {
        project: project._id,
        title: 'Design high-fidelity wireframes in Figma',
        description: 'Provide interactive mockups for the dashboard and Kanban board components.',
        status: 'In Progress',
        priority: 'High',
        assignedTo: dev1._id,
        createdBy: pm._id,
        startDate: addDays(now, 1),
        dueDate: addDays(now, 10),
        progress: 40,
        order: 3,
        labels: ['Design', 'UI/UX']
      },
      {
        project: project._id,
        title: 'Implement JWT authentication & RBAC middleware',
        description: 'Verify Bearer tokens and restrict endpoint actions by user role.',
        status: 'In Progress',
        priority: 'Critical',
        assignedTo: dev2._id,
        createdBy: pm._id,
        startDate: addDays(now, 5),
        dueDate: addDays(now, 15),
        progress: 30,
        order: 4,
        labels: ['Backend', 'Security']
      },
      {
        project: project._id,
        title: 'Build responsive Drag & Drop Kanban UI',
        description: 'Implement column cards with smooth drag transitions and persistent backend updates.',
        status: 'To Do',
        priority: 'High',
        assignedTo: dev1._id,
        createdBy: pm._id,
        startDate: addDays(now, 12),
        dueDate: addDays(now, 22),
        progress: 0,
        order: 5,
        labels: ['Frontend', 'Kanban']
      },
      {
        project: project._id,
        title: 'Interactive Gantt Chart Timeline Visualization',
        description: 'Visualize milestones, durations, progress bars, and support live timeline adjustments.',
        status: 'To Do',
        priority: 'High',
        assignedTo: dev1._id,
        createdBy: pm._id,
        startDate: addDays(now, 18),
        dueDate: addDays(now, 28),
        progress: 0,
        order: 6,
        labels: ['Timeline', 'Gantt']
      },
      {
        project: project._id,
        title: 'End-to-End Regression & User Acceptance Testing',
        description: 'Run automated and manual verification across all modules.',
        status: 'To Do',
        priority: 'Critical',
        assignedTo: dev2._id,
        createdBy: pm._id,
        startDate: addDays(now, 25),
        dueDate: addDays(now, 34),
        progress: 0,
        order: 7,
        labels: ['QA', 'Testing']
      }
    ]);

    console.log('[Seeder]: Database seeded successfully with timeline records!');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]:', err);
    process.exit(1);
  }
};

seedData();
