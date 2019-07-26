import { Component, Prop, h, State } from '@stencil/core';
import { AntivirusShieldIcon } from './icons/antivirus-shield';
import { loadTranslate, getNestedObject, ITranslate } from '../utils/utils';
import { languages, defaultLang, languageTypes } from '../constants';
import { Observable } from 'rxjs';

/**
 * The imunifyav-widget web component
 */
@Component({
  tag: 'antivirus-widget',
  styleUrl: 'style.scss',
  shadow: true
})
export class AntivirusWidget {
  @Prop() translateService: { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };
  @Prop() url: string;
  
  @State() state;
  /** translate object */
  @State()
  t: ITranslate;

  handleClickSection(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    // location.href = this.url;

    this.state = this._changeStatus(this.state.isProcessing);
  }

  _changeStatus(isProcessing = false) {
    if (isProcessing) {
      return {
        isProcessing: false,
        statusMsg: this.t.msg(['WIDGET', 'STATUS_MSG', 'SAFELY']),
        descMsg: this.t.msg(['WIDGET', 'DESC_MSG', 'HISTORY']),
        actionMsg: this.t.msg(['WIDGET', 'ACTION_MSG', 'AGAIN'])
      };
    } else {
      return {
        isProcessing: true,
        statusMsg: this.t.msg(['WIDGET', 'STATUS_MSG', 'IN_PROCESS']),
        descMsg: this.t.msg(['WIDGET', 'DESC_MSG', 'WAIT']),
        actionMsg: this.t.msg(['WIDGET', 'ACTION_MSG', 'REPORT'])
      };
    }
  }

  async componentWillLoad() {
    this.t = await loadTranslate(getNestedObject(this.translateService, ['currentLang']) || defaultLang);

    this.state = this._changeStatus(true);

    if (this.translateService) {
      this.translateService.onLangChange.subscribe(async d => {
        if (d.lang in languages) {
          this.t = await loadTranslate(d.lang);
        }
      });
    }
  }

  render() {
    return (
      <section onClick={this.handleClickSection.bind(this)} class="vepp-overview-widget-list__item vepp-widget_adaptive">
        <div>
          <a class="vepp-overview-widget-list__item-link" href="#/site/1/settings/files">
            {this.t.msg(['WIDGET', 'ANTIVIRUS'])}
          </a>
        </div>
        <div class="vepp-overview-widget-list__item-overflow vepp-widget-text_additional vepp-widget-text_with-margin-adaptive vepp-widget-text_success">
          {this.state.statusMsg}
        </div>
        <div class="vepp-overview-widget-list__item-overflow vepp-widget-text_additional vepp-widget-text_with-margin-adaptive">
          {this.state.descMsg}
        </div>
        <div class="vepp-widget-icon_adaptive">
          <AntivirusShieldIcon/>
        </div>
        <a
          class="ngispui-link ngispui-link_type_hover-dropdown ngispui-link_size_small ngispui-link_color_primary"
          rel="noopener noreferrer"
        >
          {this.state.actionMsg}
        </a>
      </section>
    );
  }
}
