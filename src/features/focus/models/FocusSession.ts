import type {AppSelection} from './AppSelection';
import {FocusMode} from './FocusMode';
import {FocusSessionStatus} from './FocusSessionStatus';
import type {FocusTask} from './FocusTask';
import type {FocusTimer} from './FocusTimer';

export interface FocusSession {
  id: string;
  mode: FocusMode;
  status: FocusSessionStatus;
  startedAt?: string;
  timer?: FocusTimer;
  tasks: FocusTask[];
  allowedApps: AppSelection;
}
