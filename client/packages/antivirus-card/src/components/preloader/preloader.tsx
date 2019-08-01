import { Component, h, Prop } from '@stencil/core';

/** Types for preloader */
export type ViewType =
  | 'local' // отображать локально, используется по-умолчанию (полезно если нужно показать на месте элемента, который еще не создан)
  | 'fixed' // поверх всей видимой области
  | 'overlay'; // перекрытие существующего элемента

/**
 * Preloader component
 */
@Component({
  tag: 'antivirus-card-preloader',
  styleUrl: 'styles/$.scss',
})
export class Preloader {
  /** Ref for spinner element */
  private _spinnerEl: HTMLAntivirusCardSpinnerRoundElement;

  /** Ref for content div element */
  private _contentDiv: HTMLDivElement;

  /** Value for css style top */
  @Prop({ reflect: true }) top = '0';

  /** Value for css style left */
  @Prop({ reflect: true }) left = '0';

  /** Value for css style height */
  @Prop({ reflect: true }) height = '100%';

  /** Value for css style width */
  @Prop({ reflect: true }) width = '100%';

  /** Spinner size type */
  @Prop({ reflect: true }) size: 'large' | 'medium' | 'small';

  /** Flag for loading */
  @Prop({ reflect: true }) loading: boolean = false;

  /** Preloader type */
  @Prop() type: ViewType = 'local';

  componentDidLoad() {
    let spinnerWidth: string;
    if (this.size) {
      switch (this.size) {
        case 'large':
          spinnerWidth = '60px';
          break;
        case 'medium':
          spinnerWidth = '30px';
          break;
        case 'small':
          spinnerWidth = '20px';
          break;
        default:
          spinnerWidth = '60px';
          break;
      }
    }
    switch (this.type) {
      case 'overlay': {
        this._spinnerEl.style.position = 'relative';
        this._spinnerEl.style.top = this.top;
        this._spinnerEl.style.left = this.left;
        this._spinnerEl.style.height = this.height;
        this._spinnerEl.style.width = this.width;
      }
    }
    this._spinnerEl.width = spinnerWidth;
    this._calculateSpinnerPosition(this._contentDiv, this._spinnerEl);
  }

  componentWillUpdate() {
    /** @todo add handle for browser scroll */
    this._calculateSpinnerPosition(this._contentDiv, this._spinnerEl);
  }

  /**
   * Method for calculate spinner position
   *
   * @param containerElement - container with data element
   * @param spinnerElement - container with spinner element
   */
  private _calculateSpinnerPosition(containerElement: HTMLDivElement, spinnerElement: HTMLAntivirusCardSpinnerRoundElement) {
    /** @todo This method copy from isp-preloader and needing in revision */
    if (typeof containerElement !== 'undefined' && typeof spinnerElement !== 'undefined') {
      // проверка нужно ли изменить положение spinner
      // в видимой области или нет
      if (containerElement.getBoundingClientRect().bottom > 0 && containerElement.getBoundingClientRect().top < window.innerHeight) {
        // верх области выше окна верхней границы окна
        if (containerElement.getBoundingClientRect().top < 0) {
          // низ области выше нижней границы окна
          if (containerElement.getBoundingClientRect().bottom < window.innerHeight) {
            spinnerElement.style['align-self'] = 'self-start';
            spinnerElement.style['padding-top'] =
              containerElement.getBoundingClientRect().bottom / 2 - containerElement.getBoundingClientRect().top + 'px';
            // иначе, если низ области ниже нижней границы окна
          } else {
            spinnerElement.style['align-self'] = 'self-start';
            spinnerElement.style['padding-top'] = window.innerHeight / 2 - containerElement.getBoundingClientRect().top + 'px';
          }
        }

        // верх области ниже окна верхней границы окна и низ области ниже верхней границы окна
        if (containerElement.getBoundingClientRect().top > 0 && containerElement.getBoundingClientRect().bottom > 0) {
          // низ области ниже нижней границы окна
          if (containerElement.getBoundingClientRect().bottom > window.innerHeight) {
            spinnerElement.style['align-self'] = 'self-start';
            spinnerElement.style['padding-top'] = (window.innerHeight - containerElement.getBoundingClientRect().top) / 2 + 'px';
            // иначе, если низ области выше  нижней границы окна
          } else {
            // выравнивание произойдет автоматически через flex
            spinnerElement.style['align-self'] = 'center';
            spinnerElement.style['padding-top'] = 0;
          }
        }
      }
    }
  }

  /**
   *  Method for check display data behind preloader
   */
  private _canDisplay(): boolean {
    return !this.loading || this.type === 'overlay';
  }

  render() {
    return (
      <div class="isp-preloader">
        {this._canDisplay() && (
          <div ref={el => (this._contentDiv = el)}>
            <slot />
          </div>
        )}
        <div style={!this.loading && { display: 'none' }}>
          <div class="isp-preloader__loader">
            <div class="isp-preloader__snipper_round">
              <antivirus-card-spinner-round ref={el => (this._spinnerEl = el)}></antivirus-card-spinner-round>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
