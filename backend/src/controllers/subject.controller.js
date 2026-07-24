import Subject from '../models/subject.model.js';
import AttendanceLog from '../models/attendanceLog.model.js';
import Timetable from '../models/timetable.model.js';

export const calculateAttendanceStats = (attended, total, requiredPercent) => {
  const currentPercent = total > 0 ? (attended / total) * 100 : 100;
  const reqFraction = requiredPercent / 100;

  let classesCanSkip = 0;
  let classesNeeded = 0;

  if (currentPercent >= requiredPercent) {
    if (reqFraction > 0) {
      classesCanSkip = Math.floor(attended / reqFraction - total);
      if (classesCanSkip < 0) classesCanSkip = 0;
    }
  } else {
    if (reqFraction < 1) {
      classesNeeded = Math.ceil((reqFraction * total - attended) / (1 - reqFraction));
    } else {
      classesNeeded = 999;
    }
  }

  let status = 'Safe';
  if (currentPercent < requiredPercent) {
    status = 'Critical';
  } else if (currentPercent - requiredPercent <= 3) {
    status = 'Warning';
  }

  return {
    currentPercent: parseFloat(currentPercent.toFixed(1)),
    classesCanSkip,
    classesNeeded,
    status,
    safeToSkip: classesCanSkip > 0,
  };
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.userId });
    const formattedSubjects = subjects.map((sub) => {
      const stats = calculateAttendanceStats(sub.attendedClasses, sub.totalClasses, sub.minimumAttendance);
      return {
        id: sub._id,
        subjectName: sub.subjectName,
        facultyName: sub.facultyName,
        attendedClasses: sub.attendedClasses,
        totalClasses: sub.totalClasses,
        minimumAttendance: sub.minimumAttendance,
        color: sub.color,
        ...stats,
      };
    });
    res.json(formattedSubjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching subjects.', error: error.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { subjectName, facultyName, attendedClasses, totalClasses, minimumAttendance, color } = req.body;

    if (!subjectName) {
      res.status(400).json({ message: 'Subject name is required.' });
      return;
    }

    const newSubject = new Subject({
      userId: req.userId,
      subjectName,
      facultyName: facultyName || '',
      attendedClasses: attendedClasses || 0,
      totalClasses: totalClasses || 0,
      minimumAttendance: minimumAttendance || 75,
      color: color || '#2563EB',
    });

    await newSubject.save();

    const stats = calculateAttendanceStats(newSubject.attendedClasses, newSubject.totalClasses, newSubject.minimumAttendance);

    res.status(201).json({
      id: newSubject._id,
      subjectName: newSubject.subjectName,
      facultyName: newSubject.facultyName,
      attendedClasses: newSubject.attendedClasses,
      totalClasses: newSubject.totalClasses,
      minimumAttendance: newSubject.minimumAttendance,
      color: newSubject.color,
      ...stats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating subject.', error: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { subjectName, facultyName, attendedClasses, totalClasses, minimumAttendance, color } = req.body;
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.userId });

    if (!subject) {
      res.status(404).json({ message: 'Subject not found.' });
      return;
    }

    if (subjectName !== undefined) subject.subjectName = subjectName;
    if (facultyName !== undefined) subject.facultyName = facultyName;
    if (attendedClasses !== undefined) subject.attendedClasses = Number(attendedClasses);
    if (totalClasses !== undefined) subject.totalClasses = Number(totalClasses);
    if (minimumAttendance !== undefined) subject.minimumAttendance = Number(minimumAttendance);
    if (color !== undefined) subject.color = color;

    await subject.save();

    const stats = calculateAttendanceStats(subject.attendedClasses, subject.totalClasses, subject.minimumAttendance);

    res.json({
      id: subject._id,
      subjectName: subject.subjectName,
      facultyName: subject.facultyName,
      attendedClasses: subject.attendedClasses,
      totalClasses: subject.totalClasses,
      minimumAttendance: subject.minimumAttendance,
      color: subject.color,
      ...stats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating subject.', error: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!subject) {
      res.status(404).json({ message: 'Subject not found.' });
      return;
    }

    await AttendanceLog.deleteMany({ subjectId: req.params.id });
    await Timetable.deleteMany({ subjectId: req.params.id });

    res.json({ message: 'Subject deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting subject.', error: error.message });
  }
};
