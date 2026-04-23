import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface TelemetryEvent {
  eventName: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  sessionData?: {
    userAgent: string;
    url: string;
    viewport: string;
  };
}

export class TasteOfVillageTelemetry {
  private static isEnabled = true;

  static async track(eventName: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    try {
      const event: TelemetryEvent = {
        eventName,
        timestamp: new Date(),
        metadata,
        sessionData: {
          userAgent: window.navigator.userAgent,
          url: window.location.href,
          viewport: `${window.innerWidth}x${window.innerHeight}`
        }
      };

      // Fire and forget (don't block the UI)
      addDoc(collection(db, 'telemetry_events'), event).catch(err => {
        console.warn('Telemetry sync failed (offline or blocked)', err);
      });
    } catch (e) {
      console.warn('Telemetry engine error', e);
    }
  }

  static disable() {
    this.isEnabled = false;
  }
}
