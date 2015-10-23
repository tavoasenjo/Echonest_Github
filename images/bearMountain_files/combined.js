(function() {
    "use strict";
    function FastClick(layer, options) {
        var oldOnClick;
        options = options || {};
        this.trackingClick = false;
        this.trackingClickStart = 0;
        this.targetElement = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchIdentifier = 0;
        this.touchBoundary = options.touchBoundary || 10;
        this.layer = layer;
        this.tapDelay = options.tapDelay || 200;
        this.tapTimeout = options.tapTimeout || 700;
        if (FastClick.notNeeded(layer)) {
            return;
        }
        function bind(method, context) {
            return function() {
                return method.apply(context, arguments);
            };
        }
        var methods = [ "onMouse", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd", "onTouchCancel" ];
        var context = this;
        for (var i = 0, l = methods.length; i < l; i++) {
            context[methods[i]] = bind(context[methods[i]], context);
        }
        if (deviceIsAndroid) {
            layer.addEventListener("mouseover", this.onMouse, true);
            layer.addEventListener("mousedown", this.onMouse, true);
            layer.addEventListener("mouseup", this.onMouse, true);
        }
        layer.addEventListener("click", this.onClick, true);
        layer.addEventListener("touchstart", this.onTouchStart, false);
        layer.addEventListener("touchmove", this.onTouchMove, false);
        layer.addEventListener("touchend", this.onTouchEnd, false);
        layer.addEventListener("touchcancel", this.onTouchCancel, false);
        if (!Event.prototype.stopImmediatePropagation) {
            layer.removeEventListener = function(type, callback, capture) {
                var rmv = Node.prototype.removeEventListener;
                if (type === "click") {
                    rmv.call(layer, type, callback.hijacked || callback, capture);
                } else {
                    rmv.call(layer, type, callback, capture);
                }
            };
            layer.addEventListener = function(type, callback, capture) {
                var adv = Node.prototype.addEventListener;
                if (type === "click") {
                    adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                        if (!event.propagationStopped) {
                            callback(event);
                        }
                    }), capture);
                } else {
                    adv.call(layer, type, callback, capture);
                }
            };
        }
        if (typeof layer.onclick === "function") {
            oldOnClick = layer.onclick;
            layer.addEventListener("click", function(event) {
                oldOnClick(event);
            }, false);
            layer.onclick = null;
        }
    }
    var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;
    var deviceIsAndroid = navigator.userAgent.indexOf("Android") > 0 && !deviceIsWindowsPhone;
    var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;
    var deviceIsIOS4 = deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);
    var deviceIsIOSWithBadTarget = deviceIsIOS && /OS [6-7]_\d/.test(navigator.userAgent);
    var deviceIsBlackBerry10 = navigator.userAgent.indexOf("BB10") > 0;
    FastClick.prototype.needsClick = function(target) {
        switch (target.nodeName.toLowerCase()) {
          case "button":
          case "select":
          case "textarea":
            if (target.disabled) {
                return true;
            }
            break;

          case "input":
            if (deviceIsIOS && target.type === "file" || target.disabled) {
                return true;
            }
            break;

          case "label":
          case "iframe":
          case "video":
            return true;
        }
        return /\bneedsclick\b/.test(target.className);
    };
    FastClick.prototype.needsFocus = function(target) {
        switch (target.nodeName.toLowerCase()) {
          case "textarea":
            return true;

          case "select":
            return !deviceIsAndroid;

          case "input":
            switch (target.type) {
              case "button":
              case "checkbox":
              case "file":
              case "image":
              case "radio":
              case "submit":
                return false;
            }
            return !target.disabled && !target.readOnly;

          default:
            return /\bneedsfocus\b/.test(target.className);
        }
    };
    FastClick.prototype.sendClick = function(targetElement, event) {
        var clickEvent, touch;
        if (document.activeElement && document.activeElement !== targetElement) {
            document.activeElement.blur();
        }
        touch = event.changedTouches[0];
        clickEvent = document.createEvent("MouseEvents");
        clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        clickEvent.forwardedTouchEvent = true;
        targetElement.dispatchEvent(clickEvent);
    };
    FastClick.prototype.determineEventType = function(targetElement) {
        if (deviceIsAndroid && targetElement.tagName.toLowerCase() === "select") {
            return "mousedown";
        }
        return "click";
    };
    FastClick.prototype.focus = function(targetElement) {
        var length;
        if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf("date") !== 0 && targetElement.type !== "time" && targetElement.type !== "month") {
            length = targetElement.value.length;
            targetElement.setSelectionRange(length, length);
        } else {
            targetElement.focus();
        }
    };
    FastClick.prototype.updateScrollParent = function(targetElement) {
        var scrollParent, parentElement;
        scrollParent = targetElement.fastClickScrollParent;
        if (!scrollParent || !scrollParent.contains(targetElement)) {
            parentElement = targetElement;
            do {
                if (parentElement.scrollHeight > parentElement.offsetHeight) {
                    scrollParent = parentElement;
                    targetElement.fastClickScrollParent = parentElement;
                    break;
                }
                parentElement = parentElement.parentElement;
            } while (parentElement);
        }
        if (scrollParent) {
            scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
        }
    };
    FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
        if (eventTarget.nodeType === Node.TEXT_NODE) {
            return eventTarget.parentNode;
        }
        return eventTarget;
    };
    FastClick.prototype.onTouchStart = function(event) {
        var targetElement, touch, selection;
        if (event.targetTouches.length > 1) {
            return true;
        }
        targetElement = this.getTargetElementFromEventTarget(event.target);
        touch = event.targetTouches[0];
        if (deviceIsIOS) {
            selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                return true;
            }
            if (!deviceIsIOS4) {
                if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                    event.preventDefault();
                    return false;
                }
                this.lastTouchIdentifier = touch.identifier;
                this.updateScrollParent(targetElement);
            }
        }
        this.trackingClick = true;
        this.trackingClickStart = event.timeStamp;
        this.targetElement = targetElement;
        this.touchStartX = touch.pageX;
        this.touchStartY = touch.pageY;
        if (event.timeStamp - this.lastClickTime < this.tapDelay) {
            event.preventDefault();
        }
        return true;
    };
    FastClick.prototype.touchHasMoved = function(event) {
        var touch = event.changedTouches[0], boundary = this.touchBoundary;
        if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
            return true;
        }
        return false;
    };
    FastClick.prototype.onTouchMove = function(event) {
        if (!this.trackingClick) {
            return true;
        }
        if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
            this.trackingClick = false;
            this.targetElement = null;
        }
        return true;
    };
    FastClick.prototype.findControl = function(labelElement) {
        if (labelElement.control !== undefined) {
            return labelElement.control;
        }
        if (labelElement.htmlFor) {
            return document.getElementById(labelElement.htmlFor);
        }
        return labelElement.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
    };
    FastClick.prototype.onTouchEnd = function(event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
        if (!this.trackingClick) {
            return true;
        }
        if (event.timeStamp - this.lastClickTime < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }
        if (event.timeStamp - this.trackingClickStart > this.tapTimeout) {
            return true;
        }
        this.cancelNextClick = false;
        this.lastClickTime = event.timeStamp;
        trackingClickStart = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;
        if (deviceIsIOSWithBadTarget) {
            touch = event.changedTouches[0];
            targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
            targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }
        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === "label") {
            forElement = this.findControl(targetElement);
            if (forElement) {
                this.focus(targetElement);
                if (deviceIsAndroid) {
                    return false;
                }
                targetElement = forElement;
            }
        } else if (this.needsFocus(targetElement)) {
            if (event.timeStamp - trackingClickStart > 100 || deviceIsIOS && window.top !== window && targetTagName === "input") {
                this.targetElement = null;
                return false;
            }
            this.focus(targetElement);
            this.sendClick(targetElement, event);
            if (!deviceIsIOS || targetTagName !== "select") {
                this.targetElement = null;
                event.preventDefault();
            }
            return false;
        }
        if (deviceIsIOS && !deviceIsIOS4) {
            scrollParent = targetElement.fastClickScrollParent;
            if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                return true;
            }
        }
        if (!this.needsClick(targetElement)) {
            event.preventDefault();
            this.sendClick(targetElement, event);
        }
        return false;
    };
    FastClick.prototype.onTouchCancel = function() {
        this.trackingClick = false;
        this.targetElement = null;
    };
    FastClick.prototype.onMouse = function(event) {
        if (!this.targetElement) {
            return true;
        }
        if (event.forwardedTouchEvent) {
            return true;
        }
        if (!event.cancelable) {
            return true;
        }
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            } else {
                event.propagationStopped = true;
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
        return true;
    };
    FastClick.prototype.onClick = function(event) {
        var permitted;
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }
        if (event.target.type === "submit" && event.detail === 0) {
            return true;
        }
        permitted = this.onMouse(event);
        if (!permitted) {
            this.targetElement = null;
        }
        return permitted;
    };
    FastClick.prototype.destroy = function() {
        var layer = this.layer;
        if (deviceIsAndroid) {
            layer.removeEventListener("mouseover", this.onMouse, true);
            layer.removeEventListener("mousedown", this.onMouse, true);
            layer.removeEventListener("mouseup", this.onMouse, true);
        }
        layer.removeEventListener("click", this.onClick, true);
        layer.removeEventListener("touchstart", this.onTouchStart, false);
        layer.removeEventListener("touchmove", this.onTouchMove, false);
        layer.removeEventListener("touchend", this.onTouchEnd, false);
        layer.removeEventListener("touchcancel", this.onTouchCancel, false);
    };
    FastClick.notNeeded = function(layer) {
        var metaViewport;
        var chromeVersion;
        var blackberryVersion;
        var firefoxVersion;
        if (typeof window.ontouchstart === "undefined") {
            return true;
        }
        chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [ , 0 ])[1];
        if (chromeVersion) {
            if (deviceIsAndroid) {
                metaViewport = document.querySelector("meta[name=viewport]");
                if (metaViewport) {
                    if (metaViewport.content.indexOf("user-scalable=no") !== -1) {
                        return true;
                    }
                    if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            } else {
                return true;
            }
        }
        if (deviceIsBlackBerry10) {
            blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);
            if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                metaViewport = document.querySelector("meta[name=viewport]");
                if (metaViewport) {
                    if (metaViewport.content.indexOf("user-scalable=no") !== -1) {
                        return true;
                    }
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }
        if (layer.style.msTouchAction === "none" || layer.style.touchAction === "manipulation") {
            return true;
        }
        firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [ , 0 ])[1];
        if (firefoxVersion >= 27) {
            metaViewport = document.querySelector("meta[name=viewport]");
            if (metaViewport && (metaViewport.content.indexOf("user-scalable=no") !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                return true;
            }
        }
        if (layer.style.touchAction === "none" || layer.style.touchAction === "manipulation") {
            return true;
        }
        return false;
    };
    FastClick.attach = function(layer, options) {
        return new FastClick(layer, options);
    };
    if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
        define(function() {
            return FastClick;
        });
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = FastClick.attach;
        module.exports.FastClick = FastClick;
    } else {
        window.FastClick = FastClick;
    }
})();

