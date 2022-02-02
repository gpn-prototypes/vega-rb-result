import React, { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoaderAction } from '@app/store/loader/loaderActions';
import { NotifyActions } from '@app/store/notify/notifyActions';
import { RootState } from '@app/store/types';
import { Modal } from '@consta/uikit/Modal';
import { Item } from '@consta/uikit/SnackBar';
import { block } from 'bem-cn';

import { CancelModeContent } from './CancelModeContent/CancelModeContent';
import { InitialModeContent } from './InitialModeContent/InitialModeContent';
import { LoadingModeContent } from './LoadingModeContent/LoadingModeContent';
import { ModalContentProps } from './types';

import './DownloadResultModal.css';

export const cn = block('DownloadResultModal');

interface Props {
  handleClose: () => void;
}

type ModalConfig = {
  initial: FC<ModalContentProps>;
  loading: FC<ModalContentProps>;
  cancel: FC<ModalContentProps>;
};

const modalConfig: ModalConfig = {
  initial: InitialModeContent,
  loading: LoadingModeContent,
  cancel: CancelModeContent,
};

export const DownloadResultModal: React.FC<Props> = ({ handleClose }) => {
  /** Store */
  const dispatch = useDispatch();

  const isLoaded: boolean = useSelector(
    ({ loader }: RootState): boolean => loader.loaded.file || false,
  );

  /** State */
  const [mode, setMode] = React.useState<string>('initial');
  const [isFileLarge, setIsFileLarge] = React.useState<boolean>(false);

  /** Callbacks */
  const appendItem = useCallback(
    (item: Item) => dispatch(NotifyActions.appendItem(item)),
    [dispatch],
  );
  const removeItem = useCallback(
    (id: string) => dispatch(NotifyActions.removeItem(id)),
    [dispatch],
  );

  /** Effects */
  useEffect(() => {
    return () => {
      dispatch(LoaderAction.resetStore());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isLoaded) {
      handleClose();

      appendItem({
        key: 'success',
        message: 'Файл расчёта сохранён на компьютер',
        status: 'success',
      });

      /** Таймаут добавлен для того, что бы визуально не мелькала нотификация */
      setTimeout(async () => {
        removeItem('success');
      }, 1500);
    }
  }, [isLoaded, handleClose, appendItem, removeItem]);

  const ContentComponent = modalConfig[mode];

  return (
    <Modal
      isOpen
      hasOverlay
      onClickOutside={() => handleClose()}
      onEsc={() => handleClose()}
    >
      <div className={cn('Content')}>
        <ContentComponent
          handleCloseContent={handleClose}
          setModalContent={(contentMode) => {
            setMode(contentMode);
          }}
          setFileWithImg={(value) => {
            setIsFileLarge(value);
          }}
          isFileWithImg={isFileLarge}
        />
      </div>
    </Modal>
  );
};
