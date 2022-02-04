import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FileAction } from '@app/store/file/fileActions';
import { Button } from '@consta/uikit/Button';
import { Checkbox } from '@consta/uikit/Checkbox';
import { IconClose } from '@consta/uikit/IconClose';
import { Text } from '@consta/uikit/Text';
import { block } from 'bem-cn';

import { ModalContentProps, ModalMode } from '../ModalContentType';

import './InitialModeContent.css';

export const cn = block('InitialModeContent');

enum DownloadTypeEnum {
  statistics = 'statistics',
  samples = 'samples',
  plots = 'plots',
}

enum DownloadNameEnum {
  statistics = 'Статистика',
  samples = 'Сэмплы',
  plots = 'Изображения',
}

type DownloadData = {
  name: DownloadNameEnum;
  type: DownloadTypeEnum;
  size: string;
  disabled?: boolean;
};

export const InitialModeContent: React.FC<ModalContentProps> = ({
  handleCloseContent,
  setModalContent,
  isFileWithImg,
  setFileWithImg,
}) => {
  /* Store */
  const dispatch = useDispatch();

  /** State */
  const [checkedState, setCheckedState] = useState<
    Record<DownloadTypeEnum, boolean>
  >({
    statistics: true,
    samples: true,
    plots: false,
  });

  const downloadDataTypes: DownloadData[] = [
    {
      name: DownloadNameEnum.statistics,
      type: DownloadTypeEnum.statistics,
      size: 'Небольшой',
    },
    {
      name: DownloadNameEnum.samples,
      type: DownloadTypeEnum.samples,
      size: 'Средний',
    },
    {
      name: DownloadNameEnum.plots,
      type: DownloadTypeEnum.plots,
      size: 'Большой',
    },
  ];

  /** Callbacks */
  const handleOnChange = useCallback(
    (type: DownloadTypeEnum): void => {
      setCheckedState({ ...checkedState, [type]: !checkedState[type] });
    },
    [checkedState],
  );

  /** Handlers */
  const downloadResult = (): void => {
    try {
      dispatch(
        FileAction.fetchResultFile({
          statistics: checkedState[DownloadTypeEnum.statistics],
          samples: checkedState[DownloadTypeEnum.samples],
        }),
      );
    } catch (error) {
      console.error('Cannot fetch result file. ', error);
    }
  };

  const handleStartDownload = (): void => {
    const withImages: boolean = checkedState[DownloadTypeEnum.plots];
    downloadResult();
    setFileWithImg(withImages);
    setModalContent(ModalMode.loading);
  };

  return (
    <>
      <div className={cn('Header')}>
        <Text as="p" size="xs" align="center">
          Экспорт результата расчёта
        </Text>
        <IconClose size="s" view="ghost" onClick={handleCloseContent} />
      </div>
      <div className={cn('Body')}>
        <div className={cn('Checkbox-group-label')}>
          <Text size="s" view="secondary">
            Выберите, какие данные включить в файл
          </Text>
        </div>
        <div className={cn('Checkbox-group-header')}>
          <Text
            as="p"
            size="xs"
            transform="uppercase"
            weight="bold"
            align="center"
          >
            данные
          </Text>
          <Text
            as="p"
            size="xs"
            transform="uppercase"
            weight="bold"
            align="right"
          >
            объем данных
          </Text>
        </div>
        <div className={cn('Checkbox-group')}>
          {downloadDataTypes.map((dataType) => (
            <div key={dataType.type} className={cn('Checkbox-group-item')}>
              <Checkbox
                label={dataType.name}
                checked={checkedState[dataType.type]}
                disabled={dataType?.disabled}
                onChange={() => handleOnChange(dataType.type)}
              />
              <Text as="p" size="s">
                {dataType.size}
              </Text>
            </div>
          ))}
        </div>
        {checkedState[DownloadTypeEnum.plots] && (
          <Text view="alert" size="xs">
            Генерация файла займёт больше времени
          </Text>
        )}
      </div>
      <div className={cn('Footer')}>
        <Button
          size="m"
          view="ghost"
          label="Закрыть"
          width="default"
          onClick={handleCloseContent}
        />
        <Button
          size="m"
          view="primary"
          label="Сохранить"
          width="default"
          disabled={!Object.values(checkedState).includes(true)}
          onClick={handleStartDownload}
          data-testid="save-result-button"
        />
      </div>
    </>
  );
};