(function($) {
    var _previousResizeWidth = -1, _updateTimeout = -1;
    var _parse = function(value) {
        return parseFloat(value) || 0;
    };
    var _rows = function(elements) {
        var tolerance = 1, $elements = $(elements), lastTop = null, rows = [];
        $elements.each(function() {
            var $that = $(this), top = $that.offset().top - _parse($that.css("margin-top")), lastRow = rows.length > 0 ? rows[rows.length - 1] : null;
            if (lastRow === null) {
                rows.push($that);
            } else {
                if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
                    rows[rows.length - 1] = lastRow.add($that);
                } else {
                    rows.push($that);
                }
            }
            lastTop = top;
        });
        return rows;
    };
    var _parseOptions = function(options) {
        var opts = {
            byRow: true,
            property: "height",
            target: null,
            remove: false
        };
        if (typeof options === "object") {
            return $.extend(opts, options);
        }
        if (typeof options === "boolean") {
            opts.byRow = options;
        } else if (options === "remove") {
            opts.remove = true;
        }
        return opts;
    };
    var matchHeight = $.fn.matchHeight = function(options) {
        var opts = _parseOptions(options);
        if (opts.remove) {
            var that = this;
            this.css(opts.property, "");
            $.each(matchHeight._groups, function(key, group) {
                group.elements = group.elements.not(that);
            });
            return this;
        }
        if (this.length <= 1 && !opts.target) {
            return this;
        }
        matchHeight._groups.push({
            elements: this,
            options: opts
        });
        matchHeight._apply(this, opts);
        return this;
    };
    matchHeight._groups = [];
    matchHeight._throttle = 80;
    matchHeight._maintainScroll = false;
    matchHeight._beforeUpdate = null;
    matchHeight._afterUpdate = null;
    matchHeight._apply = function(elements, options) {
        var opts = _parseOptions(options), $elements = $(elements), rows = [ $elements ];
        var scrollTop = $(window).scrollTop(), htmlHeight = $("html").outerHeight(true);
        var $hiddenParents = $elements.parents().filter(":hidden");
        $hiddenParents.each(function() {
            var $that = $(this);
            $that.data("style-cache", $that.attr("style"));
        });
        $hiddenParents.css("display", "block");
        if (opts.byRow && !opts.target) {
            $elements.each(function() {
                var $that = $(this), display = $that.css("display") === "inline-block" ? "inline-block" : "block";
                $that.data("style-cache", $that.attr("style"));
                $that.css({
                    display: display,
                    "padding-top": "0",
                    "padding-bottom": "0",
                    "margin-top": "0",
                    "margin-bottom": "0",
                    "border-top-width": "0",
                    "border-bottom-width": "0",
                    height: "100px"
                });
            });
            rows = _rows($elements);
            $elements.each(function() {
                var $that = $(this);
                $that.attr("style", $that.data("style-cache") || "");
            });
        }
        $.each(rows, function(key, row) {
            var $row = $(row), targetHeight = 0;
            if (!opts.target) {
                if (opts.byRow && $row.length <= 1) {
                    $row.css(opts.property, "");
                    return;
                }
                $row.each(function() {
                    var $that = $(this), display = $that.css("display") === "inline-block" ? "inline-block" : "block";
                    var css = {
                        display: display
                    };
                    css[opts.property] = "";
                    $that.css(css);
                    if ($that.outerHeight(false) > targetHeight) {
                        targetHeight = $that.outerHeight(false);
                    }
                    $that.css("display", "");
                });
            } else {
                targetHeight = opts.target.outerHeight(false);
            }
            $row.each(function() {
                var $that = $(this), verticalPadding = 0;
                if (opts.target && $that.is(opts.target)) {
                    return;
                }
                if ($that.css("box-sizing") !== "border-box") {
                    verticalPadding += _parse($that.css("border-top-width")) + _parse($that.css("border-bottom-width"));
                    verticalPadding += _parse($that.css("padding-top")) + _parse($that.css("padding-bottom"));
                }
                $that.css(opts.property, targetHeight - verticalPadding);
            });
            console.log("apply finished");
        });
        $hiddenParents.each(function() {
            var $that = $(this);
            $that.attr("style", $that.data("style-cache") || null);
        });
        if (matchHeight._maintainScroll) {
            $(window).scrollTop(scrollTop / htmlHeight * $("html").outerHeight(true));
        }
        return this;
    };
    matchHeight._applyDataApi = function() {
        var groups = {};
        $("[data-match-height], [data-mh]").each(function() {
            var $this = $(this), groupId = $this.attr("data-mh") || $this.attr("data-match-height");
            if (groupId in groups) {
                groups[groupId] = groups[groupId].add($this);
            } else {
                groups[groupId] = $this;
            }
        });
        $.each(groups, function() {
            this.matchHeight(true);
        });
    };
    var _update = function(event) {
        if (matchHeight._beforeUpdate) {
            matchHeight._beforeUpdate(event, matchHeight._groups);
        }
        $.each(matchHeight._groups, function() {
            matchHeight._apply(this.elements, this.options);
        });
        if (matchHeight._afterUpdate) {
            matchHeight._afterUpdate(event, matchHeight._groups);
        }
    };
    matchHeight._update = function(throttle, event) {
        if (event && event.type === "resize") {
            var windowWidth = $(window).width();
            if (windowWidth === _previousResizeWidth) {
                return;
            }
            _previousResizeWidth = windowWidth;
        }
        if (!throttle) {
            _update(event);
        } else if (_updateTimeout === -1) {
            _updateTimeout = setTimeout(function() {
                _update(event);
                _updateTimeout = -1;
            }, matchHeight._throttle);
        }
        console.log("updated");
    };
    $(matchHeight._applyDataApi);
    $(window).bind("load", function(event) {
        matchHeight._update(false, event);
    });
    $(window).bind("resize orientationchange", function(event) {
        matchHeight._update(true, event);
    });
})(jQuery);

