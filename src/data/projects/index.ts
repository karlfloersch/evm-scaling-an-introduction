/**
 * Project Registry
 *
 * This file exports all available projects for comparison.
 * To add a new project, create a file and import it here.
 */

import { monad } from './monad';
import { megaeth } from './megaeth';
import { ethereumMainnet } from './ethereum-mainnet';
import type { Project } from './types';

export * from './types';

/**
 * All available projects
 */
export const projects: Project[] = [
  ethereumMainnet,
  monad,
  megaeth,
];

/**
 * Project lookup by ID
 */
export const projectsById: Record<string, Project> = Object.fromEntries(
  projects.map((p) => [p.id, p])
);

/**
 * Get a project by ID
 */
export function getProject(id: string): Project | undefined {
  return projectsById[id];
}

/**
 * Get projects by status
 */
export function getProjectsByStatus(status: Project['status']): Project[] {
  return projects.filter((p) => p.status === status);
}

/**
 * Get projects that implement specific tech
 */
export function getProjectsWithTech(techId: string): Project[] {
  return projects.filter((p) => p.techStack.includes(techId));
}
