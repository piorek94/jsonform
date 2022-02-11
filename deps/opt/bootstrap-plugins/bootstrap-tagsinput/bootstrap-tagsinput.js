/*
 * bootstrap-tagsinput v0.8.0
 * 
 */

(function ($) {
  "use strict";

  var defaultOptions = {
    // PIOREK94: Add bootstrap 4 support
    theme: "bootstrap4",
    tagClass: function(item) {
      return this.theme === "bootstrap4" ? 'badge badge-info' : 'label label-info';
    },
    // PIOREK94: end of custom code
    // tagClass: function(item) {
    //   return 'label label-info';
    // },
    focusClass: 'focus',
    itemValue: function(item) {
      return item ? item.toString() : item;
    },
    itemText: function(item) {
      return this.itemValue(item);
    },
    itemTitle: function(item) {
      return null;
    },
    freeInput: true,
    addOnBlur: true,
    maxTags: undefined,
    maxChars: undefined,
    confirmKeys: [13, 44],
    delimiter: ',',
    delimiterRegex: null,
    cancelConfirmKeysOnEmpty: false,
    onTagExists: function(item, $tag) {
      $tag.hide().fadeIn();
    },
    trimValue: false,
    allowDuplicates: false,
    // PIOREK94: Allow to edit the Tag before remove: https://github.com/Nodws/bootstrap4-tagsinput/commit/6b0ce5a46eecc881d81298000fc8a5d97107e8bb
    editOnBackspace: false,
    // PIOREK94: end of custom code
    triggerChange: true
  };

  /**
   * Constructor function
   */
  function TagsInput(element, options) {
    this.isInit = true;
    this.itemsArray = [];

    this.$element = $(element);
    // PIOREK94: Setting style to display: none breaks browser-native validation; use `sr-only` class instead
    this.$element.addClass('sr-only');
    // PIOREK94: end of custom code
    // this.$element.hide();

    this.isSelect = (element.tagName === 'SELECT');
    this.multiple = (this.isSelect && element.hasAttribute('multiple'));
    this.objectItems = options && options.itemValue;
    this.placeholderText = element.hasAttribute('placeholder') ? this.$element.attr('placeholder') : '';
    this.inputSize = Math.max(1, this.placeholderText.length);

    this.$container = $('<div class="bootstrap-tagsinput"></div>');
    // PIOREK94: TODO: Fix problem related to using bootstrap tags input on jquery
    // validate plugin. Currently jquery validate error: "has no name assigned" occurs.
    // The following line solves problem for text input, but for select causes one empty value.
    // this.$input = $('<input type="' + this.type + '" name="' + this.name + '" placeholder="' + this.placeholderText + '"/>').appendTo(this.$container);
    this.name = element.hasAttribute('name') ? this.$element.attr('name') : '';
    this.type = element.hasAttribute('type') ? this.$element.attr('type') : 'text';
    this.$input = $('<input type="' + this.type + '" placeholder="' + this.placeholderText + '"/>').appendTo(this.$container);
    // PIOREK94: end of custom code
    //this.$input = $('<input type="text" placeholder="' + this.placeholderText + '"/>').appendTo(this.$container);

    this.$element.before(this.$container);

    this.build(options);
    this.isInit = false;
  }

  TagsInput.prototype = {
    constructor: TagsInput,

    /**
     * Adds the given item as a new tag. Pass true to dontPushVal to prevent
     * updating the elements val()
     */
    add: function(item, dontPushVal, options) {
      var self = this;

      if (self.options.maxTags && self.itemsArray.length >= self.options.maxTags)
        return;

      // Ignore falsey values, except false
      if (item !== false && !item)
        return;

      // Trim value
      if (typeof item === "string" && self.options.trimValue) {
        item = $.trim(item);
      }

      // Throw an error when trying to add an object while the itemValue option was not set
      if (typeof item === "object" && !self.objectItems)
        throw("Can't add objects when itemValue option is not set");

      // Ignore strings only containg whitespace
      if (item.toString().match(/^\s*$/))
        return;

      // If SELECT but not multiple, remove current tag
      if (self.isSelect && !self.multiple && self.itemsArray.length > 0)
        self.remove(self.itemsArray[0]);

      if (typeof item === "string" && this.$element[0].tagName === 'INPUT') {
        var delimiter = (self.options.delimiterRegex) ? self.options.delimiterRegex : self.options.delimiter;
        var items = item.split(delimiter);
        if (items.length > 1) {
          for (var i = 0; i < items.length; i++) {
            this.add(items[i], true);
          }

          if (!dontPushVal)
            self.pushVal(self.options.triggerChange);
          return;
        }
      }

      var itemValue = self.options.itemValue(item),
          itemText = self.options.itemText(item),
          tagClass = self.options.tagClass(item),
          itemTitle = self.options.itemTitle(item);

      // Ignore items allready added
      var existing = $.grep(self.itemsArray, function(item) { return self.options.itemValue(item) === itemValue; } )[0];
      if (existing && !self.options.allowDuplicates) {
        // Invoke onTagExists
        if (self.options.onTagExists) {
          var $existingTag = $(".tag", self.$container).filter(function() { return $(this).data("item") === existing; });
          self.options.onTagExists(item, $existingTag);
        }
        return;
      }

      // if length greater than limit
      if (self.items().toString().length + item.length + 1 > self.options.maxInputLength)
        return;

      // raise beforeItemAdd arg
      var beforeItemAddEvent = $.Event('beforeItemAdd', { item: item, cancel: false, options: options});
      self.$element.trigger(beforeItemAddEvent);
      if (beforeItemAddEvent.cancel)
        return;

      // register item in internal array and map
      self.itemsArray.push(item);

      // add a tag element

      // PIOREK94: Fix XSS vulnerable https://snyk.io/vuln/npm:bootstrap-tagsinput:20160720:
      // source: https://github.com/WOLFF-Daten-Menschen-Marketing-GmbH/bootstrap-tagsinput-2021/commit/76ad08ec524b7c6856f7d7ccb093d04d3a8a66b1
      var $tag = $('<span class="tag ' + htmlEncode(tagClass) + (itemTitle !== null ? ('" title="' + htmlEncode(itemTitle)) : '') + '">' + htmlEncode(itemText) + '<span data-role="remove"></span></span>');
      // PIOREK94: end of custom code
      // var $tag = $('<span class="tag ' + htmlEncode(tagClass) + (itemTitle !== null ? ('" title="' + itemTitle) : '') + '">' + htmlEncode(itemText) + '<span data-role="remove"></span></span>');
      $tag.data('item', item);
      self.findInputWrapper().before($tag);
      //$tag.after(' ');

      // Check to see if the tag exists in its raw or uri-encoded form
      // PIOREK94: jQuery selector fix for values containing quotes
      var optionExists = (
        $('option[value="' + encodeURIComponent(itemValue).replace(/"/g, '\\"') + '"]', self.$element).length ||
        $('option[value="' + htmlEncode(itemValue).replace(/"/g, '\\"') + '"]', self.$element).length
      );
      // PIOREK94: end of custom code
      // var optionExists = (
      //   $('option[value="' + encodeURIComponent(itemValue) + '"]', self.$element).length ||
      //   $('option[value="' + htmlEncode(itemValue) + '"]', self.$element).length
      // );

      // add <option /> if item represents a value not present in one of the <select />'s options
      // PIOREK94: but allow add when multiple and allowDuplicates is set
      if (self.isSelect && (!optionExists || (self.multiple && self.options.allowDuplicates))) {
      // PIOREK94: end of custom code
      // if (self.isSelect && !optionExists) {
        var $option = $('<option selected>' + htmlEncode(itemText) + '</option>');
        $option.data('item', item);
        $option.attr('value', itemValue);
        self.$element.append($option);
      }

      if (!dontPushVal)
        self.pushVal(self.options.triggerChange);

      // Add class when reached maxTags
      if (self.options.maxTags === self.itemsArray.length || self.items().toString().length === self.options.maxInputLength)
        self.$container.addClass('bootstrap-tagsinput-max');

      // If using typeahead, once the tag has been added, clear the typeahead value so it does not stick around in the input.
      if ($('.typeahead, .twitter-typeahead', self.$container).length) {
        self.$input.typeahead('val', '');
      }

      if (this.isInit) {
        self.$element.trigger($.Event('itemAddedOnInit', { item: item, options: options }));
      } else {
        self.$element.trigger($.Event('itemAdded', { item: item, options: options }));
      }
    },

    /**
     * Removes the given item. Pass true to dontPushVal to prevent updating the
     * elements val()
     */
    remove: function(item, dontPushVal, options) {
      var self = this;

      if (self.objectItems) {
        if (typeof item === "object")
          item = $.grep(self.itemsArray, function(other) { return self.options.itemValue(other) ==  self.options.itemValue(item); } );
        else
          item = $.grep(self.itemsArray, function(other) { return self.options.itemValue(other) ==  item; } );

        item = item[item.length-1];
      }

      if (item) {
        var beforeItemRemoveEvent = $.Event('beforeItemRemove', { item: item, cancel: false, options: options });
        self.$element.trigger(beforeItemRemoveEvent);
        if (beforeItemRemoveEvent.cancel)
          return;

        // PIOREK94: Fix item removal when allowDuplicates is true
        if (options && options.tagElement)
          $(options.tagElement).remove()
        else
          $('.tag', self.$container).filter(function() { return $(this).data('item') === item; }).remove();
        $('option', self.$element).each(function(){ if($(this).data('item') === item) { $(this).remove(); return false; } });
        if($.inArray(item, self.itemsArray) !== -1) {
          var itemIndex = (options && options.tagIndex) || $.inArray(item, self.itemsArray);
          self.itemsArray.splice(itemIndex, 1);
        }
        // PIOREK94: end of custom code
        // $('.tag', self.$container).filter(function() { return $(this).data('item') === item; }).remove();
        // $('option', self.$element).filter(function() { return $(this).data('item') === item; }).remove();
        // if($.inArray(item, self.itemsArray) !== -1)
        //   self.itemsArray.splice($.inArray(item, self.itemsArray), 1);
      }

      if (!dontPushVal)
        self.pushVal(self.options.triggerChange);

      // Remove class when reached maxTags
      if (self.options.maxTags > self.itemsArray.length)
        self.$container.removeClass('bootstrap-tagsinput-max');

      self.$element.trigger($.Event('itemRemoved',  { item: item, options: options }));
    },

    /**
     * Removes all items
     */
    removeAll: function() {
      var self = this;

      $('.tag', self.$container).remove();
      $('option', self.$element).remove();

      while(self.itemsArray.length > 0)
        self.itemsArray.pop();

      self.pushVal(self.options.triggerChange);
    },

    /**
     * Refreshes the tags so they match the text/value of their corresponding
     * item.
     */
    refresh: function() {
      var self = this;
      $('.tag', self.$container).each(function() {
        var $tag = $(this),
            item = $tag.data('item'),
            itemValue = self.options.itemValue(item),
            itemText = self.options.itemText(item),
            tagClass = self.options.tagClass(item);

          // Update tag's class and inner text
          $tag.attr('class', null);
          $tag.addClass('tag ' + htmlEncode(tagClass));
          $tag.contents().filter(function() {
            return this.nodeType == 3;
          })[0].nodeValue = htmlEncode(itemText);

          if (self.isSelect) {
            var option = $('option', self.$element).filter(function() { return $(this).data('item') === item; });
            option.attr('value', itemValue);
          }
      });
    },

    /**
     * Returns the items added as tags
     */
    items: function() {
      return this.itemsArray;
    },

    /**
     * Assembly value by retrieving the value of each item, and set it on the
     * element.
     */
    pushVal: function() {
      var self = this,
          val = $.map(self.items(), function(item) {
            return self.options.itemValue(item).toString();
          });

      self.$element.val(val, true);

      if (self.options.triggerChange)
        self.$element.trigger('change');
    },

    /**
     * Initializes the tags input behaviour on the element
     */
    build: function(options) {
      var self = this;

      self.options = $.extend({}, defaultOptions, options);
      // When itemValue is set, freeInput should always be false
      if (self.objectItems)
        self.options.freeInput = false;

      makeOptionItemFunction(self.options, 'itemValue');
      makeOptionItemFunction(self.options, 'itemText');
      makeOptionFunction(self.options, 'tagClass');

      // Typeahead Bootstrap version 2.3.2
      if (self.options.typeahead) {
        var typeahead = self.options.typeahead || {};

        makeOptionFunction(typeahead, 'source');

        self.$input.typeahead($.extend({}, typeahead, {
          source: function (query, process) {
            // PIOREK94: add support for latest version of bootstrap3-typeahead v4.0.2 and bloodhound v0.11.1 & replace deprecated jquery methods
            function processData(data) {
              if (!data)
                return;

              if (typeof data.success === "function") {
                // support for Angular callbacks
                data.success(process);
              } else if (typeof data.then === "function") {
                // support for Angular promises
                data.then(process);
              } else {
                // support for functions and jquery promises
                $.when(data).then(process);
              }
            }

            // Bloodhound (since 0.11) needs three arguments.
            // Two of them are callback functions (sync and async) for local and remote data processing
            // see https://github.com/twitter/typeahead.js/blob/master/src/bloodhound/bloodhound.js#L132
            if (typeof typeahead.source === "function" && typeahead.source.length === 3) {
              typeahead.source(query, processData, processData);
            }
            else {
              // data is directly returned by source function
              processData(typeahead.source(query));
            }
          },
          updater: function (item) {
            if (self.objectItems)
              self.add(self.options.itemValue(item));
            else
              self.add(self.options.itemText(item));
            return '';
          }
          // PIOREK94: end of custom code
          //   function processItems(items) {
          //     var texts = [];
          //
          //     for (var i = 0; i < items.length; i++) {
          //       var text = self.options.itemText(items[i]);
          //       map[text] = items[i];
          //       texts.push(text);
          //     }
          //     process(texts);
          //   }
          //
          //   this.map = {};
          //   var map = this.map,
          //       data = typeahead.source(query);
          //
          //   if ($.isFunction(data.success)) {
          //     // support for Angular callbacks
          //     data.success(processItems);
          //   } else if ($.isFunction(data.then)) {
          //     // support for Angular promises
          //     data.then(processItems);
          //   } else {
          //     // support for functions and jquery promises
          //     $.when(data)
          //      .then(processItems);
          //   }
          // },
          // updater: function (text) {
          //   self.add(this.map[text]);
          //   return this.map[text];
          // },
          // matcher: function (text) {
          //   return (text.toLowerCase().indexOf(this.query.trim().toLowerCase()) !== -1);
          // },
          // sorter: function (texts) {
          //   return texts.sort();
          // },
          // highlighter: function (text) {
          //   var regex = new RegExp( '(' + this.query + ')', 'gi' );
          //   return text.replace( regex, "<strong>$1</strong>" );
          // }
        }));
      }

      // typeahead.js
      if (self.options.typeaheadjs) {
        // Determine if main configurations were passed or simply a dataset
        var typeaheadjs = self.options.typeaheadjs;
        // PIOREK94: replace deprecated jquery methods
        if (!Array.isArray(typeaheadjs)) {
        // PIOREK94: end of custom code
        // if (!$.isArray(typeaheadjs)) {
            typeaheadjs = [null, typeaheadjs];
        }

        $.fn.typeahead.apply(self.$input, typeaheadjs).on('typeahead:selected', $.proxy(function (obj, datum, name) {
          var index = 0;
          typeaheadjs.some(function(dataset, _index) {
            if (dataset.name === name) {
              index = _index;
              return true;
            }
            return false;
          });

          // @TODO Dep: https://github.com/corejavascript/typeahead.js/issues/89
          if (typeaheadjs[index].valueKey) {
            self.add(datum[typeaheadjs[index].valueKey]);
          } else {
            self.add(datum);
          }

          self.$input.typeahead('val', '');
        }, self));
      }

      self.$container.on('click', $.proxy(function(event) {
        if (! self.$element.attr('disabled')) {
          // PIOREK94: replace deprecated jquery methods
          self.$input.prop('disabled', false);
          // PIOREK94: end of custom code
          // self.$input.removeAttr('disabled');
        }
        // PIOREK94: replace deprecated jquery methods
        self.$input.trigger("focus");
        // PIOREK94: end of custom code
        // self.$input.focus();
      }, self));

      // PIOREK94: clear input value after when freeInput is disabled:
      // user typed few letters but did not select the tag and then focused out from the control
      if (!self.options.freeInput) {
        self.$input.on('focusout', $.proxy(function(event) {
          if (self.$input.typeahead) {
            self.$input.val('');
          }
        }, self));
      }
      // PIOREK94: end of custom code
        if (self.options.addOnBlur && self.options.freeInput) {
          self.$input.on('focusout', $.proxy(function(event) {
              // HACK: only process on focusout when no typeahead opened, to
              //       avoid adding the typeahead text as tag
              if ($('.typeahead, .twitter-typeahead', self.$container).length === 0) {
                self.add(self.$input.val());
                self.$input.val('');
              }
          }, self));
        }

      // Toggle the 'focus' css class on the container when it has focus
      self.$container.on({
        focusin: function() {
          self.$container.addClass(self.options.focusClass);
        },
        focusout: function() {
          self.$container.removeClass(self.options.focusClass);
        },
      });

      self.$container.on('keydown', 'input', $.proxy(function(event) {
        var $input = $(event.target),
            $inputWrapper = self.findInputWrapper();

        if (self.$element.attr('disabled')) {
          self.$input.attr('disabled', 'disabled');
          return;
        }

        switch (event.which) {
          // BACKSPACE
          case 8:
            if (doGetCaretPosition($input[0]) === 0) {
              var prev = $inputWrapper.prev();
              if (prev.length) {
                // PIOREK94: Allow to edit the Tag before remove: https://github.com/Nodws/bootstrap4-tagsinput/commit/6b0ce5a46eecc881d81298000fc8a5d97107e8bb
                if (self.options.editOnBackspace === true) {
                  $input.val(prev.data('item'));
                }
                // PIOREK94: end of custom code
                // PIOREK94: Fix item removal when allowDuplicates is true
                self.remove(prev.data('item'), false, { tagElement: prev, tagIndex: prev.index() });
                // PIOREK94: end of custom code
                // self.remove(prev.data('item'));
              }
            }
            break;

          // DELETE
          case 46:
            if (doGetCaretPosition($input[0]) === 0) {
              var next = $inputWrapper.next();
              if (next.length) {
                // PIOREK94: Fix item removal when allowDuplicates is true
                self.remove(next.data('item'), false, { tagElement: next, tagIndex: next.index() - 1 });
                // PIOREK94: end of custom code
                // self.remove(next.data('item'));
              }
            }
            break;

          // LEFT ARROW
          case 37:
            // Try to move the input before the previous tag
            var $prevTag = $inputWrapper.prev();
            if ($input.val().length === 0 && $prevTag[0]) {
              $prevTag.before($inputWrapper);
              // PIOREK94: replace deprecated jquery methods
              $input.trigger("focus");
              // PIOREK94: end of custom code
              // $input.focus();
            }
            break;
          // RIGHT ARROW
          case 39:
            // Try to move the input after the next tag
            var $nextTag = $inputWrapper.next();
            if ($input.val().length === 0 && $nextTag[0]) {
              $nextTag.after($inputWrapper);
              // PIOREK94: replace deprecated jquery methods
              $input.trigger("focus");
              // PIOREK94: end of custom code
              // $input.focus();
            }
            break;
         default:
             // ignore
         }

        // Reset internal input's size
        var textLength = $input.val().length,
            wordSpace = Math.ceil(textLength / 5),
            size = textLength + wordSpace + 1;
        // PIOREK94: set input size properly
        $input.attr('size', Math.max(this.inputSize, size));
        // PIOREK94: end of custom code
        // $input.attr('size', Math.max(this.inputSize, $input.val().length));
      }, self));

      self.$container.on('keypress', 'input', $.proxy(function(event) {
         var $input = $(event.target);

         if (self.$element.attr('disabled')) {
            self.$input.attr('disabled', 'disabled');
            return;
         }

         var text = $input.val(),
         maxLengthReached = self.options.maxChars && text.length >= self.options.maxChars;
         if (self.options.freeInput && (keyCombinationInList(event, self.options.confirmKeys) || maxLengthReached)) {
            // Only attempt to add a tag if there is data in the field
            if (text.length !== 0) {
               self.add(maxLengthReached ? text.substr(0, self.options.maxChars) : text);
               $input.val('');
               // PIOREK94: clear the value of typeaheadjs, as tagsinput clears the input field
               if (self.options.typeaheadjs) {
                 $input.typeahead('val', '');
               }
               // PIOREK94: end of custom code
            }

            // If the field is empty, let the event triggered fire as usual
            if (self.options.cancelConfirmKeysOnEmpty === false) {
                event.preventDefault();
            }
         }

         // Reset internal input's size
         var textLength = $input.val().length,
            wordSpace = Math.ceil(textLength / 5),
            size = textLength + wordSpace + 1;
         // PIOREK94: set input size properly
         $input.attr('size', Math.max(this.inputSize, size));
         // PIOREK94: end of custom code
         // $input.attr('size', Math.max(this.inputSize, $input.val().length));
      }, self));

      // Remove icon clicked
      self.$container.on('click', '[data-role=remove]', $.proxy(function(event) {
        if (self.$element.attr('disabled')) {
          return;
        }
        // PIOREK94: Fix item removal when allowDuplicates is true
        var $tag = $(event.target).closest('.tag');
        self.remove($tag.data('item'), false, { tagElement: $tag, tagIndex: $tag.index() });
        // PIOREK94: end of custom code
        // self.remove($(event.target).closest('.tag').data('item'));
      }, self));

      // Only add existing value as tags when using strings as tags
      if (self.options.itemValue === defaultOptions.itemValue) {
        if (self.$element[0].tagName === 'INPUT') {
            self.add(self.$element.val());
        } else {
          $('option', self.$element).each(function() {
            self.add($(this).attr('value'), true);
          });
        }
      }
    },

    /**
     * Removes all tagsinput behaviour and unregsiter all event handlers
     */
    destroy: function() {
      var self = this;

      // Unbind events
      self.$container.off('keypress', 'input');
      self.$container.off('click', '[role=remove]');

      self.$container.remove();
      self.$element.removeData('tagsinput');
      self.$element.show();
    },

    /**
     * Sets focus on the tagsinput
     */
    focus: function() {
      // PIOREK94: replace deprecated jquery methods
      this.$input.trigger("focus");
      // PIOREK94: end of custom code
      // this.$input.focus();
    },

    /**
     * Returns the internal input element
     */
    input: function() {
      return this.$input;
    },

    /**
     * Returns the element which is wrapped around the internal input. This
     * is normally the $container, but typeahead.js moves the $input element.
     */
    findInputWrapper: function() {
      var elt = this.$input[0],
          container = this.$container[0];
      while(elt && elt.parentNode !== container)
        elt = elt.parentNode;

      return $(elt);
    }
  };

  /**
   * Register JQuery plugin
   */
  $.fn.tagsinput = function(arg1, arg2, arg3) {
    var results = [];

    this.each(function() {
      var tagsinput = $(this).data('tagsinput');
      // Initialize a new tags input
      if (!tagsinput) {
          tagsinput = new TagsInput(this, arg1);
          $(this).data('tagsinput', tagsinput);
          results.push(tagsinput);

          if (this.tagName === 'SELECT') {
              $('option', $(this)).attr('selected', 'selected');
          }

          // Init tags from $(this).val()
          $(this).val($(this).val());
      } else if (!arg1 && !arg2) {
          // tagsinput already exists
          // no function, trying to init
          results.push(tagsinput);
      } else if(tagsinput[arg1] !== undefined) {
          // Invoke function on existing tags input
            if(tagsinput[arg1].length === 3 && arg3 !== undefined){
               var retVal = tagsinput[arg1](arg2, null, arg3);
            }else{
               var retVal = tagsinput[arg1](arg2);
            }
          if (retVal !== undefined)
              results.push(retVal);
      }
    });

    if ( typeof arg1 == 'string') {
      // Return the results from the invoked function calls
      return results.length > 1 ? results : results[0];
    } else {
      return results;
    }
  };

  $.fn.tagsinput.Constructor = TagsInput;

  /**
   * Most options support both a string or number as well as a function as
   * option value. This function makes sure that the option with the given
   * key in the given options is wrapped in a function
   */
  function makeOptionItemFunction(options, key) {
    if (typeof options[key] !== 'function') {
      var propertyName = options[key];
      options[key] = function(item) { return item[propertyName]; };
    }
  }
  function makeOptionFunction(options, key) {
    if (typeof options[key] !== 'function') {
      var value = options[key];
      options[key] = function() { return value; };
    }
  }
  /**
   * HtmlEncodes the given value
   */
  var htmlEncodeContainer = $('<div />');
  function htmlEncode(value) {
    if (value) {
      return htmlEncodeContainer.text(value).html();
    } else {
      return '';
    }
  }

  /**
   * Returns the position of the caret in the given input field
   * http://flightschool.acylt.com/devnotes/caret-position-woes/
   */
  function doGetCaretPosition(oField) {
    var iCaretPos = 0;
    if (document.selection) {
      oField.focus ();
      var oSel = document.selection.createRange();
      oSel.moveStart ('character', -oField.value.length);
      iCaretPos = oSel.text.length;
    } else if (oField.selectionStart || oField.selectionStart == '0') {
      iCaretPos = oField.selectionStart;
    }
    return (iCaretPos);
  }

  /**
    * Returns boolean indicates whether user has pressed an expected key combination.
    * @param object keyPressEvent: JavaScript event object, refer
    *     http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    * @param object lookupList: expected key combinations, as in:
    *     [13, {which: 188, shiftKey: true}]
    */
  function keyCombinationInList(keyPressEvent, lookupList) {
      var found = false;
      $.each(lookupList, function (index, keyCombination) {
          if (typeof (keyCombination) === 'number' && keyPressEvent.which === keyCombination) {
              found = true;
              return false;
          }

          if (keyPressEvent.which === keyCombination.which) {
              var alt = !keyCombination.hasOwnProperty('altKey') || keyPressEvent.altKey === keyCombination.altKey,
                  shift = !keyCombination.hasOwnProperty('shiftKey') || keyPressEvent.shiftKey === keyCombination.shiftKey,
                  ctrl = !keyCombination.hasOwnProperty('ctrlKey') || keyPressEvent.ctrlKey === keyCombination.ctrlKey;
              if (alt && shift && ctrl) {
                  found = true;
                  return false;
              }
          }
      });

      return found;
  }

  /**
   * Initialize tagsinput behaviour on inputs and selects which have
   * data-role=tagsinput
   */
  $(function() {
    $("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").tagsinput();
  });
})(window.jQuery);
