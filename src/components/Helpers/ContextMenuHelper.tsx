import React, { useRef, useState, MouseEvent } from 'react';
import { Switch } from '@consta/uikit/Switch';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import SvgMoreVertical from '@app/assets/icons/components/MoreVertical';
import { ContextMenu } from '@consta/uikit/ContextMenu';

import './ContextMenuHelper.css';

export function SwitchRightSide(
  item: MenuContextItem,
  onChange: (item: MenuContextItem) => void,
): React.ReactNode {
  const nodeArray: unknown[] = [];

  item.switch !== undefined &&
    nodeArray.push(
      <Switch
        size="m"
        checked={item.switch}
        onChange={() => onChange(item)}
        key="Switch" />,
    );

  return nodeArray;
}

interface Props {
  title: string;
  menuItems: MenuContextItem[];
  onChange: (item: MenuContextItem) => void;
  onClick: (item: MenuContextItem) => void;
}

export const VerticalMoreContextMenu: React.FC<Props> = ({ menuItems, title, onChange, onClick }) => {
  const ref = useRef(null);
  const [isOpenContextMenu, setIsOpenContextMenu] = useState<boolean>(false);

  /** Обработка клика по контекстному меню */
  const handleContextClick = (event: MouseEvent<Element>) => {
    const currentElement = event.target as Element;
    const elementText = currentElement.textContent;

    const currentMenuItem = menuItems
      .find((menuItem: MenuContextItem) => menuItem.name === elementText);

    if (currentMenuItem && currentMenuItem.switch === undefined) {
      onClick(currentMenuItem);
      setIsOpenContextMenu(false);
    }
  }

  return <div className="vertical">
    <div onClick={() => setIsOpenContextMenu(!isOpenContextMenu)} ref={ref} className="vertical__title">
      <div>{title}</div>
      <SvgMoreVertical className="vertical__more" />
    </div>

    {isOpenContextMenu && (
      <ContextMenu
        items={menuItems}
        getLabel={(item) => item.name}
        getRightSideBar={(item) => SwitchRightSide(item, onChange)}
        anchorRef={ref}
        onClick={handleContextClick}
        size="s"
        direction="downStartLeft"
        onClickOutside={() => setIsOpenContextMenu(false)}
      />
    )}
  </div>
}
