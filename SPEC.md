# Shiori - AI-Assisted Productivity Desktop App

## Concept & Vision

Shiori (栞) is a personal productivity companion with a distinctive **dark anime pixel art aesthetic**. It connects to Google Classroom, Gmail, and Calendar to automatically surface what matters — upcoming deadlines, pending assignments, emails from teachers — and generates AI-powered study plans. The visual style blends retro pixel art with modern glassmorphism, featuring neon pink/purple/blue accents against deep dark backgrounds.

The app feels like a cozy nighttime study session in a neon-lit Tokyo arcade — nostalgic, focused, and slightly magical.

## Design Language

### Aesthetic Direction
**"Midnight Study Room"** — Deep blue-black backgrounds with frosted glass panels, soft glowing accents, and anime-inspired subtle details (like a small mascot or decorative elements). Think: if a sophisticated Tokyo café had a homework app.

### Color Palette
```
--bg-primary: #0a0a14          /* Deep space black */
--bg-secondary: #12121f        /* Slightly lighter panel bg */
--bg-card: #1a1a2e             /* Card background */
--bg-glass: rgba(20, 20, 35, 0.85)

--accent-pink: #ff6b9d         /* Hot pink - primary accent */
--accent-purple: #c44dff        /* Vivid purple - main accent */
--accent-blue: #4d9fff          /* Electric blue */
--accent-cyan: #00f5ff          /* Neon cyan */
--accent-yellow: #ffe94e        /* Neon yellow */

--accent-success: #4dff91      /* Neon green */
--accent-warning: #ffaa4d      /* Neon orange */
--accent-danger: #ff4d6a       /* Neon red */

--text-primary: #f0f0f5        /* Near white */
--text-secondary: #a0a0b5      /* Muted lavender gray */
--text-muted: #606080          /* Dim gray */

--gradient-glow: linear-gradient(135deg, #ff6b9d 0%, #c44dff 50%, #4d9fff 100%)
```

### Typography
- **Headings/Pixel**: `'Press Start 2P', monospace` — Authentic pixel font for headers, stats, and buttons
- **Body/Alt**: `'VT323', monospace` — Retro terminal style for body text and UI labels
- **Body/Readable**: `'Inter', sans-serif` — Clean, highly readable for longer content

### Spatial System
- Pixel-perfect borders with inset shadows for 3D effect
- Sharp corners (0px radius) for authentic retro feel
- Heavy use of box-shadows for depth: `box-shadow: 4px 4px 0 #color`
- Glass panels with subtle blur but strong colored borders

### Motion Philosophy
- **Entrance**: Elements fade in with slight upward drift (opacity 0→1, translateY 10px→0), 300ms ease-out, staggered 50ms
- **Hover**: Gentle scale (1.02) + shadow intensification, 150ms
- **Page transitions**: Crossfade 200ms
- **Loading**: Soft pulse animation with gradient shimmer
- **Micro-interactions**: Buttons have subtle press effect (scale 0.98 on active)

### Visual Assets
- **Icons**: Lucide React icons (consistent, clean line style)
- **Decorative**: Subtle floating particles or soft gradient orbs in background
- **Empty states**: Illustrated with simple anime-style line art (or placeholder silhouettes)
- **Favicon**: Stylized "栞" character with pink/purple/blue gradient, pixel-style border

## Layout & Structure

