var tests = [
  {
    name: 'template',
    jsonform: {
      schema: {
        textfield: {
          type: 'string'
        }
      },
      form: [
        {
          key: 'textfield',
          template: 'I can haz template miam-miam<br/><input class="col-sm-6" type="text" name="<%= node.name %>" value="<%= escape(value) %>" id="<%= id %>" />'
        }
      ]
    }
  }
];
