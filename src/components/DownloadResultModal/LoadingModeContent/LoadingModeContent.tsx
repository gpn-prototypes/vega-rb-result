import React from 'react';
import { Button } from '@consta/uikit/Button';
import { Loader } from '@consta/uikit/Loader';
import { Text } from '@consta/uikit/Text';
import { block } from 'bem-cn';

import './LoadingModeContent.css';

export const cn = block('LoadingModeContent');

interface Props {
  handleCloseContent: () => void;
  setModalContent: (contentType: string) => void;
}

export const LoadingModeContent: React.FC<Props> = ({
  handleCloseContent,
  setModalContent,
}) => {
  console.log(handleCloseContent); // TODO ? сделать handleCloseContent ?

  return (
    <>
      <div className={cn('Header')}>
        <Text as="p" size="xs" align="center">
          Экспорт результата расчёта
        </Text>
      </div>
      <div className={cn('Body')}>
        <Text size="s" view="secondary">
          Файл генерируется, пожалуйста, не закрывайте вкладку браузера.
        </Text>
        <Text size="s" view="secondary">
          Скачивание начнется автоматически.
        </Text>

        <Loader />

        <Text view="alert" size="xs">
          Генерация файла займёт больше времени из-за большого объема данных
        </Text>
      </div>
      <div className={cn('Footer')}>
        <Button
          size="m"
          view="ghost"
          label="Отменить"
          width="default"
          onClick={() => setModalContent('cancel')}
        />
      </div>
    </>
  );
};
