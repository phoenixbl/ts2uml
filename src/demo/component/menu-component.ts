import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { IMenu, IMenuItem } from "../interface";
import { DisplayMode, LayoutMode } from "../model";
import { setTimeout, clearTimeout } from "timers";

@Component
export default class MenuComponent extends Vue {
  public name: string = "menu-vue";
  protected vertical: DisplayMode = DisplayMode.VERTICAL;
  static horizontal: DisplayMode = DisplayMode.HORIZONTAL;
  expandedMenus: Array<string | number> = [];
  catchExpandedMenus: Array<string | number> = [];
  isSimpleMode: boolean = false;
  horizontalIsOpenChild: boolean = false;
  mouseoutTimeout: any = null;
  horizontalChildWarpNode!: Node;
  horizontalOpenChildren: Array<IMenuItem> = [];
  searchKey: string = "";
  @Prop() menuConfig!: IMenu;
  @Watch("searchKey")
  onSearchKeyChange(val: string) {
    if (val === "") {
      this.$set(this, "expandedMenus", []);
    }
  }
  get getMenus() {
    if (this.searchKey) {
      return this.menuConfig.menus.reduce(this.filterMenu, []);
    }
    return this.menuConfig.menus;
  }
  get hasInternationalization() {
    return !!(this as any).$i18n;
  }
  get hasHorizontalClassification() {
    return true;
  }

  constructor() {
    super();
  }

  created() {
    if (
      this.menuConfig.isAllExpand &&
      this.menuConfig.displayStyle === DisplayMode.VERTICAL
    ) {
      this.menuConfig.menus.forEach((menu: IMenuItem) => {
        if (menu.children) {
          this.expandedMenus.push(menu.id);
          menu.children.forEach((childMenu: IMenuItem) => {
            if (childMenu.children) {
              this.expandedMenus.push(menu.id);
            }
          });
        }
      });
    }
    if (
      this.menuConfig.hasSimpleMode &&
      this.menuConfig.defaultLayoutMode === LayoutMode.SIMPLE &&
      this.menuConfig.displayStyle === DisplayMode.VERTICAL
    ) {
      this.isSimpleMode = true;
    }
  }

  filterMenu(filterMenu: Array<IMenuItem>, menu: any) {
    let newMenu: any = {};
    let filterKey = this.searchKey.trim();
    if (menu.children && Array.isArray(menu.children)) {
      newMenu.children = menu.children.reduce(this.filterMenu, []);
    }
    let name = this.internationalTranslation(menu.name);
    if (
      name.includes(filterKey) ||
      (newMenu.children && newMenu.children.length)
    ) {
      Object.keys(menu).forEach(key => {
        if (key !== "children") {
          this.$set(newMenu, key, menu[key]);
        }
      });
      if (newMenu.children && Array.isArray(newMenu.children)) {
        this.expandedMenus.push(newMenu.id);
      }
      filterMenu.push(newMenu);
    }
    return filterMenu;
  }

  canExecute(menuItem: IMenuItem) {
    return (
      !this.menuConfig.hasOwnProperty("canExecute") ||
      (typeof this.menuConfig.canExecute === "boolean" &&
        this.menuConfig.canExecute) ||
      (typeof this.menuConfig.canExecute === "function" &&
        this.menuConfig.canExecute(menuItem))
    );
  }

  onClickMenu(menuItem: IMenuItem, menuLevel: number, isNotHidden: boolean) {
    if (menuItem.disabled || !this.canExecute(menuItem)) return;
    if (menuItem.children && menuItem.children.length) {
      this.switchExpandedMenus(menuItem, menuLevel, isNotHidden);
    } else {
      if (
        menuLevel === 3 ||
        ((menuLevel === 1 || menuLevel === 2) &&
          (!menuItem.children ||
            (menuItem.children && menuItem.children.length === 0)))
      ) {
        this.$set(this.menuConfig, "activeMenu", menuItem.id);
        if (this.isSimpleMode) {
          setTimeout(() => {
            this.hiddenThreeLevelMenu();
          }, 100);
        }
      }
    }
  }

  switchExpandedMenus(
    menuItem: IMenuItem,
    menuLevel: number,
    isNotHidden: boolean
  ) {
    if (menuLevel === 3 || !menuItem.children) {
      return;
    }
    let findIndex = this.expandedMenus.findIndex(
      (id: string | number) => id === menuItem.id
    );
    if (findIndex > -1) {
      this.expandedMenus.splice(findIndex, 1);
    } else {
      if (!this.menuConfig.isExpandMultipleChild || this.isSimpleMode) {
        this.hiddenThreeLevelMenu(isNotHidden);
      }
      this.expandedMenus.push(menuItem.id);
    }
  }

  onFavoriteChanged(event: Event, menuItem: IMenuItem) {
    event.stopPropagation();
    if (typeof this.menuConfig.onActiveFavorite === "function") {
      this.menuConfig.onActiveFavorite(menuItem);
    }
  }

  switchSimpleAndExpand() {
    this.isSimpleMode = !this.isSimpleMode;
    if (this.isSimpleMode) {
      this.hiddenThreeLevelMenu();
    }
  }

  hiddenThreeLevelMenu(isNotHidden?: boolean) {
    this.menuConfig.menus.forEach((menu: IMenuItem) => {
      let removeIndex = this.expandedMenus.findIndex(
        (id: string | number) => id === menu.id
      );
      if (!isNotHidden && removeIndex > -1) {
        this.expandedMenus.splice(removeIndex, 1);
      }
      if (menu.children) {
        removeIndex = -1;
        menu.children.forEach((item: IMenuItem) => {
          removeIndex = this.expandedMenus.findIndex(
            (id: string | number) => id === item.id
          );
          if (removeIndex > -1) {
            this.expandedMenus.splice(removeIndex, 1);
          }
        });
      }
    });
  }

  internationalTranslation(message: string): string {
    return this.hasInternationalization && (this as any).$te(message)
      ? (this as any).$t(message)
      : message || "";
  }

  navItemMouseover(event: Event, menu: IMenuItem) {
    event.stopPropagation();
    if (this.mouseoutTimeout) {
      clearTimeout(this.mouseoutTimeout);
      this.mouseoutTimeout = null;
      this.expandedMenus = [];
    }
    if (menu.children && menu.children.length) {
      this.expandedMenus.push(menu.id);
      this.horizontalOpenChildren = menu.children;
    }
  }

  navItemMouseout(event: Event, menu: IMenuItem) {
    event.stopPropagation();
    this.mouseoutTimeout = setTimeout(() => {
      this.expandedMenus = [];
    }, 100);
  }

  navChildMouseover(event: Event) {
    if (
      event.target &&
      (event.target as any).className === "p-wit-menu-horizontal-child-content"
    ) {
      this.horizontalChildWarpNode = event.target as Node;
    }
    if (this.mouseoutTimeout) {
      clearTimeout(this.mouseoutTimeout);
      this.mouseoutTimeout = null;
    }
  }

  navChildMouseout(event: Event) {
    event.stopPropagation();
    if (
      (event as any).toElement !== null &&
      (event as any).fromElement !== null &&
      this.horizontalChildWarpNode.compareDocumentPosition &&
      (this.horizontalChildWarpNode.compareDocumentPosition(
        (event as any).toElement
      ) === 20 ||
        this.horizontalChildWarpNode.compareDocumentPosition(
          (event as any).fromElement
        ) === 20)
    ) {
      return;
    }
    this.expandedMenus = [];
  }
}
