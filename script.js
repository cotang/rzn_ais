jQuery(document).ready(function($){

  function changeKey(obj, keyOld, keyNew){
    for (let key in obj) {
      if ( typeof obj[key] == 'object' ) {
        changeKey(obj[key], keyOld, keyNew)
      } else {
        if( obj[keyOld] ){
          obj[keyNew] = obj[keyOld];
      //     delete obj[keyOld];
        }
      }
    }  
    return obj;
  }
  function createSelect2JSON(initArr){
    var newArr = [];
    configureSelect2JSON(initArr); 

    function configureSelect2JSON(arr){
      arr.forEach(function(obj){
        if( obj['id'] ){
          let newItem = {};
          newItem['id'] = obj['id'];
          newItem['text'] = obj['label'];
          newArr.push(newItem);
        }
        if( obj['items'] ){
          configureSelect2JSON( obj['items'] )
        }    
      });
      return arr;
    }
    return newArr;
  }

  function getJson(url, callback){
    var req  = new XMLHttpRequest();
    req.open("GET", url);
    req.addEventListener('load', function(){
      try {
        var responseJson = JSON.parse(this.responseText);
      } catch (err) {
        console.log( "Извините, в данных ошибка, мы попробуем получить их ещё раз" );
        console.log( err.name );
        console.log( err.message );
      }
      callback(responseJson)
    });
    req.send();
  }



  var tree = [];
  /* вызов getJson, получение данных из json */
  getJson("test.json", function(generated){
    // console.log(generated)
    tree = generated;
    tree.forEach(function(item){
      changeKey(item, 'items', 'nodes');
      changeKey(item, 'label', 'text');
    }); 
    console.log('tree', tree)

    // создаем селект
    var arrayForSelect = createSelect2JSON(tree);
    var selectField = $('#select2-field').select2({
      data: arrayForSelect
    });

    // создаем дерево
    var treeview = $('#tree').treeview({
      data: tree,
      // levels: 10,
      expandIcon: "glyphicon glyphicon-plus",
      collapseIcon: "glyphicon glyphicon-minus",
      nodeIcon: "glyphicon glyphicon-unchecked",
      selectedIcon: "glyphicon glyphicon-ok",
      onNodeSelected: function(event, node) {
        selectField.val(node.id).trigger("change");
      },
      onNodeUnselected: function (event, node) {
        if (selectField.val() == node.id){
          selectField.val(null).trigger("change");
        }
      }
    });


    $('#select2-field').on('select2:select', function (e) {
      var id = e.params.data.id;

      $('#tree').treeview('getNodes', arrayForSelect).forEach(function(item){
        if (item.id == id){
          // console.log(item)
          $('#tree').treeview('selectNode', [ item, { silent: true } ]);
          var parent = $('#tree').treeview('getParents', item);
          $('#tree').treeview('expandNode', [ parent, { silent: true } ]);          
        }
      })        
    });




  });

});




// https://www.jqueryscript.net/blog/Best-Tree-View-Plugins-jQuery.html