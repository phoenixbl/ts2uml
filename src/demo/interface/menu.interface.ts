import { IMenuItem } from "./menu-item.interface";
import { DisplayMode, ExpandTrigger, LayoutMode } from "../model/menu.enum";

export interface IMenu {
  activeMenu?: string;

  displayStyle: DisplayMode;

  expandTrigger?: ExpandTrigger;

  hasSimpleMode?: boolean;

  hasFavorites?: boolean;

  hasSearchMenu?: boolean;

  isAllExpand?: boolean;

  isExpandMultipleChild?: boolean;

  defaultLayoutMode?: LayoutMode;

  menuTitle?: string;

  menus: Array<IMenuItem>;

  onActiveMenu: (menuItem: IMenuItem) => void;

  onActiveFavorite?: (menuItem: IMenuItem) => void;
}
