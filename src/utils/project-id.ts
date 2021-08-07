//TODO wtf
const localStorageKey = 'projectId';
const defaultProjectId = 'a3333333-b111-c111-d111-e00000000000';

// export function getProjectId(): string {
//   let value = localStorage.getItem(localStorageKey) || '';
//   if (!value) {
//     localStorage.setItem(localStorageKey, 'a3333333-b111-c111-d111-e00000000000');
//     value = localStorage.getItem(localStorageKey) || '';
//   }
//
//   return value;
// }

export const setProjectId = (projectId: string): void =>
  localStorage.setItem('projectId', projectId);

export const getProjectId = (): string => localStorage.getItem(localStorageKey) || defaultProjectId;
