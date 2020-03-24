/*
Knowage, Open Source Business Intelligence suite
Copyright (C) 2016 Engineering Ingegneria Informatica S.p.A.

Knowage is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

Knowage is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
angular
	.module('cockpitModule')
	.controller('customChartWidgetEditControllerFunction',customChartWidgetEditControllerFunction)

function customChartWidgetEditControllerFunction(
	$scope,
	finishEdit,
	model,
	mdPanelRef,
	sbiModule_translate,
	datastore){
	
	$scope.translate = sbiModule_translate;
	$scope.newModel = angular.copy(model);
	
	if($scope.newModel.css.opened) $scope.newModel.css.opened = false;
	if($scope.newModel.html.opened) $scope.newModel.html.opened = false;
	if(!$scope.newModel.js.opened) $scope.newModel.js.opened = true;
	
	$scope.toggleLanguage = function(language){
		var languages = ['css','html','js'];
		for(var k in languages){
			if(languages[k] != language) $scope.newModel[languages[k]].opened = false;
			else $scope.newModel[language].opened = !$scope.newModel[language].opened;
		}
	}
	
	//Codemirror initializer
	$scope.codemirrorLoaded = function(_editor) {
        $scope._doc = _editor.getDoc();
        $scope._editor = _editor;
        _editor.focus();
        $scope._doc.markClean()
        _editor.on("beforeChange", function() {});
        _editor.on("change", function() {});
    };

    //codemirror options
    $scope.editorOptionsCss = {
        theme: 'eclipse',
        lineWrapping: true,
        lineNumbers: true,
        mode: {name:'css'},
        onLoad: $scope.codemirrorLoaded
    };
    $scope.editorOptionsHtml = {
        theme: 'eclipse',
        lineWrapping: true,
        lineNumbers: true,
        mode: {name: "xml", htmlMode: true},
        onLoad: $scope.codemirrorLoaded
    };
    $scope.editorOptionsJs = {
        theme: 'eclipse',
        lineWrapping: true,
        lineNumbers: true,
        mode: {name: "javascript"},
        onLoad: $scope.codemirrorLoaded
    };
	
//*************************START STUBBED DATA
	var sort1 = datastore.filter({'city':'Santa Fe','total': 2}).sort('city').getDataArray(function(record){
        return {
            name :record.city,
            y:record.total_children
        }
    });;
	console.log('sort1',sort1)
  
	var sort2 = datastore.filter({'total_children':'!2'}).sort('city').getDataArray(function(record){
        return {
            name :record.city,
            z:record.total_children
        }
    });
    console.log('sort2', sort2)
    
    var column = datastore.sort('city').getColumn('city');
    console.log('column',column)
    
//    var seriesAndData = datastore.getSeriesAndData({'dataLabel':'myData','series':[{'name':'city'},{'desc':'city_desc'}]}, function(record){
//        return {
//            name :record.city,
//            children:record.total_children
//        }
//    });
//    console.log('seriesAndData',seriesAndData);
//*************************END STUBBED DATA
    
	
	$scope.saveConfiguration=function(){
		 mdPanelRef.close();
		 angular.copy($scope.newModel,model);
		 $scope.$destroy();
		 finishEdit.resolve();
 	}
 	$scope.cancelConfiguration=function(){
 		mdPanelRef.close();
 		$scope.$destroy();
 		finishEdit.reject();
 	}



}
