import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/modal' };

export const BasicModal = () => ({
  mixins: [theme],
  data() {
    return {
      visible: false
    };
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      console.log(e);
      this.visible = false;
    }
  },
  template: `
  <div>
    <sm-button type="primary" v-on:click="showModal">
      Open Modal
    </sm-button>
    <sm-modal v-model="visible" title="Basic Modal" v-on:ok="handleOk">
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </sm-modal>
  </div>
  `
});
BasicModal.story = {
  name: toI18n('basicComponent.basic')
};

export const ConfirmModal = () => ({
  methods: {
    showConfirm() {
      this.$confirm({
        title: 'Do you Want to delete these items?',
        content: 'Some descriptions',
        class: 'test'
      });
    },
    showDeleteConfirm() {
      this.$confirm({
        title: 'Are you sure delete this task?',
        content: 'Some descriptions',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No'
      });
    },
    showPropsConfirm() {
      this.$confirm({
        title: 'Are you sure delete this task?',
        content: 'Some descriptions',
        okText: 'Yes',
        okType: 'danger',
        okButtonProps: {
          props: {
            disabled: true
          }
        },
        cancelText: 'No'
      });
    }
  },
  template: `
  <div>
    <sm-button v-on:click="showConfirm">
      Confirm
    </sm-button>
    <sm-button type="dashed" v-on:click="showDeleteConfirm">
      Delete
    </sm-button>
    <sm-button type="dashed" v-on:click="showPropsConfirm">
      With extra props
    </sm-button>
  </div>
  `
});
ConfirmModal.story = {
  name: toI18n('basicComponent.modal.confirmationModalDialog')
};

