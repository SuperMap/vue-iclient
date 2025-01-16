import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.notification.title')}`,
  id: 'BasicComponents/notification'
};
export const BasicNotification = () => ({
  mixins: [theme],
  methods: {
    openNotification() {
      this.$notification.open({
        message: 'Notification Title',
        description:
          'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        onClick: () => {
          console.log('Notification Clicked!');
        }
      });
    }
  },
  template: `
  <sm-button type="primary" v-on:click="openNotification">
    Open the notification box
  </sm-button>
    `
});
BasicNotification.story = {
  name: toI18n('basicComponent.basic')
};

export const CustomStyle = () => ({
  methods: {
    openNotification() {
      this.$notification.open({
        message: 'Notification Title',
        description:
          'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        style: {
          width: '600px',
          marginLeft: `${335 - 600}px`
        }
      });
    }
  },
  template: `
  <sm-button type="primary" v-on:click="openNotification">
    Open the notification box
  </sm-button>
    `
});
CustomStyle.story = {
  name: toI18n('basicComponent.notification.customStyle')
};

export const Position = () => ({
  data() {
    return {
      iconStyle: {
        color: 'rgba(255, 255, 255, 0.65)',
        marginRight: '8px'
      }
    };
  },
  methods: {
    openNotification(placement) {
      this.$notification.open({
        message: `Notification ${placement}`,
        description:
          'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        placement
      });
    }
  },
  template: `
  <div>
    <sm-button type="primary" v-on:click="openNotification('topLeft')">
      <sm-icon type="radius-upleft" :iconStyle="iconStyle" />
      topLeft
    </sm-button>
    <sm-button type="primary" v-on:click="openNotification('topRight')">
      <sm-icon type="radius-upright" :iconStyle="iconStyle" />
      topRight
    </sm-button>
    <sm-button type="primary" v-on:click="openNotification('bottomLeft')">
      <sm-icon type="radius-bottomleft" :iconStyle="iconStyle" />
      bottomLeft
    </sm-button>
    <sm-button type="primary" v-on:click="openNotification('bottomRight')">
      <sm-icon type="radius-bottomright" :iconStyle="iconStyle" />
      bottomRight
    </sm-button>
  </div>
    `
});
Position.story = {
  name: toI18n('basicComponent.notification.position')
};

export const icon = () => ({
  methods: {
    openNotificationWithIcon(type) {
      this.$notification[type]({
        message: 'Notification Title',
        description:
          'This is the content of the notification. This is the content of the notification. This is the content of the notification.'
      });
    }
  },
  template: `
  <div>
    <sm-button v-on:click="() => openNotificationWithIcon('success')">
      Success
    </sm-button>
    <sm-button v-on:click="() => openNotificationWithIcon('info')">
      Info
    </sm-button>
    <sm-button v-on:click="() => openNotificationWithIcon('warning')">
      Warning
    </sm-button>
    <sm-button v-on:click="() => openNotificationWithIcon('error')">
      Error
    </sm-button>
  </div>
    `
});
icon.story = {
  name: toI18n('basicComponent.notification.icon')
};

export const AutoCloseDelay = () => ({
  methods: {
    openNotification() {
      this.$notification.open({
        message: 'Notification Title',
        description:
          'I will never close automatically. I will be close automatically. I will never close automatically.',
        duration: 0
      });
    }
  },
  template: `
  <sm-button type="primary" v-on:click="openNotification">
    Open the notification box
  </sm-button>
    `
});
AutoCloseDelay.story = {
  name: toI18n('basicComponent.notification.autoCloseDelay')
};

export const CustomButton = () => ({
  methods: {
    openNotification() {
      const key = `open${Date.now()}`;
      this.$notification.open({
        message: 'Notification Title',
        description:
          'A function will be be called after the notification is closed (automatically after the "duration" time of manually).',
        btn: h => {
          return h(
            'sm-button',
            {
              props: {
                type: 'primary',
                size: 'small'
              },
              on: {
                click: () => this.$notification.close(key)
              }
            },
            'Confirm'
          );
        },
        key
      });
    }
  },
  template: `
  <sm-button type="primary" v-on:click="openNotification">
    Open the notification box
  </sm-button>
    `
});
CustomButton.story = {
  name: toI18n('basicComponent.notification.customButton')
};

export const UpdateInfoContent = () => ({
  methods: {
    openNotification() {
      this.$notification.open({
        key: 'updatable',
        message: 'Notification Title',
        description: 'description.'
      });
      setTimeout(() => {
        this.$notification.open({
          key: 'updatable',
          message: 'New Title',
          description: 'New description.'
        });
      }, 1000);
    }
  },
  template: `
  <sm-button type="primary" v-on:click="openNotification">
    Open the notification box
  </sm-button>
    `
});
UpdateInfoContent.story = {
  name: toI18n('basicComponent.notification.updateInfoContent')
};
