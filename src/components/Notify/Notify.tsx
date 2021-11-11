import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store/types';
import { Item, SnackBar } from '@consta/uikit/SnackBar';

import './Notify.scss';

const NotifyComponent: React.FC = () => {
  const items: Item[] = useSelector(({ notify }: RootState) => notify.items);

  return (
    <div className="notify">
      <SnackBar items={items} />
    </div>
  );
};

export default NotifyComponent;