export const MessagecModal = () => ({
  methods: {
    info() {
      this.$info({
        title: 'This is a notification message',
        content: 'some messages...some messages...'
      });
    },
    success() {
      this.$success({
        title: 'This is a success message',
        content: 'some messages...some messages...'
      });
    },
    error() {
      this.$error({
        title: 'This is an error message',
        content: 'some messages...some messages...'
      });
    },
    warning() {
      this.$warning({
        title: 'This is a warning message',
        content: 'some messages...some messages...'
      });
    }
  },
  template: `
  <div>
    <sm-button v-on:click="info">
      Info
    </sm-button>
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
MessagecModal.story = {
  name: toI18n('basicComponent.modal.informationModalDialog')
};

export const updateDestroyModal = () => ({
  methods: {
    countDown() {
      let secondsToGo = 5;
      const modal = this.$success({
        title: 'This is a notification message',
        content: `This modal will be destroyed after ${secondsToGo} second.`
      });
      const interval = setInterval(() => {
        secondsToGo -= 1;
        modal.update({
          content: `This modal will be destroyed after ${secondsToGo} second.`
        });
      }, 1000);
      setTimeout(() => {
        clearInterval(interval);
        modal.destroy();
      }, secondsToGo * 1000);
    }
  },
  template: `
  <sm-button @click="countDown">
    Open modal to close in 5s
  </sm-button>
  `
});
updateDestroyModal.story = {
  name: toI18n('basicComponent.modal.manualToUpdateDestroy')
};

export const FooterPropsModal = () => ({
  data() {
    return {
      visible: false
    };
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      this.visible = false;
    },
    handleCancel(e) {
      this.visible = false;
    }
  },
  template: `
  <div>
    <sm-button type="primary" v-on:click="showModal">
      Open Modal with customized button props
    </sm-button>
    <sm-modal
      v-model="visible"
      title="Basic Modal"
      :ok-button-props="{ props: { disabled: true } }"
      :cancel-button-props="{ props: { disabled: true } }"
      v-on:ok="handleOk"
    >
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </sm-modal>
  </div>
  `
});
FooterPropsModal.story = {
  name: toI18n('basicComponent.modal.customizeFooterProps')
};

export const AsyncColseModal = () => ({
  data() {
    return {
      ModalText: 'Content of the modal',
      visible: false,
      confirmLoading: false
    };
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      this.ModalText = 'The modal will be closed after two seconds';
      this.confirmLoading = true;
      setTimeout(() => {
        this.visible = false;
        this.confirmLoading = false;
      }, 2000);
    },
    handleCancel(e) {
      this.visible = false;
    }
  },
  template: `
  <div>
    <sm-button type="primary" v-on:click="showModal">
      Open Modal with async logic
    </sm-button>
    <sm-modal
      title="Title"
      :visible="visible"
      :confirm-loading="confirmLoading"
      v-on:ok="handleOk"
      v-on:cancel="handleCancel"
    >
      <p>{{ ModalText }}</p>
    </sm-modal>
  </div>
  `
});
AsyncColseModal.story = {
  name: toI18n('basicComponent.modal.asynchronouslyClose')
};

export const AsyncConfirmModal = () => ({
  methods: {
    showConfirm() {
      this.$confirm({
        title: 'Do you want to delete these items?',
        content: 'When clicked the OK button, this dialog will be closed after 1 second',
        onOk() {
          return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
          }).catch(() => console.log('Oops errors!'));
        }
      });
    }
  },
  template: `
  <sm-button v-on:click="showConfirm">
    Confirm
  </sm-button>
  `
});
AsyncConfirmModal.story = {
  name: toI18n('basicComponent.modal.confirmationModalDialogPromise')
};

export const CustomFooterModal = () => ({
  data() {
    return {
      loading: false,
      visible: false
    };
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      this.loading = true;
      setTimeout(() => {
        this.visible = false;
        this.loading = false;
      }, 3000);
    },
    handleCancel(e) {
      this.visible = false;
    }
  },
  template: `
  <div>
    <sm-button type="primary" v-on:click="showModal">
      Open Modal with customized footer
    </sm-button>
    <sm-modal v-model="visible" title="Title" on-ok="handleOk">
      <template slot="footer">
        <sm-button key="back" v-on:click="handleCancel">
          Return
        </sm-button>
        <sm-button key="submit" type="primary" :loading="loading" v-on:click="handleOk">
          Submit
        </sm-button>
      </template>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </sm-modal>
  </div>
  `
});
CustomFooterModal.story = {
  name: toI18n('basicComponent.modal.customFooter')
};

export const CustomButtonModal = () => ({
  data() {
    return {
      visible: false
    };
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    hideModal() {
      this.visible = false;
    },
    confirm() {
      this.$confirm({
        title: 'Confirm',
        content: 'Bla bla ...',
        okText: '确认',
        cancelText: '取消'
      });
    }
  },
  template: `
  <div>
    <sm-button type="primary" v-on:click="showModal">
      Modal
    </sm-button>
    <sm-modal v-model="visible" title="Modal" ok-text="确认" cancel-text="取消" v-on:ok="hideModal">
      <p>Bla bla ...</p>
      <p>Bla bla ...</p>
      <p>Bla bla ...</p>
    </sm-modal>
    <br />
    <br />
    <sm-button v-on:click="confirm">
      Confirm
    </sm-button>
  </div>
  `
});
CustomButtonModal.story = {
  name: toI18n('basicComponent.modal.internationalization')
};

export const CustomLocationModal = () => ({
  data() {
    return {
      modal1Visible: false,
      modal2Visible: false
    };
  },
  methods: {
    setModal1Visible(modal1Visible) {
      this.modal1Visible = modal1Visible;
    }
  },
  template: `
  <div id="components-modal-demo-position">
    <sm-button type="primary" v-on:click="() => setModal1Visible(true)">
      Display a modal dialog at 20px to Top
    </sm-button>
    <sm-modal
      title="20px to Top"
      style="top: 20px;"
      :visible="modal1Visible"
      v-on:ok="() => setModal1Visible(false)"
      v-on:cancel="() => setModal1Visible(false)"
    >
      <p>some contents...</p>
      <p>some contents...</p>
      <p>some contents...</p>
    </sm-modal>
    <br /><br />
    <sm-button type="primary" v-on:click="() => (modal2Visible = true)">
      Vertically centered modal dialog
    </sm-button>
    <sm-modal
      v-model="modal2Visible"
      title="Vertically centered modal dialog"
      centered
      v-on:ok="() => (modal2Visible = false)"
    >
      <p>some contents...</p>
      <p>some contents...</p>
      <p>some contents...</p>
    </sm-modal>
  </div>
  `
});
CustomLocationModal.story = {
  name: toI18n('basicComponent.modal.customLocation')
};

export const DestroyModal = () => ({
  methods: {
    showConfirm() {
      const self = this;
      for (let i = 0; i < 3; i += 1) {
        setTimeout(() => {
          this.$confirm({
            content: 'destroy all',
            onOk() {
              return new Promise((resolve, reject) => {
                setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
              }).catch(() => console.log('Oops errors!'));
            },
            cancelText: 'Click to destroy all',
            onCancel() {
              self.destroyAll();
            },
            okButtonProps: {
              props: {
                disabled: false
              }
            }
          });
        }, i * 500);
      }
    },
    destroyAll() {
      this.$destroyAll();
    }
  },
  template: `
  <sm-button v-on:click="showConfirm">
    Confirm
  </sm-button>
  `
});
DestroyModal.story = {
  name: toI18n('basicComponent.modal.destroyModalDialog')
};
