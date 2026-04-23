import { useState, useEffect, useCallback } from 'react';
import { Staff, RotaEntry } from '../types';
import { streamStaff, streamActiveShifts, getRotaForWeek, saveRotaShift, exportTimesheets, getMondayOfISOWeek } from '../services/staffService';

export function useStaff() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [activeShifts, setActiveShifts] = useState<any[]>([]);
  const [rotaData, setRotaData] = useState<Record<string, string>>({});
  const [loadingRota, setLoadingRota] = useState(false);
  
  // Terminal & Form State
  const [staffPin, setStaffPin] = useState('');
  const [staffMessage, setStaffMessage] = useState({ text: '', type: '' });
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('staff');
  const [showStaffForm, setShowStaffForm] = useState(false);

  // Week ID calculation (ISO-8601)
  const [rotaWeekId, setRotaWeekId] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const w1 = new Date(d.getFullYear(), 0, 4); const dw = w1.getDay() || 7;
    const wn = 1 + Math.round(((d.getTime() - w1.getTime()) / 86400000 - 3 + ((dw + 6) % 7)) / 7);
    return `${d.getFullYear()}-W${String(wn).padStart(2, '0')}`;
  });

  // Stream staff and active shifts (Real-time Firestore)
  useEffect(() => {
    const unsubStaff = streamStaff(setStaffList);
    const unsubShifts = streamActiveShifts(setActiveShifts);
    return () => { unsubStaff(); unsubShifts(); };
  }, []);

  // Fetch Rota when week changes
  const fetchRota = useCallback(async (weekId: string) => {
    setLoadingRota(true);
    try {
      const entries = await getRotaForWeek(weekId);
      // Convert list of entries to the grid-friendly Record<staffId_day, timeStr>
      const grid: Record<string, string> = {};
      entries.forEach(e => {
        const dayKey = e.day.toLowerCase().slice(0, 3);
        grid[`${e.staff_id}_${dayKey}`] = `${e.start_time}-${e.end_time}`;
      });
      setRotaData(grid);
    } catch (err) {
      console.error('[useStaff] Failed to load rota:', err);
    } finally {
      setLoadingRota(false);
    }
  }, []);

  useEffect(() => {
    fetchRota(rotaWeekId);
  }, [rotaWeekId, fetchRota]);

  const changeWeek = (delta: number) => {
    const parts = rotaWeekId.split('-W');
    const yr = parseInt(parts[0]);
    const wk = parseInt(parts[1]);
    let newWk = wk + delta;
    let newYr = yr;

    if (newWk < 1) { newYr--; newWk = 52; }
    else if (newWk > 52) { newYr++; newWk = 1; }

    setRotaWeekId(`${newYr}-W${String(newWk).padStart(2, '0')}`);
  };

  const updateShift = async (staffId: string, dayPrefix: string, value: string) => {
    const key = `${staffId}_${dayPrefix}`;
    // Optimistic update
    setRotaData(prev => ({ ...prev, [key]: value }));

    try {
      // Calculate actual ISO date for the day of that week
      const [year, week] = rotaWeekId.split('-W').map(Number);
      const monday = getMondayOfISOWeek(week, year);
      const dayMap: Record<string, number> = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
      const dayOffset = dayMap[dayPrefix] ?? 0;
      const actualDate = new Date(monday);
      actualDate.setDate(monday.getDate() + dayOffset);
      const dayStr = actualDate.toISOString().split('T')[0];

      await saveRotaShift(staffId, dayStr, value, rotaWeekId);
    } catch (err) {
      // Revert on failure
      fetchRota(rotaWeekId);
      alert('Failed to save shift. Please check your connection.');
    }
  };

  const downloadTimesheet = (range: { from: string, to: string }) => {
    exportTimesheets(range.from, range.to);
  };

  return {
    staffList,
    activeShifts,
    rotaData,
    rotaWeekId,
    setRotaWeekId,
    loadingRota,
    setRotaData,
    changeWeek,
    updateShift,
    downloadTimesheet,
    staffPin, setStaffPin,
    staffMessage, setStaffMessage,
    newStaffName, setNewStaffName,
    newStaffPin, setNewStaffPin,
    newStaffRole, setNewStaffRole,
    showStaffForm, setShowStaffForm
  };
}

