import React, { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoaderAction } from '@app/store/loader/loaderActions';
import { NotifyActions } from '@app/store/notify/notifyActions';
import { RootState } from '@app/store/types';
import { Item } from '@consta/uikit/__internal__/src/components/SnackBar/helper';
import { Modal } from '@consta/uikit/Modal';
import { block } from 'bem-cn';

import { CancelModeContent } from './CancelModeContent/CancelModeContent';
import { InitialModeContent } from './InitialModeContent/InitialModeContent';
import { LoadingModeContent } from './LoadingModeContent/LoadingModeContent';
import { ModalContentProps, ModalMode } from './ModalContentType';

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
  const [mode, setMode] = React.useState<ModalMode>(ModalMode.initial);
  const [isFileLarge, setIsFileLarge] = React.useState<boolean>(false);

  /** Callbacks */
  const showNotification = useCallback(
    (item: Item) => dispatch(NotifyActions.appendItem(item)),
    [dispatch],
  );
  const hideNotification = useCallback(
    (id: string) => dispatch(NotifyActions.removeItem(id)),
    [dispatch],
  );

  /** Effects */
  useEffect(() => {
    return () => {
      dispatch(LoaderAction.resetStore());
    };
  }, [dispatch]);

  /**
   * Подписываемся на состояние загрузки:
   * когда файл загружен,
   * закрываем модалку и показываем нотификацию
   * */
  useEffect(() => {
    if (isLoaded) {
      handleClose();

      showNotification({
        key: 'success',
        message: 'Файл расчёта сохранён на компьютер',
        status: 'success',
        onClose: () => hideNotification('success'),
        autoClose: 5,
      });
    }
  }, [isLoaded, handleClose, showNotification, hideNotification]);

  const ContentComponent = modalConfig[mode];

  return (
    <Modal
      isOpen
      hasOverlay
      onClickOutside={handleClose}
      onEsc={handleClose}
      data-testid="export-file-modal"
    >
      <div className={cn('Content')}>
        <ContentComponent
          handleCloseContent={handleClose}
          setModalContent={(contentMode) => {
            setMode(ModalMode[contentMode]);
          }}
          setFileWithImg={setIsFileLarge}
          isFileWithImg={isFileLarge}
        />
      </div>
    </Modal>
  );
};
