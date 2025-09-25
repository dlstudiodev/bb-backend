/**
 * User entity - Minimal interface for external notifications workflow
 */
export interface User {
  id: string;
  email: string;
  /** Number of days since last activity (workout or TYM session) */
  daysSinceLastActivity?: number;
  /** Whether the user has any workout history */
  hasWorkoutHistory?: boolean;
}