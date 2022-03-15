import React, { FC, useCallback, useMemo } from 'react';
import { ContextMenuBaseItem } from '@app/components/Helpers/ContextMenuBaseItem/ContextMenuBaseItem';
import { ItemWithChoice } from '@app/components/Helpers/ContextMenuItemWithChoice/ContextMenuItemWithChoice';
import {
  MenuContextGroup,
  MenuContextItem,
} from '@app/interfaces/ContextMenuInterface';
import { Popover, Position } from '@consta/uikit/Popover';
import { Switch } from '@consta/uikit/Switch';
import { block } from 'bem-cn';

import './ContextMenuDropdown.css';

const cn = block('ContextMenuDropdown');

interface ContextMenuDropdownProps {
  ref: React.RefObject<HTMLHeadingElement>;
  menuItems?: MenuContextItem[];
  groupItems?: MenuContextGroup[];
  setIsOpenContextMenu: (isOpen: boolean) => void;
  position: Position;
  getDisabled?: (item: MenuContextItem) => boolean;
  onClick?: (item: MenuContextItem) => void;
  onChange?: (item: MenuContextItem) => void;
}

export const ContextMenuDropdown: FC<ContextMenuDropdownProps> = ({
  ref,
  menuItems,
  groupItems,
  onChange,
  getDisabled,
  position,
  onClick,
  setIsOpenContextMenu,
}) => {
  /** Обработка клика по контекстному меню */
  const handleContextClick = useCallback(
    (menuItem: MenuContextItem) => {
      if (onClick) {
        onClick(menuItem);
      }
      setIsOpenContextMenu(false);
    },
    [onClick, setIsOpenContextMenu],
  );

  const itemWithSwitch = useCallback(
    (menuItem: MenuContextItem) => (
      <ContextMenuBaseItem menuItem={menuItem} getDisabled={getDisabled}>
        <Switch
          size="m"
          checked={menuItem.switch}
          onChange={() => onChange && onChange(menuItem)}
          key="Switch"
          style={{ marginLeft: '12px' }} // className react-bem не работает с констой?!
        />
      </ContextMenuBaseItem>
    ),
    [getDisabled, onChange],
  );

  const simpleItem = useCallback(
    (menuItem: MenuContextItem) => (
      <ContextMenuBaseItem
        menuItem={menuItem}
        handleContextClick={handleContextClick}
        getDisabled={getDisabled}
      />
    ),
    [handleContextClick, getDisabled],
  );

  const renderMenuItems = useCallback(
    (originMenuItems: MenuContextItem[]) => {
      return originMenuItems.map((menuItem: MenuContextItem) => {
        if (menuItem.switch !== undefined) {
          return itemWithSwitch(menuItem);
        }

        if (menuItem.choice !== undefined) {
          return (
            <ItemWithChoice
              menuItem={menuItem}
              onChange={onChange}
              getDisabled={getDisabled}
              setIsOpenContextMenu={setIsOpenContextMenu}
            />
          );
        }

        return simpleItem(menuItem);
      });
    },
    [itemWithSwitch, simpleItem, getDisabled, onChange, setIsOpenContextMenu],
  );

  const renderGroupItems = useCallback(
    (originGroupItems: MenuContextGroup[]) => {
      return originGroupItems.map((groupItem: MenuContextGroup) => {
        return (
          <>
            <div className={cn('AnalysisTitle')}>{groupItem.title}</div>
            {renderMenuItems(groupItem.children)}
          </>
        );
      });
    },
    [renderMenuItems],
  );

  const renderContent = useMemo(() => {
    if (groupItems?.length) {
      return renderGroupItems(groupItems);
    }

    if (menuItems?.length) {
      return renderMenuItems(menuItems);
    }

    return null;
  }, [groupItems, menuItems, renderGroupItems, renderMenuItems]);

  return (
    <Popover
      anchorRef={ref}
      onClickOutside={() => setIsOpenContextMenu(false)}
      direction="downStartLeft"
      className={cn()}
      position={position}
    >
      {renderContent}
    </Popover>
  );
};
