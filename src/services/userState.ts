/**
 * User State Service
 * Manages pending actions and cached media per user
 */

export type PendingAction = 'voice_menu' | 'image_menu' | 'contact_confirm' | null;

export interface CachedMedia {
  data: string;
  mimetype: string;
  duration?: number;
  timestamp: number;
}

export interface ExtractedContact {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  raw: string;
}

export interface UserState {
  pendingAction: PendingAction;
  cachedVoice?: CachedMedia;
  cachedImage?: CachedMedia;
  extractedContact?: ExtractedContact;
  lastActivity: number;
}

// In-memory state storage (per user JID)
const userStates = new Map<string, UserState>();

// State expires after 10 minutes of inactivity
const STATE_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Get user state, creating if needed
 */
export function getUserState(jid: string): UserState {
  let state = userStates.get(jid);
  
  // Check if state expired
  if (state && Date.now() - state.lastActivity > STATE_EXPIRY_MS) {
    userStates.delete(jid);
    state = undefined;
  }
  
  if (!state) {
    state = {
      pendingAction: null,
      lastActivity: Date.now(),
    };
    userStates.set(jid, state);
  }
  
  return state;
}

/**
 * Update user state
 */
export function setUserState(jid: string, updates: Partial<UserState>): void {
  const state = getUserState(jid);
  Object.assign(state, updates, { lastActivity: Date.now() });
}

/**
 * Clear user state (after action completed or cancelled)
 */
export function clearUserState(jid: string): void {
  userStates.delete(jid);
}

/**
 * Check if user has a pending action
 */
export function hasPendingAction(jid: string): boolean {
  const state = userStates.get(jid);
  if (!state) return false;
  if (Date.now() - state.lastActivity > STATE_EXPIRY_MS) {
    userStates.delete(jid);
    return false;
  }
  return state.pendingAction !== null;
}

/**
 * Get pending action type
 */
export function getPendingAction(jid: string): PendingAction {
  const state = userStates.get(jid);
  if (!state) return null;
  if (Date.now() - state.lastActivity > STATE_EXPIRY_MS) {
    userStates.delete(jid);
    return null;
  }
  return state.pendingAction;
}
