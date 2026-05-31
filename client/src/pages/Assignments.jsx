import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Clock, CheckCircle, AlertCircle, Plus, ExternalLink, Download, Calendar, FileText, X } from 'lucide-react'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'
import { useAssignmentsStore, useXPStore } from '../stores'
import { exportAssignmentsToICal } from '../utils/icalExport'
import { exportAssignmentsToPDF } from '../utils/pdfExport'

const T = {
  bg: '#0a0d12',
  surface: 'rgba(13,17,24,0.95)',
  surfaceBright: 'rgba(20,25,34,0.9)',
  border: 'rgba(50,55,70,0.4)',
  borderBright: 'rgba(80,90,110,0.5)',
  text: '#dfe2eb',
  muted: '#8c90a0',
  faint: '#424754',
  blue: '#afc6ff',
  blueVibrant: '#528dff',
  purple: '#e5b5ff',
  purpleVibrant: '#c44dff',
  green: '#4dff91',
  pink: '#ff6b9d',
  orange: '#ffd6a0',
  cyan: '#4daaff',
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(50,55,70,0.4)',
  color: '#dfe2eb',
  outline: 'none',
  fontFamily: "'Manrope', sans-serif",
  fontSize: 14,
  boxSizing: 'border-box',
}

const PRIORITY_STYLES = {
  high:   { background: 'rgba(255,77,106,0.15)',  color: '#ff4d6a' },
  medium: { background: 'rgba(255,170,77,0.15)', color: '#ffaa4d' },
  low:    { background: 'rgba(77,255,145,0.15)',  color: '#4dff91' },
}

const COURSE_COLORS = ['#528dff', '#c44dff', '#ff6b9d', '#4daaff', '#4dff91', '#ffd6a0', '#e5b5ff', '#ffaa4d']

function PriorityBadge({ priority }) {
  const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium
  return (
    <span style={{
      ...s,
      padding: '2px 8px',
      borderRadius: 5,
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600,
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}>
      {priority || 'medium'}
    </span>
  )
}

function DueDateChip({ dueDate }) {
  if (!dueDate) return null
  const d = new Date(dueDate)
  const now = new Date()
  const diff = (d - now) / (1000 * 60 * 60 * 24)
  const color = diff < 1 ? T.pink : diff < 3 ? T.orange : T.muted
  return (
    <span style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 5,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(50,55,70,0.4)',
      color,
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600, fontSize: 11, letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      <Calendar size={10} />
      {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </span>
  )
}

function GradeChip({ grade }) {
  if (!grade) return null
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 5,
      background: 'rgba(77,255,145,0.12)',
      border: '1px solid rgba(77,255,145,0.3)',
      color: T.green,
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700, fontSize: 11,
    }}>
      {grade.letterGrade} · {grade.percentage}%
    </span>
  )
}

const STATUS_FILTERS = [
  { value: 'all',      label: 'All' },
  { value: 'pending',  label: 'Pending' },
  { value: 'complete', label: 'Completed' },
  { value: 'graded',   label: 'Graded' },
]

