import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/message' };

export const BasicMessage = () => ({
  mixins: [theme],
  methods: {
    info() {
      this.$message.info('This is a normal message');
    }
  },
  template: `
  <sm-button type="primary" v-on:click="info">
    Display normal message
  </sm-button>
  `
});
BasicMessage.story = {
  name: toI18n('basicComponent.basic')
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
  <sm-button v-on:click="success">
    Display a sequence of message
  </sm-button>
  `
});
LoadingMessage.story = {
  name: toI18n('basicComponent.message.loading')
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
  <sm-button v-on:click="success">
    Customized display duration
  </sm-button>
  `
});
DelayedMessage.story = {
  name: toI18n('basicComponent.message.customizeDuration')
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
    <sm-button v-on:click="success">
      Success
    </sm-button>
    <sm-button v-on:click="error">
      Error
    </sm-button>
    <sm-button v-on:click="warning">
      Warning
    </sm-button>
  </div>
  `
});
OtherTypesMessage.story = {
  name: toI18n('basicComponent.message.type')
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
  <sm-button type="primary" v-on:click="openMessage">
    Open the message box
  </sm-button>
  `
});
UpdatedMessage.story = {
  name: toI18n('basicComponent.message.updateContent')
};
