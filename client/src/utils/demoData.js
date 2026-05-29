export const DEMO_USER = {
  id: 'demo-user-001',
  name: 'Alex Kim',
  email: 'alex.kim@student.edu',
  avatar: null,
  isDemo: true,
  streak: 7,
  totalStudyHours: 142,
  joinDate: '2025-09-01'
}

export const DEMO_COURSES = [
  { id: 'course-1', name: 'Calculus II', code: 'MATH 202', color: '#ff6b9d', instructor: 'Dr. Sarah Chen', credits: 4 },
  { id: 'course-2', name: 'Data Structures', code: 'CS 301', color: '#c44dff', instructor: 'Prof. James Park', credits: 3 },
  { id: 'course-3', name: 'World History', code: 'HIST 101', color: '#4daaff', instructor: 'Dr. Maria Santos', credits: 3 },
  { id: 'course-4', name: 'Physics I', code: 'PHYS 201', color: '#4dff91', instructor: 'Prof. David Liu', credits: 4 },
  { id: 'course-5', name: 'English Composition', code: 'ENG 102', color: '#ffd6a0', instructor: 'Prof. Emma Wells', credits: 3 }
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
    title: "Newton's Laws Lab Report",
    courseId: 'course-4',
    courseName: 'Physics I',
    dueDate: daysFromNow(8),
    status: 'pending',
    priority: 'medium',
    description: "Write up lab results from last week's experiment on Newton's second law.",
    estimatedHours: 2,
    grade: null
  },
  {
    id: 'assign-5',
    title: 'Midterm Review — Integration Techniques',
    courseId: 'course-1',
    courseName: 'Calculus II',
    dueDate: daysFromNow(11),
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
  },
  {
    id: 'assign-7',
    title: 'Research Proposal: AI Ethics',
    courseId: 'course-5',
    courseName: 'English Composition',
    dueDate: daysFromNow(5),
    status: 'pending',
    priority: 'medium',
    description: '500-word research proposal on AI bias in hiring systems.',
    estimatedHours: 2,
    grade: null
  },
  {
    id: 'assign-8',
    title: 'Projectile Motion Problems',
    courseId: 'course-4',
    courseName: 'Physics I',
    dueDate: daysFromNow(-5),
    status: 'graded',
    priority: 'low',
    description: 'Problem set on 2D kinematics and projectile motion.',
    estimatedHours: 2,
    grade: { pointsEarned: 91, pointsPossible: 100 }
  },
  {
    id: 'assign-9',
    title: 'Sorting Algorithms Analysis',
    courseId: 'course-2',
    courseName: 'Data Structures',
    dueDate: daysFromNow(14),
    status: 'pending',
    priority: 'low',
    description: 'Write analysis comparing time/space complexity of merge sort, quick sort, heap sort.',
    estimatedHours: 3,
    grade: null
  },
  {
    id: 'assign-10',
    title: 'Peer Review: Classmate Essay',
    courseId: 'course-5',
    courseName: 'English Composition',
    dueDate: daysFromNow(9),
    status: 'pending',
    priority: 'low',
    description: 'Review and provide feedback on 2 classmate research proposals.',
    estimatedHours: 1,
    grade: null
  }
]

export const DEMO_EVENTS = [
  {
    id: 'event-1',
    title: 'Calculus Office Hours',
    start: daysFromNow(1),
    type: 'academic',
    description: 'Dr. Chen office hours — bring integration questions',
    color: '#ff6b9d'
  },
  {
    id: 'event-2',
    title: 'CS 301 Group Study',
    start: daysFromNow(3),
    type: 'study',
    description: 'BST implementation group session in library room 204',
    color: '#c44dff'
  },
  {
    id: 'event-3',
    title: 'Physics Lab',
    start: daysFromNow(5),
    type: 'academic',
    description: 'Lab session — bring your completed pre-lab worksheet',
    color: '#4dff91'
  },
  {
    id: 'event-4',
    title: 'History Essay Draft Due',
    start: daysFromNow(6),
    type: 'deadline',
    description: 'First draft for peer review',
    color: '#4daaff'
  },
  {
    id: 'event-5',
    title: 'Calculus II Midterm',
    start: daysFromNow(11),
    type: 'exam',
    description: 'Integration techniques — 90 minutes, closed book',
    color: '#ff4d6a'
  },
  {
    id: 'event-6',
    title: 'CS Study Session',
    start: daysFromNow(7),
    type: 'study',
    description: 'Algorithm complexity review before quiz',
    color: '#c44dff'
  },
  {
    id: 'event-7',
    title: 'Physics Lecture',
    start: daysFromNow(2),
    type: 'academic',
    description: 'Chapter 5: Work, Energy, Power',
    color: '#4dff91'
  },
  {
    id: 'event-8',
    title: 'English Writing Workshop',
    start: daysFromNow(4),
    type: 'academic',
    description: 'Workshop on argumentative essay structure',
    color: '#ffd6a0'
  }
]

