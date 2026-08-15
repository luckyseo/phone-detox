import {
  FocusMode,
  type FocusSession,
  FocusSessionStatus,
  type FocusTask,
  type FocusTimer,
} from '../models';

export interface CreateDraftSessionInput {
  id: string;
  mode: FocusMode;
  allowedAppsToken: string;
  durationSeconds?: number;
  tasks?: FocusTask[];
}

export function createDraftSession(
  input: CreateDraftSessionInput,
): FocusSession {
  const timer = createTimer(input.mode, input.durationSeconds);
  const tasks = input.tasks ?? [];

  validateSessionShape(input.mode, timer, tasks);

  return {
    id: input.id,
    mode: input.mode,
    status: FocusSessionStatus.DRAFT,
    timer,
    tasks,
    allowedApps: {
      opaqueToken: input.allowedAppsToken,
    },
  };
}

export function addTask(tasks: FocusTask[], task: FocusTask): FocusTask[] {
  const title = task.title.trim();

  if (title.length === 0) {
    throw new Error('Task title is required.');
  }

  return [...tasks, {...task, title}];
}

export function deleteTask(tasks: FocusTask[], taskId: string): FocusTask[] {
  return tasks.filter(task => task.id !== taskId);
}

export function updateTaskTitle(
  tasks: FocusTask[],
  taskId: string,
  title: string,
): FocusTask[] {
  const nextTitle = title.trim();

  if (nextTitle.length === 0) {
    throw new Error('Task title is required.');
  }

  return tasks.map(task =>
    task.id === taskId ? {...task, title: nextTitle} : task,
  );
}

export function completeTask(
  session: FocusSession,
  taskId: string,
): FocusSession {
  return {
    ...session,
    tasks: session.tasks.map(task =>
      task.id === taskId ? {...task, completed: true} : task,
    ),
  };
}

export function startSession(
  session: FocusSession,
  startedAt: Date,
): FocusSession {
  if (session.status !== FocusSessionStatus.DRAFT) {
    throw new Error('Only draft sessions can be started.');
  }

  validateSessionShape(session.mode, session.timer, session.tasks);

  return {
    ...session,
    status: FocusSessionStatus.ACTIVE,
    startedAt: startedAt.toISOString(),
    timer: session.timer
      ? {
          ...session.timer,
          endsAt: new Date(
            startedAt.getTime() + session.timer.durationSeconds * 1000,
          ).toISOString(),
        }
      : undefined,
  };
}

export function cancelSession(session: FocusSession): FocusSession {
  if (session.status !== FocusSessionStatus.ACTIVE) {
    throw new Error('Only active sessions can be cancelled.');
  }

  return {...session, status: FocusSessionStatus.CANCELLED};
}

export function completeSession(session: FocusSession): FocusSession {
  if (session.status !== FocusSessionStatus.ACTIVE) {
    throw new Error('Only active sessions can be completed.');
  }

  return {...session, status: FocusSessionStatus.COMPLETED};
}

export function areAllTasksComplete(tasks: FocusTask[]): boolean {
  return tasks.length > 0 && tasks.every(task => task.completed);
}

export function isTimerExpired(
  session: FocusSession,
  now: Date = new Date(),
): boolean {
  if (!session.timer?.endsAt) {
    return false;
  }

  return Date.parse(session.timer.endsAt) <= now.getTime();
}

export function shouldCompleteSession(
  session: FocusSession,
  now: Date = new Date(),
): boolean {
  if (session.status !== FocusSessionStatus.ACTIVE) {
    return false;
  }

  if (session.mode === FocusMode.TIMER) {
    return isTimerExpired(session, now);
  }

  if (session.mode === FocusMode.TASKS) {
    return areAllTasksComplete(session.tasks);
  }

  return isTimerExpired(session, now) && areAllTasksComplete(session.tasks);
}

function createTimer(
  mode: FocusMode,
  durationSeconds?: number,
): FocusTimer | undefined {
  if (mode === FocusMode.TASKS) {
    return undefined;
  }

  if (!durationSeconds || durationSeconds <= 0) {
    throw new Error('Timer sessions require a positive duration.');
  }

  return {durationSeconds};
}

function validateSessionShape(
  mode: FocusMode,
  timer: FocusTimer | undefined,
  tasks: FocusTask[],
): void {
  if (
    (mode === FocusMode.TIMER || mode === FocusMode.TIMER_AND_TASKS) &&
    !timer
  ) {
    throw new Error('Timer sessions require timer configuration.');
  }

  if (
    (mode === FocusMode.TASKS || mode === FocusMode.TIMER_AND_TASKS) &&
    tasks.length === 0
  ) {
    throw new Error('Task sessions require at least one task.');
  }
}
