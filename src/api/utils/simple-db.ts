import fs from 'fs';
import path from 'path';

// Types definition
export type FastingStatus = 'idle' | 'fasting' | 'eating' | 'paused' | 'completed';
export type SessionSource = 'manual_start' | 'manual_edit' | 'backfill' | 'auto_recover';

export interface FastingSession {
  id: string;
  fasting_status: FastingStatus;
  start_at: number;
  end_at: number | null;
  target_duration_hours: number;
  duration_minutes: number;
  completed: boolean;
  source: SessionSource;
  timezone: string;
}

export interface MealRecord {
  id: string;
  timestamp: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUrl?: string;
  foodName: string;
  calories: number;
  aiAnalysis?: unknown;
  // Simplified for DB storage
}

export interface DatabaseSchema {
  sessions: FastingSession[];
  userSettings: {
    plan: string;
  };
  mealRecords: MealRecord[];
}

const DB_FILE = path.join(process.cwd(), 'src', 'api', 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Initial DB state
const initialData: DatabaseSchema = {
  sessions: [],
  userSettings: {
    plan: '16:8'
  },
  mealRecords: []
};

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

export const db = {
  read: (): DatabaseSchema => {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return initialData;
    }
  },
  write: (data: DatabaseSchema) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  },
  update: (callback: (data: DatabaseSchema) => void) => {
    const data = db.read();
    callback(data);
    db.write(data);
    return data;
  }
};
