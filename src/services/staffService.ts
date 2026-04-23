import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { Staff, RotaEntry } from '../types';

/**
 * Staff & Rota Service
 * Handlers for staff registry, clocking, and weekly scheduling via Go API.
 */

// ─── Staff Registry (Firestore Wrapper) ───

export function streamStaff(callback: (staff: Staff[]) => void) {
  let isCancelled = false;

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/v1/staff');
      if (!res.ok) return;
      const list = await res.json();
      if (!isCancelled) {
        callback(list.map((s: any) => ({
          ...s,
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        })));
      }
    } catch (err) {
      console.error("Error polling staff:", err);
    }
  };

  fetchStaff();
  const interval = setInterval(fetchStaff, 60000); // Poll every minute

  return () => {
    isCancelled = true;
    clearInterval(interval);
  };
}

export function streamActiveShifts(callback: (shifts: any[]) => void) {
  let isCancelled = false;

  const fetchShifts = async () => {
    try {
      const res = await fetch('/api/v1/shifts/active');
      if (!res.ok) return;
      const list = await res.json();
      if (!isCancelled) {
        callback(list || []);
      }
    } catch (err) {
      console.error("Error polling active shifts:", err);
    }
  };

  fetchShifts();
  const interval = setInterval(fetchShifts, 30000); // Poll every 30s

  return () => {
    isCancelled = true;
    clearInterval(interval);
  };
}

export async function clockShift(pin: string) {
  const res = await fetch('/api/v1/shifts/clock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Invalid PIN' }));
    throw new Error(err.message || 'Invalid PIN');
  }
  return await res.json();
}

// ─── Rota Management (Go API Wrapper) ───

/**
 * Fetches the rota for a specific ISO week (e.g. "2024-W16")
 */
export async function getRotaForWeek(weekId: string): Promise<RotaEntry[]> {
  const [year, week] = weekId.split('-W').map(Number);
  const monday = getMondayOfISOWeek(week, year);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const from = monday.toISOString().split('T')[0];
  const to = sunday.toISOString().split('T')[0];

  console.log(`[staffService] Fetching rota for ${weekId} (${from} to ${to})`);

  if (MOCK_MODE) {
    return [
      { id: 'mock1', staff_id: '1', day: 'Monday', start_time: '09:00', end_time: '17:00' },
      { id: 'mock2', staff_id: '2', day: 'Tuesday', start_time: '10:00', end_time: '18:00' },
    ];
  }

  try {
    const res = await fetch(`/api/v1/rota?from=${from}&to=${to}`);
    if (!res.ok) throw new Error('Failed to fetch rota');
    return await res.json();
  } catch (err) {
    console.error('[staffService] getRota failed:', err);
    return [];
  }
}

/**
 * Parses a shift string like "9-5" or "10:30-18:00" and saves it.
 * If empty/OFF, it should delete the entry (not implemented in parser, handled by caller).
 */
export async function saveRotaShift(staffId: string, day: string, timeStr: string, weekId: string) {
  if (!timeStr || timeStr.toUpperCase() === 'OFF' || timeStr === '—') {
    // Delete logic handled via API if ID is known, 
    // but the current UI doesn't track IDs for empty cells.
    // For now, we'll just skip or send empty range if the backend supports it.
    return;
  }

  const { start, end } = parseShiftTime(timeStr);
  
  const payload = {
    staff_id: staffId,
    day: day, // e.g. "Monday"
    start_time: start,
    end_time: end,
    // Note: The date is inferred from weekId + day on the backend if needed, 
    // but the Go API HandleSetRota just takes Day/StartTime/EndTime.
  };

  try {
    const res = await fetch('/api/v1/rota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save shift');
    return await res.json();
  } catch (err) {
    console.error('[staffService] saveRotaShift failed:', err);
    throw err;
  }
}

// ─── Timesheet Export ───

export async function exportTimesheets(from: string, r_to: string) {
  try {
    // Try API first (returns JSON array of shift records)
    const res = await fetch(`/api/v1/shifts/export?from=${from}&to=${r_to}`);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/csv') || contentType.includes('application/octet-stream')) {
        // Backend returned a real CSV file
        const blob = await res.blob();
        downloadBlob(blob, `timesheet_${from}_to_${r_to}.csv`);
        return;
      }
      // Backend returned JSON — convert to CSV on the frontend
      const data: Array<{
        staff_name: string;
        date: string;
        clock_in: string;
        clock_out: string;
        break_minutes: number;
        total_hours: number;
        hourly_rate: number;
        pay: number;
      }> = await res.json();

      const headers = ['Staff Name', 'Date', 'Clock In', 'Clock Out', 'Break (min)', 'Hours Worked', 'Hourly Rate (£)', 'Pay (£)'];
      const rows = data.map(r => [
        `"${r.staff_name}"`,
        r.date,
        r.clock_in,
        r.clock_out,
        r.break_minutes ?? 0,
        r.total_hours?.toFixed(2) ?? '',
        r.hourly_rate?.toFixed(2) ?? '',
        r.pay?.toFixed(2) ?? '',
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `timesheet_${from}_to_${r_to}.csv`);
    } else {
      throw new Error(`API returned ${res.status}`);
    }
  } catch (err) {
    console.error('[staffService] exportTimesheets failed:', err);
    alert('⚠️ Could not export timesheet. Please check your connection and try again.');
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


const MOCK_MODE = process.env.NODE_ENV === 'development';

export function getMondayOfISOWeek(w: number, y: number) {
  // ISO-8601 weeks: Week 1 is the week with the first Thursday of the year (or Jan 4th).
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const day = jan4.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const monday = new Date(jan4);
  // monday = jan4 - (day-1), but handle Sunday (0) separately
  monday.setUTCDate(jan4.getUTCDate() - (day === 0 ? 6 : day - 1));
  
  // Now we have Monday of Week 1. Add (w-1) weeks.
  const targetMonday = new Date(monday);
  targetMonday.setUTCDate(monday.getUTCDate() + (w - 1) * 7);
  return targetMonday;
}

function parseShiftTime(str: string): { start: string, end: string } {
  const parts = str.split(/[-–—]| to /i).map(s => s.trim());
  if (parts.length < 2) return { start: str, end: '' };

  const format = (t: string, referenceHours?: number) => {
    t = t.toLowerCase();
    let isPm = t.includes('pm');
    let isAm = t.includes('am');
    let clean = t.replace(/[ap]m/g, '').trim();
    
    // Detection: is it already 24h? (e.g. "02:00", "14:00")
    const isAlready24h = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(clean) || parseInt(clean.split(':')[0]) > 12;

    let [hStr, mStr] = clean.split(':');
    let h = parseInt(hStr);
    let m = mStr ? parseInt(mStr) : 0;

    if (isNaN(h)) return t;

    // Apply "Smaller implies PM" ONLY if not already clearly 24h or fixed AM/PM
    if (!isPm && !isAm && !isAlready24h && referenceHours !== undefined) {
      if (h < referenceHours && h <= 12) {
        // Exception: 12-hour clock "12" is sometimes noon, sometimes midnight. 
        // In "9-12", 12 is usually noon (PM context starts at 12).
        isPm = true;
      }
    }

    if (isPm && h < 12) h += 12;
    if (isAm && h === 12) h = 0;

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  try {
    const start24 = format(parts[0]);
    const startHours = parseInt(start24.split(':')[0]);
    const end24 = format(parts[1], startHours);
    return { start: start24, end: end24 };
  } catch {
    return { start: parts[0], end: parts[1] };
  }
}
