export interface AppSelection {
  opaqueToken: string;
}

export enum FocusSessionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum FocusMode {
  TIMER = 'TIMER',
  TASKS = 'TASKS',
  TIMER_AND_TASKS = 'TIMER_AND_TASKS',
}

export interface FocusTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface FocusTimer {
  durationSeconds: number;
  endsAt?: string;
}

export interface FocusSession {
  id: string;
  mode: FocusMode;
  status: FocusSessionStatus;
  startedAt?: string;
  timer?: FocusTimer;
  tasks: FocusTask[];
  allowedApps: AppSelection;
}

export interface FocusPlatform {
  requestAuthorization(): Promise<boolean>;
  selectAllowedApps(): Promise<AppSelection>;
  startSession(session: FocusSession): Promise<void>;
  endSession(): Promise<void>;
  getActiveSession(): Promise<FocusSession | null>;
  completeTask(taskId: string): Promise<void>;
}
