import React, { FC } from 'react';
import {
  MenuContextItemAnalysis,
  MenuContextItemSwitchAnalysis,
} from '@app/interfaces/ContextMenuInterface';
import { Switch } from '@consta/uikit/Switch';
import cn from 'classnames';

import '../Helpers/ContextMenuHelper.css';

interface SensitiveAnalysisDropdownMenuProps {
  menuItem: Omit<MenuContextItemAnalysis, 'title'>;
  onChange: (item: MenuContextItemSwitchAnalysis) => void;
}

export const SensitiveAnalysisDropdownMenu: FC<SensitiveAnalysisDropdownMenuProps> =
  ({ menuItem, onChange }) => {
    const onChangeCallback = (): void =>
      onChange(menuItem as MenuContextItemSwitchAnalysis);

    return (
      <>
        <div
          className={cn('menu__title', menuItem.border ? 'menu__border' : '')}
          role="button"
          tabIndex={0}
          key={menuItem.id}
        >
          <div className={cn('menu__left')}>
            <div>{menuItem.name}</div>
          </div>
          <div>
            <Switch
              size="m"
              checked={menuItem.switch}
              onChange={onChangeCallback}
              key="Switch"
              className={cn('menu__switch-element')}
            />
          </div>
        </div>
      </>
    );
  };