!function(a) {
    "use strict";
    "function" == typeof define && define.amd ? define([ "jquery" ], a) : "undefined" != typeof exports ? module.exports = a(require("jquery")) : a(jQuery);
}(function(a) {
    "use strict";
    var b = window.Slick || {};
    b = function() {
        function c(c, d) {
            var f, g, h, e = this;
            if (e.defaults = {
                accessibility: !0,
                adaptiveHeight: !1,
                appendArrows: a(c),
                appendDots: a(c),
                arrows: !0,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="previous">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="next">Next</button>',
                autoplay: !1,
                autoplaySpeed: 3e3,
                centerMode: !1,
                centerPadding: "50px",
                cssEase: "ease",
                customPaging: function(a, b) {
                    return '<button type="button" data-role="none">' + (b + 1) + "</button>";
                },
                dots: !1,
                dotsClass: "slick-dots",
                draggable: !0,
                easing: "linear",
                edgeFriction: .35,
                fade: !1,
                focusOnSelect: !1,
                infinite: !0,
                initialSlide: 0,
                lazyLoad: "ondemand",
                mobileFirst: !1,
                pauseOnHover: !0,
                pauseOnDotsHover: !1,
                respondTo: "window",
                responsive: null,
                rows: 1,
                rtl: !1,
                slide: "",
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: !0,
                swipeToSlide: !1,
                touchMove: !0,
                touchThreshold: 5,
                useCSS: !0,
                variableWidth: !1,
                vertical: !1,
                verticalSwiping: !1,
                waitForAnimate: !0
            }, e.initials = {
                animating: !1,
                dragging: !1,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: !1,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: !1,
                unslicked: !1
            }, a.extend(e, e.initials), e.activeBreakpoint = null, e.animType = null, e.animProp = null, 
            e.breakpoints = [], e.breakpointSettings = [], e.cssTransitions = !1, e.hidden = "hidden", 
            e.paused = !1, e.positionProp = null, e.respondTo = null, e.rowCount = 1, e.shouldClick = !0, 
            e.$slider = a(c), e.$slidesCache = null, e.transformType = null, e.transitionType = null, 
            e.visibilityChange = "visibilitychange", e.windowWidth = 0, e.windowTimer = null, 
            f = a(c).data("slick") || {}, e.options = a.extend({}, e.defaults, f, d), e.currentSlide = e.options.initialSlide, 
            e.originalSettings = e.options, g = e.options.responsive || null, g && g.length > -1) {
                e.respondTo = e.options.respondTo || "window";
                for (h in g) g.hasOwnProperty(h) && (e.breakpoints.push(g[h].breakpoint), e.breakpointSettings[g[h].breakpoint] = g[h].settings);
                e.breakpoints.sort(function(a, b) {
                    return e.options.mobileFirst === !0 ? a - b : b - a;
                });
            }
            "undefined" != typeof document.mozHidden ? (e.hidden = "mozHidden", e.visibilityChange = "mozvisibilitychange") : "undefined" != typeof document.webkitHidden && (e.hidden = "webkitHidden", 
            e.visibilityChange = "webkitvisibilitychange"), e.autoPlay = a.proxy(e.autoPlay, e), 
            e.autoPlayClear = a.proxy(e.autoPlayClear, e), e.changeSlide = a.proxy(e.changeSlide, e), 
            e.clickHandler = a.proxy(e.clickHandler, e), e.selectHandler = a.proxy(e.selectHandler, e), 
            e.setPosition = a.proxy(e.setPosition, e), e.swipeHandler = a.proxy(e.swipeHandler, e), 
            e.dragHandler = a.proxy(e.dragHandler, e), e.keyHandler = a.proxy(e.keyHandler, e), 
            e.autoPlayIterator = a.proxy(e.autoPlayIterator, e), e.instanceUid = b++, e.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/, 
            e.init(!0), e.checkResponsive(!0);
        }
        var b = 0;
        return c;
    }(), b.prototype.addSlide = b.prototype.slickAdd = function(b, c, d) {
        var e = this;
        if ("boolean" == typeof c) d = c, c = null; else if (0 > c || c >= e.slideCount) return !1;
        e.unload(), "number" == typeof c ? 0 === c && 0 === e.$slides.length ? a(b).appendTo(e.$slideTrack) : d ? a(b).insertBefore(e.$slides.eq(c)) : a(b).insertAfter(e.$slides.eq(c)) : d === !0 ? a(b).prependTo(e.$slideTrack) : a(b).appendTo(e.$slideTrack), 
        e.$slides = e.$slideTrack.children(this.options.slide), e.$slideTrack.children(this.options.slide).detach(), 
        e.$slideTrack.append(e.$slides), e.$slides.each(function(b, c) {
            a(c).attr("data-slick-index", b);
        }), e.$slidesCache = e.$slides, e.reinit();
    }, b.prototype.animateHeight = function() {
        var a = this;
        if (1 === a.options.slidesToShow && a.options.adaptiveHeight === !0 && a.options.vertical === !1) {
            var b = a.$slides.eq(a.currentSlide).outerHeight(!0);
            a.$list.animate({
                height: b
            }, a.options.speed);
        }
    }, b.prototype.animateSlide = function(b, c) {
        var d = {}, e = this;
        e.animateHeight(), e.options.rtl === !0 && e.options.vertical === !1 && (b = -b), 
        e.transformsEnabled === !1 ? e.options.vertical === !1 ? e.$slideTrack.animate({
            left: b
        }, e.options.speed, e.options.easing, c) : e.$slideTrack.animate({
            top: b
        }, e.options.speed, e.options.easing, c) : e.cssTransitions === !1 ? (e.options.rtl === !0 && (e.currentLeft = -e.currentLeft), 
        a({
            animStart: e.currentLeft
        }).animate({
            animStart: b
        }, {
            duration: e.options.speed,
            easing: e.options.easing,
            step: function(a) {
                a = Math.ceil(a), e.options.vertical === !1 ? (d[e.animType] = "translate(" + a + "px, 0px)", 
                e.$slideTrack.css(d)) : (d[e.animType] = "translate(0px," + a + "px)", e.$slideTrack.css(d));
            },
            complete: function() {
                c && c.call();
            }
        })) : (e.applyTransition(), b = Math.ceil(b), d[e.animType] = e.options.vertical === !1 ? "translate3d(" + b + "px, 0px, 0px)" : "translate3d(0px," + b + "px, 0px)", 
        e.$slideTrack.css(d), c && setTimeout(function() {
            e.disableTransition(), c.call();
        }, e.options.speed));
    }, b.prototype.asNavFor = function(b) {
        var c = this, d = c.options.asNavFor;
        d && null !== d && (d = a(d).not(c.$slider)), null !== d && "object" == typeof d && d.each(function() {
            var c = a(this).slick("getSlick");
            c.unslicked || c.slideHandler(b, !0);
        });
    }, b.prototype.applyTransition = function(a) {
        var b = this, c = {};
        c[b.transitionType] = b.options.fade === !1 ? b.transformType + " " + b.options.speed + "ms " + b.options.cssEase : "opacity " + b.options.speed + "ms " + b.options.cssEase, 
        b.options.fade === !1 ? b.$slideTrack.css(c) : b.$slides.eq(a).css(c);
    }, b.prototype.autoPlay = function() {
        var a = this;
        a.autoPlayTimer && clearInterval(a.autoPlayTimer), a.slideCount > a.options.slidesToShow && a.paused !== !0 && (a.autoPlayTimer = setInterval(a.autoPlayIterator, a.options.autoplaySpeed));
    }, b.prototype.autoPlayClear = function() {
        var a = this;
        a.autoPlayTimer && clearInterval(a.autoPlayTimer);
    }, b.prototype.autoPlayIterator = function() {
        var a = this;
        a.options.infinite === !1 ? 1 === a.direction ? (a.currentSlide + 1 === a.slideCount - 1 && (a.direction = 0), 
        a.slideHandler(a.currentSlide + a.options.slidesToScroll)) : (0 === a.currentSlide - 1 && (a.direction = 1), 
        a.slideHandler(a.currentSlide - a.options.slidesToScroll)) : a.slideHandler(a.currentSlide + a.options.slidesToScroll);
    }, b.prototype.buildArrows = function() {
        var b = this;
        b.options.arrows === !0 && b.slideCount > b.options.slidesToShow && (b.$prevArrow = a(b.options.prevArrow), 
        b.$nextArrow = a(b.options.nextArrow), b.htmlExpr.test(b.options.prevArrow) && b.$prevArrow.appendTo(b.options.appendArrows), 
        b.htmlExpr.test(b.options.nextArrow) && b.$nextArrow.appendTo(b.options.appendArrows), 
        b.options.infinite !== !0 && b.$prevArrow.addClass("slick-disabled"));
    }, b.prototype.buildDots = function() {
        var c, d, b = this;
        if (b.options.dots === !0 && b.slideCount > b.options.slidesToShow) {
            for (d = '<ul class="' + b.options.dotsClass + '">', c = 0; c <= b.getDotCount(); c += 1) d += "<li>" + b.options.customPaging.call(this, b, c) + "</li>";
            d += "</ul>", b.$dots = a(d).appendTo(b.options.appendDots), b.$dots.find("li").first().addClass("slick-active").attr("aria-hidden", "false");
        }
    }, b.prototype.buildOut = function() {
        var b = this;
        b.$slides = b.$slider.children(":not(.slick-cloned)").addClass("slick-slide"), b.slideCount = b.$slides.length, 
        b.$slides.each(function(b, c) {
            a(c).attr("data-slick-index", b).data("originalStyling", a(c).attr("style") || "");
        }), b.$slidesCache = b.$slides, b.$slider.addClass("slick-slider"), b.$slideTrack = 0 === b.slideCount ? a('<div class="slick-track"/>').appendTo(b.$slider) : b.$slides.wrapAll('<div class="slick-track"/>').parent(), 
        b.$list = b.$slideTrack.wrap('<div aria-live="polite" class="slick-list"/>').parent(), 
        b.$slideTrack.css("opacity", 0), (b.options.centerMode === !0 || b.options.swipeToSlide === !0) && (b.options.slidesToScroll = 1), 
        a("img[data-lazy]", b.$slider).not("[src]").addClass("slick-loading"), b.setupInfinite(), 
        b.buildArrows(), b.buildDots(), b.updateDots(), b.options.accessibility === !0 && b.$list.prop("tabIndex", 0), 
        b.setSlideClasses("number" == typeof this.currentSlide ? this.currentSlide : 0), 
        b.options.draggable === !0 && b.$list.addClass("draggable");
    }, b.prototype.buildRows = function() {
        var b, c, d, e, f, g, h, a = this;
        if (e = document.createDocumentFragment(), g = a.$slider.children(), a.options.rows > 1) {
            for (h = a.options.slidesPerRow * a.options.rows, f = Math.ceil(g.length / h), b = 0; f > b; b++) {
                var i = document.createElement("div");
                for (c = 0; c < a.options.rows; c++) {
                    var j = document.createElement("div");
                    for (d = 0; d < a.options.slidesPerRow; d++) {
                        var k = b * h + (c * a.options.slidesPerRow + d);
                        g.get(k) && j.appendChild(g.get(k));
                    }
                    i.appendChild(j);
                }
                e.appendChild(i);
            }
            a.$slider.html(e), a.$slider.children().children().children().css({
                width: 100 / a.options.slidesPerRow + "%",
                display: "inline-block"
            });
        }
    }, b.prototype.checkResponsive = function(b) {
        var d, e, f, c = this, g = !1, h = c.$slider.width(), i = window.innerWidth || a(window).width();
        if ("window" === c.respondTo ? f = i : "slider" === c.respondTo ? f = h : "min" === c.respondTo && (f = Math.min(i, h)), 
        c.originalSettings.responsive && c.originalSettings.responsive.length > -1 && null !== c.originalSettings.responsive) {
            e = null;
            for (d in c.breakpoints) c.breakpoints.hasOwnProperty(d) && (c.originalSettings.mobileFirst === !1 ? f < c.breakpoints[d] && (e = c.breakpoints[d]) : f > c.breakpoints[d] && (e = c.breakpoints[d]));
            null !== e ? null !== c.activeBreakpoint ? e !== c.activeBreakpoint && (c.activeBreakpoint = e, 
            "unslick" === c.breakpointSettings[e] ? c.unslick(e) : (c.options = a.extend({}, c.originalSettings, c.breakpointSettings[e]), 
            b === !0 && (c.currentSlide = c.options.initialSlide), c.refresh(b)), g = e) : (c.activeBreakpoint = e, 
            "unslick" === c.breakpointSettings[e] ? c.unslick(e) : (c.options = a.extend({}, c.originalSettings, c.breakpointSettings[e]), 
            b === !0 && (c.currentSlide = c.options.initialSlide), c.refresh(b)), g = e) : null !== c.activeBreakpoint && (c.activeBreakpoint = null, 
            c.options = c.originalSettings, b === !0 && (c.currentSlide = c.options.initialSlide), 
            c.refresh(b), g = e), b || g === !1 || c.$slider.trigger("breakpoint", [ c, g ]);
        }
    }, b.prototype.changeSlide = function(b, c) {
        var f, g, h, d = this, e = a(b.target);
        switch (e.is("a") && b.preventDefault(), e.is("li") || (e = e.closest("li")), h = 0 !== d.slideCount % d.options.slidesToScroll, 
        f = h ? 0 : (d.slideCount - d.currentSlide) % d.options.slidesToScroll, b.data.message) {
          case "previous":
            g = 0 === f ? d.options.slidesToScroll : d.options.slidesToShow - f, d.slideCount > d.options.slidesToShow && d.slideHandler(d.currentSlide - g, !1, c);
            break;

          case "next":
            g = 0 === f ? d.options.slidesToScroll : f, d.slideCount > d.options.slidesToShow && d.slideHandler(d.currentSlide + g, !1, c);
            break;

          case "index":
            var i = 0 === b.data.index ? 0 : b.data.index || e.index() * d.options.slidesToScroll;
            d.slideHandler(d.checkNavigable(i), !1, c), e.children().trigger("focus");
            break;

          default:
            return;
        }
    }, b.prototype.checkNavigable = function(a) {
        var c, d, b = this;
        if (c = b.getNavigableIndexes(), d = 0, a > c[c.length - 1]) a = c[c.length - 1]; else for (var e in c) {
            if (a < c[e]) {
                a = d;
                break;
            }
            d = c[e];
        }
        return a;
    }, b.prototype.cleanUpEvents = function() {
        var b = this;
        b.options.dots && null !== b.$dots && (a("li", b.$dots).off("click.slick", b.changeSlide), 
        b.options.pauseOnDotsHover === !0 && b.options.autoplay === !0 && a("li", b.$dots).off("mouseenter.slick", a.proxy(b.setPaused, b, !0)).off("mouseleave.slick", a.proxy(b.setPaused, b, !1))), 
        b.options.arrows === !0 && b.slideCount > b.options.slidesToShow && (b.$prevArrow && b.$prevArrow.off("click.slick", b.changeSlide), 
        b.$nextArrow && b.$nextArrow.off("click.slick", b.changeSlide)), b.$list.off("touchstart.slick mousedown.slick", b.swipeHandler), 
        b.$list.off("touchmove.slick mousemove.slick", b.swipeHandler), b.$list.off("touchend.slick mouseup.slick", b.swipeHandler), 
        b.$list.off("touchcancel.slick mouseleave.slick", b.swipeHandler), b.$list.off("click.slick", b.clickHandler), 
        a(document).off(b.visibilityChange, b.visibility), b.$list.off("mouseenter.slick", a.proxy(b.setPaused, b, !0)), 
        b.$list.off("mouseleave.slick", a.proxy(b.setPaused, b, !1)), b.options.accessibility === !0 && b.$list.off("keydown.slick", b.keyHandler), 
        b.options.focusOnSelect === !0 && a(b.$slideTrack).children().off("click.slick", b.selectHandler), 
        a(window).off("orientationchange.slick.slick-" + b.instanceUid, b.orientationChange), 
        a(window).off("resize.slick.slick-" + b.instanceUid, b.resize), a("[draggable!=true]", b.$slideTrack).off("dragstart", b.preventDefault), 
        a(window).off("load.slick.slick-" + b.instanceUid, b.setPosition), a(document).off("ready.slick.slick-" + b.instanceUid, b.setPosition);
    }, b.prototype.cleanUpRows = function() {
        var b, a = this;
        a.options.rows > 1 && (b = a.$slides.children().children(), b.removeAttr("style"), 
        a.$slider.html(b));
    }, b.prototype.clickHandler = function(a) {
        var b = this;
        b.shouldClick === !1 && (a.stopImmediatePropagation(), a.stopPropagation(), a.preventDefault());
    }, b.prototype.destroy = function(b) {
        var c = this;
        c.autoPlayClear(), c.touchObject = {}, c.cleanUpEvents(), a(".slick-cloned", c.$slider).detach(), 
        c.$dots && c.$dots.remove(), c.$prevArrow && "object" != typeof c.options.prevArrow && c.$prevArrow.remove(), 
        c.$nextArrow && "object" != typeof c.options.nextArrow && c.$nextArrow.remove(), 
        c.$slides && (c.$slides.removeClass("slick-slide slick-active slick-center slick-visible").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function() {
            a(this).attr("style", a(this).data("originalStyling"));
        }), c.$slideTrack.children(this.options.slide).detach(), c.$slideTrack.detach(), 
        c.$list.detach(), c.$slider.append(c.$slides)), c.cleanUpRows(), c.$slider.removeClass("slick-slider"), 
        c.$slider.removeClass("slick-initialized"), c.unslicked = !0, b || c.$slider.trigger("destroy", [ c ]);
    }, b.prototype.disableTransition = function(a) {
        var b = this, c = {};
        c[b.transitionType] = "", b.options.fade === !1 ? b.$slideTrack.css(c) : b.$slides.eq(a).css(c);
    }, b.prototype.fadeSlide = function(a, b) {
        var c = this;
        c.cssTransitions === !1 ? (c.$slides.eq(a).css({
            zIndex: 1e3
        }), c.$slides.eq(a).animate({
            opacity: 1
        }, c.options.speed, c.options.easing, b)) : (c.applyTransition(a), c.$slides.eq(a).css({
            opacity: 1,
            zIndex: 1e3
        }), b && setTimeout(function() {
            c.disableTransition(a), b.call();
        }, c.options.speed));
    }, b.prototype.filterSlides = b.prototype.slickFilter = function(a) {
        var b = this;
        null !== a && (b.unload(), b.$slideTrack.children(this.options.slide).detach(), 
        b.$slidesCache.filter(a).appendTo(b.$slideTrack), b.reinit());
    }, b.prototype.getCurrent = b.prototype.slickCurrentSlide = function() {
        var a = this;
        return a.currentSlide;
    }, b.prototype.getDotCount = function() {
        var a = this, b = 0, c = 0, d = 0;
        if (a.options.infinite === !0) for (;b < a.slideCount; ) ++d, b = c + a.options.slidesToShow, 
        c += a.options.slidesToScroll <= a.options.slidesToShow ? a.options.slidesToScroll : a.options.slidesToShow; else if (a.options.centerMode === !0) d = a.slideCount; else for (;b < a.slideCount; ) ++d, 
        b = c + a.options.slidesToShow, c += a.options.slidesToScroll <= a.options.slidesToShow ? a.options.slidesToScroll : a.options.slidesToShow;
        return d - 1;
    }, b.prototype.getLeft = function(a) {
        var c, d, f, b = this, e = 0;
        return b.slideOffset = 0, d = b.$slides.first().outerHeight(), b.options.infinite === !0 ? (b.slideCount > b.options.slidesToShow && (b.slideOffset = -1 * b.slideWidth * b.options.slidesToShow, 
        e = -1 * d * b.options.slidesToShow), 0 !== b.slideCount % b.options.slidesToScroll && a + b.options.slidesToScroll > b.slideCount && b.slideCount > b.options.slidesToShow && (a > b.slideCount ? (b.slideOffset = -1 * (b.options.slidesToShow - (a - b.slideCount)) * b.slideWidth, 
        e = -1 * (b.options.slidesToShow - (a - b.slideCount)) * d) : (b.slideOffset = -1 * b.slideCount % b.options.slidesToScroll * b.slideWidth, 
        e = -1 * b.slideCount % b.options.slidesToScroll * d))) : a + b.options.slidesToShow > b.slideCount && (b.slideOffset = (a + b.options.slidesToShow - b.slideCount) * b.slideWidth, 
        e = (a + b.options.slidesToShow - b.slideCount) * d), b.slideCount <= b.options.slidesToShow && (b.slideOffset = 0, 
        e = 0), b.options.centerMode === !0 && b.options.infinite === !0 ? b.slideOffset += b.slideWidth * Math.floor(b.options.slidesToShow / 2) - b.slideWidth : b.options.centerMode === !0 && (b.slideOffset = 0, 
        b.slideOffset += b.slideWidth * Math.floor(b.options.slidesToShow / 2)), c = b.options.vertical === !1 ? -1 * a * b.slideWidth + b.slideOffset : -1 * a * d + e, 
        b.options.variableWidth === !0 && (f = b.slideCount <= b.options.slidesToShow || b.options.infinite === !1 ? b.$slideTrack.children(".slick-slide").eq(a) : b.$slideTrack.children(".slick-slide").eq(a + b.options.slidesToShow), 
        c = f[0] ? -1 * f[0].offsetLeft : 0, b.options.centerMode === !0 && (f = b.options.infinite === !1 ? b.$slideTrack.children(".slick-slide").eq(a) : b.$slideTrack.children(".slick-slide").eq(a + b.options.slidesToShow + 1), 
        c = f[0] ? -1 * f[0].offsetLeft : 0, c += (b.$list.width() - f.outerWidth()) / 2)), 
        c;
    }, b.prototype.getOption = b.prototype.slickGetOption = function(a) {
        var b = this;
        return b.options[a];
    }, b.prototype.getNavigableIndexes = function() {
        var e, a = this, b = 0, c = 0, d = [];
        for (a.options.infinite === !1 ? e = a.slideCount : (b = -1 * a.options.slidesToScroll, 
        c = -1 * a.options.slidesToScroll, e = 2 * a.slideCount); e > b; ) d.push(b), b = c + a.options.slidesToScroll, 
        c += a.options.slidesToScroll <= a.options.slidesToShow ? a.options.slidesToScroll : a.options.slidesToShow;
        return d;
    }, b.prototype.getSlick = function() {
        return this;
    }, b.prototype.getSlideCount = function() {
        var c, d, e, b = this;
        return e = b.options.centerMode === !0 ? b.slideWidth * Math.floor(b.options.slidesToShow / 2) : 0, 
        b.options.swipeToSlide === !0 ? (b.$slideTrack.find(".slick-slide").each(function(c, f) {
            return f.offsetLeft - e + a(f).outerWidth() / 2 > -1 * b.swipeLeft ? (d = f, !1) : void 0;
        }), c = Math.abs(a(d).attr("data-slick-index") - b.currentSlide) || 1) : b.options.slidesToScroll;
    }, b.prototype.goTo = b.prototype.slickGoTo = function(a, b) {
        var c = this;
        c.changeSlide({
            data: {
                message: "index",
                index: parseInt(a)
            }
        }, b);
    }, b.prototype.init = function(b) {
        var c = this;
        a(c.$slider).hasClass("slick-initialized") || (a(c.$slider).addClass("slick-initialized"), 
        c.buildRows(), c.buildOut(), c.setProps(), c.startLoad(), c.loadSlider(), c.initializeEvents(), 
        c.updateArrows(), c.updateDots()), b && c.$slider.trigger("init", [ c ]);
    }, b.prototype.initArrowEvents = function() {
        var a = this;
        a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.on("click.slick", {
            message: "previous"
        }, a.changeSlide), a.$nextArrow.on("click.slick", {
            message: "next"
        }, a.changeSlide));
    }, b.prototype.initDotEvents = function() {
        var b = this;
        b.options.dots === !0 && b.slideCount > b.options.slidesToShow && a("li", b.$dots).on("click.slick", {
            message: "index"
        }, b.changeSlide), b.options.dots === !0 && b.options.pauseOnDotsHover === !0 && b.options.autoplay === !0 && a("li", b.$dots).on("mouseenter.slick", a.proxy(b.setPaused, b, !0)).on("mouseleave.slick", a.proxy(b.setPaused, b, !1));
    }, b.prototype.initializeEvents = function() {
        var b = this;
        b.initArrowEvents(), b.initDotEvents(), b.$list.on("touchstart.slick mousedown.slick", {
            action: "start"
        }, b.swipeHandler), b.$list.on("touchmove.slick mousemove.slick", {
            action: "move"
        }, b.swipeHandler), b.$list.on("touchend.slick mouseup.slick", {
            action: "end"
        }, b.swipeHandler), b.$list.on("touchcancel.slick mouseleave.slick", {
            action: "end"
        }, b.swipeHandler), b.$list.on("click.slick", b.clickHandler), a(document).on(b.visibilityChange, a.proxy(b.visibility, b)), 
        b.$list.on("mouseenter.slick", a.proxy(b.setPaused, b, !0)), b.$list.on("mouseleave.slick", a.proxy(b.setPaused, b, !1)), 
        b.options.accessibility === !0 && b.$list.on("keydown.slick", b.keyHandler), b.options.focusOnSelect === !0 && a(b.$slideTrack).children().on("click.slick", b.selectHandler), 
        a(window).on("orientationchange.slick.slick-" + b.instanceUid, a.proxy(b.orientationChange, b)), 
        a(window).on("resize.slick.slick-" + b.instanceUid, a.proxy(b.resize, b)), a("[draggable!=true]", b.$slideTrack).on("dragstart", b.preventDefault), 
        a(window).on("load.slick.slick-" + b.instanceUid, b.setPosition), a(document).on("ready.slick.slick-" + b.instanceUid, b.setPosition);
    }, b.prototype.initUI = function() {
        var a = this;
        a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.show(), 
        a.$nextArrow.show()), a.options.dots === !0 && a.slideCount > a.options.slidesToShow && a.$dots.show(), 
        a.options.autoplay === !0 && a.autoPlay();
    }, b.prototype.keyHandler = function(a) {
        var b = this;
        37 === a.keyCode && b.options.accessibility === !0 ? b.changeSlide({
            data: {
                message: "previous"
            }
        }) : 39 === a.keyCode && b.options.accessibility === !0 && b.changeSlide({
            data: {
                message: "next"
            }
        });
    }, b.prototype.lazyLoad = function() {
        function g(b) {
            a("img[data-lazy]", b).each(function() {
                var b = a(this), c = a(this).attr("data-lazy"), d = document.createElement("img");
                d.onload = function() {
                    b.animate({
                        opacity: 1
                    }, 200);
                }, d.src = c, b.css({
                    opacity: 0
                }).attr("src", c).removeAttr("data-lazy").removeClass("slick-loading");
            });
        }
        var c, d, e, f, b = this;
        b.options.centerMode === !0 ? b.options.infinite === !0 ? (e = b.currentSlide + (b.options.slidesToShow / 2 + 1), 
        f = e + b.options.slidesToShow + 2) : (e = Math.max(0, b.currentSlide - (b.options.slidesToShow / 2 + 1)), 
        f = 2 + (b.options.slidesToShow / 2 + 1) + b.currentSlide) : (e = b.options.infinite ? b.options.slidesToShow + b.currentSlide : b.currentSlide, 
        f = e + b.options.slidesToShow, b.options.fade === !0 && (e > 0 && e--, f <= b.slideCount && f++)), 
        c = b.$slider.find(".slick-slide").slice(e, f), g(c), b.slideCount <= b.options.slidesToShow ? (d = b.$slider.find(".slick-slide"), 
        g(d)) : b.currentSlide >= b.slideCount - b.options.slidesToShow ? (d = b.$slider.find(".slick-cloned").slice(0, b.options.slidesToShow), 
        g(d)) : 0 === b.currentSlide && (d = b.$slider.find(".slick-cloned").slice(-1 * b.options.slidesToShow), 
        g(d));
    }, b.prototype.loadSlider = function() {
        var a = this;
        a.setPosition(), a.$slideTrack.css({
            opacity: 1
        }), a.$slider.removeClass("slick-loading"), a.initUI(), "progressive" === a.options.lazyLoad && a.progressiveLazyLoad();
    }, b.prototype.next = b.prototype.slickNext = function() {
        var a = this;
        a.changeSlide({
            data: {
                message: "next"
            }
        });
    }, b.prototype.orientationChange = function() {
        var a = this;
        a.checkResponsive(), a.setPosition();
    }, b.prototype.pause = b.prototype.slickPause = function() {
        var a = this;
        a.autoPlayClear(), a.paused = !0;
    }, b.prototype.play = b.prototype.slickPlay = function() {
        var a = this;
        a.paused = !1, a.autoPlay();
    }, b.prototype.postSlide = function(a) {
        var b = this;
        b.$slider.trigger("afterChange", [ b, a ]), b.animating = !1, b.setPosition(), b.swipeLeft = null, 
        b.options.autoplay === !0 && b.paused === !1 && b.autoPlay();
    }, b.prototype.prev = b.prototype.slickPrev = function() {
        var a = this;
        a.changeSlide({
            data: {
                message: "previous"
            }
        });
    }, b.prototype.preventDefault = function(a) {
        a.preventDefault();
    }, b.prototype.progressiveLazyLoad = function() {
        var c, d, b = this;
        c = a("img[data-lazy]", b.$slider).length, c > 0 && (d = a("img[data-lazy]", b.$slider).first(), 
        d.attr("src", d.attr("data-lazy")).removeClass("slick-loading").load(function() {
            d.removeAttr("data-lazy"), b.progressiveLazyLoad(), b.options.adaptiveHeight === !0 && b.setPosition();
        }).error(function() {
            d.removeAttr("data-lazy"), b.progressiveLazyLoad();
        }));
    }, b.prototype.refresh = function(b) {
        var c = this, d = c.currentSlide;
        c.destroy(!0), a.extend(c, c.initials), c.init(), b || c.changeSlide({
            data: {
                message: "index",
                index: d
            }
        }, !1);
    }, b.prototype.reinit = function() {
        var b = this;
        b.$slides = b.$slideTrack.children(b.options.slide).addClass("slick-slide"), b.slideCount = b.$slides.length, 
        b.currentSlide >= b.slideCount && 0 !== b.currentSlide && (b.currentSlide = b.currentSlide - b.options.slidesToScroll), 
        b.slideCount <= b.options.slidesToShow && (b.currentSlide = 0), b.setProps(), b.setupInfinite(), 
        b.buildArrows(), b.updateArrows(), b.initArrowEvents(), b.buildDots(), b.updateDots(), 
        b.initDotEvents(), b.options.focusOnSelect === !0 && a(b.$slideTrack).children().on("click.slick", b.selectHandler), 
        b.setSlideClasses(0), b.setPosition(), b.$slider.trigger("reInit", [ b ]);
    }, b.prototype.resize = function() {
        var b = this;
        a(window).width() !== b.windowWidth && (clearTimeout(b.windowDelay), b.windowDelay = window.setTimeout(function() {
            b.windowWidth = a(window).width(), b.checkResponsive(), b.unslicked || b.setPosition();
        }, 50));
    }, b.prototype.removeSlide = b.prototype.slickRemove = function(a, b, c) {
        var d = this;
        return "boolean" == typeof a ? (b = a, a = b === !0 ? 0 : d.slideCount - 1) : a = b === !0 ? --a : a, 
        d.slideCount < 1 || 0 > a || a > d.slideCount - 1 ? !1 : (d.unload(), c === !0 ? d.$slideTrack.children().remove() : d.$slideTrack.children(this.options.slide).eq(a).remove(), 
        d.$slides = d.$slideTrack.children(this.options.slide), d.$slideTrack.children(this.options.slide).detach(), 
        d.$slideTrack.append(d.$slides), d.$slidesCache = d.$slides, d.reinit(), void 0);
    }, b.prototype.setCSS = function(a) {
        var d, e, b = this, c = {};
        b.options.rtl === !0 && (a = -a), d = "left" == b.positionProp ? Math.ceil(a) + "px" : "0px", 
        e = "top" == b.positionProp ? Math.ceil(a) + "px" : "0px", c[b.positionProp] = a, 
        b.transformsEnabled === !1 ? b.$slideTrack.css(c) : (c = {}, b.cssTransitions === !1 ? (c[b.animType] = "translate(" + d + ", " + e + ")", 
        b.$slideTrack.css(c)) : (c[b.animType] = "translate3d(" + d + ", " + e + ", 0px)", 
        b.$slideTrack.css(c)));
    }, b.prototype.setDimensions = function() {
        var a = this;
        a.options.vertical === !1 ? a.options.centerMode === !0 && a.$list.css({
            padding: "0px " + a.options.centerPadding
        }) : (a.$list.height(a.$slides.first().outerHeight(!0) * a.options.slidesToShow), 
        a.options.centerMode === !0 && a.$list.css({
            padding: a.options.centerPadding + " 0px"
        })), a.listWidth = a.$list.width(), a.listHeight = a.$list.height(), a.options.vertical === !1 && a.options.variableWidth === !1 ? (a.slideWidth = Math.ceil(a.listWidth / a.options.slidesToShow), 
        a.$slideTrack.width(Math.ceil(a.slideWidth * a.$slideTrack.children(".slick-slide").length))) : a.options.variableWidth === !0 ? a.$slideTrack.width(5e3 * a.slideCount) : (a.slideWidth = Math.ceil(a.listWidth), 
        a.$slideTrack.height(Math.ceil(a.$slides.first().outerHeight(!0) * a.$slideTrack.children(".slick-slide").length)));
        var b = a.$slides.first().outerWidth(!0) - a.$slides.first().width();
        a.options.variableWidth === !1 && a.$slideTrack.children(".slick-slide").width(a.slideWidth - b);
    }, b.prototype.setFade = function() {
        var c, b = this;
        b.$slides.each(function(d, e) {
            c = -1 * b.slideWidth * d, b.options.rtl === !0 ? a(e).css({
                position: "relative",
                right: c,
                top: 0,
                zIndex: 800,
                opacity: 0
            }) : a(e).css({
                position: "relative",
                left: c,
                top: 0,
                zIndex: 800,
                opacity: 0
            });
        }), b.$slides.eq(b.currentSlide).css({
            zIndex: 900,
            opacity: 1
        });
    }, b.prototype.setHeight = function() {
        var a = this;
        if (1 === a.options.slidesToShow && a.options.adaptiveHeight === !0 && a.options.vertical === !1) {
            var b = a.$slides.eq(a.currentSlide).outerHeight(!0);
            a.$list.css("height", b);
        }
    }, b.prototype.setOption = b.prototype.slickSetOption = function(a, b, c) {
        var d = this;
        d.options[a] = b, c === !0 && (d.unload(), d.reinit());
    }, b.prototype.setPosition = function() {
        var a = this;
        a.setDimensions(), a.setHeight(), a.options.fade === !1 ? a.setCSS(a.getLeft(a.currentSlide)) : a.setFade(), 
        a.$slider.trigger("setPosition", [ a ]);
    }, b.prototype.setProps = function() {
        var a = this, b = document.body.style;
        a.positionProp = a.options.vertical === !0 ? "top" : "left", "top" === a.positionProp ? a.$slider.addClass("slick-vertical") : a.$slider.removeClass("slick-vertical"), 
        (void 0 !== b.WebkitTransition || void 0 !== b.MozTransition || void 0 !== b.msTransition) && a.options.useCSS === !0 && (a.cssTransitions = !0), 
        void 0 !== b.OTransform && (a.animType = "OTransform", a.transformType = "-o-transform", 
        a.transitionType = "OTransition", void 0 === b.perspectiveProperty && void 0 === b.webkitPerspective && (a.animType = !1)), 
        void 0 !== b.MozTransform && (a.animType = "MozTransform", a.transformType = "-moz-transform", 
        a.transitionType = "MozTransition", void 0 === b.perspectiveProperty && void 0 === b.MozPerspective && (a.animType = !1)), 
        void 0 !== b.webkitTransform && (a.animType = "webkitTransform", a.transformType = "-webkit-transform", 
        a.transitionType = "webkitTransition", void 0 === b.perspectiveProperty && void 0 === b.webkitPerspective && (a.animType = !1)), 
        void 0 !== b.msTransform && (a.animType = "msTransform", a.transformType = "-ms-transform", 
        a.transitionType = "msTransition", void 0 === b.msTransform && (a.animType = !1)), 
        void 0 !== b.transform && a.animType !== !1 && (a.animType = "transform", a.transformType = "transform", 
        a.transitionType = "transition"), a.transformsEnabled = null !== a.animType && a.animType !== !1;
    }, b.prototype.setSlideClasses = function(a) {
        var c, d, e, f, b = this;
        b.$slider.find(".slick-slide").removeClass("slick-active").attr("aria-hidden", "true").removeClass("slick-center"), 
        d = b.$slider.find(".slick-slide"), b.options.centerMode === !0 ? (c = Math.floor(b.options.slidesToShow / 2), 
        b.options.infinite === !0 && (a >= c && a <= b.slideCount - 1 - c ? b.$slides.slice(a - c, a + c + 1).addClass("slick-active").attr("aria-hidden", "false") : (e = b.options.slidesToShow + a, 
        d.slice(e - c + 1, e + c + 2).addClass("slick-active").attr("aria-hidden", "false")), 
        0 === a ? d.eq(d.length - 1 - b.options.slidesToShow).addClass("slick-center") : a === b.slideCount - 1 && d.eq(b.options.slidesToShow).addClass("slick-center")), 
        b.$slides.eq(a).addClass("slick-center")) : a >= 0 && a <= b.slideCount - b.options.slidesToShow ? b.$slides.slice(a, a + b.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false") : d.length <= b.options.slidesToShow ? d.addClass("slick-active").attr("aria-hidden", "false") : (f = b.slideCount % b.options.slidesToShow, 
        e = b.options.infinite === !0 ? b.options.slidesToShow + a : a, b.options.slidesToShow == b.options.slidesToScroll && b.slideCount - a < b.options.slidesToShow ? d.slice(e - (b.options.slidesToShow - f), e + f).addClass("slick-active").attr("aria-hidden", "false") : d.slice(e, e + b.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false")), 
        "ondemand" === b.options.lazyLoad && b.lazyLoad();
    }, b.prototype.setupInfinite = function() {
        var c, d, e, b = this;
        if (b.options.fade === !0 && (b.options.centerMode = !1), b.options.infinite === !0 && b.options.fade === !1 && (d = null, 
        b.slideCount > b.options.slidesToShow)) {
            for (e = b.options.centerMode === !0 ? b.options.slidesToShow + 1 : b.options.slidesToShow, 
            c = b.slideCount; c > b.slideCount - e; c -= 1) d = c - 1, a(b.$slides[d]).clone(!0).attr("id", "").attr("data-slick-index", d - b.slideCount).prependTo(b.$slideTrack).addClass("slick-cloned");
            for (c = 0; e > c; c += 1) d = c, a(b.$slides[d]).clone(!0).attr("id", "").attr("data-slick-index", d + b.slideCount).appendTo(b.$slideTrack).addClass("slick-cloned");
            b.$slideTrack.find(".slick-cloned").find("[id]").each(function() {
                a(this).attr("id", "");
            });
        }
    }, b.prototype.setPaused = function(a) {
        var b = this;
        b.options.autoplay === !0 && b.options.pauseOnHover === !0 && (b.paused = a, a ? b.autoPlayClear() : b.autoPlay());
    }, b.prototype.selectHandler = function(b) {
        var c = this, d = a(b.target).is(".slick-slide") ? a(b.target) : a(b.target).parents(".slick-slide"), e = parseInt(d.attr("data-slick-index"));
        return e || (e = 0), c.slideCount <= c.options.slidesToShow ? (c.$slider.find(".slick-slide").removeClass("slick-active").attr("aria-hidden", "true"), 
        c.$slides.eq(e).addClass("slick-active").attr("aria-hidden", "false"), c.options.centerMode === !0 && (c.$slider.find(".slick-slide").removeClass("slick-center"), 
        c.$slides.eq(e).addClass("slick-center")), c.asNavFor(e), void 0) : (c.slideHandler(e), 
        void 0);
    }, b.prototype.slideHandler = function(a, b, c) {
        var d, e, f, g, h = null, i = this;
        return b = b || !1, i.animating === !0 && i.options.waitForAnimate === !0 || i.options.fade === !0 && i.currentSlide === a || i.slideCount <= i.options.slidesToShow ? void 0 : (b === !1 && i.asNavFor(a), 
        d = a, h = i.getLeft(d), g = i.getLeft(i.currentSlide), i.currentLeft = null === i.swipeLeft ? g : i.swipeLeft, 
        i.options.infinite === !1 && i.options.centerMode === !1 && (0 > a || a > i.getDotCount() * i.options.slidesToScroll) ? (i.options.fade === !1 && (d = i.currentSlide, 
        c !== !0 ? i.animateSlide(g, function() {
            i.postSlide(d);
        }) : i.postSlide(d)), void 0) : i.options.infinite === !1 && i.options.centerMode === !0 && (0 > a || a > i.slideCount - i.options.slidesToScroll) ? (i.options.fade === !1 && (d = i.currentSlide, 
        c !== !0 ? i.animateSlide(g, function() {
            i.postSlide(d);
        }) : i.postSlide(d)), void 0) : (i.options.autoplay === !0 && clearInterval(i.autoPlayTimer), 
        e = 0 > d ? 0 !== i.slideCount % i.options.slidesToScroll ? i.slideCount - i.slideCount % i.options.slidesToScroll : i.slideCount + d : d >= i.slideCount ? 0 !== i.slideCount % i.options.slidesToScroll ? 0 : d - i.slideCount : d, 
        i.animating = !0, i.$slider.trigger("beforeChange", [ i, i.currentSlide, e ]), f = i.currentSlide, 
        i.currentSlide = e, i.setSlideClasses(i.currentSlide), i.updateDots(), i.updateArrows(), 
        i.options.fade === !0 ? (c !== !0 ? i.fadeSlide(e, function() {
            i.postSlide(e);
        }) : i.postSlide(e), i.animateHeight(), void 0) : (c !== !0 ? i.animateSlide(h, function() {
            i.postSlide(e);
        }) : i.postSlide(e), void 0)));
    }, b.prototype.startLoad = function() {
        var a = this;
        a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.hide(), 
        a.$nextArrow.hide()), a.options.dots === !0 && a.slideCount > a.options.slidesToShow && a.$dots.hide(), 
        a.$slider.addClass("slick-loading");
    }, b.prototype.swipeDirection = function() {
        var a, b, c, d, e = this;
        return a = e.touchObject.startX - e.touchObject.curX, b = e.touchObject.startY - e.touchObject.curY, 
        c = Math.atan2(b, a), d = Math.round(180 * c / Math.PI), 0 > d && (d = 360 - Math.abs(d)), 
        45 >= d && d >= 0 ? e.options.rtl === !1 ? "left" : "right" : 360 >= d && d >= 315 ? e.options.rtl === !1 ? "left" : "right" : d >= 135 && 225 >= d ? e.options.rtl === !1 ? "right" : "left" : e.options.verticalSwiping === !0 ? d >= 35 && 135 >= d ? "left" : "right" : "vertical";
    }, b.prototype.swipeEnd = function() {
        var c, b = this;
        if (b.dragging = !1, b.shouldClick = b.touchObject.swipeLength > 10 ? !1 : !0, void 0 === b.touchObject.curX) return !1;
        if (b.touchObject.edgeHit === !0 && b.$slider.trigger("edge", [ b, b.swipeDirection() ]), 
        b.touchObject.swipeLength >= b.touchObject.minSwipe) switch (b.swipeDirection()) {
          case "left":
            c = b.options.swipeToSlide ? b.checkNavigable(b.currentSlide + b.getSlideCount()) : b.currentSlide + b.getSlideCount(), 
            b.slideHandler(c), b.currentDirection = 0, b.touchObject = {}, b.$slider.trigger("swipe", [ b, "left" ]);
            break;

          case "right":
            c = b.options.swipeToSlide ? b.checkNavigable(b.currentSlide - b.getSlideCount()) : b.currentSlide - b.getSlideCount(), 
            b.slideHandler(c), b.currentDirection = 1, b.touchObject = {}, b.$slider.trigger("swipe", [ b, "right" ]);
        } else b.touchObject.startX !== b.touchObject.curX && (b.slideHandler(b.currentSlide), 
        b.touchObject = {});
    }, b.prototype.swipeHandler = function(a) {
        var b = this;
        if (!(b.options.swipe === !1 || "ontouchend" in document && b.options.swipe === !1 || b.options.draggable === !1 && -1 !== a.type.indexOf("mouse"))) switch (b.touchObject.fingerCount = a.originalEvent && void 0 !== a.originalEvent.touches ? a.originalEvent.touches.length : 1, 
        b.touchObject.minSwipe = b.listWidth / b.options.touchThreshold, b.options.verticalSwiping === !0 && (b.touchObject.minSwipe = b.listHeight / b.options.touchThreshold), 
        a.data.action) {
          case "start":
            b.swipeStart(a);
            break;

          case "move":
            b.swipeMove(a);
            break;

          case "end":
            b.swipeEnd(a);
        }
    }, b.prototype.swipeMove = function(a) {
        var d, e, f, g, h, b = this;
        return h = void 0 !== a.originalEvent ? a.originalEvent.touches : null, !b.dragging || h && 1 !== h.length ? !1 : (d = b.getLeft(b.currentSlide), 
        b.touchObject.curX = void 0 !== h ? h[0].pageX : a.clientX, b.touchObject.curY = void 0 !== h ? h[0].pageY : a.clientY, 
        b.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(b.touchObject.curX - b.touchObject.startX, 2))), 
        b.options.verticalSwiping === !0 && (b.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(b.touchObject.curY - b.touchObject.startY, 2)))), 
        e = b.swipeDirection(), "vertical" !== e ? (void 0 !== a.originalEvent && b.touchObject.swipeLength > 4 && a.preventDefault(), 
        g = (b.options.rtl === !1 ? 1 : -1) * (b.touchObject.curX > b.touchObject.startX ? 1 : -1), 
        b.options.verticalSwiping === !0 && (g = b.touchObject.curY > b.touchObject.startY ? 1 : -1), 
        f = b.touchObject.swipeLength, b.touchObject.edgeHit = !1, b.options.infinite === !1 && (0 === b.currentSlide && "right" === e || b.currentSlide >= b.getDotCount() && "left" === e) && (f = b.touchObject.swipeLength * b.options.edgeFriction, 
        b.touchObject.edgeHit = !0), b.swipeLeft = b.options.vertical === !1 ? d + f * g : d + f * (b.$list.height() / b.listWidth) * g, 
        b.options.verticalSwiping === !0 && (b.swipeLeft = d + f * g), b.options.fade === !0 || b.options.touchMove === !1 ? !1 : b.animating === !0 ? (b.swipeLeft = null, 
        !1) : (b.setCSS(b.swipeLeft), void 0)) : void 0);
    }, b.prototype.swipeStart = function(a) {
        var c, b = this;
        return 1 !== b.touchObject.fingerCount || b.slideCount <= b.options.slidesToShow ? (b.touchObject = {}, 
        !1) : (void 0 !== a.originalEvent && void 0 !== a.originalEvent.touches && (c = a.originalEvent.touches[0]), 
        b.touchObject.startX = b.touchObject.curX = void 0 !== c ? c.pageX : a.clientX, 
        b.touchObject.startY = b.touchObject.curY = void 0 !== c ? c.pageY : a.clientY, 
        b.dragging = !0, void 0);
    }, b.prototype.unfilterSlides = b.prototype.slickUnfilter = function() {
        var a = this;
        null !== a.$slidesCache && (a.unload(), a.$slideTrack.children(this.options.slide).detach(), 
        a.$slidesCache.appendTo(a.$slideTrack), a.reinit());
    }, b.prototype.unload = function() {
        var b = this;
        a(".slick-cloned", b.$slider).remove(), b.$dots && b.$dots.remove(), b.$prevArrow && "object" != typeof b.options.prevArrow && b.$prevArrow.remove(), 
        b.$nextArrow && "object" != typeof b.options.nextArrow && b.$nextArrow.remove(), 
        b.$slides.removeClass("slick-slide slick-active slick-visible").attr("aria-hidden", "true").css("width", "");
    }, b.prototype.unslick = function(a) {
        var b = this;
        b.$slider.trigger("unslick", [ b, a ]), b.destroy();
    }, b.prototype.updateArrows = function() {
        var b, a = this;
        b = Math.floor(a.options.slidesToShow / 2), a.options.arrows === !0 && a.options.infinite !== !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.removeClass("slick-disabled"), 
        a.$nextArrow.removeClass("slick-disabled"), 0 === a.currentSlide ? (a.$prevArrow.addClass("slick-disabled"), 
        a.$nextArrow.removeClass("slick-disabled")) : a.currentSlide >= a.slideCount - a.options.slidesToShow && a.options.centerMode === !1 ? (a.$nextArrow.addClass("slick-disabled"), 
        a.$prevArrow.removeClass("slick-disabled")) : a.currentSlide >= a.slideCount - 1 && a.options.centerMode === !0 && (a.$nextArrow.addClass("slick-disabled"), 
        a.$prevArrow.removeClass("slick-disabled")));
    }, b.prototype.updateDots = function() {
        var a = this;
        null !== a.$dots && (a.$dots.find("li").removeClass("slick-active").attr("aria-hidden", "true"), 
        a.$dots.find("li").eq(Math.floor(a.currentSlide / a.options.slidesToScroll)).addClass("slick-active").attr("aria-hidden", "false"));
    }, b.prototype.visibility = function() {
        var a = this;
        document[a.hidden] ? (a.paused = !0, a.autoPlayClear()) : a.options.autoplay === !0 && (a.paused = !1, 
        a.autoPlay());
    }, a.fn.slick = function() {
        var g, a = this, c = arguments[0], d = Array.prototype.slice.call(arguments, 1), e = a.length, f = 0;
        for (f; e > f; f++) if ("object" == typeof c || "undefined" == typeof c ? a[f].slick = new b(a[f], c) : g = a[f].slick[c].apply(a[f].slick, d), 
        "undefined" != typeof g) return g;
        return a;
    };
});

