import {
  areAllTasksComplete,
  completeTask,
  createDraftSession,
  shouldCompleteSession,
  startSession,
} from '../services/focusSessionService';
import {FocusMode, FocusSessionStatus, type FocusTask} from '../models';

const tasks: FocusTask[] = [
  {id: 'task-1', title: 'Write outline', completed: false},
  {id: 'task-2', title: 'Stretch', completed: false},
];

describe('focusSessionService', () => {
  it('reports all tasks complete only when every task is done', () => {
    expect(
      areAllTasksComplete(tasks.map(task => ({...task, completed: true}))),
    ).toBe(true);
    expect(areAllTasksComplete(tasks)).toBe(false);
    expect(areAllTasksComplete([])).toBe(false);
  });

  it('creates a timer draft session', () => {
    const session = createDraftSession({
      id: 'session-1',
      mode: FocusMode.TIMER,
      allowedAppsToken: 'allowed-apps',
      durationSeconds: 1500,
    });

    expect(session.status).toBe(FocusSessionStatus.DRAFT);
    expect(session.timer?.durationSeconds).toBe(1500);
    expect(session.allowedApps.opaqueToken).toBe('allowed-apps');
  });

  it('starts a draft session and calculates an absolute end time', () => {
    const draft = createDraftSession({
      id: 'session-1',
      mode: FocusMode.TIMER,
      allowedAppsToken: 'allowed-apps',
      durationSeconds: 60,
    });

    const active = startSession(draft, new Date('2026-08-15T00:00:00.000Z'));

    expect(active.status).toBe(FocusSessionStatus.ACTIVE);
    expect(active.startedAt).toBe('2026-08-15T00:00:00.000Z');
    expect(active.timer?.endsAt).toBe('2026-08-15T00:01:00.000Z');
  });

  it('completes task sessions when every task is done', () => {
    const draft = createDraftSession({
      id: 'session-1',
      mode: FocusMode.TASKS,
      allowedAppsToken: 'allowed-apps',
      tasks,
    });
    const active = startSession(draft, new Date('2026-08-15T00:00:00.000Z'));

    const oneDone = completeTask(active, 'task-1');
    const allDone = completeTask(oneDone, 'task-2');

    expect(shouldCompleteSession(oneDone)).toBe(false);
    expect(shouldCompleteSession(allDone)).toBe(true);
  });

  it('requires both timer expiry and tasks for timer-and-tasks sessions', () => {
    const draft = createDraftSession({
      id: 'session-1',
      mode: FocusMode.TIMER_AND_TASKS,
      allowedAppsToken: 'allowed-apps',
      durationSeconds: 60,
      tasks,
    });
    const active = startSession(draft, new Date('2026-08-15T00:00:00.000Z'));
    const allDone = completeTask(completeTask(active, 'task-1'), 'task-2');

    expect(
      shouldCompleteSession(allDone, new Date('2026-08-15T00:00:59.000Z')),
    ).toBe(false);
    expect(
      shouldCompleteSession(allDone, new Date('2026-08-15T00:01:00.000Z')),
    ).toBe(true);
  });

  it('rejects invalid session shapes', () => {
    expect(() =>
      createDraftSession({
        id: 'session-1',
        mode: FocusMode.TIMER,
        allowedAppsToken: 'allowed-apps',
      }),
    ).toThrow('Timer sessions require a positive duration.');

    expect(() =>
      createDraftSession({
        id: 'session-2',
        mode: FocusMode.TASKS,
        allowedAppsToken: 'allowed-apps',
      }),
    ).toThrow('Task sessions require at least one task.');
  });
});
