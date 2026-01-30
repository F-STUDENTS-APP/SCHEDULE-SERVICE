import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendResponse, sendError } from '../utils/response';
import { createSubjectSchema } from '../validators/schedule.validator';

export const getSubjects = async (req: Request, res: Response) => {
  const items = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
  return sendResponse(res, 200, true, 'Subjects retrieved', items);
};

export const createSubject = async (req: Request, res: Response) => {
  const { error, value } = createSubjectSchema.validate(req.body);
  if (error) return sendError(res, 400, error.details[0].message);

  const subject = await prisma.subject.create({ data: value });
  return sendResponse(res, 201, true, 'Subject created', subject);
};

export const updateSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await prisma.subject.update({
    where: { id },
    data: req.body,
  });
  return sendResponse(res, 200, true, 'Subject updated', item);
};

export const deleteSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.subject.delete({ where: { id } });
  return sendResponse(res, 200, true, 'Subject deleted');
};