const Assignments = () => {
  const {
    assignments,
    courses,
    filter,
    setFilter,
    getFilteredAssignments,
    setGrade,
    updateAssignment,
    addAssignment,
  } = useAssignmentsStore()
  const { addXP } = useXPStore()

  const handleToggleComplete = (e, assignment) => {
    e.stopPropagation()
    const isCompleting = assignment.status === 'pending'
    updateAssignment(assignment.id, { status: isCompleting ? 'complete' : 'pending' })
    if (isCompleting) {
      addXP(50, 'assignment_complete')
      const remaining = assignments.filter(a => a.status === 'pending' && a.id !== assignment.id).length
      if (remaining === 0) confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
    }
  }

  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [gradeModalOpen, setGradeModalOpen] = useState(false)
  const [gradeInput, setGradeInput] = useState({ earned: '', possible: '' })

  // Add modal state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: '', courseId: '', dueDate: '', priority: 'medium', estimatedHours: '',
  })

  const filteredAssignments = getFilteredAssignments()

  const handleGradeSave = () => {
    if (!selectedAssignment || !gradeInput.earned || !gradeInput.possible) return
    const earned = parseFloat(gradeInput.earned)
    const possible = parseFloat(gradeInput.possible)
    const percentage = (earned / possible) * 100
    let letterGrade = 'F'
    if (percentage >= 90) letterGrade = 'A'
    else if (percentage >= 80) letterGrade = 'B'
    else if (percentage >= 70) letterGrade = 'C'
    else if (percentage >= 60) letterGrade = 'D'
    setGrade(selectedAssignment.id, {
      pointsEarned: earned,
      pointsPossible: possible,
      percentage: percentage.toFixed(1),
      letterGrade,
      enteredAt: new Date(),
    })
    setGradeModalOpen(false)
    setGradeInput({ earned: '', possible: '' })
    setSelectedAssignment(null)
  }

  const statusConfig = {
    pending:     { icon: Clock,        color: '#ffaa4d', label: 'Pending',     variant: 'warning' },
    'in-progress': { icon: AlertCircle, color: '#4d9fff', label: 'In Progress', variant: 'info' },
    submitted:   { icon: AlertCircle,  color: '#4d9fff', label: 'Submitted',   variant: 'info' },
    complete:    { icon: CheckCircle,  color: '#4dff91', label: 'Done',        variant: 'success' },
    completed:   { icon: CheckCircle,  color: '#4dff91', label: 'Done',        variant: 'success' },
    graded:      { icon: CheckCircle,  color: '#4dff91', label: 'Graded',      variant: 'success' },
  }

  const handleAddSave = () => {
    if (!newAssignment.title.trim()) return
    const course = courses.find(c => c.id === newAssignment.courseId)
    addAssignment({
      id: Date.now().toString(),
      title: newAssignment.title.trim(),
      courseId: newAssignment.courseId,
      courseName: course?.name || '',
      dueDate: newAssignment.dueDate || null,
      priority: newAssignment.priority,
      estimatedHours: newAssignment.estimatedHours ? parseFloat(newAssignment.estimatedHours) : null,
      status: 'pending',
      createdAt: new Date(),
    })
    setAddModalOpen(false)
    setNewAssignment({ title: '', courseId: '', dueDate: '', priority: 'medium', estimatedHours: '' })
  }

  return (
    <div style={{ padding: '0 0 40px', maxWidth: 860, margin: '0 auto' }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}
      >
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 22, color: T.text,
            margin: 0, lineHeight: 1.2,
          }}>
            Assignments
          </h1>
          <p style={{ margin: '4px 0 0', fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted }}>
            {assignments.length} total · {assignments.filter(a => a.status === 'pending').length} pending
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => exportAssignmentsToICal(assignments)}
            style={{
              padding: '8px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(50,55,70,0.4)',
              color: T.cyan,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <Calendar size={13} /> iCal
          </button>
          <button
            onClick={() => exportAssignmentsToPDF(assignments)}
            style={{
              padding: '8px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(50,55,70,0.4)',
              color: T.blue,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <FileText size={13} /> PDF
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            style={{
              padding: '9px 18px', borderRadius: 8,
              background: 'linear-gradient(135deg, #c44dff, #528dff)',
              color: '#fff', border: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <Plus size={14} /> Add
          </button>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 16, flexWrap: 'wrap',
        }}
      >
        {/* Status pill filters */}
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_FILTERS.map(sf => {
            const active = filter.status === sf.value
            return (
              <button
                key={sf.value}
                onClick={() => setFilter({ status: sf.value })}
                style={{
                  padding: '6px 14px', borderRadius: 20,
                  background: active ? 'linear-gradient(135deg, rgba(196,77,255,0.25), rgba(82,141,255,0.25))' : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(196,77,255,0.5)' : '1px solid rgba(50,55,70,0.4)',
                  color: active ? T.purple : T.muted,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                {sf.label}
              </button>
            )
          })}
        </div>

        {/* Course dropdown */}
        <select
          value={filter.course}
          onChange={e => setFilter({ course: e.target.value })}
          style={{
            padding: '6px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(50,55,70,0.4)',
            color: T.muted,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600, fontSize: 12, cursor: 'pointer',
            outline: 'none',
          }}>
          <option value="all">All Courses</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </motion.div>

      {/* Assignment List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <AnimatePresence>
          {filteredAssignments.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center', padding: '64px 24px',
                background: 'rgba(13,17,24,0.95)',
                border: '1px solid rgba(50,55,70,0.4)',
                borderRadius: 12,
              }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(50,55,70,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle size={24} color={T.faint} />
              </div>
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 15, color: T.text, margin: '0 0 6px',
              }}>
                No assignments found
              </p>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted, margin: '0 0 20px' }}>
                Adjust filters or add a new assignment
              </p>
              <button
                onClick={() => setAddModalOpen(true)}
                style={{
                  padding: '9px 20px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #c44dff, #528dff)',
                  color: '#fff', border: 'none',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}>
                + Add Assignment
              </button>
            </motion.div>
          ) : (
            filteredAssignments.map((a, idx) => {
              const courseIdx = courses.findIndex(c => c.id === a.courseId)
              const dotColor = COURSE_COLORS[courseIdx >= 0 ? courseIdx % COURSE_COLORS.length : 0]
              const isDone = a.status === 'complete' || a.status === 'completed' || a.status === 'graded'
              const canToggle = a.status === 'pending' || a.status === 'complete'

              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                  whileHover={{ y: -2 }}
                  onClick={() => { setSelectedAssignment(a); setGradeModalOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', marginBottom: 8,
                    background: 'rgba(13,17,24,0.95)',
                    border: '1px solid rgba(50,55,70,0.4)',
                    borderRadius: 10,
                    opacity: a.status === 'graded' ? 0.65 : 1,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}>

                  {/* Checkbox circle */}
                  {canToggle ? (
                    <button
                      onClick={e => handleToggleComplete(e, a)}
                      title={isDone ? 'Mark pending' : 'Mark complete'}
                      style={{
                        flexShrink: 0,
                        width: 22, height: 22, borderRadius: '50%',
                        border: `2px solid ${isDone ? T.green : T.faint}`,
                        background: isDone ? 'rgba(77,255,145,0.15)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0,
                      }}>
                      {isDone && <CheckCircle size={12} color={T.green} />}
                    </button>
                  ) : (
                    <div style={{
                      flexShrink: 0,
                      width: 22, height: 22, borderRadius: '50%',
                      border: `2px solid ${T.green}`,
                      background: 'rgba(77,255,145,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle size={12} color={T.green} />
                    </div>
                  )}

                  {/* Course color dot */}
                  <div style={{
                    flexShrink: 0,
                    width: 8, height: 8, borderRadius: '50%',
                    background: dotColor,
                  }} />

                  {/* Title + course name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0,
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 15, fontWeight: 600,
                      color: isDone ? T.muted : T.text,
                      textDecoration: isDone ? 'line-through' : 'none',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {a.title}
                    </p>
                    {a.courseName && (
                      <p style={{
                        margin: '2px 0 0',
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: 12, color: T.muted,
                      }}>
                        {a.courseName}
                      </p>
                    )}
                  </div>

                  {/* Right side: priority + due date + grade */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {a.priority && <PriorityBadge priority={a.priority} />}
                    <DueDateChip dueDate={a.dueDate} />
                    {a.grade ? (
                      <GradeChip grade={a.grade} />
                    ) : (
                      !isDone && (
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedAssignment(a); setGradeModalOpen(true) }}
                          style={{
                            padding: '2px 8px', borderRadius: 5,
                            background: 'transparent',
                            border: '1px solid rgba(255,107,157,0.3)',
                            color: T.pink,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 600, fontSize: 11, cursor: 'pointer',
                          }}>
                          + Grade
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* Grade Modal */}
      <Modal
        isOpen={gradeModalOpen}
        onClose={() => { setGradeModalOpen(false); setSelectedAssignment(null) }}
        title="Enter Grade"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGradeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleGradeSave}>Save</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted }}>
            {selectedAssignment?.title}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.muted, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Points</label>
              <Input
                type="number"
                value={gradeInput.earned}
                onChange={e => setGradeInput(prev => ({ ...prev, earned: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.muted, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Max</label>
              <Input
                type="number"
                value={gradeInput.possible}
                onChange={e => setGradeInput(prev => ({ ...prev, possible: e.target.value }))}
                placeholder="100"
              />
            </div>
          </div>
          {gradeInput.earned && gradeInput.possible && (
            <div style={{
              padding: '14px', borderRadius: 10, textAlign: 'center',
              background: 'rgba(196,77,255,0.08)',
              border: '1px solid rgba(196,77,255,0.3)',
            }}>
              <p style={{ margin: '0 0 4px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Result</p>
              <p style={{
                margin: 0,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 28,
                background: 'linear-gradient(135deg, #c44dff, #528dff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {((parseFloat(gradeInput.earned) / parseFloat(gradeInput.possible)) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedAssignment && !gradeModalOpen}
        onClose={() => setSelectedAssignment(null)}
        title={selectedAssignment?.title}
        size="lg"
      >
        {selectedAssignment && (() => {
          const sc = statusConfig[selectedAssignment.status] || statusConfig.pending
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 6,
                  background: `${sc.color}18`,
                  border: `1px solid ${sc.color}44`,
                  color: sc.color,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600, fontSize: 11, letterSpacing: '0.06em',
                }}>
                  {sc.label}
                </span>
                {selectedAssignment.grade && <GradeChip grade={selectedAssignment.grade} />}
                {selectedAssignment.priority && <PriorityBadge priority={selectedAssignment.priority} />}
              </div>

              {selectedAssignment.description && (
                <p style={{ margin: 0, fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
                  {selectedAssignment.description}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: selectedAssignment.grade ? '1fr 1fr' : '1fr', gap: 12 }}>
                <div style={{
                  padding: '14px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(50,55,70,0.4)',
                }}>
                  <p style={{ margin: '0 0 6px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Due Date</p>
                  <p style={{ margin: 0, fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.text }}>
                    {selectedAssignment.dueDate
                      ? new Date(selectedAssignment.dueDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                      : 'No due date'}
                  </p>
                </div>
                {selectedAssignment.grade && (
                  <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    background: 'rgba(77,255,145,0.05)',
                    border: '1px solid rgba(77,255,145,0.25)',
                  }}>
                    <p style={{ margin: '0 0 6px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Grade</p>
                    <p style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: T.green }}>
                      {selectedAssignment.grade.pointsEarned} / {selectedAssignment.grade.pointsPossible}
                    </p>
                  </div>
                )}
              </div>

              {selectedAssignment.link && (
                <a
                  href={selectedAssignment.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: T.blue, textDecoration: 'none',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600, fontSize: 13,
                  }}>
                  Open in Classroom <ExternalLink size={14} />
                </a>
              )}

              {!selectedAssignment.grade && (
                <button
                  onClick={() => { setGradeInput({ earned: '', possible: '' }); setGradeModalOpen(true) }}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #c44dff, #528dff)',
                    color: '#fff', border: 'none',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}>
                  Enter Grade
                </button>
              )}
            </div>
          )
        })()}
      </Modal>

      {/* Add Assignment Modal */}
      {addModalOpen && (
        <div
          onClick={() => setAddModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480,
              background: 'rgba(13,17,24,0.98)',
              border: '1px solid rgba(80,90,110,0.5)',
              borderRadius: 14,
              padding: '24px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: T.text }}>
                New Assignment
              </h2>
              <button
                onClick={() => setAddModalOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.muted, display: 'flex', alignItems: 'center',
                }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.muted, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Title</label>
                <input
                  style={inputStyle}
                  placeholder="Assignment title"
                  value={newAssignment.title}
                  onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.muted, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Course</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={newAssignment.courseId}
                  onChange={e => setNewAssignment(p => ({ ...p, courseId: e.target.value }))}>
                  <option value="">Select course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.muted, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Due Date</label>
                  <input
                    type="date"
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                    value={newAssignment.dueDate}
                    onChange={e => setNewAssignment(p => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.muted, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Priority</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={newAssignment.priority}
                    onChange={e => setNewAssignment(p => ({ ...p, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.muted, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Estimated Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  style={inputStyle}
                  placeholder="e.g. 2.5"
                  value={newAssignment.estimatedHours}
                  onChange={e => setNewAssignment(p => ({ ...p, estimatedHours: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  onClick={() => setAddModalOpen(false)}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(50,55,70,0.4)',
                    color: T.text,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  }}>
                  Cancel
                </button>
                <button
                  onClick={handleAddSave}
                  disabled={!newAssignment.title.trim()}
                  style={{
                    padding: '9px 20px', borderRadius: 8,
                    background: newAssignment.title.trim() ? 'linear-gradient(135deg, #c44dff, #528dff)' : 'rgba(255,255,255,0.06)',
                    color: newAssignment.title.trim() ? '#fff' : T.faint,
                    border: 'none',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: 13,
                    cursor: newAssignment.title.trim() ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                  }}>
                  Add Assignment
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Assignments
