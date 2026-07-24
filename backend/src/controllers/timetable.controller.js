import Timetable from '../models/timetable.model.js';

export const getTimetable = async (req, res) => {
  try {
    const slots = await Timetable.find({ userId: req.userId }).populate('subjectId', 'subjectName color');
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching timetable.', error: error.message });
  }
};

export const createSlot = async (req, res) => {
  try {
    const { day, timeSlot, subjectId } = req.body;

    if (!day || !timeSlot || !subjectId) {
      res.status(400).json({ message: 'Day, timeslot, and subject ID are required.' });
      return;
    }

    const newSlot = new Timetable({
      userId: req.userId,
      day,
      timeSlot,
      subjectId,
    });

    await newSlot.save();
    const populated = await newSlot.populate('subjectId', 'subjectName color');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating timetable slot.', error: error.message });
  }
};

export const deleteSlot = async (req, res) => {
  try {
    const slot = await Timetable.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!slot) {
      res.status(404).json({ message: 'Timetable slot not found.' });
      return;
    }

    res.json({ message: 'Timetable slot deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting slot.', error: error.message });
  }
};