(function(a, i, g) {
    a.fn.tinyNav = function(j) {
        var b = a.extend({
            active: "selected",
            header: "",
            label: ""
        }, j);
        return this.each(function() {
            g++;
            var h = a(this), d = "tinynav" + g, f = ".l_" + d, e = a("<select/>").attr("id", d).addClass("tinynav " + d);
            if (h.is("ul,ol")) {
                "" !== b.header && e.append(a("<option/>").text(b.header));
                var c = "";
                h.addClass("l_" + d).find("a").each(function() {
                    c += '<option value="' + a(this).attr("href") + '">';
                    var b;
                    for (b = 0; b < a(this).parents("ul, ol").length - 1; b++) c += "- ";
                    c += a(this).text() + "</option>";
                });
                e.append(c);
                b.header || e.find(":eq(" + a(f + " li").index(a(f + " li." + b.active)) + ")").attr("selected", !0);
                e.change(function() {
                    i.location.href = a(this).val();
                });
                a(f).after(e);
                b.label && e.before(a("<label/>").attr("for", d).addClass("tinynav_label " + d + "_label").append(b.label));
            }
        });
    };
})(jQuery, this, 0);

(function() {
    function e() {}
    function t(e, t) {
        for (var n = e.length; n--; ) if (e[n].listener === t) return n;
        return -1;
    }
    function n(e) {
        return function() {
            return this[e].apply(this, arguments);
        };
    }
    var i = e.prototype, r = this, o = r.EventEmitter;
    i.getListeners = function(e) {
        var t, n, i = this._getEvents();
        if ("object" == typeof e) {
            t = {};
            for (n in i) i.hasOwnProperty(n) && e.test(n) && (t[n] = i[n]);
        } else t = i[e] || (i[e] = []);
        return t;
    }, i.flattenListeners = function(e) {
        var t, n = [];
        for (t = 0; e.length > t; t += 1) n.push(e[t].listener);
        return n;
    }, i.getListenersAsObject = function(e) {
        var t, n = this.getListeners(e);
        return n instanceof Array && (t = {}, t[e] = n), t || n;
    }, i.addListener = function(e, n) {
        var i, r = this.getListenersAsObject(e), o = "object" == typeof n;
        for (i in r) r.hasOwnProperty(i) && -1 === t(r[i], n) && r[i].push(o ? n : {
            listener: n,
            once: !1
        });
        return this;
    }, i.on = n("addListener"), i.addOnceListener = function(e, t) {
        return this.addListener(e, {
            listener: t,
            once: !0
        });
    }, i.once = n("addOnceListener"), i.defineEvent = function(e) {
        return this.getListeners(e), this;
    }, i.defineEvents = function(e) {
        for (var t = 0; e.length > t; t += 1) this.defineEvent(e[t]);
        return this;
    }, i.removeListener = function(e, n) {
        var i, r, o = this.getListenersAsObject(e);
        for (r in o) o.hasOwnProperty(r) && (i = t(o[r], n), -1 !== i && o[r].splice(i, 1));
        return this;
    }, i.off = n("removeListener"), i.addListeners = function(e, t) {
        return this.manipulateListeners(!1, e, t);
    }, i.removeListeners = function(e, t) {
        return this.manipulateListeners(!0, e, t);
    }, i.manipulateListeners = function(e, t, n) {
        var i, r, o = e ? this.removeListener : this.addListener, s = e ? this.removeListeners : this.addListeners;
        if ("object" != typeof t || t instanceof RegExp) for (i = n.length; i--; ) o.call(this, t, n[i]); else for (i in t) t.hasOwnProperty(i) && (r = t[i]) && ("function" == typeof r ? o.call(this, i, r) : s.call(this, i, r));
        return this;
    }, i.removeEvent = function(e) {
        var t, n = typeof e, i = this._getEvents();
        if ("string" === n) delete i[e]; else if ("object" === n) for (t in i) i.hasOwnProperty(t) && e.test(t) && delete i[t]; else delete this._events;
        return this;
    }, i.removeAllListeners = n("removeEvent"), i.emitEvent = function(e, t) {
        var n, i, r, o, s = this.getListenersAsObject(e);
        for (r in s) if (s.hasOwnProperty(r)) for (i = s[r].length; i--; ) n = s[r][i], 
        n.once === !0 && this.removeListener(e, n.listener), o = n.listener.apply(this, t || []), 
        o === this._getOnceReturnValue() && this.removeListener(e, n.listener);
        return this;
    }, i.trigger = n("emitEvent"), i.emit = function(e) {
        var t = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(e, t);
    }, i.setOnceReturnValue = function(e) {
        return this._onceReturnValue = e, this;
    }, i._getOnceReturnValue = function() {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0;
    }, i._getEvents = function() {
        return this._events || (this._events = {});
    }, e.noConflict = function() {
        return r.EventEmitter = o, e;
    }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function() {
        return e;
    }) : "object" == typeof module && module.exports ? module.exports = e : this.EventEmitter = e;
}).call(this), function(e) {
    function t(t) {
        var n = e.event;
        return n.target = n.target || n.srcElement || t, n;
    }
    var n = document.documentElement, i = function() {};
    n.addEventListener ? i = function(e, t, n) {
        e.addEventListener(t, n, !1);
    } : n.attachEvent && (i = function(e, n, i) {
        e[n + i] = i.handleEvent ? function() {
            var n = t(e);
            i.handleEvent.call(i, n);
        } : function() {
            var n = t(e);
            i.call(e, n);
        }, e.attachEvent("on" + n, e[n + i]);
    });
    var r = function() {};
    n.removeEventListener ? r = function(e, t, n) {
        e.removeEventListener(t, n, !1);
    } : n.detachEvent && (r = function(e, t, n) {
        e.detachEvent("on" + t, e[t + n]);
        try {
            delete e[t + n];
        } catch (i) {
            e[t + n] = void 0;
        }
    });
    var o = {
        bind: i,
        unbind: r
    };
    "function" == typeof define && define.amd ? define("eventie/eventie", o) : e.eventie = o;
}(this), function(e, t) {
    "function" == typeof define && define.amd ? define([ "eventEmitter/EventEmitter", "eventie/eventie" ], function(n, i) {
        return t(e, n, i);
    }) : "object" == typeof exports ? module.exports = t(e, require("wolfy87-eventemitter"), require("eventie")) : e.imagesLoaded = t(e, e.EventEmitter, e.eventie);
}(window, function(e, t, n) {
    function i(e, t) {
        for (var n in t) e[n] = t[n];
        return e;
    }
    function r(e) {
        return "[object Array]" === d.call(e);
    }
    function o(e) {
        var t = [];
        if (r(e)) t = e; else if ("number" == typeof e.length) for (var n = 0, i = e.length; i > n; n++) t.push(e[n]); else t.push(e);
        return t;
    }
    function s(e, t, n) {
        if (!(this instanceof s)) return new s(e, t);
        "string" == typeof e && (e = document.querySelectorAll(e)), this.elements = o(e), 
        this.options = i({}, this.options), "function" == typeof t ? n = t : i(this.options, t), 
        n && this.on("always", n), this.getImages(), a && (this.jqDeferred = new a.Deferred());
        var r = this;
        setTimeout(function() {
            r.check();
        });
    }
    function f(e) {
        this.img = e;
    }
    function c(e) {
        this.src = e, v[e] = this;
    }
    var a = e.jQuery, u = e.console, h = u !== void 0, d = Object.prototype.toString;
    s.prototype = new t(), s.prototype.options = {}, s.prototype.getImages = function() {
        this.images = [];
        for (var e = 0, t = this.elements.length; t > e; e++) {
            var n = this.elements[e];
            "IMG" === n.nodeName && this.addImage(n);
            var i = n.nodeType;
            if (i && (1 === i || 9 === i || 11 === i)) for (var r = n.querySelectorAll("img"), o = 0, s = r.length; s > o; o++) {
                var f = r[o];
                this.addImage(f);
            }
        }
    }, s.prototype.addImage = function(e) {
        var t = new f(e);
        this.images.push(t);
    }, s.prototype.check = function() {
        function e(e, r) {
            return t.options.debug && h && u.log("confirm", e, r), t.progress(e), n++, n === i && t.complete(), 
            !0;
        }
        var t = this, n = 0, i = this.images.length;
        if (this.hasAnyBroken = !1, !i) return this.complete(), void 0;
        for (var r = 0; i > r; r++) {
            var o = this.images[r];
            o.on("confirm", e), o.check();
        }
    }, s.prototype.progress = function(e) {
        this.hasAnyBroken = this.hasAnyBroken || !e.isLoaded;
        var t = this;
        setTimeout(function() {
            t.emit("progress", t, e), t.jqDeferred && t.jqDeferred.notify && t.jqDeferred.notify(t, e);
        });
    }, s.prototype.complete = function() {
        var e = this.hasAnyBroken ? "fail" : "done";
        this.isComplete = !0;
        var t = this;
        setTimeout(function() {
            if (t.emit(e, t), t.emit("always", t), t.jqDeferred) {
                var n = t.hasAnyBroken ? "reject" : "resolve";
                t.jqDeferred[n](t);
            }
        });
    }, a && (a.fn.imagesLoaded = function(e, t) {
        var n = new s(this, e, t);
        return n.jqDeferred.promise(a(this));
    }), f.prototype = new t(), f.prototype.check = function() {
        var e = v[this.img.src] || new c(this.img.src);
        if (e.isConfirmed) return this.confirm(e.isLoaded, "cached was confirmed"), void 0;
        if (this.img.complete && void 0 !== this.img.naturalWidth) return this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), 
        void 0;
        var t = this;
        e.on("confirm", function(e, n) {
            return t.confirm(e.isLoaded, n), !0;
        }), e.check();
    }, f.prototype.confirm = function(e, t) {
        this.isLoaded = e, this.emit("confirm", this, t);
    };
    var v = {};
    return c.prototype = new t(), c.prototype.check = function() {
        if (!this.isChecked) {
            var e = new Image();
            n.bind(e, "load", this), n.bind(e, "error", this), e.src = this.src, this.isChecked = !0;
        }
    }, c.prototype.handleEvent = function(e) {
        var t = "on" + e.type;
        this[t] && this[t](e);
    }, c.prototype.onload = function(e) {
        this.confirm(!0, "onload"), this.unbindProxyEvents(e);
    }, c.prototype.onerror = function(e) {
        this.confirm(!1, "onerror"), this.unbindProxyEvents(e);
    }, c.prototype.confirm = function(e, t) {
        this.isConfirmed = !0, this.isLoaded = e, this.emit("confirm", this, t);
    }, c.prototype.unbindProxyEvents = function(e) {
        n.unbind(e.target, "load", this), n.unbind(e.target, "error", this);
    }, s;
});

