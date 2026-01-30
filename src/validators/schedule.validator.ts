import Joi from 'joi';

export const createSubjectSchema = Joi.object({
  code: Joi.string().uppercase().min(2).max(10).required(),
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
});

export const createScheduleSchema = Joi.object({
  classId: Joi.string().uuid().required(),
  className: Joi.string().optional(),
  subjectId: Joi.string().uuid().required(),
  subjectName: Joi.string().optional(),
  teacherId: Joi.string().uuid().required(),
  teacherName: Joi.string().optional(),
  day: Joi.string()
    .valid('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')
    .required(),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  academicYear: Joi.string()
    .pattern(/^\d{4}\/\d{4}$/)
    .required(),
  semester: Joi.number().valid(1, 2).required(),
});

export const recordAttendanceSchema = Joi.object({
  scheduleId: Joi.string().uuid().required(),
  studentId: Joi.string().uuid().required(),
  studentName: Joi.string().optional(),
  date: Joi.date().required(),
  status: Joi.string().valid('PRESENT', 'LATE', 'ABSENT', 'PERMISSION', 'SICK').required(),
  notes: Joi.string().max(200).optional(),
});
