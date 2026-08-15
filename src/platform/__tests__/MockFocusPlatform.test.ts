import {FocusMode, FocusSessionStatus} from '../FocusPlatform';
import {MockFocusPlatform} from '../MockFocusPlatform';

describe('MockFocusPlatform', () => {
  it('starts, reads, mutates, and ends a focus session', async () => {
    const platform = new MockFocusPlatform();

    await platform.startSession({
      id: 'session-1',
      mode: FocusMode.TASKS,
      status: FocusSessionStatus.DRAFT,
      tasks: [{id: 'task-1', title: 'Plan the day', completed: false}],
      allowedApps: {opaqueToken: 'allowed-apps'},
    });

    await platform.completeTask('task-1');
    const activeSession = await platform.getActiveSession();

    expect(activeSession?.status).toBe(FocusSessionStatus.ACTIVE);
    expect(activeSession?.tasks[0]?.completed).toBe(true);

    await platform.endSession();

    await expect(platform.getActiveSession()).resolves.toBeNull();
  });
});