(function(a) {
    a.fn.extend({
        customSelect: function(c) {
            if (typeof document.body.style.maxHeight === "undefined") {
                return this;
            }
            var e = {
                customClass: "customSelect",
                mapClass: true,
                mapStyle: true
            }, c = a.extend(e, c), d = c.customClass, f = function(h, k) {
                var g = h.find(":selected"), j = k.children(":first"), i = g.html() || "&nbsp;";
                j.html(i);
                if (g.attr("disabled")) {
                    k.addClass(b("DisabledOption"));
                } else {
                    k.removeClass(b("DisabledOption"));
                }
                setTimeout(function() {
                    k.removeClass(b("Open"));
                    a(document).off("mouseup.customSelect");
                }, 60);
            }, b = function(g) {
                return d + g;
            };
            return this.each(function() {
                var g = a(this), i = a("<span />").addClass(b("Inner")), h = a("<span />");
                g.after(h.append(i));
                h.addClass(d);
                if (c.mapClass) {
                    h.addClass(g.attr("class"));
                }
                if (c.mapStyle) {
                    h.attr("style", g.attr("style"));
                }
                g.addClass("hasCustomSelect").on("render.customSelect", function() {
                    f(g, h);
                    g.css("width", "");
                    var k = parseInt(g.outerWidth(), 10) - (parseInt(h.outerWidth(), 10) - parseInt(h.width(), 10));
                    h.css({
                        display: "inline-block"
                    });
                    var j = h.outerHeight();
                    if (g.attr("disabled")) {
                        h.addClass(b("Disabled"));
                    } else {
                        h.removeClass(b("Disabled"));
                    }
                    i.css({
                        width: k,
                        display: "inline-block"
                    });
                    g.css({
                        "-webkit-appearance": "menulist-button",
                        width: h.outerWidth(),
                        position: "absolute",
                        opacity: 0,
                        height: j,
                        fontSize: h.css("font-size")
                    });
                }).on("change.customSelect", function() {
                    h.addClass(b("Changed"));
                    f(g, h);
                }).on("keyup.customSelect", function(j) {
                    if (!h.hasClass(b("Open"))) {
                        g.trigger("blur.customSelect");
                        g.trigger("focus.customSelect");
                    } else {
                        if (j.which == 13 || j.which == 27) {
                            f(g, h);
                        }
                    }
                }).on("mousedown.customSelect", function() {
                    h.removeClass(b("Changed"));
                }).on("mouseup.customSelect", function(j) {
                    if (!h.hasClass(b("Open"))) {
                        if (a("." + b("Open")).not(h).length > 0 && typeof InstallTrigger !== "undefined") {
                            g.trigger("focus.customSelect");
                        } else {
                            h.addClass(b("Open"));
                            j.stopPropagation();
                            a(document).one("mouseup.customSelect", function(k) {
                                if (k.target != g.get(0) && a.inArray(k.target, g.find("*").get()) < 0) {
                                    g.trigger("blur.customSelect");
                                } else {
                                    f(g, h);
                                }
                            });
                        }
                    }
                }).on("focus.customSelect", function() {
                    h.removeClass(b("Changed")).addClass(b("Focus"));
                }).on("blur.customSelect", function() {
                    h.removeClass(b("Focus") + " " + b("Open"));
                }).on("mouseenter.customSelect", function() {
                    h.addClass(b("Hover"));
                }).on("mouseleave.customSelect", function() {
                    h.removeClass(b("Hover"));
                }).trigger("render.customSelect");
            });
        }
    });
})(jQuery);

