import projectService from './ProjectService';

function saveBlob(blob: Blob, fileName) {
  const a = document.createElement('a');

  a.href = window.URL.createObjectURL(blob);
  a.download = fileName;
  a.dispatchEvent(new MouseEvent('click'));
}

export const loadArchive = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve();
    }

    projectService
      .getCalculationArchive(url)
      .then(async ({ filename, data }) => {
        if (filename && data) {
          const xmlRequest = new XMLHttpRequest();

          /**
           * Делаем запрос в http, получаем результаты файла
           * Результаты в blob, отправляем на сохранение пользователю
           */
          xmlRequest.open('get', url, true);

          const identity = await projectService.identity.getToken();

          xmlRequest.setRequestHeader('Authorization', `Bearer ${identity}`);

          xmlRequest.responseType = 'blob';
          xmlRequest.onload = (e) => {
            const target = e.currentTarget as any;

            if (target !== null) {
              const blob = target.response;
              const contentDispo = target.getResponseHeader(
                'Content-Disposition',
              );
              // https://stackoverflow.com/a/23054920/
              const fileName = contentDispo.match(
                /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
              )[1];

              saveBlob(blob, fileName);
            }

            resolve();
          };

          xmlRequest.onerror = (e) => reject(e);
          xmlRequest.send();
        }
      });
  });
};
