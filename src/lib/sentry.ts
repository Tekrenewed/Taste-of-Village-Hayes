/**
 * Taste of Village — Custom Error Monitoring
 * 
 * Zero external dependencies. Writes errors to Firestore `error_logs` collection.
 * Viewable in the Admin dashboard + Google Cloud Console automatically.
 * 
 * Replaces Sentry with an in-house solution using existing Firebase infrastructure.
 */
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ERROR_COLLECTION = 'error_logs';
const MAX_ERRORS_PER_SESSION = 10; // Prevent flood from loops
let errorCount = 0;
let sessionId = '';

// Generate a unique session ID for correlating errors from the same visit
function getSessionId(): string {
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return sessionId;
}

interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  feature?: string;
  orderId?: string;
  context?: Record<string, unknown>;
  userAgent: string;
  sessionId: string;
  timestamp: ReturnType<typeof Timestamp.now>;
  severity: 'error' | 'warning' | 'critical';
}

/**
 * Log an error to Firestore. Silent — never throws.
 */
async function logError(entry: Omit<ErrorLog, 'url' | 'userAgent' | 'sessionId' | 'timestamp'>) {
  if (errorCount >= MAX_ERRORS_PER_SESSION) return; // Rate limit
  errorCount++;

  try {
    const log: ErrorLog = {
      ...entry,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
      timestamp: Timestamp.now(),
    };

    await addDoc(collection(db, ERROR_COLLECTION), log);
  } catch {
    // If Firestore itself is down, there's nothing we can do — fail silently
    console.warn('[ErrorMonitor] Failed to log error to Firestore');
  }
}

/**
 * Capture a custom error with order context.
 */
export function captureOrderError(error: Error, orderId: string, context?: Record<string, unknown>) {
  logError({
    message: error.message,
    stack: error.stack?.slice(0, 1000), // Trim stack to save space
    feature: 'orders',
    orderId,
    context,
    severity: 'error',
  });
}

/**
 * Capture a generic application error.
 */
export function captureError(error: Error, feature?: string, context?: Record<string, unknown>) {
  logError({
    message: error.message,
    stack: error.stack?.slice(0, 1000),
    feature,
    context,
    severity: 'error',
  });
}

/**
 * Initialise global error handlers.
 * Catches unhandled errors and promise rejections automatically.
 */
export function initErrorMonitoring() {
  // Catch unhandled JS errors
  window.addEventListener('error', (event) => {
    // Skip errors from browser extensions or cross-origin scripts
    if (!event.filename || event.filename.includes('extension')) return;

    logError({
      message: event.message || 'Unknown error',
      stack: event.error?.stack?.slice(0, 1000),
      feature: 'global',
      severity: 'critical',
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    logError({
      message: error?.message || String(error) || 'Unhandled promise rejection',
      stack: error?.stack?.slice(0, 1000),
      feature: 'global',
      severity: 'critical',
    });
  });

  console.log('[ErrorMonitor] Active — logging to Firestore');
}
