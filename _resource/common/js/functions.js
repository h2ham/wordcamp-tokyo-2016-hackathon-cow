'use strict';

var HW = {};
var hw;

HW = function() {
  this.init();
};

(function($, window, document, undefined) {

  HW.prototype = {
    /**
     * 初期設定
     */
    init: function() {
      var base = this;
      var $window = $(window);

      // スクロール位置の保時
      base.scrollTop = 0;

      // トップへ戻るボタン
      base.$topBack = $('.pagetop');

      // スムーススクロール実行
      base.smoothScroll('.js-goto-pagetop', {forthTop: true});
      base.smoothScroll('a[href^="#"]');

      base.breakpointClassSwitch();

      $(document).on('click', '.js-nav-button', function() {
        $('body').toggleClass('nav-is-show');
      });

      // スクロール時のイベント
      $window.on('scroll', function() {
        if (!base.isSPSize()) {
        }
      });

      // リサイズ時に動くイベント
      $window.on('resize', $.throttle(250, function() {
      }));

      // window on load イベント
      $window.on('load', function() {
        base.windowOnloadInit();
      });
    },

    /**
     * Window on load設定
     */
    windowOnloadInit: function() {
      $('body').addClass('loaded');
    },

    /**
     * スムーススクロール イベントセット
     */
    smoothScroll: function(selector, options) {
      var base = this;
      $(selector).on('click.smoothScroll', function(e) {
        e.preventDefault();
        var elmHash = $(this).attr('href');
        if (elmHash === '#') { return; }
        base.scrollEffect(elmHash, options);
      });
    },

    /**
     * スムーススクロールエフェクト本体
     */
    scrollEffect: function(elmHash, options) {
      var c = $.extend({
        speed: 650,
        easing: 'swing',
        adjust: 0,
        forthTop: false
      }, options);
      if (!elmHash || elmHash === '#') { return; }
      var targetOffset;
      targetOffset = (c.forthTop) ? 0 : $(elmHash).offset().top - c.adjust;
      $('html,body').animate({scrollTop: targetOffset}, c.speed, c.easing);
    },

    breakpointClassSwitch: function() {
      var base = this;
      if (base.isSPSize()) {
        $('body').removeClass('isPC').addClass('isSP');
      } else {
        $('body').removeClass('isSP').addClass('isPC');
      }
    },

    /**
     * Is SP Size
     */
    isSPSize: function() {
      return (window.matchMedia('(max-width: 767px)').matches) ? true : false ;
    }
  };

})(jQuery, window, document);

hw = new HW();
