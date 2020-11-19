import { withKnobs } from '@storybook/addon-knobs';

export default { title: 'Basic/message', decorators: [withKnobs] };

export const BasicMessage = () => ({
  methods: {
    info() {
      this.$message.info('This is a normal message');
    }
  },
  template: `
  <sm-button type="primary" @click="info">
    Display normal message
  </sm-button>
  `
});
BasicMessage.story = {
  name: '基本提示'
};

export const LoadingMessage = () => ({
  methods: {
    success() {
      this.$message
        .loading('Action in progress..', 2.5)
        .then(() => this.$message.success('Loading finished', 2.5))
        .then(() => this.$message.info('Loading finished is finished', 2.5));
    }
  },
  template: `
  <sm-button @click="success">
    Display a sequence of message
  </sm-button>
  `
});
LoadingMessage.story = {
  name: 'Promise 接口'
};

export const DelayedMessage = () => ({
  methods: {
    success() {
      this.$message.success(
        'This is a prompt message for success, and it will disappear in 10 seconds',
        3
      );
    }
  },
  template: `
  <sm-button @click="success">
    Customized display duration
  </sm-button>
  `
});
DelayedMessage.story = {
  name: '修改延时'
};

export const OtherTypesMessage = () => ({
  methods: {
    success() {
      this.$message.success('This is a success message');
    },
    error() {
      this.$message.error('This is an error message');
    },
    warning() {
      this.$message.warning('This is a warning message');
    }
  },
  template: `
  <div>
    <sm-button @click="success">
      Success
    </sm-button>
    <sm-button @click="error">
      Error
    </sm-button>
    <sm-button @click="warning">
      Warning
    </sm-button>
  </div>
  `
});
OtherTypesMessage.story = {
  name: '其他类型'
};

export const UpdatedMessage = () => ({
  methods: {
    openMessage() {
      this.$message.loading({ content: 'Loading...', key: 'updatable' });
      setTimeout(() => {
        this.$message.success({
          content: 'Loaded!',
          key: 'updatable',
          duration: 2
        });
      }, 1000);
    }
  },
  template: `
  <sm-button type="primary" @click="openMessage">
    Open the message box
  </sm-button>
  `
});
OtherTypesMessage.story = {
  name: '更新消息内容'
};
