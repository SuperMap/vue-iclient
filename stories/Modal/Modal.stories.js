import { withKnobs } from '@storybook/addon-knobs';

export default { title: 'BasicComponent/modal', decorators: [withKnobs] };

export const BasicModal = () => ({
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
    <sm-button type="primary" @click="showModal">
      Open Modal
    </sm-button>
    <sm-modal v-model="visible" title="Basic Modal" @ok="handleOk">
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </sm-modal>
  </div>
  `
});
BasicModal.story = {
  name: '基本用法'
};

// export const ConfirmModal = () => ({
//   methods: {
//     showConfirm() {
//       this.$confirm({
//         title: 'Do you Want to delete these items?',
//         content: h => <div style = "color:red;" > Some descriptions </div>,
//         onOk() {
//           console.log('OK');
//         },
//         onCancel() {
//           console.log('Cancel');
//         },
//         class: 'test'
//       });
//     },
//     showDeleteConfirm() {
//       this.$confirm({
//         title: 'Are you sure delete this task?',
//         content: 'Some descriptions',
//         okText: 'Yes',
//         okType: 'danger',
//         cancelText: 'No',
//         onOk() {
//           console.log('OK');
//         },
//         onCancel() {
//           console.log('Cancel');
//         }
//       });
//     },
//     showPropsConfirm() {
//       this.$confirm({
//         title: 'Are you sure delete this task?',
//         content: 'Some descriptions',
//         okText: 'Yes',
//         okType: 'danger',
//         okButtonProps: {
//           props: {
//             disabled: true
//           }
//         },
//         cancelText: 'No',
//         onOk() {
//           console.log('OK');
//         },
//         onCancel() {
//           console.log('Cancel');
//         }
//       });
//     }
//   },
//   template: `
//   <div>
//     <sm-button @click="showConfirm">
//       Confirm
//     </sm-button>
//     <sm-button type="dashed" @click="showDeleteConfirm">
//       Delete
//     </sm-button>
//     <sm-button type="dashed" @click="showPropsConfirm">
//       With extra props
//     </sm-button>
//   </div>
//   `
// });
// ConfirmModal.story = {
//   name: '确认对话框'
// };

// export const MessagecModal = () => ({
//   methods: {
//     info() {
//       const h = this.$createElement;
//       this.$info({
//         title: 'This is a notification message',
//         content: h('div', {}, [
//           h('p', 'some messages...some messages...'),
//           h('p', 'some messages...some messages...')
//         ]),
//         onOk() {}
//       });
//     },
//     success() {
//       this.$success({
//         title: 'This is a success message',
//         // JSX support
//         content: (
//           <div>
//             <p>some messages...some messages...</p>
//             <p>some messages...some messages...</p>
//           </div>
//         )
//       });
//     },
//     error() {
//       this.$error({
//         title: 'This is an error message',
//         content: 'some messages...some messages...'
//       });
//     },
//     warning() {
//       this.$warning({
//         title: 'This is a warning message',
//         content: 'some messages...some messages...'
//       });
//     }
//   },
//   template: `
//   <div>
//     <sm-button @click="info">
//       Info
//     </sm-button>
//     <sm-button @click="success">
//       Success
//     </sm-button>
//     <sm-button @click="error">
//       Error
//     </sm-button>
//     <sm-button @click="warning">
//       Warning
//     </sm-button>
//   </div>
//   `
// });
// MessagecModal.story = {
//   name: '信息提示'
// };

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
      console.log(e);
      this.visible = false;
    },
    handleCancel(e) {
      console.log(e);
      this.visible = false;
    }
  },
  template: `
  <div>
    <sm-button type="primary" @click="showModal">
      Open Modal with customized button props
    </sm-button>
    <sm-modal
      v-model="visible"
      title="Basic Modal"
      :ok-button-props="{ props: { disabled: true } }"
      :cancel-button-props="{ props: { disabled: true } }"
      @ok="handleOk"
    >
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </sm-modal>
  </div>
  `
});
FooterPropsModal.story = {
  name: '页脚按钮属性'
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
      console.log('Clicked cancel button');
      this.visible = false;
    }
  },
  template: `
  <div>
    <sm-button type="primary" @click="showModal">
      Open Modal with async logic
    </sm-button>
    <sm-modal
      title="Title"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>{{ ModalText }}</p>
    </sm-modal>
  </div>
  `
});
AsyncColseModal.story = {
  name: '异步关闭对话框'
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
        },
        onCancel() {}
      });
    }
  },
  template: `
  <sm-button @click="showConfirm">
    Confirm
  </sm-button>
  `
});
AsyncConfirmModal.story = {
  name: '延迟确认对话框'
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
    <sm-button type="primary" @click="showModal">
      Open Modal with customized footer
    </sm-button>
    <sm-modal v-model="visible" title="Title" on-ok="handleOk">
      <template slot="footer">
        <sm-button key="back" @click="handleCancel">
          Return
        </sm-button>
        <sm-button key="submit" type="primary" :loading="loading" @click="handleOk">
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
  name: '自定义页脚'
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
    <sm-button type="primary" @click="showModal">
      Modal
    </sm-button>
    <sm-modal v-model="visible" title="Modal" ok-text="确认" cancel-text="取消" @ok="hideModal">
      <p>Bla bla ...</p>
      <p>Bla bla ...</p>
      <p>Bla bla ...</p>
    </sm-modal>
    <br />
    <br />
    <sm-button @click="confirm">
      Confirm
    </sm-button>
  </div>
  `
});
CustomButtonModal.story = {
  name: '自定义按钮文字'
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
    <sm-button type="primary" @click="() => setModal1Visible(true)">
      Display a modal dialog at 20px to Top
    </sm-button>
    <sm-modal
      title="20px to Top"
      style="top: 20px;"
      :visible="modal1Visible"
      @ok="() => setModal1Visible(false)"
      @cancel="() => setModal1Visible(false)"
    >
      <p>some contents...</p>
      <p>some contents...</p>
      <p>some contents...</p>
    </sm-modal>
    <br /><br />
    <sm-button type="primary" @click="() => (modal2Visible = true)">
      Vertically centered modal dialog
    </sm-button>
    <sm-modal
      v-model="modal2Visible"
      title="Vertically centered modal dialog"
      centered
      @ok="() => (modal2Visible = false)"
    >
      <p>some contents...</p>
      <p>some contents...</p>
      <p>some contents...</p>
    </sm-modal>
  </div>
  `
});
CustomLocationModal.story = {
  name: '自定义位置'
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
  <sm-button @click="showConfirm">
    Confirm
  </sm-button>
  `
});
DestroyModal.story = {
  name: '销毁确认对话框'
};
