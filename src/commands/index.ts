import type { Command } from '../types';
import { pingCommand } from './ping';
import { helpCommand } from './help';
import { detailsCommand } from './details';

/**
 * Command registry
 * Add new commands here to register them
 */
const commands: Command[] = [
  pingCommand,
  helpCommand,
  detailsCommand,
];

/**
 * Command map for quick lookup
 */
const commandMap = new Map<string, Command>();

/**
 * Initialize command registry
 */
export function initializeCommands(): void {
  for (const command of commands) {
    commandMap.set(command.name.toLowerCase(), command);
  }
  console.log(`Registered ${commands.length} commands: ${commands.map(c => c.name).join(', ')}`);
}

/**
 * Get a command by name
 */
export function getCommand(name: string): Command | undefined {
  return commandMap.get(name.toLowerCase());
}

/**
 * Get all registered commands
 */
export function getAllCommands(): Command[] {
  return commands;
}
