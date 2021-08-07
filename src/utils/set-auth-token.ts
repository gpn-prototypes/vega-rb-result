import { rbResultService } from '@app/utils/rb-result-service';

export function authHeader(defaultToken: string | undefined) {
  const token = rbResultService.identity?.getToken() || defaultToken;

  return { Authorization: `Bearer ${token}` };
}
