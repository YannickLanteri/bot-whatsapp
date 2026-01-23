import type { MediaTypeHandler } from '../types';
import { voiceHandler } from './voice';

/**
 * Media handlers registry
 * Add new media handlers here to register them
 */
const mediaHandlers: MediaTypeHandler[] = [
  voiceHandler,
];

/**
 * Get handler for a specific media type
 */
export function getMediaHandler(type: string): MediaTypeHandler | undefined {
  return mediaHandlers.find(handler => handler.types.includes(type));
}

/**
 * Get all registered media handlers
 */
export function getAllMediaHandlers(): MediaTypeHandler[] {
  return mediaHandlers;
}
