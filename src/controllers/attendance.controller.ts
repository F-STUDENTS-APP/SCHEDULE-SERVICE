import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendResponse, sendError } from '../utils/response';
import { recordAttendanceSchema } from '../validators/schedule.validator';
import axios from 'axios';

export const recordAttendance = async (req: Request, res: Response) => {
  const { error, value } = recordAttendanceSchema.validate(req.body);
  if (error) return sendError(res, 400, error.details[0].message);

  const attendance = await prisma.lessonAttendance.upsert({
    where: {
      scheduleId_studentId_date: {
        scheduleId: value.scheduleId,
        studentId: value.studentId,
        date: new Date(value.date),
      },
    },
    update: {
      status: value.status,
      notes: value.notes,
      recordedBy: (req as any).user?.id || 'SYSTEM',
    },
    create: {
      ...value,
      date: new Date(value.date),
      recordedBy: (req as any).user?.id || 'SYSTEM',
    },
  });

  // Automation: If status is ABSENT, trigger violation-service
  if (value.status === 'ABSENT') {
    try {
      const VIOLATION_SERVICE_URL = process.env.VIOLATION_SERVICE_URL || 'http://localhost:3004';
      await axios.post(`${VIOLATION_SERVICE_URL}/api/v1/violations/internal/trigger-auto`, {
        studentId: value.studentId,
        studentName: value.studentName,
        categoryCode: 'ABSEN_TANPA_KETERANGAN',
        categoryName: 'Absen Tanpa Keterangan',
        points: 5,
        notes: `Otomatis ditrigger karena absen pada jadwal ${value.scheduleId} tanggal ${value.date}`,
      });
    } catch (error) {
      console.error('Failed to trigger automated violation:', error);
    }
  }

  // Automation: If status is LATE or ABSENT, trigger urgent parent alert
  if (value.status === 'ABSENT' || value.status === 'LATE') {
    try {
      const NOTIFICATION_SERVICE_URL =
        process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007';
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/trigger/urgent`, {
        userId: value.studentId, // Parent ID in production, for now studentId
        type: 'URGENT_PRESENCE',
        title: value.status === 'ABSENT' ? 'Peringatan Absensi Siswa' : 'Peringatan Keterlambatan',
        message: `Anak Anda (${value.studentName}) ditandai ${value.status} pada jam pelajaran ${value.scheduleId} hari ini.`,
        category: 'SYSTEM',
        channels: ['INTERNAL', 'WA'],
      });
    } catch (error) {
      console.error('Failed to trigger urgent alert:', error);
    }
  }

  return sendResponse(res, 200, true, 'Attendance recorded', attendance);
};

export const getStudentAttendanceHistory = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const items = await prisma.lessonAttendance.findMany({
    where: { studentId },
    include: { schedule: { include: { subject: true } } },
    orderBy: { date: 'desc' },
  });
  return sendResponse(res, 200, true, 'Attendance history retrieved', items);
};
