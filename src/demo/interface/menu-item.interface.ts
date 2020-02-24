export interface IMenuItem {
  id: string | number;
  name: string;
  icon?: string;
  code?: string;
  link?: any;
  visible?: boolean;
  disabled?: boolean;
  isFavorite?: boolean;
  component?: any;
  children?: Array<IMenuItem>;
}
