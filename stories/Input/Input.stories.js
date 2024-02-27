import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.input.title')}`,
  id: 'BasicComponents/input'
};

export const BasicInput = () => ({
  mixins: [theme],
  template: `
  <sm-input style="width:160px;" placeholder="Basic input"></sm-input>
  `
});
BasicInput.story = {
  name: toI18n('basicComponent.basic')
};

export const PrefixInput = () => ({
  template: `
  <div class="components-input-demo-presuffix">
    <sm-input ref="userNameInput" placeholder="Basic usage">
      <sm-icon style="padding:0" slot="prefix" type="user" />
      <sm-tooltip slot="suffix" title="Extra information">
        <sm-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
      </sm-tooltip>
    </sm-input>
    <br />
    <br />
    <sm-input prefix="￥" suffix="RMB" />
  </div>
  `
});
PrefixInput.story = {
  name: toI18n('basicComponent.input.prefixSuffix')
};

export const SearchInput = () => ({
  template: `
  <div>
    <sm-input-search placeholder="input search loading deault" loading />
    <br />
    <br />
    <sm-input-search placeholder="input search loading with enterButton" loading enter-button />
  </div>
  `
});
SearchInput.story = {
  name: toI18n('basicComponent.input.searchWithLoading')
};

export const LabelInput = () => ({
  template: `
  <div>
    <div style="margin-bottom: 16px">
      <sm-input addon-before="Http://" addon-after=".com" default-value="mysite" />
    </div>
    <div style="margin-bottom: 16px">
      <sm-input default-value="mysite">
        <sm-select slot="addonBefore" default-value="Http://" style="width: 90px">
          <sm-select-option value="Http://">
            Http://
          </sm-select-option>
          <sm-select-option value="Https://">
            Https://
          </sm-select-option>
        </sm-select>
        <sm-select slot="addonAfter" default-value=".com" style="width: 80px">
          <sm-select-option value=".com">
            .com
          </sm-select-option>
          <sm-select-option value=".jp">
            .jp
          </sm-select-option>
          <sm-select-option value=".cn">
            .cn
          </sm-select-option>
          <sm-select-option value=".org">
            .org
          </sm-select-option>
        </sm-select>
      </sm-input>
    </div>
    <div style="margin-bottom: 16px">
      <sm-input default-value="mysite">
        <sm-icon slot="addonAfter" type="setting" />
      </sm-input>
    </div>
  </div>
  `
});
LabelInput.story = {
  name: toI18n('basicComponent.input.prePostTab')
};

export const DeleteInput = () => ({
  template: `
  <div>
    <sm-input placeholder="input with clear icon" allow-clear />
    <br />
    <br />
    <sm-textarea placeholder="textarea with clear icon" allow-clear />
  </div>
  `
});
DeleteInput.story = {
  name: toI18n('basicComponent.input.clearIcon')
};

export const TextareaInput = () => ({
  template: `
  <div>
    <sm-textarea placeholder="Autosize height based on content lines" auto-size />
    <div style="margin: 24px 0" />
    <sm-textarea
      placeholder="Autosize height with minimum and maximum number of lines"
      :auto-size="{ minRows: 2, maxRows: 6 }"
    />
    <div style="margin: 24px 0" />
    <sm-textarea
      placeholder="Controlled autosize"
      :auto-size="{ minRows: 3, maxRows: 5 }"
    />
  </div>
  `
});
TextareaInput.story = {
  name: toI18n('basicComponent.input.fitHeight')
};

export const SearchButtonInput = () => ({
  template: `
  <div>
    <sm-input-search placeholder="input search text" style="width: 200px" />
    <br /><br />
    <sm-input-search placeholder="input search text" enter-button />
    <br /><br />
    <sm-input-search
      placeholder="input search text"
      enter-button="Search"
      size="large"
    />
    <br /><br />
    <sm-input-search placeholder="input search text" size="large" >
      <sm-button slot="enterButton">
        Custom
      </sm-button>
    </sm-input-search>
  </div>
  `
});
SearchButtonInput.story = {
  name: toI18n('basicComponent.input.searchBox')
};

export const SizeInput = () => ({
  template: `
  <div class="components-input-demo-size">
    <sm-input size="large" placeholder="large size" />
    <sm-input style="margin: 10px 0" placeholder="default size" />
    <sm-input size="small" placeholder="small size" />
  </div>
  `
});
SizeInput.story = {
  name: toI18n('basicComponent.input.size')
};

export const Textarea = () => ({
  template: `
  <sm-textarea placeholder="Basic usage" :rows="4" />
  `
});
Textarea.story = {
  name: toI18n('basicComponent.input.textArea')
};

export const PasswordInput = () => ({
  template: `
  <sm-input-password placeholder="input password" />
  `
});
PasswordInput.story = {
  name: toI18n('basicComponent.input.passwordBox')
};

export const ErrorInput = () => ({
  template: `
  <div>
    <sm-input style="width:160px;" :error="true" placeholder="Error"/>
    <br /><br />
    <sm-textarea :error="true" placeholder="textarea with clear icon"/>
  </div>
  `
});
ErrorInput.story = {
  name: toI18n('basicComponent.input.error')
};

export const Disabled = () => ({
  template: `
  <div>
    <sm-input style="width:160px;" disabled placeholder="Basic input" value="123"></sm-input>
    <br /><br />
    <sm-textarea disabled placeholder="textarea"/>
    <br /><br />
    <sm-input style="width:160px;" unit="RMB" disabled placeholder="Basic input"/>
  </div>
  `
});
Disabled.story = {
  name: toI18n('basicComponent.input.disabled')
};

export const ReadOnly = () => ({
  template: `
  <div>
    <sm-input style="width:160px;" readOnly placeholder="readOnly" value="123"/>
    <br />
    <br />
    <sm-textarea readOnly placeholder="readOnly" value="123"/>
    <br />
    <br />
    <sm-input style="width:160px;" unit="RMB" readOnly placeholder="Basic input" value="123"/>
  </div>
  `
});
ReadOnly.story = {
  name: toI18n('basicComponent.input.readOnly')
};

export const Unit = () => ({
  template: `
  <div>
    <sm-input style="width:160px;" unit="RMB" placeholder="Basic input"/>
  </div>
  `
});
Unit.story = {
  name: toI18n('basicComponent.input.unit')
};
