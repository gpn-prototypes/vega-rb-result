import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store/types';
import { Button } from '@consta/uikit/Button';
import { Loader } from '@consta/uikit/Loader';
import { Text } from '@consta/uikit/Text';
import { block } from 'bem-cn';

import { ModalContentProps, ModalMode } from '../ModalContentType';

import './LoadingModeContent.css';

export const cn = block('LoadingModeContent');

export const LoadingModeContent: React.FC<ModalContentProps> = ({
  setModalContent,
  isFileWithImg,
}) => {
  /** Store */
  const status = useSelector(({ file }: RootState) => file.status);

  /** Handlers */
  const handleClose = (): void => {
    setModalContent(ModalMode.cancel);
  };

  return (
    <>
      <div className={cn('Header')} data-testid="export-file-loading-modal">
        <Text as="p" size="xs" align="center">
          Экспорт результата расчёта
        </Text>
      </div>
      <div className={cn('Body')}>
        <Text size="s" view="secondary">
          {status}
        </Text>
        <Text size="s" view="secondary">
          Скачивание начнется автоматически.
        </Text>

        <Loader />

        {isFileWithImg && (
          <Text view="alert" size="xs">
            Генерация файла займёт больше времени из-за большого объема данных
          </Text>
        )}
      </div>
      <div className={cn('Footer')}>
        <Button
          size="m"
          view="ghost"
          label="Отменить"
          width="default"
          onClick={handleClose}
          data-testid="cancel-file-export"
        />
      </div>
    </>
  );
};
