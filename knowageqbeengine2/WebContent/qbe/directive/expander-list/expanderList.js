/**
 * Knowage, Open Source Business Intelligence suite
 * Copyright (C) 2016 Engineering Ingegneria Informatica S.p.A.
 * 
 * Knowage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Knowage is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function() {
	var scripts = document.getElementsByTagName("script");
	var currentScriptPath = scripts[scripts.length - 1].src;
	currentScriptPath = currentScriptPath.substring(0, currentScriptPath.lastIndexOf('/') + 1);

angular.module('qbe_expander_list', ['ngMaterial'])
.directive('qbeExpanderList', function() {
	return {
		templateUrl:  '/knowageqbeengine2/qbe/directive/expander-list/expander-list.html',
		controller: qbeExpanderListControllerFunction,
		priority: 10,
		scope: {
			ngModel:"=",
			showGridView:"=?",
			showAddToOrganizer:"=?",
			selectedRow:"=?",
			tableSpeedMenuOption:"=?",
			selectedDocument:"=?",
			selectDocumentAction:"&",
			deleteDocumentAction:"&",
			executeDocumentAction:"&",
			cloneDocumentAction:"&",
			addToOrganizerAction:"&",
			addToFavoritesAction:"&",
			editDocumentAction:"&",
			shareDocumentAction:"&",
			orderingDocumentCards:"=?",
			cloneEnabled:"=?",
			deleteEnabled:"=?"	
		},
		link: function (scope, elem, attrs) { 

		}
	}
});

function qbeExpanderListControllerFunction($scope,sbiModule_translate, sbiModule_config){
	
	$scope.sbiModule_config = sbiModule_config;
	$scope.translate = sbiModule_translate;
	
	$scope.clickDocument=function(item){		
		 $scope.selectDocumentAction({doc: item});
	}
}
})();