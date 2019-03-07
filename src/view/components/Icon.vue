<template>
  <div :class="['sm-icon',`is-${position}`]" @click="iconClicked">
    <div
      :style="iconStyle"
      :class="{['sm-icon__el-icon']:true,[`${iconClass}`]:!iconUrl,['is-auto-rotate']:autoRotate}"
    ></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      transform: null
    };
  },
  props: {
    iconUrl: {
      type: String
    },
    collapsed: {
      type: Boolean,
      default: true
    },
    autoRotate: {
      type: Boolean,
      default: true
    },
    iconClass: {
      type: String,
      default: "el-icon-back"
    },
    wayOfExpansion: {
      type: String,
      default: "click"
    },
    position: {
      type: String,
      default: "top-left"
    }
  },
  mounted() {
    this.$nextTick(() => {
      let controlContainer = this.$el.parentElement.children[0];
      if (!this.collapsed) {
        this.autoRotate && (this.transform = this.rotateDeg[this.position][1]);
        controlContainer.classList.add("is-click-in");
      } else {
        controlContainer.style.visibility = "visible";
      }
    });
  },
  methods: {
    iconClicked() {
      let controlContainer = this.$el.parentElement.children[0];
      controlContainer.style.visibility = "visible";
      this.autoRotate &&
        (this.transform = this.rotateDeg[this.position][
          this.collapsed ? 0 : 1
        ]);
      controlContainer.classList.remove(
        `is-click-${this.collapsed ? "out" : "in"}`
      );
      controlContainer.classList.add(
        `is-click-${this.collapsed ? "in" : "out"}`
      );
      this.collapsed = !this.collapsed;
    }
  },
  computed: {
    iconStyle() {
      return {
        transform: this.transform
      };
    },
    rotateDeg() {
      return {
        "top-right": ["rotate(-45deg)", "rotate(135deg)"],
        "top-left": ["rotate(-135deg)", "rotate(45deg)"],
        "bottom-left": ["rotate(135deg)", "rotate(-45deg)"],
        "bottom-right": ["rotate(45deg)", "rotate(-135deg)"]
      };
    }
  }
};
</script>


