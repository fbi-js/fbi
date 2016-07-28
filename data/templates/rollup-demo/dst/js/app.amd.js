define(function () { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Modal = function () {
    function Modal(name) {
      classCallCheck(this, Modal);

      this.name = name;
    }

    createClass(Modal, [{
      key: "init",
      value: function init() {
        console.log(this.name);
      }
    }]);
    return Modal;
  }();

  var app = (function () {
    var txt, modal;
    return Promise.resolve().then(function () {

      console.log('app');

      return red();
    }).then(function (_resp) {
      txt = _resp;

      console.log(txt);

      modal = new Modal();

      modal.init();
    });
  });

  function red() {
    return new Promise(function (resolve, reject) {
      resolve('red');
    });
  }

  return app;

});