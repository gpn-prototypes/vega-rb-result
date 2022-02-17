import projectService from './ProjectService';

export const loadArchive = async (url: string): Promise<void> => {
  const { filename, data } = await projectService.getCalculationArchive(url);

  const resultUrl = window.URL.createObjectURL(data);
  const link = Object.assign(document.createElement('a'), {
    style: { display: 'none' },
    download: filename,
    href: resultUrl,
  });

  document.body.appendChild(link).click();
  window.URL.revokeObjectURL(resultUrl);
};
