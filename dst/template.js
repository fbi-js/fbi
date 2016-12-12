
require('source-map-support').install();
    
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = require('./helpers/utils.js');
var copy = _interopDefault(require('./helpers/copy.js'));

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a);}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d);}function d(e){c(e,1);}c();})}

class Template {

  init(name, dst, opts) {return __async(function*(){
    if (!name) {
      return false
    }
    let ret = false;
    const src = _.join(opts.data.templates, name);
    const has = _.existSync(src);

    if (has) {
      copy(src, dst, opts.TEMPLATE_INIT_IGNORE);
      return true
    }
    return ret
  }())}

  all(opts) {return __async(function*(){
    const _exist = yield _.exist(opts.data.templates);
    let ret = [];
    if (_exist) {
      let templates = yield _.readDir(opts.data.templates);
      templates = templates.filter(_.isTemplate);
      templates.map(item => {
        try {
          const config = require(_.join(opts.data.templates, item, opts.paths.config));
          const pkg = require(_.join(opts.data.templates, item, 'package.json'));
          ret.push({
            name: item,
            desc: config.templateDescription || '',
            version: pkg.version
          });
        } catch (err) {}
      });
    }
    return ret
  }())}
}

module.exports = Template;
// this is outro
// this is footer
//# sourceMappingURL=template.js.map