export const DEMO_NOTES = [
  {
    id: 'note-demo-1',
    title: 'Integration Techniques',
    content: '# Integration Techniques\n\n## U-Substitution\nUse when you see f(g(x)) · g\'(x)\n- Let u = g(x)\n- Then du = g\'(x)dx\n\n## Integration by Parts\n**Formula:** ∫u dv = uv - ∫v du\n\n**LIATE rule** for choosing u:\n- **L**ogarithms\n- **I**nverse trig\n- **A**lgebraic\n- **T**rig\n- **E**xponential\n\n## Trigonometric Substitution\n- √(a²-x²) → x = a·sin(θ)\n- √(a²+x²) → x = a·tan(θ)\n- √(x²-a²) → x = a·sec(θ)\n\n## Partial Fractions\nFor rational functions — factor denominator first.',
    courseId: 'course-1',
    color: '#ff6b9d',
    pinned: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'note-demo-2',
    title: 'BST Operations — Exam Notes',
    content: '# Binary Search Tree\n\n## Time Complexity\n| Operation | Average | Worst |\n|-----------|---------|-------|\n| Search    | O(log n)| O(n)  |\n| Insert    | O(log n)| O(n)  |\n| Delete    | O(log n)| O(n)  |\n\n## Traversal Types\n- **Inorder** (L-Root-R): gives sorted order\n- **Preorder** (Root-L-R): used for copying tree\n- **Postorder** (L-R-Root): used for deletion\n\n## Key Interview Points\n- BST invariant: left < node < right\n- Balanced BST: AVL, Red-Black\n- Successor = leftmost node in right subtree\n\n`TODO: Review deletion of nodes with 2 children`',
    courseId: 'course-2',
    color: '#c44dff',
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    updatedAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'note-demo-3',
    title: 'WWI Essay Outline',
    content: '# Essay: Causes of WWI\n\n## Thesis\nWhile the assassination of Archduke Franz Ferdinand was the spark, WWI was made inevitable by decades of militarism, imperial rivalry, and entangled alliances.\n\n## Body Paragraphs\n1. **Militarism** — arms race, especially Germany vs Britain naval competition\n2. **Alliance System** — Triple Entente vs Triple Alliance, chain-reaction trigger\n3. **Imperial Rivalries** — Moroccan Crises, Balkans instability\n4. **Nationalism** — Pan-Slavism, German nationalism, Austro-Hungarian tensions\n\n## Sources to cite\n- MacMillan, *The War That Ended Peace* (2013)\n- Clark, *The Sleepwalkers* (2012)\n\n**Due in 6 days — start writing tonight!**',
    courseId: 'course-3',
    color: '#4daaff',
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    updatedAt: Date.now() - 1000 * 60 * 10,
  },
]

export const DEMO_COURSE_WEIGHTS = {
  'course-1': [
    { id: 'cat-calc-hw', name: 'Homework', weight: 25 },
    { id: 'cat-calc-quiz', name: 'Quizzes', weight: 25 },
    { id: 'cat-calc-mid', name: 'Midterm', weight: 25 },
    { id: 'cat-calc-fin', name: 'Final Exam', weight: 25 },
  ],
  'course-2': [
    { id: 'cat-cs-hw', name: 'Assignments', weight: 40 },
    { id: 'cat-cs-quiz', name: 'Quizzes', weight: 20 },
    { id: 'cat-cs-proj', name: 'Projects', weight: 40 },
  ],
}

export const DEMO_GRADES = {
  'course-1': {
    'hw1': { name: 'HW 1 — U-Substitution', pointsEarned: 48, pointsPossible: 50 },
    'hw2': { name: 'HW 2 — Trig Integrals', pointsEarned: 44, pointsPossible: 50 },
    'quiz1': { name: 'Quiz 1', pointsEarned: 18, pointsPossible: 20 },
    'quiz2': { name: 'Quiz 2 — Partial Fractions', pointsEarned: 17, pointsPossible: 20 },
    'midterm1': { name: 'Midterm 1', pointsEarned: 138, pointsPossible: 150 }
  },
  'course-2': {
    'hw1': { name: 'Arrays & Linked Lists', pointsEarned: 95, pointsPossible: 100 },
    'hw2': { name: 'Stacks & Queues', pointsEarned: 88, pointsPossible: 100 },
    'quiz1': { name: 'BFS/DFS Quiz', pointsEarned: 92, pointsPossible: 100 },
    'project1': { name: 'Linked List Project', pointsEarned: 145, pointsPossible: 150 }
  },
  'course-3': {
    'essay1': { name: 'Short Essay — Ancient Rome', pointsEarned: 87, pointsPossible: 100 },
    'reading1': { name: 'Reading Response 1', pointsEarned: 19, pointsPossible: 20 },
    'reading2': { name: 'Reading Response 2', pointsEarned: 18, pointsPossible: 20 },
    'quiz1': { name: 'Chapter 3-4 Quiz', pointsEarned: 44, pointsPossible: 50 }
  },
  'course-4': {
    'lab1': { name: 'Lab 1 — Kinematics', pointsEarned: 96, pointsPossible: 100 },
    'lab2': { name: 'Lab 2 — Projectile Motion', pointsEarned: 91, pointsPossible: 100 },
    'hw1': { name: 'HW 1 — Motion Equations', pointsEarned: 47, pointsPossible: 50 },
    'quiz1': { name: 'Vectors & Forces Quiz', pointsEarned: 38, pointsPossible: 40 }
  },
  'course-5': {
    'essay1': { name: 'Descriptive Essay', pointsEarned: 92, pointsPossible: 100 },
    'hw1': { name: 'Grammar Workshop 1', pointsEarned: 24, pointsPossible: 25 },
    'hw2': { name: 'Grammar Workshop 2', pointsEarned: 23, pointsPossible: 25 }
  }
}
