import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { LocalStorageKey } from '@app/constants/LocalStorageKeyConstants';
import { loadArchive } from '@app/services/utilsService';
import { NotifyActions } from '@app/store/notify/notifyActions';
import { LocalStorageHelper } from '@app/utils/LocalStorageHelper';
import { Button } from '@consta/uikit/Button';
import { Checkbox } from '@consta/uikit/Checkbox';
import { IconClose } from '@consta/uikit/IconClose';
import { Item } from '@consta/uikit/SnackBar';
import { Text } from '@consta/uikit/Text';
import { block } from 'bem-cn';

import './InitialModeContent.css';

export const cn = block('InitialModeContent');

interface Props {
  handleCloseContent: () => void;
  setModalContent: (contentType: string) => void;
}

type DownloadData = {
  name: string;
  size: string;
  disabled?: boolean;
};

export const InitialModeContent: React.FC<Props> = ({
  handleCloseContent,
  setModalContent,
}) => {
  const dispatch = useDispatch();

  const downloadDataTypes: DownloadData[] = [
    { name: 'Статистика', size: 'Небольшой', disabled: true },
    { name: 'Сэмплы', size: 'Средний', disabled: true },
    { name: 'Изображения', size: 'Большой' },
  ];

  /** State */
  const [checkedState, setCheckedState] = useState<boolean[]>([
    true,
    true,
    false,
  ]);

  const appendItem = useCallback(
    (item: Item) => dispatch(NotifyActions.appendItem(item)),
    [dispatch],
  );
  const removeItem = useCallback(
    (id: string) => dispatch(NotifyActions.removeItem(id)),
    [dispatch],
  );

  const handleOnChange = (position: number): void => {
    const updatedCheckedState = checkedState.map(
      (item: boolean, index: number) => {
        return position === index ? !item : item;
      },
    );

    setCheckedState(updatedCheckedState);
  };

  const downloadResult = async (): Promise<void> => {
    try {
      appendItem({
        key: 'notify',
        message: 'Идет генерация файла',
        status: 'system',
      });

      /** Таймаут добавлен для того, что бы визуально не мелькала нотификация */
      setTimeout(async () => {
        await loadArchive(
          LocalStorageHelper.get(LocalStorageKey.RecordId) || '',
        );

        removeItem('notify');
      }, 1500);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <>
      <div className={cn('Header')}>
        <Text as="p" size="xs" align="center">
          Экспорт результата расчёта
        </Text>
        <IconClose size="s" view="ghost" onClick={() => handleCloseContent()} />
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
          {downloadDataTypes.map((item, index) => (
            <div className={cn('Checkbox-group-item')}>
              <Checkbox
                label={item.name}
                checked={checkedState[index]}
                disabled={item?.disabled}
                onChange={() => handleOnChange(index)}
              />
              <Text as="p" size="s">
                {item.size}
              </Text>
            </div>
          ))}
        </div>
        {checkedState[2] && (
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
          onClick={() => handleCloseContent()}
        />
        <Button
          size="m"
          view="primary"
          label="Сохранить"
          width="default"
          disabled={!checkedState.includes(true)}
          onClick={() => {
            downloadResult();
            setModalContent('loading');
          }}
        />
      </div>
    </>
  );
};
