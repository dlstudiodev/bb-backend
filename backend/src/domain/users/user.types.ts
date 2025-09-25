/**
 * User entity - Minimal interface for external notifications workflow
 */
export interface User {
  id: string;
  /** Number of days since last activity (workout or TYM session) */
  daysSinceLastActivity?: number;
  /** Whether the user has any workout history */
  hasWorkoutHistory?: boolean;
  /** User email (enriched by workflow when needed) */
  email?: string;
}
