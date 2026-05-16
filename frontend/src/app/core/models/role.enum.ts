export enum Role {
  Client = 'ROLE_CLIENT',
  Agent = 'ROLE_AGENT',
  Admin = 'ROLE_ADMIN',
}

export const ALL_ROLES = [Role.Client, Role.Agent, Role.Admin] as const;
