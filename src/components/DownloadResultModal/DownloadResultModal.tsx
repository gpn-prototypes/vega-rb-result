import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store/types';
import { Modal } from '@consta/uikit/Modal';
import { block } from 'bem-cn';

import { CancelModeContent } from './CancelModeContent/CancelModeContent';
import { InitialModeContent } from './InitialModeContent/InitialModeContent';
import { LoadingModeContent } from './LoadingModeContent/LoadingModeContent';
import { ModalContentProps, ModalMode } from './ModalContentType';

import './DownloadResultModal.css';

const cn = block('DownloadResultModal');

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

export const DownloadResultModal: FC<Props> = ({ handleClose }) => {
  /** Store */
  const isLoaded: boolean = useSelector(
    ({ loader }: RootState): boolean => loader.loaded.file || false,
  );

  /** State */
  const [mode, setMode] = useState<ModalMode>(ModalMode.initial);
  const [isFileLarge, setIsFileLarge] = useState<boolean>(false);

  /**
   * Подписываемся на состояние загрузки:
   * когда файл загружен,
   * закрываем модалку
   * */
  useEffect(() => {
    if (isLoaded) {
      handleClose();
    }
  }, [handleClose, isLoaded]);

  const ContentComponent = modalConfig[mode];

  return (
    <Modal
      isOpen
      hasOverlay
      onClickOutside={handleClose}
      onEsc={handleClose}
      data-testid="export-file-modal"
      className="download-result-modal"
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