var LastGang = LastGang || {};

LastGang.navigation = function() {
    var button = $(".toggle--nav-primary"), body = $("body");
    button.bind("click", function(e) {
        e.preventDefault();
        if (body.hasClass("nav--open")) {
            body.removeClass("nav--open");
            body.removeClass("overlay--opacity").delay(500).queue(function() {
                body.removeClass("overlay--height");
                $(this).dequeue();
            });
        } else {
            body.addClass("nav--open overlay--opacity overlay--height");
        }
    });
};

LastGang.eqHeights = function() {
    $(".eq-height").matchHeight({
        byRow: false,
        property: "height",
        target: null,
        remove: false
    });
    $(".placement-col").matchHeight({
        byRow: false,
        property: "height",
        target: null,
        remove: false
    });
    imagesLoaded($(".alm-listing"), function(instance) {
        $.fn.matchHeight._update();
        $(".eq-height").addClass("faded");
    });
};

LastGang.artNav = function() {
    var button = $(".toggle--div, .close-button"), nav = $(".min-nav"), list = $(".list-container"), icon = $(".ion-arrow-down-b");
    button.on("click", function(e) {
        e.preventDefault();
        expanded_height = list.find(".wrap-cols").outerHeight(true);
        list.toggleClass("list-open");
        if (list.hasClass("list-open")) {
            list.css("max-height", expanded_height);
        } else {
            list.css("max-height", 0);
        }
        nav.toggleClass("expand-list");
        icon.toggleClass("ion-arrow-up-b");
    });
};

