//$filter('find')($scope.List,{id : hogeId}, true);
app.filter('find', function() {
    return function(input, value, isFirst) {
        if(!Array.isArray(input)) return false;
        var existList = [];
        var keys = Object.keys(value);
        for(var i = 0; i < input.length; i++){
            var isOk = false;
            for(var j = 0; j < keys.length; j++){
                if(input[i][keys[j]] != value[keys[j]]){
                    continue;
                } else{
                    isOk = true;
                }
            }
            if(isOk){
                input[i].index = i;
                existList.push(input[i]);
                if(isFirst) return existList[0];
            }
        }
        return existList;
    };
})
//ng-if="items | inArray : 'test'" あればtrue なければfalse
//$filter('inArray')(items,'test');
.filter('inArray', function() {
    return function(array, value) {
        if(!Array.isArray(array)) return false;
        return array.indexOf(value) !== -1;
    };
});