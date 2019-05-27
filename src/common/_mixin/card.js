import Card from '../card/Card';

export default {
  components: { 'sm-card': Card },
  data() {
    return {
      isShow: true
    };
  },
  props: {
    position: {
      type: String,
      default: 'top-left',
      validator(value) {
        return ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value);
      }
    },
    iconClass: {
      type: String
    },
    autoRotate: {
      type: Boolean,
      default: false
    },
    headerName: {
      type: String
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  }
};
