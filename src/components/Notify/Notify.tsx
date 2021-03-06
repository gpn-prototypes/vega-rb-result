import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store/types';
import { SnackBar, SnackBarItemDefault } from '@consta/uikit/SnackBar';

import './Notify.css';

const NotifyComponent: React.FC = () => {
  const items: SnackBarItemDefault[] = useSelector(
    ({ notify }: RootState) => notify.items,
  );

  return (
    <div className="notify">
      <SnackBar items={items} />
    </div>
  );
};

export default NotifyComponent;
