function geti18n() {
  return {
    t: msg => {
      return msg;
    },
    d: msg => {
      return msg;
    },
    tc: msg => {
      return msg
    }
  };
}

function getLanguage() {
  return 'zh';
}
function initi18n(){}
var lang = {zh:{}}

export { geti18n, getLanguage, lang, initi18n };
