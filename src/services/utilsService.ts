import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import projectService from './ProjectService';
import { CalculationResponse } from './types';

export const loadArchive = (
  statistics: boolean,
  samples: boolean,
  plots: boolean,
): Observable<CalculationResponse> => {
  return from(
    projectService.getCalculationArchive(statistics, samples, plots),
  ).pipe(
    tap(({ filename, data }) => {
      const url = window.URL.createObjectURL(data);
      const link = Object.assign(document.createElement('a'), {
        style: { display: 'none' },
        download: filename,
        href: url,
      });

      document.body.appendChild(link).click();
      window.URL.revokeObjectURL(url);
    }),
  );
};
