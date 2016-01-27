(function (jquery) {
    var context = {};

    function initContainer(options) {
        context.$container = options.$container;
    }

    function initSize(options) {
        context.stripCount = options.stripCount;
        context.containerWidth = options.width.replace('px', '');
        context.containerHeight = options.height.replace('px', '');
        context.stripWidth = context.containerWidth / context.stripCount;
        context.stripHeight = context.containerHeight;
    }

    function initImgs(options) {
        context.imgSrcs = [];
        context.$container.children().each(function (index, element) {
            var $element = $(element);
            $element.css('display', 'none');
            context.imgSrcs.push($element.attr('src'));
        });

        context._imgCurrentIndex = 0;
        context.nextImgSrc = function () {
            if (++context._imgCurrentIndex > context.imgSrcs.length - 1) {
                context._imgCurrentIndex = 0;
            }

            return context.imgSrcs[context._imgCurrentIndex];
        };
    }

    function initStrips(options) {
        context.$strips = [];
        for (var i = 0; i < context.stripCount; i++) {
            var $strip = jquery('<div></div>');
            $strip.css('background-size', context.containerWidth + 'px ' + context.containerHeight + 'px');
            $strip.css('background-position-x', i * context.stripWidth * -1 + 'px');
            $strip.css('background-position-y', '0px');
            $strip.css('background-repeat', 'no-repeat');
            $strip.css('position', 'absolute');
            $strip.css('left', (i * context.stripWidth) + 'px');
            $strip.css('top', context.stripHeight + 'px');
            $strip.css('width', context.stripWidth + 'px');
            $strip.css('height', context.stripHeight + 'px');
            $strip.css('display', 'block');
            $strip.css('overflow', 'hidden');
            $strip.css('zoom', '1');
            context.$strips.push($strip);
            context.$container.append($strip);
        }
    }

    function initDefaultBackground() {
        context.$container.css('background-image', 'url(' + context.imgSrcs[0] + ')');
        context.$container.css('background-size', context.containerWidth + 'px ' + context.containerHeight + 'px');
    }

    function initTime(options) {
        context.interval = options.interval;
        context.baseDelay = options.baseDelay;
        context.delayIncrement = options.delayIncrement;
    }

    function init(options) {
        var initFuncs = [initContainer, initSize, initImgs, initStrips, initDefaultBackground, initTime];
//        for (var i = 0, f; f = initFuncs[i++];) {
//            f(options);
//        }
        jquery.each(initFuncs,function(i,f){
            f(options);
        });
    }

    var baseEffect = {
        __nextEffect: null,
        prepare: function (context) {
            throw new Error('请重写prepare方法');
        },
        transform: function (context) {
            throw new Error('请重写transform方法');
        },
        execute: function (context) {
            this.prepare(context);
            return this.transform(context);
        },
        setNext: function (effect) {
            return this.__nextEffect = effect;
        },
        next: function () {
            return this.__nextEffect;
        }
    };

    var downToUpEffect = (function (baseEffect) {
        var effect = jquery.extend({}, baseEffect);
        var imgSrc;

        effect.prepare = function (context) {
            imgSrc = context.nextImgSrc();
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                $strip.css('background-image', 'url(' + imgSrc + ')');
                $strip.css('top', context.stripHeight + 'px');
            }
        };

        effect.transform = function (context) {
            var dfd = jquery.Deferred();
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                if (i == context.$strips.length - 1) {
                    $strip.animate({top: '0px'}, context.baseDelay + i * context.delayIncrement, function () {
                        context.$container.css('background-image', 'url(' + imgSrc + ')');
                        dfd.resolve();
                    });
                } else {
                    $strip.animate({top: '0px'}, context.baseDelay + i * context.delayIncrement);
                }
            }

            return dfd.promise();
        };

        return effect;
    })(baseEffect);

    var upToDownEffect = (function (baseEffect) {
        var effect = jquery.extend({}, baseEffect);
        var imgSrc;

        effect.prepare = function (context) {
            imgSrc = context.nextImgSrc();
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                $strip.css('background-image', 'url(' + imgSrc + ')');
                $strip.css('top', '-' + context.stripHeight + 'px');
            }
        };

        effect.transform = function (context) {
            var dfd = jquery.Deferred();
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                if (i == context.$strips.length - 1) {
                    $strip.animate({top: '0px'}, context.baseDelay + i * context.delayIncrement, function () {
                        context.$container.css('background-image', 'url(' + imgSrc + ')');
                        dfd.resolve();
                    });
                } else {
                    $strip.animate({top: '0px'}, context.baseDelay + i * context.delayIncrement);
                }
            }

            return dfd.promise();
        };

        return effect;
    })(baseEffect);

    var leftToRightEffect = (function (baseEffect) {
        var effect = jquery.extend({}, baseEffect);
        var imgSrc;

        effect.prepare = function (context) {
            imgSrc = context.nextImgSrc();
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                $strip.css('background-image', 'url(' + imgSrc + ')');
                $strip.css('top', '0px');
                $strip.css('left', '-' + (context.$strips.length - i) * context.stripWidth + 'px');
            }
        };

        effect.transform = function (context) {
            var dfd = jquery.Deferred();
            for (var i = context.$strips.length - 1, $strip; $strip = context.$strips[i]; i--) {
                if (i == 0) {
                    $strip.animate({left: i * context.stripWidth + 'px'}, context.baseDelay + ((context.$strips.length - i) * context.delayIncrement), function () {
                        context.$container.css('background-image', 'url(' + imgSrc + ')');
                        dfd.resolve();
                    });
                } else {
                    $strip.animate({left: i * context.stripWidth + 'px'}, context.baseDelay + ((context.$strips.length - i) * context.delayIncrement));
                }
            }

            return dfd.promise();
        };

        return effect;
    })(baseEffect);

    var rightToLeftEffect = (function (baseEffect) {
        var effect = jquery.extend({}, baseEffect);
        var imgSrc;

        effect.prepare = function (context) {
            imgSrc = context.nextImgSrc();
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                $strip.css('background-image', 'url(' + imgSrc + ')');
                $strip.css('top', '0px')
                var stripLeft = context.stripWidth * context.$strips.length + i * context.stripWidth;
                $strip.css('left', stripLeft + 'px');
            }
        };

        effect.transform = function (context) {
            var dfd = jquery.Deferred();
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                if (i == context.$strips.length - 1) {
                    $strip.animate({left: i * context.stripWidth + 'px'}, context.baseDelay + i * context.delayIncrement, function () {
                        context.$container.css('background-image', 'url(' + imgSrc + ')');
                        dfd.resolve();
                    });
                } else {
                    $strip.animate({left: i * context.stripWidth + 'px'}, context.baseDelay + i * context.delayIncrement);
                }
            }

            return dfd.promise();
        };

        return effect;
    })(baseEffect);

    var upDownCrossInEffect = (function (baseEffect) {
        var effect = jquery.extend({}, baseEffect);
        var imgSrc;

        effect.prepare = function (context) {
            imgSrc = context.nextImgSrc();
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                $strip.css('background-image', 'url(' + imgSrc + ')');

                if (i % 2 == 0) {
                    $strip.css('top', context.stripHeight + 'px');
                } else {
                    $strip.css('top', '-' + context.stripHeight + 'px');
                }

                var stripLeft = i * context.stripWidth;
                $strip.css('left', stripLeft + 'px');
            }
        };

        effect.transform = function (context) {
            var dfd = jquery.Deferred();
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                if (i % 2 == 0) {
                    if (i == context.$strips.length - 1) {
                        $strip.animate({top: '0px'}, context.baseDelay + i * context.delayIncrement, function () {
                            context.$container.css('background-image', 'url(' + imgSrc + ')');
                            dfd.resolve();
                        });
                    } else {
                        $strip.animate({top: '0px'}, context.baseDelay + i * context.delayIncrement);
                    }
                } else {
                    if (i == context.$strips.length - 1) {
                        $strip.animate({top: '0px'}, context.baseDelay + i * context.delayIncrement, function () {
                            context.$container.css('background-image', 'url(' + imgSrc + ')');
                            dfd.resolve();
                        });
                    } else {
                        $strip.animate({top: '0px'}, context.baseDelay + i * context.delayIncrement);
                    }
                }
            }

            return dfd.promise();
        };

        return effect;
    })(baseEffect);

    var upDownCrossOutffect = (function (baseEffect) {
        var effect = jquery.extend({}, baseEffect);
        var imgSrc;

        effect.prepare = function (context) {
            imgSrc = context.nextImgSrc();
            context.$container.css('background-image', 'url(' + imgSrc + ')');
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                $strip.css('top', '0px');
                var stripLeft = i * context.stripWidth;
                $strip.css('left', stripLeft + 'px');
            }
        };

        effect.transform = function (context) {
            var dfd = jquery.Deferred();
            for (var i = 0, $strip; $strip = context.$strips[i]; i++) {
                if (i % 2 == 0) {
                    if (i == context.$strips.length - 1) {
                        $strip.animate({top: context.stripHeight + 'px'}, context.baseDelay + i * context.delayIncrement, function () {
                            dfd.resolve();
                        });
                    } else {
                        $strip.animate({top: context.stripHeight + 'px'}, context.baseDelay + i * context.delayIncrement);
                    }
                } else {
                    if (i == context.$strips.length - 1) {
                        $strip.animate({top: '-' + context.stripHeight + 'px'}, context.baseDelay + i * context.delayIncrement, function () {
                            dfd.resolve();
                        });
                    } else {
                        $strip.animate({top: '-' + context.stripHeight + 'px'}, context.baseDelay + i * context.delayIncrement);
                    }
                }
            }

            return dfd.promise();
        };

        return effect;
    })(baseEffect);

    function executeEffect(effect, context) {
        setTimeout(
            function () {
                effect.execute(context).done(
                    function () {
                        executeEffect(effect.next(), context);
                    });
            }, context.interval * 1000);
    }

    function setDefaultOptions(options, $container) {
        options = options || {};
        options.$container = $container;
        options.width = options.width || '800px';
        options.height = options.height || '600px';
        options.stripCount = options.stripCount || 10;
        options.interval = options.interval || 2;
        options.baseDelay = options.baseDelay || 400;
        options.delayIncrement = options.delayIncrement || 80;

        return options;
    }

    jquery.fn.curtain = function (options) {

        init(setDefaultOptions(options, this));

        downToUpEffect
            .setNext(upToDownEffect)
            .setNext(leftToRightEffect)
            .setNext(rightToLeftEffect)
            .setNext(upDownCrossInEffect)
            .setNext(upDownCrossOutffect)
            .setNext(downToUpEffect);

        executeEffect(downToUpEffect, context);

    }
})(jQuery);