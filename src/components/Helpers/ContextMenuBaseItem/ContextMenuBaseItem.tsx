import React, { FC } from 'react';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import cn from 'classnames';

import '../ContextMenuHelper.css';

interface ContextMenuBaseItemProps {
  menuItem: MenuContextItem;
  column?: boolean;
  getDisabled?: (item: MenuContextItem) => boolean;
  handleContextClick?: (menuItem: MenuContextItem) => void;
}

export const ContextMenuBaseItem: FC<ContextMenuBaseItemProps> = ({
  menuItem,
  handleContextClick,
  column,
  getDisabled,
  children,
}) => {
  return (
    <div
      className={cn('Menu__Title', {
        Menu__Border: menuItem.border,
        Menu__Column: column,
        Menu__Disabled: getDisabled && getDisabled(menuItem),
      })}
      onClick={() => {
        if (handleContextClick) {
          handleContextClick(menuItem);
        }
      }}
      onKeyUp={() => {}}
      role="button"
      tabIndex={0}
    >
      <div className={cn('Menu__Left')}>
        {menuItem.icon && (
          <div className={cn('Menu__Icon')}>{menuItem.icon()}</div>
        )}

        <div>{menuItem.name}</div>
      </div>

      <div>{children}</div>
    </div>
  );
};
