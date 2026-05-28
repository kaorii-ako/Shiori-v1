export const DEMO_USER = {
  id: 'demo-user-001',
  name: 'Alex Kim',
  email: 'alex.kim@student.edu',
  avatar: null,
  isDemo: true
}

export const DEMO_COURSES = [
  { id: 'course-1', name: 'Calculus II', code: 'MATH 202', color: '#ff6b9d', instructor: 'Dr. Sarah Chen' },
  { id: 'course-2', name: 'Data Structures', code: 'CS 301', color: '#c44dff', instructor: 'Prof. James Park' },
  { id: 'course-3', name: 'World History', code: 'HIST 101', color: '#4daaff', instructor: 'Dr. Maria Santos' },
  { id: 'course-4', name: 'Physics I', code: 'PHYS 201', color: '#4dff91', instructor: 'Prof. David Liu' }
]

const now = new Date()
const daysFromNow = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000).toISOString()

export const DEMO_ASSIGNMENTS = [
  {
    id: 'assign-1',
    title: 'Integration by Parts Problem Set',
    courseId: 'course-1',
    courseName: 'Calculus II',
    dueDate: daysFromNow(2),
    status: 'pending',
    priority: 'high',
    description: 'Complete exercises 7.1 – 7.4 from textbook. Show all work.',
    estimatedHours: 3,
    grade: null
  },
  {
    id: 'assign-2',
    title: 'Binary Search Tree Implementation',
    courseId: 'course-2',
    courseName: 'Data Structures',
    dueDate: daysFromNow(4),
    status: 'in-progress',
    priority: 'high',
    description: 'Implement BST with insert, delete, search, and traversal methods in Python.',
    estimatedHours: 5,
    grade: null
  },
  {
    id: 'assign-3',
    title: 'Essay: Causes of WWI',
    courseId: 'course-3',
    courseName: 'World History',
    dueDate: daysFromNow(6),
    status: 'pending',
    priority: 'medium',
    description: '1500-word analytical essay on the primary causes of World War I.',
    estimatedHours: 4,
    grade: null
  },
  {
    id: 'assign-4',
    title: 'Newton\'s Laws Lab Report',
    courseId: 'course-4',
    courseName: 'Physics I',
    dueDate: daysFromNow(8),
    status: 'pending',
    priority: 'medium',
    description: 'Write up lab results from last week\'s experiment on Newton\'s second law.',
    estimatedHours: 2,
    grade: null
  },
  {
    id: 'assign-5',
    title: 'Midterm Review — Integration Techniques',
    courseId: 'course-1',
    courseName: 'Calculus II',
    dueDate: daysFromNow(10),
    status: 'pending',
    priority: 'high',
    description: 'Midterm exam covers integration by parts, trig substitution, and partial fractions.',
    estimatedHours: 6,
    grade: null
  },
  {
    id: 'assign-6',
    title: 'Graph Traversal Algorithms Quiz',
    courseId: 'course-2',
    courseName: 'Data Structures',
    dueDate: daysFromNow(-3),
    status: 'completed',
    priority: 'low',
    description: 'Quiz on BFS and DFS algorithms.',
    estimatedHours: 1,
    grade: 92
  }
]

export const DEMO_EVENTS = [
  {
    id: 'event-1',
    title: 'Calculus Office Hours',
    date: daysFromNow(1),
    type: 'academic',
    description: 'Dr. Chen office hours — bring integration questions',
    color: '#ff6b9d'
  },
  {
    id: 'event-2',
    title: 'CS 301 Group Study',
    date: daysFromNow(3),
    type: 'study',
    description: 'BST implementation group session in library room 204',
    color: '#c44dff'
  },
  {
    id: 'event-3',
    title: 'Physics Lab',
    date: daysFromNow(5),
    type: 'academic',
    description: 'Lab session — bring your completed pre-lab worksheet',
    color: '#4dff91'
  },
  {
    id: 'event-4',
    title: 'History Essay Draft Due',
    date: daysFromNow(6),
    type: 'deadline',
    description: 'First draft for peer review',
    color: '#4daaff'
  },
  {
    id: 'event-5',
    title: 'Calculus II Midterm',
    date: daysFromNow(12),
    type: 'exam',
    description: 'Integration techniques — 90 minutes, closed book',
    color: '#ff4d6a'
  }
]

export const DEMO_GRADES = {
  'course-1': {
    'hw1': { name: 'HW 1 — U-Substitution', pointsEarned: 48, pointsPossible: 50 },
    'hw2': { name: 'HW 2 — Trig Integrals', pointsEarned: 44, pointsPossible: 50 },
    'quiz1': { name: 'Quiz 1', pointsEarned: 18, pointsPossible: 20 }
  },
  'course-2': {
    'hw1': { name: 'Arrays & Linked Lists', pointsEarned: 95, pointsPossible: 100 },
    'quiz1': { name: 'BFS/DFS Quiz', pointsEarned: 92, pointsPossible: 100 }
  },
  'course-3': {
    'essay1': { name: 'Short Essay — Ancient Rome', pointsEarned: 87, pointsPossible: 100 }
  },
  'course-4': {
    'lab1': { name: 'Lab 1 — Kinematics', pointsEarned: 96, pointsPossible: 100 },
    'lab2': { name: 'Lab 2 — Projectile Motion', pointsEarned: 91, pointsPossible: 100 }
  }
}
