import { Router } from 'express';
import * as subjectController from '../controllers/subject.controller';
import * as scheduleController from '../controllers/schedule.controller';
import * as attendanceController from '../controllers/attendance.controller';

const router = Router();

// Subjects
router.get('/subjects', subjectController.getSubjects);
router.post('/subjects', subjectController.createSubject);
router.put('/subjects/:id', subjectController.updateSubject);
router.delete('/subjects/:id', subjectController.deleteSubject);

// Schedules & Monitoring
router.get('/', scheduleController.getSchedules);
router.post('/', scheduleController.createSchedule);
router.get('/active/:classId', scheduleController.getActiveLesson);

// Attendance
router.post('/attendance', attendanceController.recordAttendance);
router.get('/attendance/student/:studentId', attendanceController.getStudentAttendanceHistory);

export default router;
