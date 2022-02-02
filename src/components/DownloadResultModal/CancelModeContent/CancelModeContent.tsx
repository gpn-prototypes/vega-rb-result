import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileAction } from '@app/store/file/fileActions';
import { RootState } from '@app/store/types';
import { Button } from '@consta/uikit/Button';
import { IconClose } from '@consta/uikit/IconClose';
import { Text } from '@consta/uikit/Text';
import { block } from 'bem-cn';

import { ModalContentProps } from '../types';

import './CancelModeContent.css';

export const cn = block('CancelModeContent');

export const CancelModeContent: React.FC<ModalContentProps> = ({
  handleCloseContent,
  setModalContent,
  isFileWithImg,
  setFileWithImg,
}) => {
  /** Store */
  const dispatch = useDispatch();

  const isLoading: boolean = useSelector(
    ({ loader }: RootState): boolean => loader.loading.file || false,
  );

  /** Callbacks */
  const cancelFetch = useCallback(() => {
    if (isLoading) {
      dispatch(FileAction.stopFetchingFile());
    }
  }, [dispatch, isLoading]);

  return (
    <>
      <div className={cn('Header')}>
        <Text as="p" size="xs" align="center">
          Отмена генерации файла
        </Text>
        <IconClose size="s" view="ghost" onClick={() => handleCloseContent()} />
      </div>
      <div className={cn('Body')}>
        <Text size="s" view="secondary">
          Прекратить генерацию файла?
        </Text>
      </div>
      <div className={cn('Footer')}>
        <Button
          size="m"
          view="ghost"
          label="Продолжить"
          width="default"
          onClick={() => {
            setFileWithImg(isFileWithImg);
            setModalContent('loading');
          }}
        />
        <Button
          size="m"
          view="primary"
          label="Прекратить"
          width="default"
          onClick={() => {
            cancelFetch();
            handleCloseContent();
          }}
        />
      </div>
    </>
  );
};
