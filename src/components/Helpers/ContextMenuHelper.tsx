import React, { useRef, useState } from 'react';
import SvgMoreVertical from '@app/assets/icons/components/MoreVertical';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { Button } from '@consta/uikit/Button';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { Popover } from '@consta/uikit/Popover';
import { Switch } from '@consta/uikit/Switch';
import { TextField } from '@consta/uikit/TextField';

import './ContextMenuHelper.scss';

interface Props {
  title: string;
  menuItems: MenuContextItem[];
  onChange: (item: MenuContextItem) => void;
  onClick: (item: MenuContextItem) => void;
}

export const VerticalMoreContextMenu: React.FC<Props> = ({
  menuItems,
  title,
  onChange,
  onClick,
}) => {
  const ref = useRef(null);
  const [isOpenContextMenu, setIsOpenContextMenu] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [inputValue, setValue] = useState(null);
  const handleInputChange = ({ value }) => setValue(value);

  /** Обработка клика по контекстному меню */
  const handleContextClick = (menuItem: MenuContextItem) => {
    onClick(menuItem);
    setIsOpenContextMenu(false);
  };

  const itemWithSwitch = (menuItem: MenuContextItem) => (
    <div className={`menu__switch ${menuItem.border ? 'menu__border' : ''}`}>
      <div className="menu__title">{menuItem.name}</div>

      <Switch
        size="m"
        checked={menuItem.switch}
        onChange={() => onChange(menuItem)}
        key="Switch"
        className="menu__switch-element"
      />
    </div>
  );

  const itemWithChoice = (menuItem: MenuContextItem) => {
    if (!menuItem.choice) {
      return <div />;
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
      <div>
        <div className="menu__title">{menuItem.name}</div>

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
                value={inputValue}
                size="s"
                min={1}
                max={99}
              />

              <Button
                label="Указать вручную"
                size="s"
                onClick={() => handleInputSave()}
                className="menu__button"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const simpleItem = (menuItem: MenuContextItem) => (
    <div
      className="menu__title"
      onClick={() => {}}
      onKeyUp={() => handleContextClick(menuItem)}
      role="button"
      tabIndex={0}
    >
      {menuItem.name}
    </div>
  );

  const items = menuItems.map((menuItem: MenuContextItem) => {
    if (menuItem.switch !== undefined) {
      return itemWithSwitch(menuItem);
    }

    if (menuItem.choice !== undefined) {
      return itemWithChoice(menuItem);
    }

    return simpleItem(menuItem);
  });

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
        <Popover
          anchorRef={ref}
          onClickOutside={() => setIsOpenContextMenu(false)}
          direction="downStartLeft"
          className="menu"
        >
          {items}
        </Popover>
      )}
    </div>
  );
};