### App Shell
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Shiori          [Search]          [Notifications] [User] │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                    │
│  Sidebar    │              Main Content Area                    │
│  - Home     │                                                    │
│  - Tasks    │         (Changes based on active view)            │
│  - Calendar │                                                    │
│  - Grades   │                                                    │
│  - Study    │                                                    │
│  - Settings │                                                    │
│             │                                                    │
├─────────────┴───────────────────────────────────────────────────┤
│                    [AI Assistant Chat - Collapsible]             │
└─────────────────────────────────────────────────────────────────┘
```

### Pages

1. **Home Dashboard** — Overview: upcoming deadlines, today's schedule, quick actions, recent activity
2. **Assignments** — List/grid of all assignments from Classroom, filterable, with grade tracking
3. **Calendar** — Month/week view synced with Google Calendar, deadline highlights
4. **Grades** — Grade calculator, course breakdown, GPA estimation, grade entry
5. **Study Plans** — AI-generated study schedules, generated from deadlines and priorities
6. **Settings** — Google account connections, preferences, theme options

### Responsive Strategy
Desktop-first (1200px+ optimal). Tablet (768px): sidebar collapses to icons. Mobile (480px): bottom nav replaces sidebar.

## Features & Interactions

### Google Integration (REAL API Connection)
- **OAuth 2.0 flow**: Connect Google account via official OAuth, request scopes for Classroom, Gmail, Calendar
- **Classroom**: Fetch courses, assignments, submissions, grades
- **Gmail**: Fetch emails from teachers/classroom notifications (label-based filtering)
- **Calendar**: Fetch events, create study session blocks
- **Sync**: Manual refresh + background sync on interval
- **Graceful degradation**: Show "Connect Google" prompts if not authenticated

### Home Dashboard
- **Today's Snapshot**: Cards showing: assignments due today, upcoming week count, unread emails
- **Quick Actions**: Buttons for "Add Assignment", "Start Study Session", "Sync Now"
- **AI Insight Card**: "You have 3 assignments due this week. Biology test Friday — suggested study time: 2 hours"
- **Recent Activity**: Timeline of recent Classroom updates, grade postings, emails

### Assignments View
- **List View**: Sortable table with columns: Course, Assignment, Due Date, Status, Grade
- **Detail Panel**: Click to expand shows full description, submission status, attached files
- **Grade Entry**: Click on empty grade cell → input modal → saves to local state (and syncs if Classroom supports)
- **Filters**: By course, status (pending/submitted/graded), date range, search
- **Bulk Actions**: Mark complete, archive

### Grade Calculator
- **Course Selector**: Dropdown of connected Classroom courses
- **Assignment Types**: Categories (homework, quizzes, exams, projects) with weight inputs
- **Grade Entry**: Per-assignment grade input (points earned / points possible)
- **Calculations**:
  - Weighted average per category
  - Overall course grade (letter + percentage)
  - Semester GPA estimation
- **Visual**: Progress bars, color-coded (green/yellow/red based on grade thresholds)
- **Goal Setting**: "What grade do I need on final to get A?"

### Calendar View
- **Month View**: Grid with deadline dots, click day to see events
- **Week View**: Time blocks with events
- **Sources**: Classroom deadlines, Calendar events, study sessions
- **Create**: Add manual events/study blocks
- **Visual Distinction**: Different colors for class, personal, study events

### Study Plans (AI-Generated)
- **Generation**: Takes assignment deadlines, exam dates, priority weights → generates weekly schedule
- **Display**: Day-by-day breakdown with suggested study sessions
- **Adjustments**: Drag to reschedule, mark sessions complete
- **AI Suggestions**: "Based on your Chemistry quiz Friday, suggest reviewing Chapter 5 today"

### AI Assistant
- **Chat Interface**: Collapsible panel at bottom
- **Powered by**: Google Gemini API (when available) or fallback responses
- **Capabilities**: Answer questions about schedule, suggest study plans, explain concepts, remind about deadlines
- **Context-aware**: Knows your assignments, grades, calendar

### Settings
- **Google Accounts**: Connect/disconnect, show connection status per service
- **Notifications**: Toggle email/app notifications, set reminder lead times
- **Appearance**: (Dark mode is default) - future: light mode toggle
- **Data**: Export data, clear local cache, sync settings

## Component Inventory

### GlassCard
- Frosted glass effect: `background: var(--bg-glass)`, `backdrop-filter: blur(20px)`, `border: 1px solid var(--glass-border)`
- Hover: Border brightens, subtle shadow glow
- States: default, hover, active (pressed), loading (shimmer)

### NavSidebar
- Fixed left, 240px width (72px collapsed)
- Nav items: Icon + label, active state with accent left border + background tint
- Collapse toggle at bottom
- User avatar/status at top

### Button
- Variants: primary (purple gradient), secondary (outlined), ghost (text only), danger
- Sizes: sm (32px), md (40px), lg (48px)
- States: default, hover (glow + lift), active (press), disabled (50% opacity), loading (spinner)

### Input
- Glass background, subtle border, focus ring in accent color
- Variants: text, password (toggle visibility), search (icon prefix), textarea
- Validation states: error (red border + message below)

### Modal
- Centered overlay with glass panel
- Backdrop blur, click outside to close
- Header with title + close button, body, footer with actions
- Enter animation: scale 0.95→1 + fade

### Badge/Chip
- Small rounded pill for status indicators
- Colors map to status: success (green), warning (amber), danger (red), info (cyan)

### ProgressBar
- Height 8px, rounded, gradient fill
- Animated fill on mount
- Color changes based on percentage (green >70%, amber 40-70%, red <40%)

### Avatar
- Circular, image or initials
- Status dot indicator (online/offline/away)
- Sizes: sm (32px), md (40px), lg (56px)

### EmptyState
- Centered illustration placeholder + heading + description + action button
- Used when lists are empty

### Toast/Notification
- Slides in from top-right
- Auto-dismiss after 5s
- Types: success, error, warning, info

## Technical Approach

### Stack
- **Framework**: React 18 + Vite (fast dev, good DX)
- **Styling**: Tailwind CSS + custom CSS variables for glass effects
- **State**: Zustand (lightweight, good for this scale)
- **Routing**: React Router v6
- **HTTP**: Axios for API calls
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend (Express.js existing structure)
- `/api/auth/google` — Initiate OAuth flow
- `/api/auth/google/callback` — Handle OAuth callback
- `/api/classroom/*` — Proxy to Google Classroom API
- `/api/gmail/*` — Proxy to Gmail API
- `/api/calendar/*` — Proxy to Google Calendar API
- `/api/user/*` — User data, preferences
- `/api/grades/*` — Grade calculations, local storage

### Google API Integration
- Use `googleapis` npm package
- OAuth2 tokens stored securely (httpOnly cookies or encrypted localStorage for desktop)
- Scopes:
  - `https://www.googleapis.com/auth/classroom.courses.readonly`
  - `https://www.googleapis.com/auth/classroom.course-work.readonly`
  - `https://www.googleapis.com/auth/classroom.student-submissions.readonly`
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `https://www.googleapis.com/auth/calendar.events`

### Data Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleConnected: boolean;
  preferences: Preferences;
}

interface Course {
  id: string;
  name: string;
  teacher: string;
  room?: string;
}

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: 'pending' | 'submitted' | 'graded';
  grade?: Grade;
  link?: string;
}

interface Grade {
  pointsEarned?: number;
  pointsPossible?: number;
  percentage?: number;
  letterGrade?: string;
  enteredAt?: Date;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  type: 'class' | 'personal' | 'study';
  source: 'classroom' | 'calendar' | 'manual';
}

interface StudySession {
  id: string;
  assignmentId?: string;
  title: string;
  date: Date;
  duration: number; // minutes
  completed: boolean;
  aiGenerated: boolean;
}
```

### File Structure
```
shiori/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities, API client
│   │   ├── styles/         # Global styles, Tailwind config
│   │   └── App.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── services/           # Google API service layer
│   ├── middleware/         # Auth, validation
│   └── index.js
├── package.json            # Root package with workspaces
└── SPEC.md
```

### Environment Variables
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GEMINI_API_KEY=
```
