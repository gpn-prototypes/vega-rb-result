import React, { FC, useRef, useState } from 'react';
import SvgMoreVertical from '@app/assets/icons/components/MoreVertical';
import {
  MenuContextItem,
  MenuContextItemAnalysis,
} from '@app/interfaces/ContextMenuInterface';
import { Button } from '@consta/uikit/Button';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { Popover, Position } from '@consta/uikit/Popover';
import { Switch } from '@consta/uikit/Switch';
import { TextField } from '@consta/uikit/TextField';

import './ContextMenuHelper.css';

interface ContextMenuBaseItemProps {
  menuItem: Omit<MenuContextItemAnalysis, 'title'>;
  handleContextClick?: (menuItem: MenuContextItem) => void;
  column?: boolean;
  getDisabled?: (item: any) => boolean;
}

export const MenuContextItemBlock: FC<ContextMenuBaseItemProps> = ({
  menuItem,
  handleContextClick,
  column,
  getDisabled,
  children,
}) => {
  // for (let menuItemKey in menuItem) {
  //   console.log(menuItem[menuItemKey]);
  // }
  // for (const [key, value] of Object.entries(menuItem)) {
  //   console.log(`${key}: ${value}`);
  // }

  console.log(menuItem);
  return (
    <>
      <div
        className={`menu__title ${menuItem.border ? 'menu__border' : ''} ${
          getDisabled && getDisabled(menuItem) ? 'menu__disabled' : ''
        } ${column ? 'menu__column' : ''}`}
        onClick={() => {
          if (handleContextClick) {
            console.log('vsds');
            // menuItem.name ? handleContextClick(menuItem) : null;
          }
        }}
        onKeyUp={() => {}}
        role="button"
        tabIndex={0}
      >
        <div className="menu__left">
          {menuItem.icon && (
            <div className="menu__icon">{menuItem.icon}icon</div>
          )}

          <div>{menuItem.name}</div>
        </div>

        <div>{children}</div>
      </div>
    </>
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
        width={'default'}
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

interface SensitiveAnalysisDropdown {
  ref: React.RefObject<HTMLHeadingElement>;
  menuItems: MenuContextItemAnalysis[][] | MenuContextItem[];
  setIsOpenContextMenu: (isOpened: boolean) => void;
  position: Position;
  onClick?: (item: MenuContextItem) => void;
  onChange?: (item: MenuContextItem) => void;
  getDisabled?: (item: MenuContextItem) => boolean;
}

export const SensitiveAnalysisDropdown: FC<SensitiveAnalysisDropdown> = ({
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
      console.log('nnn', menuItem);
      onClick(menuItem);
    }
    setIsOpenContextMenu(false);
  };

  // const itemWithSwitch = (menuItem: MenuContextItem) => (
  //   <ContextMenuBaseItem menuItem={menuItem} getDisabled={getDisabled}>
  //     <Switch
  //       size="m"
  //       checked={menuItem.switch}
  //       onChange={() => onChange && onChange(menuItem)}
  //       key="Switch"
  //       className="menu__switch-element"
  //     />
  //   </ContextMenuBaseItem>
  // );

  // const simpleItem = (menuItem: MenuContextItem & { title: string }) => (
  //   <MenuContextItemBlock
  //     menuItem={menuItem}
  //     handleContextClick={handleContextClick}
  //     getDisabled={getDisabled}
  //   />
  // );

  // const items2 = menuItems.map(
  //   (menuItem: MenuContextItem & { title: string }) => {
  //     // return menuItem.title
  //     return simpleItem(menuItem);
  //   },
  // );

  // const items = menuItems().map((menuItem: any) => {
  //   // if (menuItem.switch !== undefined) {
  //   //   return itemWithSwitch(menuItem);
  //   // }
  //
  //   // if (menuItem.choice !== undefined) {
  //   //   return (
  //   //     <ItemWithChoice
  //   //       menuItem={menuItem}
  //   //       onChange={onChange}
  //   //       getDisabled={getDisabled}
  //   //       setIsOpenContextMenu={setIsOpenContextMenu}
  //   //     />
  //   //   );
  //   // }
  //
  //   return simpleItem(menuItem);
  // });

  return (
    <>
      {console.log(menuItems, 'menuItemsLOL')}
      {console.dir(menuItems, 'menuItemsLOL')}
      <Popover
        anchorRef={ref}
        onClickOutside={() => setIsOpenContextMenu(false)} // TODO
        direction="downStartLeft"
        className="menusWrapper"
        position={position}
      >
        {/* @ts-ignore*/}
        {menuItems.map((i) => {
          return (
            <div className="menu">
              <div className="menu__title">{i[0].title}</div>
              {Object.values(i[0]).map((j: any) => (
                <MenuContextItemBlock menuItem={j} />
              ))}
            </div>
          );
        })}
      </Popover>
    </>
  );
};

export const ContextMenuBaseItem: FC<ContextMenuBaseItemProps> = ({
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
          // handleContextClick(menuItem);
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

interface ContextMenuProps {
  ref: React.RefObject<HTMLHeadingElement>;
  menuItems: MenuContextItemAnalysis[][] | MenuContextItem[];
  setIsOpenContextMenu: (isOpened: boolean) => void;
  position: Position;
  onClick?: (item: MenuContextItem) => void;
  onChange?: (item: MenuContextItem) => void;
  getDisabled?: (item: MenuContextItem) => boolean;
}

export const CustomContextMenu: FC<ContextMenuProps> = ({
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
      console.log('click CustomContextMenu', menuItem);
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

  // @ts-ignore
  const items = menuItems.map((menuItem: MenuContextItem) => {
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
    <Popover
      anchorRef={ref}
      onClickOutside={() => setIsOpenContextMenu(false)}
      direction="downStartLeft"
      className="menu"
      position={position}
    >
      {items}
    </Popover>
  );
};

interface VerticalMoreContextMenu {
  title: string;
  menuItems: MenuContextItemAnalysis[][] | MenuContextItem[];
  onChange: (item: MenuContextItem) => void;
}

export const VerticalMoreContextMenu: FC<VerticalMoreContextMenu> = ({
  menuItems,
  title,
  onChange,
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
      console.log('click dr', menuItems?.length ? menuItems.length : 'f');
      setIsOpenContextMenu(() => true);
    }
  };

  return (
    <div className="vertical">
      <div
        onClick={openDropdown}
        className="vertical__title"
        ref={ref}
        role="button"
        tabIndex={0}
        aria-hidden="true"
      >
        <div>{title}</div>
        <SvgMoreVertical />
      </div>
      {isOpenContextMenu && menuItems.length > 0 && (
        // <CustomContextMenu
        //   ref={ref}
        //   menuItems={menuItems}
        //   onClick={() => {}} // оставить
        //   onChange={onChange}
        //   position={getPosition()}
        //   setIsOpenContextMenu={setIsOpenContextMenu}
        // />

        <SensitiveAnalysisDropdown
          ref={ref}
          menuItems={menuItems}
          onClick={() => {}} // оставить
          onChange={onChange}
          position={getPosition()}
          setIsOpenContextMenu={setIsOpenContextMenu}
        />
      )}
    </div>
  );
};
