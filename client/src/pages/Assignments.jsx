import { useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ExternalLink,
  Download,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import { useAssignmentsStore } from '../stores'
import { exportAssignmentsToICal } from '../utils/icalExport'
import { exportAssignmentsToPDF } from '../utils/pdfExport'

const Assignments = () => {
  const {
    assignments,
    courses,
    filter,
    setFilter,
    getFilteredAssignments,
    setGrade,
    updateAssignment,
  } = useAssignmentsStore()

  const handleToggleComplete = (e, assignment) => {
    e.stopPropagation()
    const isCompleting = assignment.status === 'pending'
    updateAssignment(assignment.id, { status: isCompleting ? 'complete' : 'pending' })
    if (isCompleting) {
      const remaining = assignments.filter(a => a.status === 'pending' && a.id !== assignment.id).length
      if (remaining === 0) confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
    }
  }

  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [gradeModalOpen, setGradeModalOpen] = useState(false)
  const [gradeInput, setGradeInput] = useState({ earned: '', possible: '' })

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
      enteredAt: new Date()
    })

    setGradeModalOpen(false)
    setGradeInput({ earned: '', possible: '' })
    setSelectedAssignment(null)
  }

  const statusConfig = {
    pending: { icon: Clock, color: '#ffaa4d', label: 'PENDING', variant: 'warning' },
    'in-progress': { icon: AlertCircle, color: '#4d9fff', label: 'IN PROGRESS', variant: 'info' },
    submitted: { icon: AlertCircle, color: '#4d9fff', label: 'SUBMITTED', variant: 'info' },
    complete: { icon: CheckCircle, color: '#4dff91', label: 'DONE', variant: 'success' },
    completed: { icon: CheckCircle, color: '#4dff91', label: 'DONE', variant: 'success' },
    graded: { icon: CheckCircle, color: '#4dff91', label: 'GRADED', variant: 'success' },
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-2xl gradient-text mb-1"
            style={{ fontFamily: '"Press Start 2P"', fontSize: '16px' }}
          >
            ASSIGNMENTS
          </h1>
          <p style={{ fontFamily: 'VT323', fontSize: '18px' }} className="text-text-secondary">
            {assignments.length} total tasks
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon={Download} size="sm"
            onClick={() => exportAssignmentsToICal(assignments)}
            style={{ borderColor: '#4daaff', color: '#4daaff' }}>
            EXPORT .ICS
          </Button>
          <Button icon={Plus}>ADD TASK</Button>
        </div>
      </motion.div>

      <GlassCard>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: '#606080' }}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filter.search}
                onChange={(e) => setFilter({ search: e.target.value })}
                className="input-glass w-full pl-12 pr-4"
                style={{ fontFamily: 'VT323', fontSize: '18px' }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={filter.course}
              onChange={(e) => setFilter({ course: e.target.value })}
              className="input-glass min-w-[150px]"
              style={{ fontFamily: 'VT323', fontSize: '18px' }}
            >
              <option value="all">ALL COURSES</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={filter.status}
              onChange={(e) => setFilter({ status: e.target.value })}
              className="input-glass min-w-[150px]"
              style={{ fontFamily: 'VT323', fontSize: '18px' }}
            >
              <option value="all">ALL STATUS</option>
              <option value="pending">PENDING</option>
              <option value="submitted">SUBMITTED</option>
              <option value="graded">GRADED</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {filteredAssignments.map((assignment, index) => {
            const status = statusConfig[assignment.status]
            const StatusIcon = status.icon

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedAssignment(assignment)}
                className="flex items-center justify-between p-4 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `2px solid ${selectedAssignment?.id === assignment.id ? 'rgba(255,107,157,0.5)' : 'rgba(196,77,255,0.2)'}`,
                  transition: 'all 0.1s'
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center"
                    style={{
                      background: `${status.color}20`,
                      border: `2px solid ${status.color}`,
                      boxShadow: `2px 2px 0 ${status.color}`
                    }}
                  >
                    <StatusIcon className="w-5 h-5" style={{ color: status.color }} />
                  </div>
                  <div>
                    <p
                      className="font-bold"
                      style={{ fontFamily: 'VT323', fontSize: '20px' }}
                    >
                      {assignment.title}
                    </p>
                    <p style={{ fontFamily: 'VT323', fontSize: '14px' }} className="text-text-muted">
                      {assignment.courseName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span style={{ fontFamily: 'VT323', fontSize: '16px' }} className="text-text-muted">
                    {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'NO DUE DATE'}
                  </span>

                  <Badge variant={status.variant}>{status.label}</Badge>

                  {(assignment.status === 'pending' || assignment.status === 'complete') && (
                    <button
                      onClick={(e) => handleToggleComplete(e, assignment)}
                      title={assignment.status === 'complete' ? 'Mark pending' : 'Mark complete'}
                      style={{
                        background: assignment.status === 'complete' ? 'rgba(77,255,145,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${assignment.status === 'complete' ? 'rgba(77,255,145,0.5)' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                      <CheckCircle size={12} color={assignment.status === 'complete' ? '#4dff91' : '#606080'} />
                      <span style={{ fontFamily: 'VT323', fontSize: 13, color: assignment.status === 'complete' ? '#4dff91' : '#606080' }}>
                        {assignment.status === 'complete' ? 'DONE' : 'DONE?'}
                      </span>
                    </button>
                  )}

                  {assignment.grade ? (
                    <span
                      className="font-mono font-bold"
                      style={{ fontFamily: '"Press Start 2P"', fontSize: '10px' }}
                    >
                      {assignment.grade.pointsEarned}/{assignment.grade.pointsPossible}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedAssignment(assignment)
                        setGradeModalOpen(true)
                      }}
                      className="text-accent-pink hover:underline"
                      style={{ fontFamily: '"Press Start 2P"', fontSize: '8px' }}
                    >
                      + GRADE
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}

          {filteredAssignments.length === 0 && (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#606080' }} />
              <p style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }} className="text-text-secondary mb-2">
                NO TASKS FOUND
              </p>
              <p style={{ fontFamily: 'VT323', fontSize: '18px' }} className="text-text-muted">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Grade Modal */}
      <Modal
        isOpen={gradeModalOpen}
        onClose={() => { setGradeModalOpen(false); setSelectedAssignment(null); }}
        title="ENTER GRADE"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGradeModalOpen(false)}>CANCEL</Button>
            <Button onClick={handleGradeSave}>SAVE</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p style={{ fontFamily: 'VT323', fontSize: '18px' }} className="text-text-secondary">
            {selectedAssignment?.title}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="POINTS"
              type="number"
              value={gradeInput.earned}
              onChange={(e) => setGradeInput(prev => ({ ...prev, earned: e.target.value }))}
              placeholder="0"
            />
            <Input
              label="MAX"
              type="number"
              value={gradeInput.possible}
              onChange={(e) => setGradeInput(prev => ({ ...prev, possible: e.target.value }))}
              placeholder="100"
            />
          </div>
          {gradeInput.earned && gradeInput.possible && (
            <div
              className="p-4 text-center"
              style={{
                background: 'rgba(196,77,255,0.1)',
                border: '2px solid #c44dff'
              }}
            >
              <p style={{ fontFamily: 'VT323', fontSize: '14px' }} className="text-text-muted">CALCULATED</p>
              <p
                style={{ fontFamily: '"Press Start 2P"', fontSize: '20px' }}
                className="gradient-text"
              >
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
        title={selectedAssignment?.title?.toUpperCase()}
        size="lg"
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={statusConfig[selectedAssignment.status].variant}>
                {statusConfig[selectedAssignment.status].label}
              </Badge>
              {selectedAssignment.grade && (
                <Badge variant="success">
                  {selectedAssignment.grade.letterGrade} ({selectedAssignment.grade.percentage}%)
                </Badge>
              )}
            </div>

            {selectedAssignment.description && (
              <p style={{ fontFamily: 'VT323', fontSize: '18px' }} className="text-text-secondary">
                {selectedAssignment.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div
                className="p-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '2px solid rgba(196,77,255,0.3)'
                }}
              >
                <p style={{ fontFamily: '"Press Start 2P"', fontSize: '8px' }} className="text-text-muted mb-2">DUE DATE</p>
                <p style={{ fontFamily: 'VT323', fontSize: '18px' }}>
                  {selectedAssignment.dueDate
                    ? new Date(selectedAssignment.dueDate).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                      })
                    : 'NO DUE DATE'}
                </p>
              </div>
              {selectedAssignment.grade && (
                <div
                  className="p-4"
                  style={{
                    background: 'rgba(77,255,145,0.05)',
                    border: '2px solid rgba(77,255,145,0.3)'
                  }}
                >
                  <p style={{ fontFamily: '"Press Start 2P"', fontSize: '8px' }} className="text-text-muted mb-2">GRADE</p>
                  <p style={{ fontFamily: '"Press Start 2P"', fontSize: '16px' }} className="text-accent-success">
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
                className="inline-flex items-center gap-2 text-accent-blue hover:underline"
                style={{ fontFamily: '"Press Start 2P"', fontSize: '10px' }}
              >
                OPEN IN CLASSROOM <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {!selectedAssignment.grade && (
              <Button
                className="w-full"
                onClick={() => {
                  setGradeInput({ earned: '', possible: '' })
                  setGradeModalOpen(true)
                }}
              >
                ENTER GRADE
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Assignments
