import Subject from '../models/subject.model.js';
import Timetable from '../models/timetable.model.js';
import StudyPlannerItem from '../models/planner.model.js';
import AttendanceLog from '../models/attendanceLog.model.js';

export const seedMockData = async (req, res) => {
  try {
    const userId = req.userId;

    // Clean existing data for this user
    await Subject.deleteMany({ userId });
    await Timetable.deleteMany({ userId });
    await StudyPlannerItem.deleteMany({ userId });
    await AttendanceLog.deleteMany({ userId });

    // 1. Create Subjects
    const subjectsData = [
      { subjectName: 'Mathematics II', facultyName: 'Dr. Anna Vance', attendedClasses: 18, totalClasses: 20, minimumAttendance: 75, color: '#3B82F6' },
      { subjectName: 'Quantum Physics', facultyName: 'Prof. Mark Slater', attendedClasses: 13, totalClasses: 20, minimumAttendance: 75, color: '#EF4444' },
      { subjectName: 'Data Structures & Algorithms', facultyName: 'Dr. Ryan Gosling', attendedClasses: 21, totalClasses: 24, minimumAttendance: 85, color: '#10B981' },
      { subjectName: 'Organic Chemistry', facultyName: 'Dr. Walter White', attendedClasses: 12, totalClasses: 16, minimumAttendance: 75, color: '#F59E0B' },
      { subjectName: 'Technical English', facultyName: 'Prof. Emma Watson', attendedClasses: 9, totalClasses: 10, minimumAttendance: 70, color: '#8B5CF6' }
    ];

    const createdSubjects = await Subject.insertMany(
      subjectsData.map((sub) => ({ ...sub, userId }))
    );

    const subMap = {};
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

    // 4. Create past Attendance Logs
    const logsToInsert = [];
    const subjectsList = createdSubjects;

    for (let i = 25; i >= 0; i--) {
      const logDate = new Date(today);
      logDate.setDate(today.getDate() - i);
      
      const dayOfWeek = logDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dailySubCount = Math.floor(Math.random() * 2) + 1;
      
      const shuffled = [...subjectsList].sort(() => 0.5 - Math.random());
      const selectedSubs = shuffled.slice(0, dailySubCount);

      selectedSubs.forEach((sub, idx) => {
        let status = 'present';
        const rand = Math.random();
        
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
  } catch (error) {
    res.status(500).json({ message: 'Server error seeding mock data.', error: error.message });
  }
};
