JSON Form dependencies
======================

This folder contains required and optional dependencies for JSON Form.


Required
--------
  - [jQuery](https://jquery.com/) v1.7.2 or above. The [jquery](jquery) folder contains all required files.
  - [Underscore.js](https://underscorejs.org/) v1.7.0 or above. The [underscore](underscore) folder contains all required files.


Optional
--------
The libraries in the ```opt``` subfolder are optional as long as you do not use the feature they enable:

  * [Bootstrap 3](https://getbootstrap.com/):
    - [bootstrap.css](opt/bootstrap/css/bootstrap.css) is only used (but not required if you provide your own styles) for styling purpose.
    - [dropdown.js](opt/bootstrap/js/dropdown.js) is needed for ```imageselect``` and ```iconselect``` fields.

  * [bootstrap-plugins](opt/bootstrap-plugins):
    - [bootstrap-tagsinput](http://bootstrap-tagsinput.github.io/bootstrap-tagsinput/examples/) is required for tags support with array values and textual input fields. The [opt/bootstrap-plugins/bootstrap-tagsinput](opt/bootstrap-plugins/bootstrap-tagsinput) folder contains all required files.
    - [bootstrap-typeahead](https://github.com/bassjobsen/Bootstrap-3-Typeahead) is required for typeahead support with textual input fields and ```tagsinput``` formatted fields. The [opt/bootstrap-plugins/bootstrap-typeahead](opt/bootstrap-plugins/bootstrap-typeahead) folder contains all required files.

  * [code-editor](opt/code-editor):
    - [Ace](https://ace.c9.io/) v1.0.0 or above is needed to render rich text input fields. The [opt/code-editor/ace](opt/code-editor/ace) folder contains a minimal set of files from ACE to render a CSS/HTML/JAVASCRIPT/JSON/LESS/MARKDOWN input field.

  * [colorpicker](opt/colorpicker):
    - [spectrum](https://bgrins.github.io/spectrum/). The [opt/colorpicker/spectrum](opt/colorpicker/spectrum) folder contains required set of file to render `color` fields.
    - [spectrum by seballot](https://seballot.github.io/spectrum/). The [opt/colorpicker/seballot-spectrum](opt/colorpicker/seballot-spectrum) folder contains required set of file to render `color` fields.
    - [vanilla-picker](https://vanilla-picker.js.org/). The [opt/colorpicker/vanilla-picker](opt/colorpicker/vanilla-picker) folder contains required set of file to render `color` fields.

  * [file-uploader](opt/file-uploader):
    - [Transloadit's jQuery SDK](https://transloadit.com/docs/sdks/jquery-sdk/) is required if form uses ```file-hosted-public``` or ```file-transloadit``` fields. The [opt/file-uploader/jquery-transloadit](opt/file-uploader/jquery-transloadit) folder contains all required files.

  * [jQuery UI](https://jqueryui.com/) enables two features:
    - drag-and-drop support within arrays and tabarrays;
    - autocomplete with textual input fields;

    The [opt/jQueryUI](opt/jQueryUI) folder contains all required files.

  * [validator](opt/validator):
    - [JSV](https://github.com/garycourt/JSV): JSON Schema Validator is used to detect and report validation errors against the JSON schema upon form submission. The [opt/validator/JSV](opt/validator/JSV) folder contains a "build" of the JSON Schema Validator for use in JSON Form. _It is not recommended to use this validator: outdated, no longer updated, support only drafts up to `json-schema-draft-03`._
    - [z-schema](https://github.com/zaggino/z-schema) is used to detect and report validation errors against the JSON schema upon form submission. The [opt/validator/z-schema](opt/validator/z-schema) folder contains all required files to use Validator in JSON Form.

  * [wysiwyg-editor](opt/wysiwyg-editor):
    - [bootstrap3-wysiwyg](http://bootstrap-wysiwyg.github.io/bootstrap3-wysiwyg/) is required if the form uses ```wysihtml5``` textarea fields. The [opt/wysiwyg-editor/bootstrap3-wysiwyg](opt/wysiwyg-editor/bootstrap3-wysiwyg) folder contains all required files.
