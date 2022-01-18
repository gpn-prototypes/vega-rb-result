import React, { useRef, useState } from 'react';
import SvgMoreVertical from '@app/assets/icons/components/MoreVertical';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { Button } from '@consta/uikit/Button';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { Popover, Position } from '@consta/uikit/Popover';
import { Switch } from '@consta/uikit/Switch';
import { TextField } from '@consta/uikit/TextField';

import './ContextMenuHelper.css';

interface ContextMenuBaseItemProps {
  menuItem: MenuContextItem;
  handleContextClick?: (menuItem: MenuContextItem) => void;
  column?: boolean;
  getDisabled?: (item: MenuContextItem) => boolean;
}

export const ContextMenuBaseItem: React.FC<ContextMenuBaseItemProps> = ({
  menuItem,
  handleContextClick,
  column,
  getDisabled,
  children,
}) => {
  return (
    <div
      className={`menu__title ${menuItem.border ? 'menu__border' : ''} ${
        getDisabled && getDisabled(menuItem) ? 'menu__disabled' : ''
      } ${column ? 'menu__column' : ''}`}
      onClick={() => {
        if (handleContextClick) {
          handleContextClick(menuItem);
        }
      }}
      onKeyUp={() => {}}
      role="button"
      tabIndex={0}
    >
      <div className="menu__left">
        {menuItem.icon && <div className="menu__icon">{menuItem.icon()}</div>}

        <div>{menuItem.name}</div>
      </div>

      <div>{children}</div>
    </div>
  );
};

export const ItemWithChoice: React.FC<{
  menuItem: MenuContextItem;
  setIsOpenContextMenu: (isOpened: boolean) => void;
  onChange?: (item: MenuContextItem) => void;
  getDisabled?: (item: MenuContextItem) => boolean;
}> = ({ menuItem, onChange, getDisabled, setIsOpenContextMenu }) => {
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(
    !menuItem.choice?.values.includes(menuItem.choice.value || 0) || false,
  );
  const [inputValue, setValue] = useState<number>(menuItem.choice?.value || 50);
  const handleInputChange = ({ value }) => setValue(value);

  if (!menuItem.choice || !onChange) {
    return null;
  }

  const stringifyValues = menuItem.choice?.values.map((value: number) =>
    String(value || 0),
  );

  const handleChange = (innerValue: string) => {
    const cloneMenuItem = { ...menuItem };

    if (cloneMenuItem.choice?.value) {
      cloneMenuItem.choice.value = Number(innerValue);
    }

    onChange(cloneMenuItem);
    setIsOpenContextMenu(false);
  };

  const handleInputSave = () => {
    const cloneMenuItem = { ...menuItem };

    if (cloneMenuItem.choice?.value) {
      cloneMenuItem.choice.value = Number(inputValue);
    }

    onChange(cloneMenuItem);
    setIsOpenContextMenu(false);
  };

  return (
    <ContextMenuBaseItem menuItem={menuItem} column getDisabled={getDisabled}>
      <ChoiceGroup
        value={String(menuItem.choice?.value)}
        items={stringifyValues || []}
        className="menu__choice"
        name={`choice_${menuItem.code}`}
        size="xs"
        multiple={false}
        getLabel={(item) => item}
        onChange={({ value }) => handleChange(value)}
      />

      <div className="menu__choice-edit">
        {!isOpenEdit && (
          <Button
            label="Указать вручную"
            size="s"
            onClick={() => setIsOpenEdit(true)}
          />
        )}

        {isOpenEdit && (
          <div>
            <TextField
              placeholder="Укажите количество"
              onChange={handleInputChange}
              value={inputValue?.toString() || ''}
              size="s"
              view="default"
            />

            <Button
              label="Указать вручную"
              size="s"
              onClick={() => handleInputSave()}
              disabled={inputValue <= 10 || inputValue >= 10000}
              className="menu__button"
            />
          </div>
        )}
      </div>
    </ContextMenuBaseItem>
  );
};

interface ContextMenuProps {
  ref: React.RefObject<HTMLHeadingElement>;
  menuItems: () => MenuContextItem[];
  setIsOpenContextMenu: (isOpened: boolean) => void;
  position: Position;
  onClick?: (item: MenuContextItem) => void;
  onChange?: (item: MenuContextItem) => void;
  getDisabled?: (item: MenuContextItem) => boolean;
}

export const CustomContextMenu: React.FC<ContextMenuProps> = ({
  ref,
  menuItems,
  onClick,
  onChange,
  position,
  setIsOpenContextMenu,
  getDisabled,
}) => {
  /** Обработка клика по контекстному меню */
  const handleContextClick = (menuItem: MenuContextItem) => {
    if (onClick) {
      onClick(menuItem);
    }

    setIsOpenContextMenu(false);
  };

  const itemWithSwitch = (menuItem: MenuContextItem) => (
    <ContextMenuBaseItem menuItem={menuItem} getDisabled={getDisabled}>
      <Switch
        size="m"
        checked={menuItem.switch}
        onChange={() => onChange && onChange(menuItem)}
        key="Switch"
        className="menu__switch-element"
      />
    </ContextMenuBaseItem>
  );

  const simpleItem = (menuItem: MenuContextItem) => (
    <ContextMenuBaseItem
      menuItem={menuItem}
      handleContextClick={handleContextClick}
      getDisabled={getDisabled}
    />
  );

  const items = menuItems().map((menuItem: MenuContextItem) => {
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

  return (
    <>
  {console.log(menuItems, 'menuItemsLOL')}
  <Popover
      anchorRef={ref}
      onClickOutside={() => setIsOpenContextMenu(false)}
      direction="downStartLeft"
      className="menu"
      position={position}
    >
      {items}
    </Popover>
    </>
  );
};

interface Props {
  title: string;
  menuItems: () => MenuContextItem[];
  onChange: (item: MenuContextItem) => void;
  onClick?: (item: MenuContextItem) => void;
}

export const VerticalMoreContextMenu: React.FC<Props> = ({
  menuItems,
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

  return (
    <div className="vertical">
      <div
        onClick={() => setIsOpenContextMenu(true)}
        ref={ref}
        className="vertical__title"
        role="button"
        tabIndex={0}
        aria-hidden="true"
      >
        <div>{title}</div>
        <SvgMoreVertical className="vertical__more" />
      </div>

      {isOpenContextMenu && (
        <>
          <div>ok</div>
          <CustomContextMenu
            ref={ref}
            menuItems={() => menuItems()}
            onClick={onClick} // оставить
            onChange={onChange}
            position={getPosition()}
            setIsOpenContextMenu={setIsOpenContextMenu}
          />
        </>
      )}
    </div>
  );
};
