import AttendanceLog from '../models/attendanceLog.model.js';
import Subject from '../models/subject.model.js';

export const getLogs = async (req, res) => {
  try {
    const logs = await AttendanceLog.find({ userId: req.userId }).populate('subjectId', 'subjectName color');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching logs.', error: error.message });
  }
};

export const createLog = async (req, res) => {
  try {
    const { subjectId, date, status, lectureNumber } = req.body;

    if (!subjectId || !status || !date) {
      res.status(400).json({ message: 'Subject ID, status, and date are required.' });
      return;
    }

    const subject = await Subject.findOne({ _id: subjectId, userId: req.userId });
    if (!subject) {
      res.status(404).json({ message: 'Subject not found.' });
      return;
    }

    const logDate = new Date(date);

    const newLog = new AttendanceLog({
      userId: req.userId,
      subjectId,
      date: logDate,
      status,
      lectureNumber: lectureNumber || 1,
    });

    await newLog.save();

    if (status === 'present' || status === 'lab') {
      subject.attendedClasses += 1;
      subject.totalClasses += 1;
    } else if (status === 'absent') {
      subject.totalClasses += 1;
    }
    await subject.save();

    res.status(201).json({
      log: newLog,
      subject: {
        id: subject._id,
        attendedClasses: subject.attendedClasses,
        totalClasses: subject.totalClasses,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating attendance log.', error: error.message });
  }
};

export const quickUpdate = async (req, res) => {
  try {
    const { subjectId, status } = req.body;

    if (!subjectId || !['present', 'absent'].includes(status)) {
      res.status(400).json({ message: 'Subject ID and status (present/absent) are required.' });
      return;
    }

    const subject = await Subject.findOne({ _id: subjectId, userId: req.userId });
    if (!subject) {
      res.status(404).json({ message: 'Subject not found.' });
      return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayLogsCount = await AttendanceLog.countDocuments({
      userId: req.userId,
      subjectId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const newLog = new AttendanceLog({
      userId: req.userId,
      subjectId,
      date: new Date(),
      status,
      lectureNumber: todayLogsCount + 1,
    });

    await newLog.save();

    if (status === 'present') {
      subject.attendedClasses += 1;
      subject.totalClasses += 1;
    } else if (status === 'absent') {
      subject.totalClasses += 1;
    }
    await subject.save();

    res.status(201).json({
      log: newLog,
      subject: {
        id: subject._id,
        attendedClasses: subject.attendedClasses,
        totalClasses: subject.totalClasses,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error performing quick log.', error: error.message });
  }
};

export const deleteLog = async (req, res) => {
  try {
    const logId = req.params.id;
    const log = await AttendanceLog.findOne({ _id: logId, userId: req.userId });

    if (!log) {
      res.status(404).json({ message: 'Attendance log not found.' });
      return;
    }

    const subject = await Subject.findOne({ _id: log.subjectId, userId: req.userId });

    if (subject) {
      if (log.status === 'present' || log.status === 'lab') {
        if (subject.attendedClasses > 0) subject.attendedClasses -= 1;
        if (subject.totalClasses > 0) subject.totalClasses -= 1;
      } else if (log.status === 'absent') {
        if (subject.totalClasses > 0) subject.totalClasses -= 1;
      }
      await subject.save();
    }

    await AttendanceLog.findByIdAndDelete(logId);

    res.json({
      message: 'Attendance log deleted successfully.',
      subject: subject
        ? {
            id: subject._id,
            attendedClasses: subject.attendedClasses,
            totalClasses: subject.totalClasses,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting attendance log.', error: error.message });
  }
};
