import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FileActions } from '@app/store/file/fileActions';
import { Button } from '@consta/uikit/Button';
import { Checkbox } from '@consta/uikit/Checkbox';
import { IconClose } from '@consta/uikit/IconClose';
import { Text } from '@consta/uikit/Text';
import { block } from 'bem-cn';

import { ModalContentProps, ModalMode } from '../ModalContentType';

import {
  DownloadData,
  DownloadNameEnum,
  DownloadTypeEnum,
} from './InitialModeContentTypes';

import './InitialModeContent.css';

export const cn = block('InitialModeContent');

export const InitialModeContent: React.FC<ModalContentProps> = ({
  handleCloseContent,
  setModalContent,
  setFileWithImg,
}) => {
  /* Store */
  const dispatch = useDispatch();

  /** State */
  const [checkedState, setCheckedState] = useState<
    Record<DownloadTypeEnum, boolean>
  >({
    statistics: true,
    projectData: true,
    samples: true,
    plots: false,
  });

  const downloadDataTypes: DownloadData[] = [
    {
      name: DownloadNameEnum.ProjectData,
      type: DownloadTypeEnum.ProjectData,
      size: 'Небольшой',
    },
    {
      name: DownloadNameEnum.Statistics,
      type: DownloadTypeEnum.Statistics,
      size: 'Небольшой',
    },
    {
      name: DownloadNameEnum.Samples,
      type: DownloadTypeEnum.Samples,
      size: 'Средний',
    },
    {
      name: DownloadNameEnum.Plots,
      type: DownloadTypeEnum.Plots,
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
        FileActions.fetchResultFile({
          statistics: checkedState[DownloadTypeEnum.Statistics],
          projectData: checkedState[DownloadTypeEnum.ProjectData],
          samples: checkedState[DownloadTypeEnum.Samples],
          plots: checkedState[DownloadTypeEnum.Plots],
        }),
      );
    } catch (error) {
      console.error('Cannot fetch result file. ', error);
    }
  };

  const handleStartDownload = (): void => {
    const withImages: boolean = checkedState[DownloadTypeEnum.Plots];

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
            <div
              key={dataType.type}
              className={cn('Checkbox-group-item', {
                projectData: dataType.type === DownloadTypeEnum.ProjectData,
              })}
            >
              <Checkbox
                label={dataType.name}
                checked={checkedState[dataType.type]}
                disabled={dataType?.disabled}
                onChange={() => handleOnChange(dataType.type)}
                data-testid="export-data-type-checkbox"
              />
              <Text as="p" size="s">
                {dataType.size}
              </Text>
            </div>
          ))}
        </div>
        {checkedState[DownloadTypeEnum.Plots] && (
          <Text view="alert" size="xs" data-testid="long-time-export-warning">
            Генерация файла займёт больше времени
          </Text>
        )}
        {!Object.values(checkedState).includes(true) && (
          <Text view="alert" size="xs" data-testid="no-data-type-warning">
            Выберите, какие данные вы хотите сохранить
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
          data-testid="close-export-button"
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
