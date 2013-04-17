/*
 * Tiny Scrollbar
 * http://www.baijs.nl/tinyscrollbar/
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Date: 13 / 08 / 2012
 * @version 1.81
 * @author Maarten Baijs
 * @modified by KodingSykosis
 */
(function ($) {

    $.tiny = $.tiny || {};

    $.tiny.scrollbar = {
        options: {
            axis: 'y'    // vertical or horizontal scrollbar? ( x || y ).
            , wheel: 40     // how many pixels must the mouswheel scroll at a time.
            , scroll: true   // enable or disable the mousewheel.
            , lockscroll: true   // return scrollwheel to browser if there is no more content.
            , size: 'auto' // set the size of the scrollbar to auto or a fixed number.
            , sizethumb: 'auto' // set the size of the thumb to auto or a fixed number.
            , invertscroll: false  // Enable mobile invert style scrolling
            , scrollPadding: 5
            , trackPadding: 3
            , contentPadding: 15
            , pagingAt: '75%'   //Should support both %, px, and int
            , pagingUrl: null
            , pagingData: {}
            , pagingKey: 'page'
            , pagingMax: 10
            , pagingAppendTo: null
            , updateWithWindow: true
        }
    };

    $.fn.tinyscrollbar = function (params) {
        var options = $.extend({}, $.tiny.scrollbar.options, params);

        this.each(function () {
            $(this).data('tsb', new Scrollbar($(this), options));
        });

        return this;
    };

    $.fn.tinyscrollbar_update = function (sScroll) {
        return $(this).data('tsb').update(sScroll);
    };

    $.fn.tinyscrollbar_paging = function () {
        var instance = $(this).data('tsb');
        return instance.resetPaging.apply(instance, arguments);
    };

    function Scrollbar(root, options) {
        if (root.children('.viewport').length == 0) {

            //add all children to a content layer
            var content = $('<div class="content">').css({ position: 'relative' });
            root.append(content);

            root.children()
                .not(content)
                .appendTo(
                    root.children('.content')
                );

            //add content layer to viewport
            content.wrap(
                $('<div class="viewport">')
            );

            //add scroll bar layers
            root.append($('<div class="scrollbar"><div class="track"><div class="thumb"></div></div></div>'));
            options.invertscroll = typeof window.orientation != 'undefined';
        }

        root.addClass('tinyscrollbar');

        var oSelf = this
            , oWrapper = root
            , oViewport = { obj: $('.viewport', root) }
            , oContent = { obj: $('.content', root), padding: options.contentPadding }
            , oScrollbar = { obj: $('.scrollbar', root), padding: options.scrollPadding }
            , oTrack = { obj: $('.track', oScrollbar.obj), padding: options.trackPadding }
            , oThumb = { obj: $('.thumb', oScrollbar.obj) }
            , sAxis = options.axis === 'x'
            , sDirection = sAxis ? 'left' : 'top'
            , sAltDirection = sAxis ? 'bottom' : 'right'
            , sSize = sAxis ? 'Width' : 'Height'
            , sAltSize = sAxis ? 'height' : 'width'
            , iScroll = 0
            , iPosition = { start: 0, now: 0 }
            , iMouse = {}
            , touchEvents = 'ontouchstart' in document.documentElement
            , paging = {
                at: 0,
                num: options.pagingNum || 1,
                url: options.pagingUrl,
                data: options.pagingData,
                key: options.pagingKey,
                max: options.pagingMax + 1,
                appendTo: options.pagingAppendTo
            }
            ;

        function initialize() {
            oSelf.update();
            setEvents();

            return oSelf;
        }

        this.update = function (sScroll) {
            oViewport[options.axis] = oViewport.obj.prop('offset' + sSize);
            oContent[options.axis] = oContent.obj.prop('scroll' + sSize)
                + oContent.padding;
            oContent.ratio = oViewport[options.axis] / oContent[options.axis];
            oScrollbar.obj.toggleClass('disable', oContent.ratio >= 1);

            oTrack[options.axis] = options.size === 'auto' ? oViewport[options.axis] - (oScrollbar.padding * 2) : options.size;
            oThumb[options.axis] = Math.min(oTrack[options.axis] - (oTrack.padding * 2), Math.max(0, (options.sizethumb === 'auto' ? ((oTrack[options.axis] - (oTrack.padding * 2)) * oContent.ratio) : options.sizethumb)));

            oScrollbar.ratio = options.sizethumb === 'auto' ? (oContent[options.axis] / oTrack[options.axis]) : (oContent[options.axis] - oViewport[options.axis]) / (oTrack[options.axis] - oThumb[options.axis]);

            iScroll = (sScroll === 'relative' && oContent.ratio <= 1) ? Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll)) : 0;
            iScroll = (sScroll === 'bottom' && oContent.ratio <= 1) ? (oContent[options.axis] - oViewport[options.axis]) : isNaN(parseInt(sScroll, 10)) ? iScroll : parseInt(sScroll, 10);

            setSize();
        };

        this.resetPaging = function (resetScroll, config) {
            if (typeof resetScroll === 'object') {
                config = resetScroll;
                resetScroll = false;
            }

            paging = $.extend({ }, paging, config);

            if (resetScroll) {
                this.update(0);
            }
        };

        function setSize() {
            var sCssSize = sSize.toLowerCase();

            oViewport.obj.css(sAltDirection, (oContent.ratio >= 1) ? '0px' : oScrollbar.obj[sAltSize]());
            oScrollbar.obj.css(sDirection, oScrollbar.padding);
            oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
            oContent.obj.css(sDirection, -iScroll);
            iMouse.start = oThumb.obj.offset()[sDirection];

            oScrollbar.obj.css(sCssSize, oViewport[options.axis]);
            oTrack.obj.css(sCssSize, oTrack[options.axis]);
            oThumb.obj.css(sCssSize, oThumb[options.axis]);
            
            if (paging.url) {
                paging.at = getPagePosition();
            }
        }

        function setEvents() {
            if (!touchEvents) {
                oThumb.obj.bind('mousedown', start);
                oTrack.obj.bind('mouseup', drag);
            }
            else {
                oViewport.obj[0].ontouchstart = function (event) {
                    if (1 === event.touches.length) {
                        start(event.touches[0]);
                        event.stopPropagation();
                    }
                };
            }

            if (options.scroll && window.addEventListener) {
                oWrapper[0].addEventListener('DOMMouseScroll', wheel, false);
                oWrapper[0].addEventListener('mousewheel', wheel, false);
            }
            else if (options.scroll) {
                oWrapper[0].onmousewheel = wheel;
            }
            
            if (options.updateWithWindow) {
                $(window).resize(function() {
                    oSelf.update('relative');
                });
            }
        }

        function start(event) {
            $("body").addClass("noSelect");

            var oThumbDir = parseInt(oThumb.obj.css(sDirection), 10);
            iMouse.start = sAxis ? event.pageX : event.pageY;
            iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;

            if (!touchEvents) {
                $(document).bind('mousemove', drag);
                $(document).bind('mouseup', end);
                oThumb.obj.bind('mouseup', end);
            }
            else {
                document.ontouchmove = function (event) {
                    event.preventDefault();
                    drag(event.touches[0]);
                };
                document.ontouchend = end;
            }
        }

        function wheel(event) {
            if (oContent.ratio < 1) {
                var oEvent = event || window.event
                    , iDelta = oEvent.wheelDelta ? oEvent.wheelDelta / 120 : -oEvent.detail / 3
                    ;

                iScroll -= iDelta * options.wheel;
                iScroll = Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll));

                oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
                oContent.obj.css(sDirection, -iScroll);
                triggerScrollEvents({ now: iScroll });

                if (options.lockscroll || (iScroll !== (oContent[options.axis] - oViewport[options.axis]) && iScroll !== 0)) {
                    oEvent = $.event.fix(oEvent);
                    oEvent.preventDefault();
                }
            }
        }

        function drag(event) {
            if (oContent.ratio < 1) {
                if (options.invertscroll && touchEvents) {
                    iPosition.now = Math.min((oTrack[options.axis] - oThumb[options.axis]), Math.max(0, (iPosition.start + (iMouse.start - (sAxis ? event.pageX : event.pageY)))));
                }
                else {
                    iPosition.now = Math.min((oTrack[options.axis] - oThumb[options.axis]), Math.max(0, (iPosition.start + ((sAxis ? event.pageX : event.pageY) - iMouse.start))));
                }

                iScroll = iPosition.now * oScrollbar.ratio;
                oContent.obj.css(sDirection, -iScroll);
                oThumb.obj.css(sDirection, iPosition.now);
                oScrollbar.obj.addClass("scrolling");
            }
        }

        function end() {
            $("body").removeClass("noSelect");
            $(document).unbind('mousemove', drag);
            $(document).unbind('mouseup', end);
            oThumb.obj.unbind('mouseup', end);
            oScrollbar.obj.removeClass("scrolling");
            document.ontouchmove = document.ontouchend = null;
            triggerScrollEvents(iPosition);
        }
        
        function triggerScrollEvents(position) {
            var pos = $.extend({ axis: options.axis }, position);
            root.trigger('scroll', $.Event('scroll'), pos);

            if (pos.axis === 'y' && pos.now >= paging.at && paging.at > 0 && paging.num < paging.max) {
                root.trigger('pagitation', $.Event('scroll'), pos);
                gotoPage(paging.num++);
                paging.at = 0;
            }
        }

        function gotoPage(pageNumber) {
            if (!paging.url) return;
            if (typeof paging.data === 'string') {
                paging.data = JSON.parse(
                    '{"' +
                        decodeURI(paging.data
                                        .replace(/&/g, '","')
                                        .replace(/=/g, '":"'))
                        + '"}'
                );
            }

            var query = $.extend({}, paging.data);
            query[paging.key] = pageNumber;

            $.get(paging.url, query, function (data, status) {
                if (status !== 'success') return;
                if (data == '') paging.max = paging.num;
                
                if (root.trigger('pagingappend', $.Event('paging', data))) {
                    $(paging.appendTo || oContent.obj).append(data);
                }
                
                oSelf.update('relative');
            });
            
        }
        
        function getPagePosition() {
            var re = /^([0-9]+)%$/,
                bottom = (oContent[options.axis] - oViewport[options.axis]);
            
            if (re.test(options.pagingAt)) {
                return bottom * (parseFloat(re.exec(options.pagingAt)[1]) / 100);
            }

            return bottom - parseFloat(options.pagingAt);
        }

        return initialize();
    }

} (jQuery));
