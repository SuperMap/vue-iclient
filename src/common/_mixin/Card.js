import SmCollapseCard from '../collapse-card/CollapseCard';

export default {
  components: { SmCollapseCard },
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
      type: Boolean, // 是否折叠
      default: false
    }
  }
};
