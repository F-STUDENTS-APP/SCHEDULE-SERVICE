import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendResponse, sendError } from '../utils/response';
import { createScheduleSchema } from '../validators/schedule.validator';
import dayjs from 'dayjs';

export const getSchedules = async (req: Request, res: Response) => {
  const { classId, day } = req.query;
  const where = {
    ...(classId && { classId: classId as string }),
    ...(day && { day: day as any }),
    isActive: true,
  };

  const items = await prisma.schedule.findMany({
    where,
    orderBy: { startTime: 'asc' },
    include: { subject: true },
  });

  return sendResponse(res, 200, true, 'Schedules retrieved', items);
};

export const createSchedule = async (req: Request, res: Response) => {
  const { error, value } = createScheduleSchema.validate(req.body);
  if (error) return sendError(res, 400, error.details[0].message);

  const schedule = await prisma.schedule.create({ data: value });
  return sendResponse(res, 201, true, 'Schedule created', schedule);
};

export const getActiveLesson = async (req: Request, res: Response) => {
  const { classId } = req.params;
  const now = dayjs();
  const currentDay = now.format('dddd').toUpperCase(); // MONDAY, etc.
  const currentTime = now.format('HH:mm');

  // Find schedule that matches current day and time range
  const active = await prisma.schedule.findFirst({
    where: {
      classId,
      day: currentDay as any,
      startTime: { lte: currentTime },
      endTime: { gte: currentTime },
      isActive: true,
    },
    include: { subject: true },
  });

  if (!active) {
    // Check if it's break time (placeholder logic - could be from env/config)
    const breakTimes = JSON.parse(process.env.BREAK_TIME_CONFIG || '[]');
    const currentBreak = breakTimes.find(
      (b: any) => currentTime >= b.start && currentTime <= b.end
    );

    return sendResponse(res, 200, true, 'Status retrieved', {
      status: currentBreak ? 'BREAK' : 'NO_ACTIVE_LESSON',
      breakName: currentBreak?.name || null,
    });
  }

  return sendResponse(res, 200, true, 'Active lesson retrieved', {
    status: 'IN_CLASS',
    lesson: active,
  });
};
