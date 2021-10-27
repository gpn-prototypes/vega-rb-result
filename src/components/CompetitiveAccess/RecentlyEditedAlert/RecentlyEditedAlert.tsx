import React from 'react';
import { Item, SnackBar } from '@consta/uikit/SnackBar';
import { IconAlert } from '@gpn-prototypes/vega-ui';

import { cnAlert } from './cn-alert';

import './RecentlyEditedAlert.scss';

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
