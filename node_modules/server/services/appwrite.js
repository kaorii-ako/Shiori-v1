import { Client, ID, Databases, Query } from 'appwrite'

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'shiori-dev')

// For server-side API key authentication
client.config.headers = {
  'X-Appwrite-Key': process.env.APPWRITE_API_KEY || ''
}

const databases = new Databases(client)

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'shiori_db'

const COLLECTIONS = {
  STUDENTS: process.env.APPWRITE_STUDENTS_COLLECTION || 'students',
  COURSES: process.env.APPWRITE_COURSES_COLLECTION || 'courses',
  ASSIGNMENTS: process.env.APPWRITE_ASSIGNMENTS_COLLECTION || 'assignments',
  GRADES: process.env.APPWRITE_GRADES_COLLECTION || 'grades',
  STUDY_PLANS: process.env.APPWRITE_STUDY_PLANS_COLLECTION || 'study_plans',
  EVENTS: process.env.APPWRITE_EVENTS_COLLECTION || 'events'
}

class AppwriteService {
  // Students
  async createStudent(studentData) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.STUDENTS, ID.unique(), {
      ...studentData,
      createdAt: new Date().toISOString()
    })
  }

  async getStudent(studentId) {
    return databases.getDocument(DATABASE_ID, COLLECTIONS.STUDENTS, studentId)
  }

  async updateStudent(studentId, studentData) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.STUDENTS, studentId, studentData)
  }

  async listStudents(queries = [Query.limit(100)]) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS, queries)
  }

  // Courses
  async createCourse(courseData) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.COURSES, ID.unique(), {
      ...courseData,
      createdAt: new Date().toISOString()
    })
  }

  async getCourses(studentId) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.COURSES, [
      Query.equal('studentId', studentId),
      Query.orderDesc('createdAt')
    ])
  }

  async updateCourse(courseId, courseData) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.COURSES, courseId, courseData)
  }

  async deleteCourse(courseId) {
    return databases.deleteDocument(DATABASE_ID, COLLECTIONS.COURSES, courseId)
  }

  // Assignments
  async createAssignment(assignmentData) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.ASSIGNMENTS, ID.unique(), {
      ...assignmentData,
      createdAt: new Date().toISOString()
    })
  }

  async getAssignments(studentId) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.ASSIGNMENTS, [
      Query.equal('studentId', studentId),
      Query.orderDesc('dueDate')
    ])
  }

  async updateAssignment(assignmentId, assignmentData) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.ASSIGNMENTS, assignmentId, assignmentData)
  }

  async deleteAssignment(assignmentId) {
    return databases.deleteDocument(DATABASE_ID, COLLECTIONS.ASSIGNMENTS, assignmentId)
  }

  // Grades
  async saveGrade(gradeData) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.GRADES, ID.unique(), {
      ...gradeData,
      createdAt: new Date().toISOString()
    })
  }

  async getGrades(studentId, courseId = null) {
    const queries = [Query.equal('studentId', studentId)]
    if (courseId) queries.push(Query.equal('courseId', courseId))
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.GRADES, queries)
  }

  // Study Plans
  async saveStudyPlan(studentId, planData) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.STUDY_PLANS, ID.unique(), {
      studentId,
      ...planData,
      createdAt: new Date().toISOString()
    })
  }

  async getStudyPlans(studentId) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDY_PLANS, [
      Query.equal('studentId', studentId),
      Query.orderDesc('createdAt')
    ])
  }

  // Events
  async createEvent(eventData) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.EVENTS, ID.unique(), {
      ...eventData,
      createdAt: new Date().toISOString()
    })
  }

  async getEvents(studentId, timeMin = null, timeMax = null) {
    const queries = [
      Query.equal('studentId', studentId),
      Query.orderDesc('startDate')
    ]
    if (timeMin) queries.push(Query.greaterThanEqual('startDate', timeMin))
    if (timeMax) queries.push(Query.lessThanEqual('endDate', timeMax))
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.EVENTS, queries)
  }

  async updateEvent(eventId, eventData) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.EVENTS, eventId, eventData)
  }

  async deleteEvent(eventId) {
    return databases.deleteDocument(DATABASE_ID, COLLECTIONS.EVENTS, eventId)
  }

  // Sync all data for a student
  async syncStudentData(studentId) {
    const [assignments, courses, grades, studyPlans, events] = await Promise.all([
      this.getAssignments(studentId),
      this.getCourses(studentId),
      this.getGrades(studentId),
      this.getStudyPlans(studentId),
      this.getEvents(studentId)
    ])

    return {
      assignments: assignments.documents,
      courses: courses.documents,
      grades: grades.documents,
      studyPlans: studyPlans.documents,
      events: events.documents
    }
  }
}

export const appwriteService = new AppwriteService()
export default appwriteService
