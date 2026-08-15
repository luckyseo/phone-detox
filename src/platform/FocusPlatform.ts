import type {AppSelection, FocusSession} from '../features/focus/models';

export type {
  AppSelection,
  FocusSession,
  FocusTask,
  FocusTimer,
} from '../features/focus/models';
export {FocusMode, FocusSessionStatus} from '../features/focus/models';

export interface FocusPlatform {
  requestAuthorization(): Promise<boolean>;
  selectAllowedApps(): Promise<AppSelection>;
  startSession(session: FocusSession): Promise<void>;
  endSession(): Promise<void>;
  getActiveSession(): Promise<FocusSession | null>;
  completeTask(taskId: string): Promise<void>;
}
