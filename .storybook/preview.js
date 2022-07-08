import i18n, { getLanguage, setLanguage, getStoryGlobalI18n } from './lang';
import './useLib';

const TEMPLATESOURCE = function(templateSource, beforTemplateSource = '', afterTemplateSource = '') {
  const beforSource = beforTemplateSource.trim();
  const afterSource = afterTemplateSource.trim();
  let otherSource = '';
  if (beforSource || afterSource) {
    otherSource = `
export default {
  ${beforSource}
  ${afterSource}
}
`;
  }
  return `
<template>
  ${templateSource.trim()}
</template>
${otherSource}
`;
};

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  viewMode: 'docs',
  previewTabs: {
    canvas: {
      hidden: true
    }
  },
  options: {
    showPanel: true,
    panelPosition: 'right',
    storySort: {
      order: ['Design', ['Theme', 'Custom Theme'], '设计', ['主题', '自定义主题'], 'Map Components', '地图组件', 'Map SubComponents',  '地图子组件', 'Chart Components',  '图表组件', 'Basic Components','基础组件']
    }
  },
  docs: {
    transformSource(source, storyId) {
      const templateReg = /(?<=template:\s\`)(.|\s)*?(?=\s*\`)/g;
      const beforTemplateReg = /(?<=\(\{)(.|\s)*?(?=\s\stemplate:\s\`)/g;
      const afterTemplateReg = /(?<=\`,)(.|\s)*?(?=\}\))/g;
      const sourceSrc = source || storyId.parameters.storySource.source;
      const templateSource = sourceSrc.match(templateReg)[0];
      const beforTemplateSource = sourceSrc.match(beforTemplateReg)[0];
      const afterTemplateSource = sourceSrc.match(afterTemplateReg) ? sourceSrc.match(afterTemplateReg)[0] : '';
      const resultSource = TEMPLATESOURCE(templateSource, beforTemplateSource, afterTemplateSource);
      return resultSource;
    }
  }
};

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    defaultValue: getLanguage(),
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en', right: '🇺🇸', title: 'English' },
        { value: 'zh', right: '🇨🇳', title: '中文' }
      ]
    }
  }
};

export const decorators = [
  () => {
    return {
      template: '<story />',
      updated() {
        const storeLang = getStoryGlobalI18n();
        if (storeLang && this.$i18n.locale !== storeLang) {
          setLanguage(storeLang);
          parent.location.reload()
        }
      },
      i18n
    };
  }
];
