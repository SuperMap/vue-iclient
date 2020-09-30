import { UserConfig } from 'vite';

const config: UserConfig = {
  optimizeDeps: {
    include: ['ant-design-vue/es/button/index', 'ant-design-vue/es/switch/index']
  },
  cssPreprocessOptions: {
    less: {
      javascriptEnabled: true
    }
  }
};

export default config;
