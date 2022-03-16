import React, { FC } from 'react';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { block } from 'bem-cn';

import './ContextMenuBaseItem.css';

const cn = block('ContextMenuBaseItem');

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
      className={cn('Wrapper', {
        Border: menuItem.border,
        Column: column,
        Disabled: getDisabled && getDisabled(menuItem),
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
      <div className={cn('Content')}>
        {menuItem.icon && <div className={cn('Title')}>{menuItem.icon()}</div>}

        <div>{menuItem.name}</div>
      </div>

      <div>{children}</div>
    </div>
  );
};
