import React from 'react';
import { Item } from '@consta/uikit/__internal__/src/components/SnackBar/helper';
import { IconAlert } from '@consta/uikit/IconAlert';
import { SnackBar } from '@consta/uikit/SnackBar';

import { cnAlert } from './cn-alert';

import './RecentlyEditedAlert.css';

export const RecentlyEditedAlert: React.FC = () => {
  const items: Item[] = [
    {
      key: 1,
      message:
        'В системе могут отобразиться данные вашего коллеги, который тоже сейчас работает над проектом. Мы работаем над улучшением механизма совместной работы.',
      icon: IconAlert,
      status: 'warning',
    },
  ];

  return (
    <div className={cnAlert()}>
      <SnackBar items={items} />
    </div>
  );
};
