import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Subject from '../models/subject.model';
import AttendanceLog from '../models/attendanceLog.model';
import StudyPlannerItem from '../models/planner.model';
import User from '../models/user.model';

export const getAnalyticsData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const subjects = await Subject.find({ userId });
    const logs = await AttendanceLog.find({ userId }).populate('subjectId', 'subjectName color');
    const plannerItems = await StudyPlannerItem.find({ userId });

    // 1. Overall Stats
    let totalAttended = 0;
    let totalClasses = 0;
    let totalSkipsAllowed = 0;

    subjects.forEach((sub) => {
      totalAttended += sub.attendedClasses;
      totalClasses += sub.totalClasses;
      
      // Calculate how many they can skip for this subject
      const reqFraction = sub.minimumAttendance / 100;
      if (reqFraction > 0) {
        const canSkip = Math.floor(sub.attendedClasses / reqFraction - sub.totalClasses);
        if (canSkip > 0) {
          totalSkipsAllowed += canSkip;
        }
      }
    });

    const overallAttendancePercent = totalClasses > 0 ? parseFloat(((totalAttended / totalClasses) * 100).toFixed(1)) : 100;

    // Safe status
    const goal = user.attendanceGoal || 75;
    let safeStatus: 'Safe' | 'Warning' | 'Critical' = 'Safe';
    if (overallAttendancePercent < goal) {
      safeStatus = 'Critical';
    } else if (overallAttendancePercent - goal <= 3) {
      safeStatus = 'Warning';
    }

    const totalMissed = totalClasses - totalAttended;

    // 2. Subject-wise Attendance
    const subjectWiseAttendance = subjects.map((sub) => {
      const currentPercent = sub.totalClasses > 0 ? parseFloat(((sub.attendedClasses / sub.totalClasses) * 100).toFixed(1)) : 100;
      return {
        subjectName: sub.subjectName,
        attended: sub.attendedClasses,
        total: sub.totalClasses,
        percentage: currentPercent,
        color: sub.color,
      };
    });

    // 3. Weekly Attendance Rates (Grouped by Day of Week for current week)
    // Find logs from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = logs.filter((log) => new Date(log.date) >= sevenDaysAgo);

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = weekdays.map((day) => {
      const dayLogs = recentLogs.filter((log) => weekdays[new Date(log.date).getDay()] === day);
      const presentLogs = dayLogs.filter((log) => log.status === 'present' || log.status === 'lab');
      const countedLogs = dayLogs.filter((log) => ['present', 'absent', 'lab'].includes(log.status));
      const percentage = countedLogs.length > 0 ? parseFloat(((presentLogs.length / countedLogs.length) * 100).toFixed(1)) : 100;

      return {
        day,
        present: presentLogs.length,
        total: countedLogs.length,
        percentage,
      };
    });

    // 4. Monthly Trend (last 6 months)
    const monthlyData: { [key: string]: { present: number; total: number } } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyData[label] = { present: 0, total: 0 };
    }

    logs.forEach((log) => {
      const logDate = new Date(log.date);
      const label = `${months[logDate.getMonth()]} ${logDate.getFullYear().toString().substring(2)}`;
      if (monthlyData[label]) {
        if (log.status === 'present' || log.status === 'lab') {
          monthlyData[label].present += 1;
        }
        if (['present', 'absent', 'lab'].includes(log.status)) {
          monthlyData[label].total += 1;
        }
      }
    });

    const monthlyTrend = Object.keys(monthlyData).map((key) => {
      const item = monthlyData[key];
      return {
        month: key,
        percentage: item.total > 0 ? parseFloat(((item.present / item.total) * 100).toFixed(1)) : 100,
      };
    });

    // 5. GitHub-style Heatmap contributions (all logs format: { date: "YYYY-MM-DD", status: "present" | ... })
    const heatmapData = logs.map((log) => {
      const dateStr = new Date(log.date).toISOString().split('T')[0];
      return {
        date: dateStr,
        status: log.status,
        subjectName: (log.subjectId as any)?.subjectName || 'Unknown',
        color: (log.subjectId as any)?.color || '#2563EB',
      };
    });

    // 6. Most Missed Subject
    let mostMissedSubject = 'None';
    let maxMissedCount = -1;
    subjects.forEach((sub) => {
      const missed = sub.totalClasses - sub.attendedClasses;
      if (missed > maxMissedCount && sub.totalClasses > 0) {
        maxMissedCount = missed;
        mostMissedSubject = sub.subjectName;
      }
    });

    // 7. Dynamic Notifications list
    const notifications: any[] = [];
    
    // Check subject attendance thresholds
    subjects.forEach((sub) => {
      const subPercent = sub.totalClasses > 0 ? (sub.attendedClasses / sub.totalClasses) * 100 : 100;
      if (subPercent < 75 && sub.totalClasses > 0) {
        notifications.push({
          id: `low-75-${sub._id}`,
          text: `Critical: Attendance in ${sub.subjectName} has fallen below 75% (${subPercent.toFixed(1)}%).`,
          type: 'critical',
          date: new Date(),
        });
      } else if (subPercent < 85 && sub.totalClasses > 0) {
        notifications.push({
          id: `low-85-${sub._id}`,
          text: `Warning: Attendance in ${sub.subjectName} is below 85% (${subPercent.toFixed(1)}%).`,
          type: 'warning',
          date: new Date(),
        });
      }
    });

    // Check upcoming study planner items due within next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    plannerItems.forEach((item) => {
      const dueDate = new Date(item.dueDate);
      if (item.status === 'Todo' && dueDate >= new Date() && dueDate <= threeDaysFromNow) {
        notifications.push({
          id: `planner-due-${item._id}`,
          text: `Upcoming ${item.type}: "${item.title}" is due on ${dueDate.toLocaleDateString()}.`,
          type: 'info',
          date: new Date(),
        });
      }
    });

    // 8. Streak calculation
    // Sort logs by date descending
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streakCount = 0;
    
    // A simple streak logic: consecutive days of 'present' or 'lab' logs
    const presentDates = new Set<string>();
    logs.forEach(l => {
      if (l.status === 'present' || l.status === 'lab') {
        presentDates.add(new Date(l.date).toDateString());
      }
    });

    let checkDate = new Date();
    // Normalize to midnight
    checkDate.setHours(0,0,0,0);

    // If they were present today or yesterday, check backward
    let activeStreak = true;
    let daysChecked = 0;
    
    // Check up to last 30 days
    while (activeStreak && daysChecked < 30) {
      const checkStr = checkDate.toDateString();
      if (presentDates.has(checkStr)) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
        daysChecked++;
      } else {
        // If first day checked (today) is not present, we can check yesterday as well
        if (daysChecked === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toDateString();
          if (presentDates.has(yesterdayStr)) {
            streakCount++;
            checkDate.setDate(checkDate.getDate() - 1);
            daysChecked = 2; // already checked today (not present) and yesterday (present)
          } else {
            activeStreak = false;
          }
        } else {
          activeStreak = false;
        }
      }
    }

    res.json({
      summary: {
        overallAttendance: overallAttendancePercent,
        safeStatus,
        totalSubjects: subjects.length,
        totalClasses,
        classesAttended: totalAttended,
        classesMissed: totalMissed,
        attendanceGoal: goal,
        totalSkipsAllowed,
        mostMissedSubject,
        streakCount,
      },
      subjectWiseAttendance,
      weeklyAttendance: weeklyData,
      monthlyTrend,
      heatmapData,
      notifications,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error generating analytics.', error: error.message });
  }
};
