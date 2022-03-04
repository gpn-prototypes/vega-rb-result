import React, { FC, useRef, useState } from 'react';
import { IconMoreVertical } from '@app/assets/icons/components/MoreVertical';
import { ContextMenuDropdown } from '@app/components/Helpers/ContextMenuDropdown';
import {
  MenuContextGroup,
  MenuContextItem,
} from '@app/interfaces/ContextMenuInterface';
import { Button } from '@consta/uikit/Button';
import { Position } from '@consta/uikit/Popover';
import { Text } from '@consta/uikit/Text';
import { block } from 'bem-cn';

import './VerticalMoreContextMenu.css';

const cn = block('Vertical');

interface VerticalContextMenu {
  title: string;
  menuItems?: MenuContextItem[];
  groupItems?: MenuContextGroup[];
  loading?: boolean;
  onChange?: (item: MenuContextItem) => void;
  onClick?: (item: MenuContextItem) => void;
}

export const VerticalMoreContextMenu: FC<VerticalContextMenu> = ({
  menuItems,
  groupItems,
  loading,
  title,
  onChange,
  onClick,
}) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const [isOpenContextMenu, setIsOpenContextMenu] = useState<boolean>(false);

  /** Установка позиции Popover */
  const getPosition = (): Position => {
    const rect: DOMRect | undefined = ref.current?.getBoundingClientRect();

    return rect ? { x: rect.left, y: rect.bottom } : { x: 0, y: 0 };
  };

  const openDropdown = () => {
    if (!isOpenContextMenu) {
      setIsOpenContextMenu(() => true);
    }
  };

  const isAbleContextMenu = (originMenuItems, originGroupItems): boolean => {
    const menuItemsLocal = originMenuItems?.length || 0;
    const groupItemsLocal = originGroupItems?.length || 0;

    return isOpenContextMenu && (menuItemsLocal > 0 || groupItemsLocal > 0);
  };

  return (
    <div className={cn()}>
      <div
        className={cn('Title')}
        role="button"
        ref={ref}
        tabIndex={0}
        aria-hidden="true"
      >
        <div className={cn('Title', { block: true })}>
          <Text>{title}</Text>
        </div>

        <Button
          size="xs"
          iconSize="m"
          view="clear"
          onClick={openDropdown}
          onlyIcon
          loading={loading || false}
          iconLeft={IconMoreVertical}
        />
      </div>
      {isAbleContextMenu(menuItems, groupItems) && (
        <ContextMenuDropdown
          ref={ref}
          menuItems={menuItems}
          groupItems={groupItems}
          onChange={onChange}
          onClick={onClick}
          position={getPosition()}
          setIsOpenContextMenu={setIsOpenContextMenu}
        />
      )}
    </div>
  );
};
