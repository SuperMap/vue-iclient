import VueTestUtils from '@vue/test-utils';

VueTestUtils.config.mocks['$t'] = msg => msg;
