import projectService from './ProjectService';

export const loadArchive = async (fileId: string): Promise<void> => {
  const { filename, data } = await projectService.getCalculationArchive(fileId);

  const url = window.URL.createObjectURL(data);
  const link = Object.assign(document.createElement('a'), {
    style: { display: 'none' },
    download: filename,
    href: url,
  });

  document.body.appendChild(link).click();
  window.URL.revokeObjectURL(url);
};