LastGang.aboutPage = {
    init: function() {
        this.carousel();
        this.targets();
    },
    carousel: function() {
        var carousel = $(".sliding-text");
        carousel.find("h2").each(function() {
            var parts = $(this).text().split(" ");
            var updated_text = parts[0] + " " + parts[1] + "<br/>" + parts[2];
            $(this).html(updated_text);
        });
        carousel.slick({
            fade: true,
            cssEase: "linear",
            arrows: false,
            dots: false,
            autoplay: true,
            autoplaySpeed: 2e3,
            pauseOnHover: false
        }).animate({
            opacity: 1
        }, 1e3);
    },
    targets: function() {
        $("#aboutus-nav").find("li a").on("click", function(e) {
            e.preventDefault();
            var id = $(this).attr("href");
            $("html,body").animate({
                scrollTop: $(id).offset().top
            }, 700);
        });
    }
};

LastGang.artistPage = {
    init: function() {
        this.videoPlayer();
        this.videoEmbed();
        this.wrapBio();
    },
    videoPlayer: function() {
        var thumb = $(".video-thumb"), btn = thumb.find("button"), player = $(".video-player"), doc = $("html, body"), title = $(".videos-title");
        btn.on("click", function(e) {
            thumb.removeClass("active");
            $(this).parent().addClass("active");
            player.html($(this).data("embed")).delay(1e3).queue(function() {
                $this = $(this);
                $this.parent().addClass("showing");
                doc.animate({
                    scrollTop: title.offset().top
                }, 300, function() {
                    $this.dequeue();
                });
            });
        });
    },
    videoEmbed: function() {
        var btn = $(".embed");
        btn.on("click", function(e) {
            e.preventDefault();
            if ($(this).parent().find("textarea").length) {
                return;
            }
            var embed_code = $(this).siblings(".video-thumb").find("button").data("embed");
            $(this).before('<textarea onClick="this.setSelectionRange(0, this.value.length)">' + embed_code + "</textarea>");
            $(this).remove();
        });
    },
    wrapBio: function() {
        var showing = "";
        var hidden = "";
        var bio = $(".bio-extended").remove();
        var target = $(".bio");
        bio.find("p").each(function(index) {
            if (index < 1) {
                showing += $(this).clone().wrap("<p>").parent().html();
            } else {
                hidden += $(this).clone().wrap("<p>").parent().html();
            }
        });
        target.after('<button class="expand-bio">Load Full Bio <i class="ion-chevron-down"></i></button>');
        target.after('<div class="bio-hidden">' + hidden + "</div>");
        target.after('<div class="bio-showing">' + showing + "</div>");
        $(".expand-bio").on("click", function(event) {
            event.preventDefault();
            $(".bio-hidden").slideToggle(500);
            $(this).toggleClass("expanded");
            if ($(this).hasClass("expanded")) {
                $(this).html('Close Full Bio <i class="ion-chevron-up"></i>');
            } else {
                $(this).html('Load Full Bio <i class="ion-chevron-down"></i>');
            }
        });
    }
};

