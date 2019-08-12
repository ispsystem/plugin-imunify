import { Component, h, Host, Prop, State } from '@stencil/core';
import { ITranslate } from '../../models/translate.reducers';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';

@Component({
  tag: 'antivirus-card-table-pagination',
  styleUrl: 'styles/$.scss',
})
export class History {
  /** Global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** Current page in pagination */
  @Prop() currentPage: number;

  /** Total page count */
  @Prop() pageCount: number;

  /** Item count on one page */
  @Prop() countOnPage: number;

  /** Handle for click next or previous page */
  @Prop() clickPagination: (event: 'next' | 'previous') => void;

  /** Handle for change count on one page */
  @Prop() changeCountOnPage: (event: number) => void;

  /** Global translate */
  @State() t: ITranslate;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ t: state.translate }));
  }

  render() {
    return (
      <Host>
        <span>{this.t.msg(['TABLE', 'ON_PAGE_LABEL'])}</span>
        <antivirus-card-select
          onChanged={e => {
            this.changeCountOnPage(e.detail);
            e.stopPropagation;
          }}
          width={50}
          borderless
          style={{ display: 'inline-block', padding: '0 12px 0 4px' }}
        >
          {[5, 10, 25, 50].map(value => (
            <antivirus-card-select-option selected={this.countOnPage === value} value={value}>
              {value}
            </antivirus-card-select-option>
          ))}
        </antivirus-card-select>
        <button class="pagination__control pagination__control_prev" onClick={() => this.clickPagination('previous')} />
        {this.currentPage}&nbsp;<span>{this.t.msg(['TABLE', 'OF'])}</span>&nbsp;{this.pageCount}
        <button class="pagination__control pagination__control_next" onClick={() => this.clickPagination('next')} />
      </Host>
    );
  }
}
