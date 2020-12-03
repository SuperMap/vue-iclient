<template>
  <div v-if="showComponent" class="sm-component-tdt-pagination pagination-container">
    <ul id="paginationUl" @click="handleClick" >
      <li type="home" class="home-item">{{ $t('tdtResults.homePage') }}</li>
      <li v-if="realPage !== 1" type="prevPage" class="prev-item">{{ $t('tdtResults.prevPage') }}</li>
      <li
        v-for="(page, index) in pageList"
        :key="page"
        :type="attrType(index)"
        :class="{ 'pagination-item': true, 'active-item': index === activePage }"
      >
        {{ page }}
      </li>
      <li v-if="realPage !== totalPage" type="nextPage" class="next-item">{{ $t('tdtResults.nextPage') }}</li>
    </ul>
  </div>
</template>

<script>
import Theme from '../../../common/_mixin/Theme';

export default {
  name: 'PaginationContainer',
  mixins: [Theme],
  props: {
    total: {
      type: Number
    },
    pageNo: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    hideOnSinglePage: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showPrevPage: false,
      activePage: 0,
      realPage: 1,
      pageList: [],
      base: 4 // 分页显示几个按钮
    };
  },
  computed: {
    totalPage() {
      return this.total && Math.ceil(this.total / this.pageSize);
    },
    showComponent() {
      if (!this.total || (this.hideOnSinglePage && this.totalPage <= 1)) {
        return false;
      }
      return true;
    },
    attrType() {
      return index => {
        if (!index) {
          return 'startPage';
        } else if (index === 3) {
          return 'endPage';
        }
        return 'serialPage';
      };
    }
  },
  watch: {
    total() {
      this.calcRenderPages();
    },
    pageNo() {
      if (this.pageNo) {
        this.initData();
      }
    }
  },
  mounted() {
    this.initData();
    this.calcRenderPages();
  },
  methods: {
    initData() {
      const remainder = this.pageNo % this.base;
      const num = remainder ? remainder - 1 : this.base - 1;
      this.activePage = num;
      this.realPage = this.pageNo;
    },
    calcRenderPages(start = 0) {
      let pageData = [];
      const count = this.totalPage;
      if (count && start <= count) {
        const step = start + this.base > count ? count - start : this.base;
        let end = start + step;
        while (start < end) {
          start += 1;
          pageData.push(start);
        }
        this.pageList = pageData;
      }
    },
    handleClick(e) {
      const { target, srcElement } = e;
      if (target.nodeName.toLowerCase() === 'li') {
        const value = target.innerHTML - 1;
        switch (srcElement.getAttribute('type')) {
          case 'home':
            this.activePage = 0;
            this.realPage = 1;
            this.calcRenderPages();
            break;
          case 'prevPage':
            this.activePage -= 1;
            this.realPage = Math.max(this.realPage - 1, 1);
            if (this.activePage < 0) {
              this.calcRenderPages(Math.max(this.realPage - this.base, 0));
              this.activePage = 3;
            }
            break;
          case 'nextPage':
            this.activePage += 1;
            this.realPage = Math.min(this.realPage + 1, this.totalPage);
            if (this.activePage > 3) {
              this.calcRenderPages(this.realPage - 1);
              this.activePage = 0;
            }
            break;
          default:
            this.activePage = value;
            this.realPage = +target.innerHTML;
            break;
        }
        this.$emit('change', { page: this.realPage, pageSize: this.pageSize });
      }
    }
  }
};
</script>
