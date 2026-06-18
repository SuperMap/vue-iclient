<template>
  <vue-editor
    ref="editor"
    :editor-options="{ isReadOnly: true, modules: { toolbar: false } }"
    disabled
  />
</template>

<script>
import { VueEditor } from 'vue2-editor';
import ConvertUtil from './util/ExpressionConverter';
import Delta from 'quill-delta';

export default {
  name: 'SmTextInfo',
  components: { VueEditor },
  props: {
    title: {
      type: String,
      default: ''
    },
    infos: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      quill: null
    };
  },
  computed: {
    formattedValue() {
      return this.valueToContents(this.infos);
    },
    contentDelta() {
      return new Delta(this.formattedValue);
    }
  },
  watch: {
    contentDelta: {
      handler(newVal) {
        this.quill && this.quill.setContents(newVal);
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initQuill();
    });
  },
  beforeDestroy() {
    this.quill = null;
  },
  methods: {
    valueToContents(value) {
      if (value && value.ops) {
        value = ConvertUtil.getTextInfosString(value.ops);
      }
      return value;
    },
    initQuill() {
      const editor = this.$refs.editor;
      if (editor) {
        this.quill = editor.quill;
        this.quill.setContents(this.contentDelta);
      }
    }
  }
};
</script>
