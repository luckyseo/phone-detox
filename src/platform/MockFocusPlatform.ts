import type {AppSelection, FocusPlatform, FocusSession} from './FocusPlatform';
import {FocusSessionStatus} from './FocusPlatform';

export class MockFocusPlatform implements FocusPlatform {
  private activeSession: FocusSession | null = null;

  async requestAuthorization(): Promise<boolean> {
    return true;
  }

  async selectAllowedApps(): Promise<AppSelection> {
    return {opaqueToken: 'mock-allowed-apps'};
  }

  async startSession(session: FocusSession): Promise<void> {
    this.activeSession = {
      ...session,
      status: FocusSessionStatus.ACTIVE,
    };
  }

  async endSession(): Promise<void> {
    this.activeSession = null;
  }

  async getActiveSession(): Promise<FocusSession | null> {
    return this.activeSession;
  }

  async completeTask(taskId: string): Promise<void> {
    if (!this.activeSession) {
      return;
    }

    this.activeSession = {
      ...this.activeSession,
      tasks: this.activeSession.tasks.map(task =>
        task.id === taskId ? {...task, completed: true} : task,
      ),
    };
  }
}
