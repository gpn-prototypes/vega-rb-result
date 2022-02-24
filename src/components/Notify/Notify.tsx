import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store/types';
import { Item } from '@consta/uikit/__internal__/src/components/SnackBar/helper';
import { SnackBar } from '@consta/uikit/SnackBar';

import './Notify.css';

const NotifyComponent: React.FC = () => {
  const items: Item[] = useSelector(({ notify }: RootState) => notify.items);

  return (
    <div className="notify">
      <SnackBar items={items} />
    </div>
  );
};

export default NotifyComponent;
