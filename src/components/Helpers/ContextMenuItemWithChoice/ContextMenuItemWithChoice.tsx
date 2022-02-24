import React, { useState } from 'react';
import { ContextMenuBaseItem } from '@app/components/Helpers/ContextMenuBaseItem/ContextMenuBaseItem';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { Button } from '@consta/uikit/Button';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { TextField } from '@consta/uikit/TextField';
import { block } from 'bem-cn';

import './ContextMenuItemWithChoice.css';

const cn = block('ItemWithChoice');

export const ItemWithChoice: React.FC<{
  menuItem: MenuContextItem | any;
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
        className={cn()}
        name={`choice_${menuItem.code}`}
        size="xs"
        width="default"
        multiple={false}
        getLabel={(item) => item}
        onChange={({ value }) => handleChange(value)}
      />

      <div className={cn('Edit')}>
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
              className={cn('Button')}
            />
          </div>
        )}
      </div>
    </ContextMenuBaseItem>
  );
};
