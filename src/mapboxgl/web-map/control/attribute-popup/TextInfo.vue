<template>
  <vue-editor
    ref="editor"
    :editor-options="{ isReadOnly: true, modules: { toolbar: false } }"
    disabled
  />
</template>

<script>
import { VueEditor, Quill } from 'vue2-editor/dist/vue2-editor.core.js';
import ConvertUtil from './util/ExpressionConverter';
import Delta from 'quill-delta';
import 'quill/dist/quill.snow.css';
import 'vue2-editor/dist/vue2-editor.css';

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
      const Font = Quill.import('attributors/style/font');
      Font.whitelist = ['Microsoft-YaHei', 'SimSun', 'SimHei', 'KaiTi', 'FangSong', 'Arial', 'Times-New-Roman', 'sans-serif'];
      Quill.register(Font, true);
      if (editor) {
        this.quill = editor.quill;
        this.quill.setContents(this.contentDelta);
      }
    }
  }
};
</script>
