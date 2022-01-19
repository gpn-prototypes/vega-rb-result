import React from 'react';
import { Button } from '@consta/uikit/Button';
import { IconClose } from '@consta/uikit/IconClose';
import { Text } from '@consta/uikit/Text';
import { block } from 'bem-cn';

import './CancelModeContent.css';

export const cn = block('CancelModeContent');

interface Props {
  handleCloseContent: () => void;
  setModalContent: (contentType: string) => void;
}

export const CancelModeContent: React.FC<Props> = ({
  handleCloseContent,
  setModalContent,
}) => {
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
          onClick={() => setModalContent('loading')}
        />
        <Button
          size="m"
          view="primary"
          label="Прекратить"
          width="default"
          onClick={() => handleCloseContent()}
        />
      </div>
    </>
  );
};
