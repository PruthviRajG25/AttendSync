import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import StudyPlannerItem from '../models/planner.model';

export const getPlannerItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await StudyPlannerItem.find({ userId: req.userId }).populate('subjectId', 'subjectName color');
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching study planner items.', error: error.message });
  }
};

export const createPlannerItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, type, dueDate, subjectId } = req.body;

    if (!title || !type || !dueDate) {
      res.status(400).json({ message: 'Title, type, and due date are required.' });
      return;
    }

    const newItem = new StudyPlannerItem({
      userId: req.userId,
      title,
      type,
      dueDate: new Date(dueDate),
      subjectId: subjectId || undefined,
    });

    await newItem.save();
    const populated = await newItem.populate('subjectId', 'subjectName color');

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error creating study planner item.', error: error.message });
  }
};

export const updatePlannerItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, type, dueDate, status, subjectId } = req.body;
    const item = await StudyPlannerItem.findOne({ _id: req.params.id, userId: req.userId });

    if (!item) {
      res.status(404).json({ message: 'Planner item not found.' });
      return;
    }

    if (title !== undefined) item.title = title;
    if (type !== undefined) item.type = type;
    if (dueDate !== undefined) item.dueDate = new Date(dueDate);
    if (status !== undefined) item.status = status;
    if (subjectId !== undefined) item.subjectId = subjectId || undefined;

    await item.save();
    const populated = await item.populate('subjectId', 'subjectName color');

    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating planner item.', error: error.message });
  }
};

export const deletePlannerItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await StudyPlannerItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!item) {
      res.status(404).json({ message: 'Planner item not found.' });
      return;
    }

    res.json({ message: 'Planner item deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error deleting planner item.', error: error.message });
  }
};
