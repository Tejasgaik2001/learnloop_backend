import { Injectable } from '@nestjs/common';

@Injectable()
export class ClockService {
  private simulatedDate: Date | null = null;

  /**
   * Get the current date - either simulated or real
   */
  now(): Date {
    if (this.simulatedDate) {
      return new Date(this.simulatedDate);
    }
    return new Date();
  }

  /**
   * Set a simulated date for time travel testing
   */
  setSimulatedDate(date: Date | string): void {
    this.simulatedDate = typeof date === 'string' ? new Date(date) : date;
    console.log(`[ClockService] Time travel activated! Current date: ${this.simulatedDate.toISOString()}`);
  }

  /**
   * Get the simulated date if set, null otherwise
   */
  getSimulatedDate(): Date | null {
    return this.simulatedDate ? new Date(this.simulatedDate) : null;
  }

  /**
   * Reset to real time
   */
  resetToRealTime(): void {
    if (this.simulatedDate) {
      console.log(`[ClockService] Returning to real time. Was simulating: ${this.simulatedDate.toISOString()}`);
    }
    this.simulatedDate = null;
  }

  /**
   * Check if we're in simulation mode
   */
  isSimulated(): boolean {
    return this.simulatedDate !== null;
  }

  /**
   * Travel forward/backward by days
   */
  travelDays(days: number): void {
    const currentDate = this.now();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    this.setSimulatedDate(newDate);
  }

  /**
   * Travel forward/backward by hours
   */
  travelHours(hours: number): void {
    const currentDate = this.now();
    const newDate = new Date(currentDate);
    newDate.setHours(newDate.getHours() + hours);
    this.setSimulatedDate(newDate);
  }

  /**
   * Get today (start of day)
   */
  today(): Date {
    const now = this.now();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  /**
   * Get tomorrow (start of day)
   */
  tomorrow(): Date {
    const today = this.today();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  /**
   * Format the current time for display
   */
  formatCurrentTime(): string {
    const now = this.now();
    if (this.isSimulated()) {
      return `[SIMULATED] ${now.toISOString()}`;
    }
    return `[REAL TIME] ${now.toISOString()}`;
  }
}
