import { Component, h, Prop, State } from '@stencil/core';
import { Observable, Subscription } from 'rxjs';
import { languageTypes, defaultLang, languages } from '../../constants';
import { loadTranslate, getNestedObject, ITranslate } from '../../utils/utils';
import { MenuIcon } from './Menu-icon';

/**
 * Antivirus menu component
 */
@Component({
  tag: 'antivirus-menu',
  shadow: true,
})
export class AntivirusMenu {
  /** RXJS subscription destroy pattern */
  private _sub = new Subscription();

  /** Antivirus card plugin url  */
  @Prop() url: string;

  /** Observable of application router */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Prop() routerChangeEvent: Observable<any>;

  /** Observable of translate service */
  @Prop() translateService: { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };

  /** Observable of icons only menu */
  @Prop() iconsOnly$: Observable<boolean>;

  /** Flag for menu active */
  @State() isActiveVMenuItem: boolean;

  /** translate object */
  @State() t: ITranslate;

  /** Flag for display only icon */
  @State() iconOnly = false;

  /**
   * Lifecycle hook,
   * Subscribing for change props params
   */
  async componentWillLoad() {
    this.isActiveVMenuItem = location.href.startsWith(this.url);

    if (this.routerChangeEvent !== undefined) {
      this._sub.add(
        this.routerChangeEvent.subscribe(() => {
          this.isActiveVMenuItem = location.href.startsWith(this.url);
        }),
      );
    }

    // prettier-ignore
    this.t = await loadTranslate(
      getNestedObject(this.translateService, ['currentLang'])
      || getNestedObject(this.translateService, ['defaultLang'])
      || defaultLang
    );

    if (this.translateService) {
      this._sub.add(
        this.translateService.onLangChange.subscribe(async d => {
          if (d.lang in languages) {
            this.t = await loadTranslate(d.lang);
          }
        }),
      );
    }

    if (Boolean(this.iconsOnly$)) {
      this._sub.add(this.iconsOnly$.subscribe({ next: value => (this.iconOnly = value) }));
    }
  }

  /**
   * Lifecycle hook, unsubscribe when component remove
   */
  componentDidUnload() {
    this._sub.unsubscribe();
  }

  /**
   * Handler for redirect on antivirus page
   */
  handleClickLink() {
    location.href = this.url;
  }

  render() {
    return (
      <antivirus-menu-vmenu-item onClick={this.handleClickLink.bind(this)} iconOnly={this.iconOnly} active={this.isActiveVMenuItem}>
        <div slot="vmenu-icon">
          <MenuIcon />
        </div>
        <div slot="vmenu-label">{this.t.msg('MENU_ITEM')}</div>
      </antivirus-menu-vmenu-item>
    );
  }
}
