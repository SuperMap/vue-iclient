(window.webpackJsonp=window.webpackJsonp||[]).push([[2,11,15,22],{461:function(t,e,n){},462:function(t,e){t.exports=function(t){return null==t}},463:function(t,e,n){},464:function(t,e,n){},465:function(t,e,n){},466:function(t,e,n){},472:function(t,e,n){"use strict";var i=n(3),a=n(73).find,s=n(152),r=!0;"find"in[]&&Array(1).find((function(){r=!1})),i({target:"Array",proto:!0,forced:r},{find:function(t){return a(this,t,arguments.length>1?arguments[1]:void 0)}}),s("find")},473:function(t,e,n){"use strict";n(461)},474:function(t,e,n){"use strict";n.r(e);var i=n(489),a=n(475),s=n(455);function r(t,e){if("group"===e.type){var n=e.path&&Object(s.e)(t,e.path),i=e.children.some((function(e){return"group"===e.type?r(t,e):"page"===e.type&&Object(s.e)(t,e.path)}));return n||i}return!1}var o={name:"SidebarLinks",components:{SidebarGroup:i.default,SidebarLink:a.default},props:["items","depth","sidebarDepth","initialOpenGroupIndex"],data:function(){return{openGroupIndex:this.initialOpenGroupIndex||0}},watch:{$route:function(){this.refreshIndex()}},created:function(){this.refreshIndex()},methods:{refreshIndex:function(){var t=function(t,e){for(var n=0;n<e.length;n++){var i=e[n];if(r(t,i))return n}return-1}(this.$route,this.items);t>-1&&(this.openGroupIndex=t)},toggleGroup:function(t){this.openGroupIndex=t===this.openGroupIndex?-1:t},isActive:function(t){return Object(s.e)(this.$route,t.regularPath)}}},u=n(69),l=Object(u.a)(o,(function(){var t=this,e=t._self._c;return t.items.length?e("ul",{staticClass:"sidebar-links"},t._l(t.items,(function(n,i){return e("li",{key:i},["group"===n.type?e("SidebarGroup",{attrs:{item:n,open:i===t.openGroupIndex,collapsable:n.collapsable||n.collapsible,depth:t.depth},on:{toggle:function(e){return t.toggleGroup(i)}}}):e("SidebarLink",{attrs:{"sidebar-depth":t.sidebarDepth,item:n}})],1)})),0):t._e()}),[],!1,null,null,null);e.default=l.exports},475:function(t,e,n){"use strict";n.r(e);n(472),n(103);var i=n(455);function a(t,e,n,i,a){var s={props:{to:e,activeClass:"",exactActiveClass:""},class:{active:i,"sidebar-link":!0}};return a>2&&(s.style={"padding-left":a+"rem"}),t("RouterLink",s,n)}function s(t,e,n,r,o){var u=arguments.length>5&&void 0!==arguments[5]?arguments[5]:1;return!e||u>o?null:t("ul",{class:"sidebar-sub-headers"},e.map((function(e){var l=Object(i.e)(r,n+"#"+e.slug);return t("li",{class:"sidebar-sub-header"},[a(t,n+"#"+e.slug,e.title,l,e.level-1),s(t,e.children,n,r,o,u+1)])})))}var r={functional:!0,props:["item","sidebarDepth"],render:function(t,e){var n=e.parent,r=n.$page,o=(n.$site,n.$route),u=n.$themeConfig,l=n.$themeLocaleConfig,c=e.props,d=c.item,h=c.sidebarDepth,f=Object(i.e)(o,d.path),p="auto"===d.type?f||d.children.some((function(t){return Object(i.e)(o,d.basePath+"#"+t.slug)})):f,g="external"===d.type?function(t,e,n){return t("a",{attrs:{href:e,target:"_blank",rel:"noopener noreferrer"},class:{"sidebar-link":!0}},[n,t("OutboundLink")])}(t,d.path,d.title||d.path):a(t,d.path,d.title||d.path,p),v=[r.frontmatter.sidebarDepth,h,l.sidebarDepth,u.sidebarDepth,1].find((function(t){return void 0!==t})),m=l.displayAllHeaders||u.displayAllHeaders;return"auto"===d.type?[g,s(t,d.children,d.basePath,o,v)]:(p||m)&&d.headers&&!i.d.test(d.path)?[g,s(t,Object(i.c)(d.headers),d.path,o,v)]:g}},o=(n(473),n(69)),u=Object(o.a)(r,void 0,void 0,!1,null,null,null);e.default=u.exports},477:function(t,e,n){},478:function(t,e,n){"use strict";var i=n(3),a=n(498).trim;i({target:"String",proto:!0,forced:n(499)("trim")},{trim:function(){return a(this)}})},479:function(t,e,n){"use strict";t.exports="\t\n\v\f\r                　\u2028\u2029\ufeff"},480:function(t,e,n){},481:function(t,e,n){"use strict";n(463)},482:function(t,e,n){},483:function(t,e,n){"use strict";n(464)},484:function(t,e,n){var i=n(54),a=n(28),s=n(42);t.exports=function(t){return"string"==typeof t||!a(t)&&s(t)&&"[object String]"==i(t)}},485:function(t,e,n){"use strict";n(465)},486:function(t,e,n){},487:function(t,e,n){"use strict";n(466)},488:function(t,e,n){},489:function(t,e,n){"use strict";n.r(e);var i=n(455),a={name:"SidebarGroup",components:{DropdownTransition:n(468).default},props:["item","open","collapsable","depth"],beforeCreate:function(){this.$options.components.SidebarLinks=n(474).default},methods:{isActive:i.e}},s=(n(487),n(69)),r=Object(s.a)(a,(function(){var t=this,e=t._self._c;return e("section",{staticClass:"sidebar-group",class:[{collapsable:t.collapsable,"is-sub-group":0!==t.depth},"depth-".concat(t.depth)]},[t.item.path?e("RouterLink",{staticClass:"sidebar-heading clickable",class:{open:t.open,active:t.isActive(t.$route,t.item.path)},attrs:{to:t.item.path},nativeOn:{click:function(e){return t.$emit("toggle")}}},[e("span",[t._v(t._s(t.item.title))]),t._v(" "),t.collapsable?e("span",{staticClass:"arrow",class:t.open?"down":"right"}):t._e()]):e("p",{staticClass:"sidebar-heading",class:{open:t.open},on:{click:function(e){return t.$emit("toggle")}}},[e("span",[t._v(t._s(t.item.title))]),t._v(" "),t.collapsable?e("span",{staticClass:"arrow",class:t.open?"down":"right"}):t._e()]),t._v(" "),e("DropdownTransition",[t.open||!t.collapsable?e("SidebarLinks",{staticClass:"sidebar-group-items",attrs:{items:t.item.children,"sidebar-depth":t.item.sidebarDepth,"initial-open-group-index":t.item.initialOpenGroupIndex,depth:t.depth+1}}):t._e()],1)],1)}),[],!1,null,null,null);e.default=r.exports},491:function(t,e,n){"use strict";n.r(e);n(72),n(104);var i=n(462),a=n.n(i),s=n(455),r={name:"PageEdit",computed:{lastUpdated:function(){return this.$page.lastUpdated},lastUpdatedText:function(){return"string"==typeof this.$themeLocaleConfig.lastUpdated?this.$themeLocaleConfig.lastUpdated:"string"==typeof this.$site.themeConfig.lastUpdated?this.$site.themeConfig.lastUpdated:"Last Updated"},editLink:function(){var t=a()(this.$page.frontmatter.editLink)?this.$site.themeConfig.editLinks:this.$page.frontmatter.editLink,e=this.$site.themeConfig,n=e.repo,i=e.docsDir,s=void 0===i?"":i,r=e.docsBranch,o=void 0===r?"master":r,u=e.docsRepo,l=void 0===u?n:u;return t&&l&&this.$page.relativePath?this.createEditLink(n,l,s,o,this.$page.relativePath):null},editLinkText:function(){return this.$themeLocaleConfig.editLinkText||this.$site.themeConfig.editLinkText||"Edit this page"}},methods:{createEditLink:function(t,e,n,i,a){if(/bitbucket.org/.test(e))return e.replace(s.a,"")+"/src"+"/".concat(i,"/")+(n?n.replace(s.a,"")+"/":"")+a+"?mode=edit&spa=0&at=".concat(i,"&fileviewer=file-view-default");return/gitlab.com/.test(e)?e.replace(s.a,"")+"/-/edit"+"/".concat(i,"/")+(n?n.replace(s.a,"")+"/":"")+a:(s.i.test(e)?e:"https://github.com/".concat(e)).replace(s.a,"")+"/edit"+"/".concat(i,"/")+(n?n.replace(s.a,"")+"/":"")+a}}},o=(n(483),n(69)),u=Object(o.a)(r,(function(){var t=this,e=t._self._c;return e("footer",{staticClass:"page-edit"},[t.editLink?e("div",{staticClass:"edit-link"},[e("a",{attrs:{href:t.editLink,target:"_blank",rel:"noopener noreferrer"}},[t._v(t._s(t.editLinkText))]),t._v(" "),e("OutboundLink")],1):t._e(),t._v(" "),t.lastUpdated?e("div",{staticClass:"last-updated"},[e("span",{staticClass:"prefix"},[t._v(t._s(t.lastUpdatedText)+":")]),t._v(" "),e("span",{staticClass:"time"},[t._v(t._s(t.lastUpdated))])]):t._e()])}),[],!1,null,null,null);e.default=u.exports},492:function(t,e,n){"use strict";n.r(e);var i=n(455),a=n(484),s=n.n(a),r=n(462),o=n.n(r),u={name:"PageNav",props:["sidebarItems"],computed:{prev:function(){return c(l.PREV,this)},next:function(){return c(l.NEXT,this)}}};var l={NEXT:{resolveLink:function(t,e){return d(t,e,1)},getThemeLinkConfig:function(t){return t.nextLinks},getPageLinkConfig:function(t){return t.frontmatter.next}},PREV:{resolveLink:function(t,e){return d(t,e,-1)},getThemeLinkConfig:function(t){return t.prevLinks},getPageLinkConfig:function(t){return t.frontmatter.prev}}};function c(t,e){var n=e.$themeConfig,a=e.$page,r=e.$route,u=e.$site,l=e.sidebarItems,c=t.resolveLink,d=t.getThemeLinkConfig,h=t.getPageLinkConfig,f=d(n),p=h(a),g=o()(p)?f:p;return!1===g?void 0:s()(g)?Object(i.k)(u.pages,g,r.path):c(a,l)}function d(t,e,n){var i=[];!function t(e,n){for(var i=0,a=e.length;i<a;i++)"group"===e[i].type?t(e[i].children||[],n):n.push(e[i])}(e,i);for(var a=0;a<i.length;a++){var s=i[a];if("page"===s.type&&s.path===decodeURIComponent(t.path))return i[a+n]}}var h=u,f=(n(485),n(69)),p=Object(f.a)(h,(function(){var t=this,e=t._self._c;return t.prev||t.next?e("div",{staticClass:"page-nav"},[e("p",{staticClass:"inner"},[t.prev?e("span",{staticClass:"prev"},[t._v("\n      ←\n      "),"external"===t.prev.type?e("a",{staticClass:"prev",attrs:{href:t.prev.path,target:"_blank",rel:"noopener noreferrer"}},[t._v("\n        "+t._s(t.prev.title||t.prev.path)+"\n\n        "),e("OutboundLink")],1):e("RouterLink",{staticClass:"prev",attrs:{to:t.prev.path}},[t._v("\n        "+t._s(t.prev.title||t.prev.path)+"\n      ")])],1):t._e(),t._v(" "),t.next?e("span",{staticClass:"next"},["external"===t.next.type?e("a",{attrs:{href:t.next.path,target:"_blank",rel:"noopener noreferrer"}},[t._v("\n        "+t._s(t.next.title||t.next.path)+"\n\n        "),e("OutboundLink")],1):e("RouterLink",{attrs:{to:t.next.path}},[t._v("\n        "+t._s(t.next.title||t.next.path)+"\n      ")]),t._v("\n      →\n    ")],1):t._e()])]):t._e()}),[],!1,null,null,null);e.default=p.exports},493:function(t,e,n){"use strict";n.r(e);n(481);var i=n(69),a=Object(i.a)({},(function(){var t=this,e=t._self._c;return e("div",{staticClass:"sidebar-button",on:{click:function(e){return t.$emit("toggle-sidebar")}}},[e("svg",{staticClass:"icon",attrs:{xmlns:"http://www.w3.org/2000/svg","aria-hidden":"true",role:"img",viewBox:"0 0 448 512"}},[e("path",{attrs:{fill:"currentColor",d:"M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z"}})])])}),[],!1,null,null,null);e.default=a.exports},495:function(t,e,n){"use strict";n(477)},496:function(t,e,n){"use strict";var i=n(11),a=n(251),s=n(16),r=n(70),o=n(38),u=n(497),l=n(21),c=n(71),d=n(252);a("search",(function(t,e,n){return[function(e){var n=o(this),a=r(e)?void 0:c(e,t);return a?i(a,e,n):new RegExp(e)[t](l(n))},function(t){var i=s(this),a=l(t),r=n(e,i,a);if(r.done)return r.value;var o=i.lastIndex;u(o,0)||(i.lastIndex=0);var c=d(i,a);return u(i.lastIndex,o)||(i.lastIndex=o),null===c?-1:c.index}]}))},497:function(t,e,n){"use strict";t.exports=Object.is||function(t,e){return t===e?0!==t||1/t==1/e:t!=t&&e!=e}},498:function(t,e,n){"use strict";var i=n(2),a=n(38),s=n(21),r=n(479),o=i("".replace),u=RegExp("^["+r+"]+"),l=RegExp("(^|[^"+r+"])["+r+"]+$"),c=function(t){return function(e){var n=s(a(e));return 1&t&&(n=o(n,u,"")),2&t&&(n=o(n,l,"$1")),n}};t.exports={start:c(1),end:c(2),trim:c(3)}},499:function(t,e,n){"use strict";var i=n(106).PROPER,a=n(1),s=n(479);t.exports=function(t){return a((function(){return!!s[t]()||"​᠎"!=="​᠎"[t]()||i&&s[t].name!==t}))}},502:function(t,e,n){"use strict";var i,a=n(3),s=n(154),r=n(53).f,o=n(102),u=n(21),l=n(155),c=n(38),d=n(156),h=n(41),f=s("".slice),p=Math.min,g=d("endsWith");a({target:"String",proto:!0,forced:!!(h||g||(i=r(String.prototype,"endsWith"),!i||i.writable))&&!g},{endsWith:function(t){var e=u(c(this));l(t);var n=arguments.length>1?arguments[1]:void 0,i=e.length,a=void 0===n?i:p(o(n),i),s=u(t);return f(e,a-s.length,a)===s}})},503:function(t,e,n){"use strict";n(480)},504:function(t,e,n){"use strict";n(482)},505:function(t,e,n){"use strict";n(486)},506:function(t,e,n){"use strict";n(488)},518:function(t,e,n){"use strict";n.r(e);n(72),n(496),n(478),n(51),n(456),n(257),n(258),n(254),n(104),n(500),n(501),n(103),n(457),n(502);var i=n(260),a=n.n(i),s=function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,i=a()(e,"title","");return a()(e,"frontmatter.tags")&&(i+=" ".concat(e.frontmatter.tags.join(" "))),n&&(i+=" ".concat(n)),r(t,i)},r=function(t,e){var n=function(t){return t.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&")},i=new RegExp("[^\0-]"),a=t.split(/\s+/g).map((function(t){return t.trim()})).filter((function(t){return!!t}));if(i.test(t))return a.some((function(t){return e.toLowerCase().indexOf(t)>-1}));var s=t.endsWith(" ");return new RegExp(a.map((function(t,e){return a.length!==e+1||s?"(?=.*\\b".concat(n(t),"\\b)"):"(?=.*\\b".concat(n(t),")")})).join("")+".+","gi").test(e)},o={name:"SearchBox",data:function(){return{query:"",focused:!1,focusIndex:0,placeholder:void 0}},computed:{showSuggestions:function(){return this.focused&&this.suggestions&&this.suggestions.length},suggestions:function(){var t=this.query.trim().toLowerCase();if(t){for(var e=this.$site.pages,n=this.$site.themeConfig.searchMaxSuggestions||5,i=this.$localePath,a=[],r=0;r<e.length&&!(a.length>=n);r++){var o=e[r];if(this.getPageLocalePath(o)===i&&this.isSearchable(o))if(s(t,o))a.push(o);else if(o.headers)for(var u=0;u<o.headers.length&&!(a.length>=n);u++){var l=o.headers[u];l.title&&s(t,o,l.title)&&a.push(Object.assign({},o,{path:o.path+"#"+l.slug,header:l}))}}return a}},alignRight:function(){return(this.$site.themeConfig.nav||[]).length+(this.$site.repo?1:0)<=2}},mounted:function(){this.placeholder=this.$site.themeConfig.searchPlaceholder||"",document.addEventListener("keydown",this.onHotkey)},beforeDestroy:function(){document.removeEventListener("keydown",this.onHotkey)},methods:{getPageLocalePath:function(t){for(var e in this.$site.locales||{})if("/"!==e&&0===t.path.indexOf(e))return e;return"/"},isSearchable:function(t){var e=null;return null===e||(e=Array.isArray(e)?e:new Array(e)).filter((function(e){return t.path.match(e)})).length>0},onHotkey:function(t){t.srcElement===document.body&&["s","/"].includes(t.key)&&(this.$refs.input.focus(),t.preventDefault())},onUp:function(){this.showSuggestions&&(this.focusIndex>0?this.focusIndex--:this.focusIndex=this.suggestions.length-1)},onDown:function(){this.showSuggestions&&(this.focusIndex<this.suggestions.length-1?this.focusIndex++:this.focusIndex=0)},go:function(t){this.showSuggestions&&(this.$router.push(this.suggestions[t].path),this.query="",this.focusIndex=0)},focus:function(t){this.focusIndex=t},unfocus:function(){this.focusIndex=-1}}},u=(n(503),n(69)),l=Object(u.a)(o,(function(){var t=this,e=t._self._c;return e("div",{staticClass:"search-box"},[e("input",{ref:"input",class:{focused:t.focused},attrs:{"aria-label":"Search",placeholder:t.placeholder,autocomplete:"off",spellcheck:"false"},domProps:{value:t.query},on:{input:function(e){t.query=e.target.value},focus:function(e){t.focused=!0},blur:function(e){t.focused=!1},keyup:[function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.go(t.focusIndex)},function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"up",38,e.key,["Up","ArrowUp"])?null:t.onUp.apply(null,arguments)},function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"down",40,e.key,["Down","ArrowDown"])?null:t.onDown.apply(null,arguments)}]}}),t._v(" "),t.showSuggestions?e("ul",{staticClass:"suggestions",class:{"align-right":t.alignRight},on:{mouseleave:t.unfocus}},t._l(t.suggestions,(function(n,i){return e("li",{key:i,staticClass:"suggestion",class:{focused:i===t.focusIndex},on:{mousedown:function(e){return t.go(i)},mouseenter:function(e){return t.focus(i)}}},[e("a",{attrs:{href:n.path},on:{click:function(t){t.preventDefault()}}},[e("span",{staticClass:"page-title"},[t._v(t._s(n.title||n.path))]),t._v(" "),n.header?e("span",{staticClass:"header"},[t._v("> "+t._s(n.header.title))]):t._e()])])})),0):t._e()])}),[],!1,null,null,null).exports,c=n(493),d=n(490);function h(t,e){return t.ownerDocument.defaultView.getComputedStyle(t,null)[e]}var f={name:"Navbar",components:{SidebarButton:c.default,NavLinks:d.default,SearchBox:l,AlgoliaSearchBox:{}},data:function(){return{linksWrapMaxWidth:null}},computed:{algolia:function(){return this.$themeLocaleConfig.algolia||this.$site.themeConfig.algolia||{}},isAlgoliaSearch:function(){return this.algolia&&this.algolia.apiKey&&this.algolia.indexName}},mounted:function(){var t=this,e=parseInt(h(this.$el,"paddingLeft"))+parseInt(h(this.$el,"paddingRight")),n=function(){document.documentElement.clientWidth<719?t.linksWrapMaxWidth=null:t.linksWrapMaxWidth=t.$el.offsetWidth-e-(t.$refs.siteName&&t.$refs.siteName.offsetWidth||0)};n(),window.addEventListener("resize",n,!1)}},p=(n(504),Object(u.a)(f,(function(){var t=this,e=t._self._c;return e("header",{staticClass:"navbar"},[e("SidebarButton",{on:{"toggle-sidebar":function(e){return t.$emit("toggle-sidebar")}}}),t._v(" "),e("RouterLink",{staticClass:"home-link",attrs:{to:t.$localePath}},[t.$site.themeConfig.logo?e("img",{staticClass:"logo",attrs:{src:t.$withBase(t.$site.themeConfig.logo),alt:t.$siteTitle}}):t._e(),t._v(" "),t.$siteTitle?e("span",{ref:"siteName",staticClass:"site-name",class:{"can-hide":t.$site.themeConfig.logo}},[t._v(t._s(t.$siteTitle))]):t._e()]),t._v(" "),e("div",{staticClass:"links",style:t.linksWrapMaxWidth?{"max-width":t.linksWrapMaxWidth+"px"}:{}},[t.isAlgoliaSearch?e("AlgoliaSearchBox",{attrs:{options:t.algolia}}):!1!==t.$site.themeConfig.search&&!1!==t.$page.frontmatter.search?e("SearchBox"):t._e(),t._v(" "),e("NavLinks",{staticClass:"can-hide"})],1)],1)}),[],!1,null,null,null));e.default=p.exports},520:function(t,e,n){"use strict";n.r(e);var i={name:"Home",components:{NavLink:n(467).default},computed:{data:function(){return this.$page.frontmatter},actionLink:function(){return{link:this.data.actionLink,text:this.data.actionText}}}},a=(n(495),n(69)),s=Object(a.a)(i,(function(){var t=this,e=t._self._c;return e("main",{staticClass:"home",attrs:{"aria-labelledby":null!==t.data.heroText?"main-title":null}},[e("header",{staticClass:"hero"},[t.data.heroImage?e("img",{attrs:{src:t.$withBase(t.data.heroImage),alt:t.data.heroAlt||"hero"}}):t._e(),t._v(" "),null!==t.data.heroText?e("h1",{attrs:{id:"main-title"}},[t._v("\n      "+t._s(t.data.heroText||t.$title||"Hello")+"\n    ")]):t._e(),t._v(" "),null!==t.data.tagline?e("p",{staticClass:"description"},[t._v("\n      "+t._s(t.data.tagline||t.$description||"Welcome to your VuePress site")+"\n    ")]):t._e(),t._v(" "),t.data.actionText&&t.data.actionLink?e("p",{staticClass:"action"},[e("NavLink",{staticClass:"action-button",attrs:{item:t.actionLink}})],1):t._e()]),t._v(" "),t.data.features&&t.data.features.length?e("div",{staticClass:"features"},t._l(t.data.features,(function(n,i){return e("div",{key:i,staticClass:"feature"},[e("h2",[t._v(t._s(n.title))]),t._v(" "),e("p",[t._v(t._s(n.details))])])})),0):t._e(),t._v(" "),e("Content",{staticClass:"theme-default-content custom"}),t._v(" "),t.data.footer?e("div",{staticClass:"footer"},[t._v("\n    "+t._s(t.data.footer)+"\n  ")]):e("Content",{staticClass:"footer",attrs:{"slot-key":"footer"}})],1)}),[],!1,null,null,null);e.default=s.exports},521:function(t,e,n){"use strict";n.r(e);var i=n(491),a=n(492),s={components:{PageEdit:i.default,PageNav:a.default},props:["sidebarItems"]},r=(n(505),n(69)),o=Object(r.a)(s,(function(){var t=this._self._c;return t("main",{staticClass:"page"},[this._t("top"),this._v(" "),t("Content",{staticClass:"theme-default-content"}),this._v(" "),t("PageEdit"),this._v(" "),t("PageNav",this._b({},"PageNav",{sidebarItems:this.sidebarItems},!1)),this._v(" "),this._t("bottom")],2)}),[],!1,null,null,null);e.default=o.exports},522:function(t,e,n){"use strict";n.r(e);var i=n(474),a=n(490),s={name:"Sidebar",components:{SidebarLinks:i.default,NavLinks:a.default},props:["items"]},r=(n(506),n(69)),o=Object(r.a)(s,(function(){var t=this._self._c;return t("aside",{staticClass:"sidebar"},[t("NavLinks"),this._v(" "),this._t("top"),this._v(" "),t("SidebarLinks",{attrs:{depth:0,items:this.items}}),this._v(" "),this._t("bottom")],2)}),[],!1,null,null,null);e.default=o.exports},548:function(t,e,n){"use strict";n.r(e);var i=n(520),a=n(518),s=n(521),r=n(522),o=n(455),u={name:"Layout",components:{Home:i.default,Page:s.default,Sidebar:r.default,Navbar:a.default},data:function(){return{isSidebarOpen:!1}},computed:{shouldShowNavbar:function(){var t=this.$site.themeConfig;return!1!==this.$page.frontmatter.navbar&&!1!==t.navbar&&(this.$title||t.logo||t.repo||t.nav||this.$themeLocaleConfig.nav)},shouldShowSidebar:function(){var t=this.$page.frontmatter;return!t.home&&!1!==t.sidebar&&this.sidebarItems.length},sidebarItems:function(){return Object(o.l)(this.$page,this.$page.regularPath,this.$site,this.$localePath)},pageClasses:function(){var t=this.$page.frontmatter.pageClass;return[{"no-navbar":!this.shouldShowNavbar,"sidebar-open":this.isSidebarOpen,"no-sidebar":!this.shouldShowSidebar},t]}},mounted:function(){var t=this;this.$router.afterEach((function(){t.isSidebarOpen=!1}))},methods:{toggleSidebar:function(t){this.isSidebarOpen="boolean"==typeof t?t:!this.isSidebarOpen,this.$emit("toggle-sidebar",this.isSidebarOpen)},onTouchStart:function(t){this.touchStart={x:t.changedTouches[0].clientX,y:t.changedTouches[0].clientY}},onTouchEnd:function(t){var e=t.changedTouches[0].clientX-this.touchStart.x,n=t.changedTouches[0].clientY-this.touchStart.y;Math.abs(e)>Math.abs(n)&&Math.abs(e)>40&&(e>0&&this.touchStart.x<=80?this.toggleSidebar(!0):this.toggleSidebar(!1))}}},l=n(69),c=Object(l.a)(u,(function(){var t=this,e=t._self._c;return e("div",{staticClass:"theme-container",class:t.pageClasses,on:{touchstart:t.onTouchStart,touchend:t.onTouchEnd}},[t.shouldShowNavbar?e("Navbar",{on:{"toggle-sidebar":t.toggleSidebar}}):t._e(),t._v(" "),e("div",{staticClass:"sidebar-mask",on:{click:function(e){return t.toggleSidebar(!1)}}}),t._v(" "),e("Sidebar",{attrs:{items:t.sidebarItems},on:{"toggle-sidebar":t.toggleSidebar},scopedSlots:t._u([{key:"top",fn:function(){return[t._t("sidebar-top")]},proxy:!0},{key:"bottom",fn:function(){return[t._t("sidebar-bottom")]},proxy:!0}],null,!0)}),t._v(" "),t.$page.frontmatter.home?e("Home"):e("Page",{attrs:{"sidebar-items":t.sidebarItems},scopedSlots:t._u([{key:"top",fn:function(){return[t._t("page-top")]},proxy:!0},{key:"bottom",fn:function(){return[t._t("page-bottom")]},proxy:!0}],null,!0)})],1)}),[],!1,null,null,null);e.default=c.exports}}]);