/* =============================================================
 * bootstrap3-typeahead.js v4.0.2
 * https://github.com/bassjobsen/Bootstrap-3-Typeahead
 * =============================================================
 * Original written by @mdo and @fat
 * =============================================================
 * Copyright 2014 Bass Jobsen @bassjobsen
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


(function (root, factory) {

    'use strict';

    // CommonJS module is defined
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('jquery'));
    }
    // AMD module is defined
    else if (typeof define === 'function' && define.amd) {
        define(['jquery'], function ($) {
            return factory($);
        });
    } else {
        factory(root.jQuery);
    }

}(this, function ($) {

    'use strict';
    // jshint laxcomma: true


    /* TYPEAHEAD PUBLIC CLASS DEFINITION
     * ================================= */

    var Typeahead = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Typeahead.defaults, options);
        this.matcher = this.options.matcher || this.matcher;
        this.sorter = this.options.sorter || this.sorter;
        this.select = this.options.select || this.select;
        this.autoSelect = typeof this.options.autoSelect == 'boolean' ? this.options.autoSelect : true;
        this.highlighter = this.options.highlighter || this.highlighter;
        this.render = this.options.render || this.render;
        this.updater = this.options.updater || this.updater;
        this.displayText = this.options.displayText || this.displayText;
        this.itemLink = this.options.itemLink || this.itemLink;
        this.itemTitle = this.options.itemTitle || this.itemTitle;
        this.followLinkOnSelect = this.options.followLinkOnSelect || this.followLinkOnSelect;
        this.source = this.options.source;
        this.delay = this.options.delay;
        this.theme = this.options.theme && this.options.themes && this.options.themes[this.options.theme] || Typeahead.defaults.themes[Typeahead.defaults.theme];
        this.$menu = $(this.options.menu || this.theme.menu);
        this.$appendTo = this.options.appendTo ? $(this.options.appendTo) : null;
        this.fitToElement = typeof this.options.fitToElement == 'boolean' ? this.options.fitToElement : false;
        this.shown = false;
        this.listen();
        this.showHintOnFocus = typeof this.options.showHintOnFocus == 'boolean' || this.options.showHintOnFocus === 'all' ? this.options.showHintOnFocus : false;
        this.afterSelect = this.options.afterSelect;
        this.afterEmptySelect = this.options.afterEmptySelect;
        // PIOREK94: Added afterRender call back function useful for using
        // plugins that depend on the HTML being rendered on the page, ex.
        // Bootstrap tooltips for each typeahead option
        this.afterRender = this.options.afterRender;
        // PIOREK94: end of custom code
        this.addItem = false;
        this.value = this.$element.val() || this.$element.text();
        this.keyPressed = false;
        this.focused = this.$element.is(':focus');
        this.changeInputOnSelect = this.options.changeInputOnSelect || this.changeInputOnSelect;
        this.changeInputOnMove = this.options.changeInputOnMove || this.changeInputOnMove;
        this.openLinkInNewTab = this.options.openLinkInNewTab || this.openLinkInNewTab;
        this.selectOnBlur = this.options.selectOnBlur || this.selectOnBlur;
        this.showCategoryHeader = this.options.showCategoryHeader || this.showCategoryHeader;
    };

    Typeahead.prototype = {

        constructor: Typeahead,


        setDefault: function (val) {
            // var val = this.$menu.find('.active').data('value');
            this.$element.data('active', val);
            if (this.autoSelect || val) {
                var newVal = this.updater(val);
                // Updater can be set to any random functions via "options" parameter in constructor above.
                // Add null check for cases when updater returns void or undefined.
                if (!newVal) {
                    newVal = '';
                }
                this.$element
                    .val(this.displayText(newVal) || newVal)
                    .text(this.displayText(newVal) || newVal)
                    .change();
                this.afterSelect(newVal);
            }
            return this.hide();
        },

        select: function () {
            var val = this.$menu.find('.active').data('value');

            this.$element.data('active', val);
            if (this.autoSelect || val) {
                var newVal = this.updater(val);
                // Updater can be set to any random functions via "options" parameter in constructor above.
                // Add null check for cases when updater returns void or undefined.
                if (!newVal) {
                    newVal = '';
                }

                if (this.changeInputOnSelect) {
                    this.$element
                        .val(this.displayText(newVal) || newVal)
                        .text(this.displayText(newVal) || newVal)
                        .change();
                }

                if (this.followLinkOnSelect && this.itemLink(val)) {
                    if (this.openLinkInNewTab) {
                        window.open(this.itemLink(val), '_blank');
                    } else {
                        document.location = this.itemLink(val);
                    }
                    this.afterSelect(newVal);
                } else if (this.followLinkOnSelect && !this.itemLink(val)) {
                    this.afterEmptySelect(newVal);
                } else {
                    this.afterSelect(newVal);
                }
            } else {
                this.afterEmptySelect();
            }

            return this.hide();
        },

        updater: function (item) {
            return item;
        },

        setSource: function (source) {
            this.source = source;
        },

        show: function () {
            var pos = $.extend({}, this.$element.position(), {
                height: this.$element[0].offsetHeight
            });

            var scrollHeight = typeof this.options.scrollHeight == 'function' ?
                this.options.scrollHeight.call() :
                this.options.scrollHeight;

            var element;
            if (this.shown) {
                element = this.$menu;
            } else if (this.$appendTo) {
                element = this.$menu.appendTo(this.$appendTo);
                this.hasSameParent = this.$appendTo.is(this.$element.parent());
            } else {
                element = this.$menu.insertAfter(this.$element);
                this.hasSameParent = true;
            }

            if (!this.hasSameParent) {
                // We cannot rely on the element position, need to position relative to the window
                element.css('position', 'fixed');
                var offset = this.$element.offset();
                pos.top = offset.top;
                pos.left = offset.left;
            }
            // The rules for bootstrap are: 'dropup' in the parent and 'dropdown-menu-right' in the element.
            // Note that to get right alignment, you'll need to specify `menu` in the options to be:
            // '<ul class="typeahead dropdown-menu" role="listbox"></ul>'
            var dropup = $(element).parent().hasClass('dropup');
            var newTop = dropup ? 'auto' : (pos.top + pos.height + scrollHeight);
            var right = $(element).hasClass('dropdown-menu-right');
            var newLeft = right ? 'auto' : pos.left;
            // it seems like setting the css is a bad idea (just let Bootstrap do it), but I'll keep the old
            // logic in place except for the dropup/right-align cases.
            element.css({ top: newTop, left: newLeft }).show();

            if (this.options.fitToElement === true) {
                element.css('width', this.$element.outerWidth() + 'px');
            }

            this.shown = true;
            // PIOREK94: Added afterRender call back function useful for using
            // plugins that depend on the HTML being rendered on the page, ex.
            // Bootstrap tooltips for each typeahead option
            this.afterRender();
            // PIOREK94: end of custom code
            return this;
        },

        hide: function () {
            this.$menu.hide();
            this.shown = false;
            return this;
        },

        lookup: function (query) {
            if (typeof(query) != 'undefined' && query !== null) {
                this.query = query;
            } else {
                this.query = this.$element.val();
            }

            if (this.query.length < this.options.minLength && !this.options.showHintOnFocus) {
                return this.shown ? this.hide() : this;
            }

            var worker = $.proxy(function () {

                // Bloodhound (since 0.11) needs three arguments.
                // Two of them are callback functions (sync and async) for local and remote data processing
                // see https://github.com/twitter/typeahead.js/blob/master/src/bloodhound/bloodhound.js#L132
                if ($.isFunction(this.source) && this.source.length === 3) {
                    this.source(this.query, $.proxy(this.process, this), $.proxy(this.process, this));
                } else if ($.isFunction(this.source)) {
                    this.source(this.query, $.proxy(this.process, this));
                } else if (this.source) {
                    this.process(this.source);
                }
            }, this);

            clearTimeout(this.lookupWorker);
            this.lookupWorker = setTimeout(worker, this.delay);
        },

        process: function (items) {
            var that = this;

            items = $.grep(items, function (item) {
                return that.matcher(item);
            });

            items = this.sorter(items);

            if (!items.length && !this.options.addItem) {
                return this.shown ? this.hide() : this;
            }

            if (items.length > 0) {
                this.$element.data('active', items[0]);
            } else {
                this.$element.data('active', null);
            }

            if (this.options.items != 'all') {
                items = items.slice(0, this.options.items);
            }

            // Add item
            if (this.options.addItem) {
                items.push(this.options.addItem);
            }

            return this.render(items).show();
        },

        matcher: function (item) {
            var it = this.displayText(item);
            return ~it.toLowerCase().indexOf(this.query.toLowerCase());
        },

        sorter: function (items) {
            var beginswith = [];
            var caseSensitive = [];
            var caseInsensitive = [];
            var item;

            while ((item = items.shift())) {
                var it = this.displayText(item);
                if (!it.toLowerCase().indexOf(this.query.toLowerCase())) {
                    beginswith.push(item);
                } else if (~it.indexOf(this.query)) {
                    caseSensitive.push(item);
                } else {
                    caseInsensitive.push(item);
                }
            }

            return beginswith.concat(caseSensitive, caseInsensitive);
        },

        highlighter: function (item) {
            var text = this.query;
            if (text === '') {
                return item;
            }
            var matches = item.match(/(>)([^<]*)(<)/g);
            var first = [];
            var second = [];
            var i;
            if (matches && matches.length) {
                // html
                for (i = 0; i < matches.length; ++i) {
                    if (matches[i].length > 2) {// escape '><'
                        first.push(matches[i]);
                    }
                }
            } else {
                // text
                first = [];
                first.push(item);
            }
            text = text.replace((/[\(\)\/\.\*\+\?\[\]]/g), function (mat) {
                return '\\' + mat;
            });
            var reg = new RegExp(text, 'g');
            var m;
            for (i = 0; i < first.length; ++i) {
                m = first[i].match(reg);
                if (m && m.length > 0) {// find all text nodes matches
                    second.push(first[i]);
                }
            }
            for (i = 0; i < second.length; ++i) {
                item = item.replace(second[i], second[i].replace(reg, '<strong>$&</strong>'));
            }
            return item;
        },

        render: function (items) {
            var that = this;
            var self = this;
            var activeFound = false;
            var data = [];
            var _category = that.options.separator;

            $.each(items, function (key, value) {
                // inject separator
                if (key > 0 && value[_category] !== items[key - 1][_category]) {
                    data.push({
                        __type: 'divider'
                    });
                }

                // PIOREK94: fix not showing category header
                if (self.showCategoryHeader) {
                // PIOREK94: end of custom code
                // if (this.showCategoryHeader) {
                    // inject category header
                    if (value[_category] && (key === 0 || value[_category] !== items[key - 1][_category])) {
                        data.push({
                            __type: 'category',
                            name: value[_category]
                        });
                    }
                }

                data.push(value);
            });

            items = $(data).map(function (i, item) {
                    if ((item.__type || false) == 'category'){
                        return $(that.options.headerHtml || that.theme.headerHtml).text(item.name)[0];
                    }

                    if ((item.__type || false) == 'divider'){
                        return $(that.options.headerDivider || that.theme.headerDivider)[0];
                    }

                    var text = self.displayText(item);
                    i = $(that.options.item || that.theme.item).data('value', item);
                    i.find(that.options.itemContentSelector || that.theme.itemContentSelector)
                        .addBack(that.options.itemContentSelector || that.theme.itemContentSelector)
                        .html(that.highlighter(text, item));
                    if(that.options.followLinkOnSelect) {
                        i.find('a').attr('href', self.itemLink(item));
                    }
                    i.find('a').attr('title', self.itemTitle(item));
                    if (text == self.$element.val()) {
                        // PIOREK94: Bootstrap 4 highlight fix: active class has to be added to li>a element not li, for backward compatibility add to both
                        i.addClass('active').find('a').addClass('active');
                        // PIOREK94: end of custom code
                        // i.addClass('active');
                        self.$element.data('active', item);
                        activeFound = true;
                    }
                    return i[0];
                });

            if (this.autoSelect && !activeFound) {
                // PIOREK94: Bootstrap 4 highlight fix: active class has to be added to li>a element not li, for backward compatibility add to both
                items.filter(':not(.dropdown-header)').first().addClass('active').find('a').addClass('active');
                // PIOREK94: end of custom code
                // items.filter(':not(.dropdown-header)').first().addClass('active');
                this.$element.data('active', items.first().data('value'));
            }
            this.$menu.html(items);
            return this;
        },

        displayText: function (item) {
            return typeof item !== 'undefined' && typeof item.name != 'undefined' ? item.name : item;
        },

        itemLink: function (item) {
            return null;
        },

        itemTitle: function (item) {
            return null;
        },

        next: function (event) {
            var active = this.$menu.find('.active').removeClass('active');
            var next = active.next();

            if (!next.length) {
                // PIOREK94: Added handling for up/down key scrolling and a carousel option
                if (this.options.carousel) {
                    next = $(this.$menu.find($(this.options.item || this.theme.item).prop('tagName'))[0]);
                } else {
                    next = active; // stop at end of list
                }
                // PIOREK94: end of custom code
                // next = $(this.$menu.find($(this.options.item || this.theme.item).prop('tagName'))[0]);
            }

            while (next.hasClass('divider') || next.hasClass('dropdown-header')) {
                next = next.next();
            }

            // PIOREK94: Bootstrap 4 highlight fix: active class has to be added to li>a element not li, for backward compatibility add to both
            next.addClass('active').find('a').addClass('active');
            // PIOREK94: end of custom code
            // next.addClass('active');
            // added for screen reader
            // PIOREK94: updater should not be triggered on move when
            // changeInputOnMove is false - this introduces incompatibility with
            // bootstrap-tagsinput (even if changeInputOnMove is false new tag
            // is inserted on move)
            if (this.changeInputOnMove) {
                var newVal = this.updater(next.data('value'));
                this.$element.val(this.displayText(newVal) || newVal);
            }
            // PIOREK94: end of custom code
            // var newVal = this.updater(next.data('value'));
            // if (this.changeInputOnMove) {
            //     this.$element.val(this.displayText(newVal) || newVal);
            // }

            // PIOREK94: Added handling for up/down key scrolling and a carousel option
            // added to scroll parent container
            var el_selector = this.theme === 'bootstrap3' ? 'ul' : 'div';
            var offset_in_list = next.offset().top - next.closest(el_selector + ' .typeahead').offset().top;
            var item_height = next.outerHeight();

            if (offset_in_list > next.closest(el_selector + ' .typeahead').height()) {
                next.closest(el_selector + ' .typeahead').scrollTop(next.closest(el_selector + ' .typeahead').scrollTop() + item_height);
            }
            // PIOREK94: end of custom code
        },

        prev: function (event) {
            var active = this.$menu.find('.active').removeClass('active');
            var prev = active.prev();

            if (!prev.length) {
                // PIOREK94: Added handling for up/down key scrolling and a carousel option
                if (this.options.carousel) {
                    prev = this.$menu.find($(this.options.item || this.theme.item).prop('tagName')).last();
                } else {
                    prev = active; // stop at start of list
                }
                // PIOREK94: end of custom code
                // prev = this.$menu.find($(this.options.item || this.theme.item).prop('tagName')).last();
            }

            while (prev.hasClass('divider') || prev.hasClass('dropdown-header')) {
                prev = prev.prev();
            }

            // PIOREK94: Bootstrap 4 highlight fix: active class has to be added to li>a element not li, for backward compatibility add to both
            prev.addClass('active').find('a').addClass('active');
            // PIOREK94: end of custom code
            // prev.addClass('active');
            // added for screen reader
            // PIOREK94: updater should not be triggered on move when
            // changeInputOnMove is false - this introduces incompatibility with
            // bootstrap-tagsinput (even if changeInputOnMove is false new tag
            // is inserted on move)
            if (this.changeInputOnMove) {
                var newVal = this.updater(prev.data('value'));
                this.$element.val(this.displayText(newVal) || newVal);
            }
            // PIOREK94: end of custom code
            // var newVal = this.updater(prev.data('value'));
            // if (this.changeInputOnMove) {
            //     this.$element.val(this.displayText(newVal) || newVal);
            // }

            // PIOREK94: Added handling for up/down key scrolling and a carousel option
            // added to scroll parent container
            var el_selector = this.theme === 'bootstrap3' ? 'ul' : 'div';
            var offset_in_list = prev.offset().top - prev.closest(el_selector + ' .typeahead').offset().top;
            var item_height = prev.outerHeight();

            if (offset_in_list < 0) {
                prev.closest(el_selector + ' .typeahead').scrollTop(prev.closest(el_selector + ' .typeahead').scrollTop() - item_height);
            }
            // PIOREK94: end of custom code
        },

        listen: function () {
            this.$element
                .on('focus.bootstrap3Typeahead', $.proxy(this.focus, this))
                .on('blur.bootstrap3Typeahead', $.proxy(this.blur, this))
                .on('keypress.bootstrap3Typeahead', $.proxy(this.keypress, this))
                .on('propertychange.bootstrap3Typeahead input.bootstrap3Typeahead', $.proxy(this.input, this))
                .on('keyup.bootstrap3Typeahead', $.proxy(this.keyup, this));

            if (this.eventSupported('keydown')) {
                this.$element.on('keydown.bootstrap3Typeahead', $.proxy(this.keydown, this));
            }

            var itemTagName = $(this.options.item || this.theme.item).prop('tagName');
            if ('ontouchstart' in document.documentElement && 'onmousemove' in document.documentElement) {
		        this.$menu
		            .on('touchstart', itemTagName, $.proxy(this.touchstart, this))
		            .on('touchend', itemTagName, $.proxy(this.click, this))
		            .on('click', $.proxy(this.click, this))
		            .on('mouseenter', itemTagName, $.proxy(this.mouseenter, this))
		            .on('mouseleave', itemTagName, $.proxy(this.mouseleave, this))
		            .on('mousedown', $.proxy(this.mousedown,this));
	        } else if ('ontouchstart' in document.documentElement) {
		        this.$menu
		            .on('touchstart', itemTagName, $.proxy(this.touchstart, this))
		            .on('touchend', itemTagName, $.proxy(this.click, this));
	        } else {
                this.$menu
                    .on('click', $.proxy(this.click, this))
                    .on('mouseenter', itemTagName, $.proxy(this.mouseenter, this))
                    .on('mouseleave', itemTagName, $.proxy(this.mouseleave, this))
                    .on('mousedown', $.proxy(this.mousedown, this));
            }
        },

        destroy: function () {
            this.$element.data('typeahead', null);
            this.$element.data('active', null);
            this.$element
                .unbind('focus.bootstrap3Typeahead')
                .unbind('blur.bootstrap3Typeahead')
                .unbind('keypress.bootstrap3Typeahead')
                .unbind('propertychange.bootstrap3Typeahead input.bootstrap3Typeahead')
                .unbind('keyup.bootstrap3Typeahead');

            if (this.eventSupported('keydown')) {
                // PIOREK94: fix error keydown after event destroyed
                this.$element.unbind('keydown.bootstrap3Typeahead');
                // PIOREK94: end of custom code
                // this.$element.unbind('keydown.bootstrap3-typeahead');
            }

            this.$menu.remove();
            this.destroyed = true;
        },

        eventSupported: function (eventName) {
            var isSupported = eventName in this.$element;
            if (!isSupported) {
                this.$element.setAttribute(eventName, 'return;');
                isSupported = typeof this.$element[eventName] === 'function';
            }
            return isSupported;
        },

        move: function (e) {
            if (!this.shown) {
                return;
            }

            switch (e.keyCode) {
                case 9: // tab
                case 13: // enter
                case 27: // escape
                    e.preventDefault();
                    break;

                case 38: // up arrow
                    // with the shiftKey (this is actually the left parenthesis)
                    if (e.shiftKey) {
                        return;
                    }
                    e.preventDefault();
                    this.prev();
                    break;

                case 40: // down arrow
                    // with the shiftKey (this is actually the right parenthesis)
                    if (e.shiftKey) {
                        return;
                    }
                    e.preventDefault();
                    this.next();
                    break;
            }
        },

        keydown: function (e) {
            /**
             * Prevent to make an ajax call while copying and pasting.
             *
             * @author Simone Sacchi
             * @version 2018/01/18
             */
            if (e.keyCode === 17) { // ctrl
                return;
            }
            this.keyPressed = true;
            this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40, 38, 9, 13, 27]);
            if (!this.shown && e.keyCode == 40) {
                this.lookup();
            } else {
                this.move(e);
            }
        },

        keypress: function (e) {
            if (this.suppressKeyPressRepeat) {
                return;
            }
            this.move(e);
        },

        input: function (e) {
            // This is a fixed for IE10/11 that fires the input event when a placehoder is changed
            // (https://connect.microsoft.com/IE/feedback/details/810538/ie-11-fires-input-event-on-focus)
            var currentValue = this.$element.val() || this.$element.text();
            if (this.value !== currentValue) {
                this.value = currentValue;
                this.lookup();
            }
        },

        keyup: function (e) {
            if (this.destroyed) {
                return;
            }
            switch (e.keyCode) {
                case 40: // down arrow
                case 38: // up arrow
                case 16: // shift
                case 17: // ctrl
                case 18: // alt
                    break;

                case 9: // tab
                    if (!this.shown || (this.showHintOnFocus && !this.keyPressed)) {
                        return;
                    }
                    this.select();
                    break;
                case 13: // enter
                    if (!this.shown) {
                        return;
                    }
                    this.select();
                    break;

                case 27: // escape
                    if (!this.shown) {
                        return;
                    }
                    this.hide();
                    break;
            }

        },

        focus: function (e) {
            if (!this.focused) {
                this.focused = true;
                this.keyPressed = false;
                if (this.options.showHintOnFocus && this.skipShowHintOnFocus !== true) {
                    if (this.options.showHintOnFocus === 'all') {
                        this.lookup('');
                    } else {
                        this.lookup();
                    }
                }
            }
            if (this.skipShowHintOnFocus) {
                this.skipShowHintOnFocus = false;
            }
        },

        blur: function (e) {
            if (!this.mousedover && !this.mouseddown && this.shown) {
                if (this.selectOnBlur) {
                    this.select();
                }
                this.hide();
                this.focused = false;
                this.keyPressed = false;
            } else if (this.mouseddown) {
                // This is for IE that blurs the input when user clicks on scroll.
                // We set the focus back on the input and prevent the lookup to occur again
                this.skipShowHintOnFocus = true;
                this.$element.focus();
                this.mouseddown = false;
            }
        },

        click: function (e) {
            e.preventDefault();
            this.skipShowHintOnFocus = true;
            this.select();
            this.$element.focus();
            this.hide();
        },

        mouseenter: function (e) {
            this.mousedover = true;
            this.$menu.find('.active').removeClass('active');
            // PIOREK94: Bootstrap 4 highlight fix: active class has to be added to li>a element not li, for backward compatibility add to both
            $(e.currentTarget).addClass('active').find('a').addClass('active');
            // PIOREK94: end of custom code
            // $(e.currentTarget).addClass('active');
        },

        mouseleave: function (e) {
            this.mousedover = false;
            // PIOREK94: remove the active element when moving the mouse outside of the list
            if (! this.selectOnBlur) {
                this.$menu.find('.active').removeClass('active');
            }
            // PIOREK94: end of custom code
            if (!this.focused && this.shown) {
                this.hide();
            }
        },

        /**
         * We track the mousedown for IE. When clicking on the menu scrollbar, IE makes the input blur thus hiding the menu.
         */
        mousedown: function (e) {
            this.mouseddown = true;
            this.$menu.one('mouseup', function (e) {
                // IE won't fire this, but FF and Chrome will so we reset our flag for them here
                this.mouseddown = false;
            }.bind(this));
        },

        touchstart: function (e) {
            e.preventDefault();
            this.$menu.find('.active').removeClass('active');
            // PIOREK94: Bootstrap 4 highlight fix: active class has to be added to li>a element not li, for backward compatibility add to both
            $(e.currentTarget).addClass('active').find('a').addClass('active');
            // PIOREK94: end of custom code
            // $(e.currentTarget).addClass('active');
        },

        touchend: function (e) {
            e.preventDefault();
            this.select();
            this.$element.focus();
        }

    };


    /* TYPEAHEAD PLUGIN DEFINITION
     * =========================== */

    var old = $.fn.typeahead;

    $.fn.typeahead = function (option) {
        var arg = arguments;
        if (typeof option == 'string' && option == 'getActive') {
            return this.data('active');
        }
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('typeahead');
            var options = typeof option == 'object' && option;
            if (!data) {
                $this.data('typeahead', (data = new Typeahead(this, options)));
            }
            if (typeof option == 'string' && data[option]) {
                if (arg.length > 1) {
                    data[option].apply(data, Array.prototype.slice.call(arg, 1));
                } else {
                    data[option]();
                }
            }
        });
    };

    Typeahead.defaults = {
        source: [],
        items: 8,
        // PIOREK94: Added handling for up/down key scrolling and a carousel option
        carousel: true,
        // PIOREK94: end of custom code
        minLength: 1,
        scrollHeight: 0,
        autoSelect: true,
        afterSelect: $.noop,
        afterEmptySelect: $.noop,
        // PIOREK94: Added afterRender call back function useful for using
        // plugins that depend on the HTML being rendered on the page, ex.
        // Bootstrap tooltips for each typeahead option
        afterRender: $.noop,
        // PIOREK94: end of custom code
        addItem: false,
        followLinkOnSelect: false,
        delay: 0,
        separator: 'category',
        changeInputOnSelect: true,
        // PIOREK94: change default value of changeInputOnMove to false to keep
        // compatibility with older code
        changeInputOnMove: false,
        // PIOREK94: end of custom code
        // changeInputOnMove: true,
        openLinkInNewTab: false,
        // PIOREK94: change default value of selectOnBlur to false to keep
        // compatibility with older code
        selectOnBlur: false,
        // PIOREK94: end of custom code
        // selectOnBlur: true,
        showCategoryHeader: true,
        // PIOREK94: set default theme to bootstrap4
        theme: "bootstrap4",
        // PIOREK94: end of custom code
        themes: {
        bootstrap3: {
            menu: '<ul class="typeahead dropdown-menu" role="listbox"></ul>',
            // PIOREK94: fix bootstrap3/4
            item: '<li><a href="#" role="option"></a></li>',
            // PIOREK94: end of custom code
            // item: '<li><a class="dropdown-item" href="#" role="option"></a></li>',
            itemContentSelector: "a",
            headerHtml: '<li class="dropdown-header"></li>',
            headerDivider: '<li class="divider" role="separator"></li>'
        },
        bootstrap4: {
            menu: '<div class="typeahead dropdown-menu" role="listbox"></div>',
            // PIOREK94: fix bootstrap3/4
            item: '<a class="dropdown-item" href="#" role="option"></a>',
            // PIOREK94: end of custom code
            // item: '<button class="dropdown-item" role="option"></button>',
            itemContentSelector: '.dropdown-item',
            headerHtml: '<h6 class="dropdown-header"></h6>',
            headerDivider: '<div class="dropdown-divider"></div>'
        }
    }
};

    $.fn.typeahead.Constructor = Typeahead;

    /* TYPEAHEAD NO CONFLICT
     * =================== */

    $.fn.typeahead.noConflict = function () {
        $.fn.typeahead = old;
        return this;
    };


    /* TYPEAHEAD DATA-API
     * ================== */

    $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
        var $this = $(this);
        if ($this.data('typeahead')) {
            return;
        }
        $this.typeahead($this.data());
    });

}));
