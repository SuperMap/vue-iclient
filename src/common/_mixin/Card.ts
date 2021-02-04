import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import SmCollapseCard from '../collapse-card/CollapseCard.vue';

@Component({
  components: { SmCollapseCard }
})
export default class CardMixin extends Vue {
  @Prop({
    default: 'top-left',
    validator(value) {
      return ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value);
    }
  })
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

  @Prop() headerName: string;
  @Prop() iconClass: string;
  @Prop({ default: false }) autoRotate: boolean;
  @Prop({ default: true }) collapsed: boolean;
  @Prop({ default: false }) splitLine: boolean; // 标题与内容的分割线
};
