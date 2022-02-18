import projectService from './ProjectService';

export const loadArchive = (url: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
    }

    projectService.getCalculationArchive(url).then(({ filename, data }) => {
      if (filename && data) {
        const resultUrl = window.URL.createObjectURL(data);
        const link = Object.assign(document.createElement('a'), {
          style: { display: 'none' },
          download: filename,
          href: resultUrl,
        });

        document.body.appendChild(link).click();
        window.URL.revokeObjectURL(resultUrl);

        setTimeout(() => resolve(), 1500);
      }
    });
  });
};