LastGang.shopify = {
    primaryNav: function() {
        $.ajax({
            url: AjaxHandler.ajaxurl,
            type: "GET",
            dataType: "html",
            data: {
                action: "primary_navigation"
            },
            success: function(data) {
                $("#nav-primary").append(data);
                $(".close-nav-mobile").on("click", function(e) {
                    e.preventDefault();
                    $("body").removeClass("nav--open");
                    $("body").removeClass("overlay--opacity").delay(500).queue(function() {
                        $("body").removeClass("overlay--height");
                        $(this).dequeue();
                    });
                });
            }
        });
    },
    footerNav: function() {
        $.ajax({
            url: AjaxHandler.ajaxurl,
            type: "GET",
            dataType: "html",
            data: {
                action: "footer_navigation"
            },
            success: function(data) {
                $("#site-footer").append(data);
            }
        });
    },
    globalNav: function() {
        $.ajax({
            url: AjaxHandler.ajaxurl,
            type: "GET",
            dataType: "html",
            data: {
                action: "global_navigation"
            },
            success: function(data) {
                $(".prepend-global").prepend(data);
            }
        });
    },
    cleanUpProductDescriptions: function() {
        $(".product-single .rte").find("img").remove();
    },
    shopSlider: function() {
        $(".shop-featured ul").slick({
            dots: true,
            arrows: false,
            autoplay: true,
            autoplaySpeed: 3e3
        });
    },
    cartCount: function() {
        var cart_url = "http://lastgang.myshopify.com/cart.json";
        $.ajax({
            type: "GET",
            url: cart_url,
            dataType: "jsonp",
            success: function(data) {
                var item_count = data["item_count"];
                if (item_count > 0) {
                    $("#CartCount").text(item_count);
                }
            }
        });
    },
    sortArtistNav: function() {
        var el = $(".artist-list li");
        if (!el.length) {
            return;
        }
        var starting_array = [];
        el.each(function(index) {
            starting_array.push($(this).clone().wrap("<li>").parent().html());
        });
        var array_divide = function(array, segmentCount) {
            var dataCount = array.length;
            if (dataCount === 0) return;
            var segmentLimit = Math.ceil(dataCount / segmentCount);
            var output_array = array_chunk(starting_array, segmentLimit);
            return output_array;
        };
        function array_chunk(input, size, preserve_keys) {
            var x, p = "", i = 0, c = -1, l = input.length || 0, n = [];
            if (size < 1) {
                return null;
            }
            if (Object.prototype.toString.call(input) === "[object Array]") {
                if (preserve_keys) {
                    while (i < l) {
                        (x = i % size) ? n[c][i] = input[i] : n[++c] = {}, n[c][i] = input[i];
                        i++;
                    }
                } else {
                    while (i < l) {
                        (x = i % size) ? n[c][x] = input[i] : n[++c] = [ input[i] ];
                        i++;
                    }
                }
            } else {
                if (preserve_keys) {
                    for (p in input) {
                        if (input.hasOwnProperty(p)) {
                            (x = i % size) ? n[c][p] = input[p] : n[++c] = {}, n[c][p] = input[p];
                            i++;
                        }
                    }
                } else {
                    for (p in input) {
                        if (input.hasOwnProperty(p)) {
                            (x = i % size) ? n[c][x] = input[p] : n[++c] = [ input[p] ];
                            i++;
                        }
                    }
                }
            }
            return n;
        }
        var new_array = array_divide(starting_array, 4);
        var html = "";
        $.each(new_array, function(index, value) {
            var ul = "";
            $.each(value, function(i, v) {
                ul += v;
            });
            html += '<div class="grid__item large--one-quarter medium--one-half small--one-whole"><ul>' + ul + "</ul></div>";
        });
        $(".artist-list div").html(html);
    }
};

LastGang.tinyNav = function() {
    $("#tinynav--artist-filters").tinyNav({
        header: "Filter By",
        active: "current_page_item"
    });
    var $cs = $(".tinynav").customSelect();
};

LastGang.interceptor = function() {
    $("a").not("#aboutus-nav a").on("click", function(event) {
        var href = $(this).attr("href"), body = $("body");
        if (href === "#" || $(this).data("intercept") === false) {
            return;
        }
        if ($(this).attr("target") !== "_blank") {
            event.preventDefault();
            body.removeClass("nav--open");
            body.removeClass("overlay--opacity").delay(500).queue(function() {
                body.removeClass("overlay--height");
                $(this).dequeue();
                $("body").fadeOut(300, function() {
                    window.location.href = href;
                });
            });
        }
    });
};

LastGang.placements = function() {
    var trigger = $(".placements-col button");
    trigger.on("click", function(e) {
        e.preventDefault();
        $(this).siblings(".hidden").slideToggle(300);
    });
};

LastGang.wrapIframes = function() {
    var iframes = $("iframe");
    iframes.each(function() {
        if (!$(this).parent().hasClass("custom-iframe")) {
            $(this).wrap("<div class='video-container'></div>");
        }
    });
};

LastGang.detectIE = function() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var ie = false;
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        ie = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
    }
    return ie;
};

LastGang.init = function() {
    this.navigation();
    this.eqHeights();
    this.artNav();
    this.artistPage.init();
    this.aboutPage.init();
    this.shopify.cartCount();
    this.placements();
    LastGang.wrapIframes();
};

(function() {
    LastGang.init();
    $.fn.almComplete = function(alm) {
        LastGang.eqHeights();
    };
    if (LastGang.detectIE() !== false) {
        $(".eq-height").addClass("faded");
        console.log(LastGang.detectIE());
    }
    if ($("body").hasClass("home")) {
        $("#featured--home").slick({
            fade: true,
            cssEase: "linear",
            arrows: false,
            dots: false,
            autoplay: true,
            autoplaySpeed: 3e3,
            pauseOnHover: false
        }).animate({
            opacity: 1
        }, 1e3);
    }
})();
//# sourceMappingURL=combined.js.map