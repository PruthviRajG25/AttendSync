import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Subject from '../models/subject.model';
import Timetable from '../models/timetable.model';
import StudyPlannerItem from '../models/planner.model';
import AttendanceLog from '../models/attendanceLog.model';

export const seedMockData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Clean existing data for this user
    await Subject.deleteMany({ userId });
    await Timetable.deleteMany({ userId });
    await StudyPlannerItem.deleteMany({ userId });
    await AttendanceLog.deleteMany({ userId });

    // 1. Create Subjects
    const subjectsData = [
      { subjectName: 'Mathematics II', facultyName: 'Dr. Anna Vance', attendedClasses: 18, totalClasses: 20, minimumAttendance: 75, color: '#3B82F6' }, // 90%
      { subjectName: 'Quantum Physics', facultyName: 'Prof. Mark Slater', attendedClasses: 13, totalClasses: 20, minimumAttendance: 75, color: '#EF4444' }, // 65% (Critical!)
      { subjectName: 'Data Structures & Algorithms', facultyName: 'Dr. Ryan Gosling', attendedClasses: 21, totalClasses: 24, minimumAttendance: 85, color: '#10B981' }, // 87.5% (Warning!)
      { subjectName: 'Organic Chemistry', facultyName: 'Dr. Walter White', attendedClasses: 12, totalClasses: 16, minimumAttendance: 75, color: '#F59E0B' }, // 75% (Borderline)
      { subjectName: 'Technical English', facultyName: 'Prof. Emma Watson', attendedClasses: 9, totalClasses: 10, minimumAttendance: 70, color: '#8B5CF6' } // 90%
    ];

    const createdSubjects = await Subject.insertMany(
      subjectsData.map((sub) => ({ ...sub, userId }))
    );

    const subMap: { [key: string]: any } = {};
    createdSubjects.forEach((sub) => {
      subMap[sub.subjectName] = sub._id;
    });

    // 2. Create Timetable Slots (Monday - Friday)
    const timetableData = [
      { day: 'Monday', timeSlot: '09:00 AM - 10:00 AM', subjectId: subMap['Mathematics II'] },
      { day: 'Monday', timeSlot: '11:00 AM - 12:00 PM', subjectId: subMap['Quantum Physics'] },
      { day: 'Tuesday', timeSlot: '09:00 AM - 10:00 AM', subjectId: subMap['Data Structures & Algorithms'] },
      { day: 'Tuesday', timeSlot: '01:00 PM - 02:00 PM', subjectId: subMap['Organic Chemistry'] },
      { day: 'Wednesday', timeSlot: '09:00 AM - 10:00 AM', subjectId: subMap['Mathematics II'] },
      { day: 'Wednesday', timeSlot: '11:00 AM - 12:00 PM', subjectId: subMap['Data Structures & Algorithms'] },
      { day: 'Thursday', timeSlot: '10:00 AM - 11:00 AM', subjectId: subMap['Quantum Physics'] },
      { day: 'Thursday', timeSlot: '02:00 PM - 03:00 PM', subjectId: subMap['Organic Chemistry'] },
      { day: 'Friday', timeSlot: '09:00 AM - 10:00 AM', subjectId: subMap['Data Structures & Algorithms'] },
      { day: 'Friday', timeSlot: '11:00 AM - 12:00 PM', subjectId: subMap['Technical English'] },
    ];

    await Timetable.insertMany(timetableData.map((slot) => ({ ...slot, userId })));

    // 3. Create Study Planner Deadlines
    const today = new Date();
    
    const oneDayLater = new Date(today);
    oneDayLater.setDate(today.getDate() + 1);

    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);

    const fiveDaysLater = new Date(today);
    fiveDaysLater.setDate(today.getDate() + 5);

    const tenDaysLater = new Date(today);
    tenDaysLater.setDate(today.getDate() + 10);

    const plannerItemsData = [
      { title: 'Physics Lab Report Submission', type: 'Assignment', dueDate: oneDayLater, status: 'Todo', subjectId: subMap['Quantum Physics'] },
      { title: 'Math Midterm Exam', type: 'Exam', dueDate: fiveDaysLater, status: 'Todo', subjectId: subMap['Mathematics II'] },
      { title: 'DSA Trees Assignment', type: 'Assignment', dueDate: twoDaysLater, status: 'Todo', subjectId: subMap['Data Structures & Algorithms'] },
      { title: 'Chemistry Lab Practical', type: 'Lab Exam', dueDate: tenDaysLater, status: 'Todo', subjectId: subMap['Organic Chemistry'] },
      { title: 'English Mock Presentation', type: 'Internal Test', dueDate: oneDayLater, status: 'Todo', subjectId: subMap['Technical English'] }
    ];

    await StudyPlannerItem.insertMany(plannerItemsData.map((item) => ({ ...item, userId })));

    // 4. Create past Attendance Logs (to populate the GitHub contribution-like heatmap)
    // We'll generate logs for the last 30 days
    const logsToInsert: any[] = [];
    const subjectsList = createdSubjects;

    for (let i = 25; i >= 0; i--) {
      const logDate = new Date(today);
      logDate.setDate(today.getDate() - i);
      
      // Exclude weekends from default school schedule
      const dayOfWeek = logDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Log 1-2 classes per day
      const dailySubCount = Math.floor(Math.random() * 2) + 1;
      
      // Pick random subjects
      const shuffled = [...subjectsList].sort(() => 0.5 - Math.random());
      const selectedSubs = shuffled.slice(0, dailySubCount);

      selectedSubs.forEach((sub, idx) => {
        // High chance of being present, but some absent, holiday, exam
        let status: 'present' | 'absent' | 'holiday' | 'exam' | 'internal' | 'lab' = 'present';
        const rand = Math.random();
        
        // Physics has a higher absent rate in mock logs to reflect its critical state
        if (sub.subjectName === 'Quantum Physics') {
          status = rand > 0.6 ? 'absent' : 'present';
        } else {
          if (rand > 0.9) status = 'absent';
          else if (rand > 0.85) status = 'holiday';
          else if (rand > 0.82) status = 'lab';
          else status = 'present';
        }

        logsToInsert.push({
          userId,
          subjectId: sub._id,
          date: logDate,
          status,
          lectureNumber: idx + 1,
        });
      });
    }

    await AttendanceLog.insertMany(logsToInsert);

    res.status(200).json({ message: 'Mock data seeded successfully! Relog to see updated statistics.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error seeding mock data.', error: error.message });
  }
};
