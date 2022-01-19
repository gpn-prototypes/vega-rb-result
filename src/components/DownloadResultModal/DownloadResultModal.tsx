import React, { FC } from 'react';
import { Modal } from '@consta/uikit/Modal';
import { block } from 'bem-cn';

import { CancelModeContent } from './CancelModeContent/CancelModeContent';
import { InitialModeContent } from './InitialModeContent/InitialModeContent';
import { LoadingModeContent } from './LoadingModeContent/LoadingModeContent';

import './DownloadResultModal.css';

export const cn = block('DownloadResultModal');

interface Props {
  handleClose: () => void;
}

interface ContentProps {
  // TODO ? вынести в одно место
  handleCloseContent: () => void;
  setModalContent: (contentType: string) => void;
}

type ModalConfig = {
  initial: FC<ContentProps>;
  loading: FC<ContentProps>;
  cancel: FC<ContentProps>;
};

const modalConfig: ModalConfig = {
  initial: InitialModeContent,
  loading: LoadingModeContent,
  cancel: CancelModeContent,
};

export const DownloadResultModal: React.FC<Props> = ({ handleClose }) => {
  /** State */
  const [mode, setMode] = React.useState<string>('initial');

  const ContentComponent = modalConfig[mode];

  return (
    <Modal
      isOpen
      width="auto"
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
        />
      </div>
    </Modal>
  );
};
