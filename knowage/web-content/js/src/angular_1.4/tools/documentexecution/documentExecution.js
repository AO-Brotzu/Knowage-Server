(function() {

	var stringStartsWith = function (string, prefix) {
		return string.toLowerCase().slice(0, prefix.length) == prefix.toLowerCase();
	};

	var documentExecutionApp = angular.module('documentExecutionModule');

	documentExecutionApp.config(['$mdThemingProvider', function($mdThemingProvider) {
		$mdThemingProvider.theme('knowage')
		$mdThemingProvider.setDefaultTheme('knowage');
	}]);
	
	documentExecutionApp.controller( 'documentExecutionController', 
			['$scope', '$http', '$mdSidenav', '$mdDialog','$mdToast', 'sbiModule_translate', 'sbiModule_restServices', 
			 'sbiModule_config', 'sbiModule_messaging', 'execProperties', 'documentExecuteUtils',
			 documentExecutionControllerFn]);


	function documentExecutionControllerFn(
			$scope, $http, $mdSidenav,$mdDialog,$mdToast, sbiModule_translate, sbiModule_restServices, sbiModule_config,
			sbiModule_messaging, execProperties, documentExecuteUtils) {

		console.log("documentExecutionControllerFn IN ");
		$scope.executionInstance = execProperties.executionInstance || {};
		$scope.roles = execProperties.roles;
		$scope.selectedRole = {name : ""};
		$scope.execContextId = "";
		$scope.documentUrl="";
		$scope.showSelectRoles=true;
		$scope.translate = sbiModule_translate;
		$scope.documentParameters = [];
		$scope.showParametersPanel = true;
		$scope.newViewpoint = JSON.parse(JSON.stringify(documentExecuteUtils.EmptyViewpoint));
		$scope.viewpoints = [];
		$scope.documentExecuteUtils = documentExecuteUtils;
		
		$scope.currentView = 'DOCUMENT';
		$scope.parameterView='';
		$scope.gvpCtrlViewpoints = [];
		
		$scope.isParameterRolePanelDisabled = true;
		
		
		$scope.initSelectedRole = function(){
			console.log("initSelectedRole IN ");
			if(execProperties.roles && execProperties.roles.length > 0) {
				if(execProperties.roles.length==1) {
					$scope.selectedRole.name = execProperties.roles[0];
					$scope.showSelectRoles=false;
					//load parameters if role is selected
					$scope.getParametersForExecution($scope.selectedRole.name);
				}
				$scope.executionProcesRestV1($scope.selectedRole.name);
			}
			$scope.isParameterRolePanelDisabled = $scope.checkParameterRolePanelDisabled();
			
			console.log("initSelectedRole OUT ");
		};

		$scope.toggleParametersPanel = function(){
			if($scope.showParametersPanel) {
				$mdSidenav('parametersPanelSideNav').close();
			} else {
				$mdSidenav('parametersPanelSideNav').open();
			}
			$scope.showParametersPanel = $mdSidenav('parametersPanelSideNav').isOpen();
		};
			
		$scope.returnToDocument = function(){
			$scope.currentView = 'DOCUMENT';
			$scope.parameterView='';
			$scope.isParameterRolePanelDisabled = $scope.checkParameterRolePanelDisabled();
		}
		
		/*
		 * START EXECUTION PROCESS REST
		 * Return the SBI_EXECUTION_ID code 
		 */
		$scope.executionProcesRestV1 = function(role, paramsStr) {			
			if(typeof paramsStr === 'undefined'){
				paramsStr='{}';
			}
			var params = 
				"label=" + execProperties.executionInstance.OBJECT_LABEL
				+ "&role=" + role
				+ "&parameters=" + paramsStr;				
			sbiModule_restServices.alterContextPath( sbiModule_config.contextName);
			sbiModule_restServices.get("1.0/documentexecution", 'url',params).success(
				function(data, status, headers, config) {					
					console.log(data);
					if(data['documentError'] && data['documentError'].length > 0 ){
						//sbiModule_messaging.showErrorMessage(data['documentError'][0].message, 'Error');
						var alert = $mdDialog.alert()
						.title(sbiModule_translate.load("sbi.generic.warning"))
						.content(data['documentError'][0].message).ok(sbiModule_translate.load("sbi.general.ok"));
						
						$mdDialog.show( alert );
					}else{
						if(data['errors'].length > 0 ){
							var strErros='';
							for(var i=0; i<=data['errors'].length-1;i++){
								strErros=strErros + data['errors'][i].description + '. \n';
							}
							//sbiModule_messaging.showErrorMessage(strErros, 'Error');
							var alert = $mdDialog.alert()
							.title(sbiModule_translate.load("sbi.generic.warning"))
							.content(strErros).ok(sbiModule_translate.load("sbi.general.ok"));
							$mdDialog.show( alert );
						}else{
							$scope.documentUrl=data.url;
						}	
					}	
					
				}).error(function(data, status, headers, config) {
					console.log("TargetLayer non Ottenuto " + status);
				});
		};
		
		/*
		 * EXECUTE PARAMS
		 * Submit param form
		 */
		$scope.executeParameter = function() {
			console.log("executeParameter IN ");
			$scope.executionProcesRestV1($scope.selectedRole.name, JSON.stringify(documentExecuteUtils.buildStringParameters($scope.documentParameters)));			
			if($mdSidenav('parametersPanelSideNav').isOpen()) {
				$mdSidenav('parametersPanelSideNav').close();
				$scope.showParametersPanel = $mdSidenav('parametersPanelSideNav').isOpen();
			}
			console.log("executeParameter OUT ");
		};
		
		$scope.changeRole = function(role) {
			// $scope.selectedRole is overwritten by the ng-model attribute
			console.log("changeRole IN ");
			//If new selected role is different from the previous one
			if(role != $scope.selectedRole.name) {  
				$scope.executionProcesRestV1(role);
//				$scope.executionProcesRestV1(role, JSON.stringify(documentExecuteUtils.buildStringParameters($scope.documentParameters)));
				$scope.getParametersForExecution(role);
//				if($mdSidenav('parametersPanelSideNav').isOpen()) {
//					$mdSidenav('parametersPanelSideNav').close();
//					$scope.showParametersPanel = $mdSidenav('parametersPanelSideNav').isOpen();
//				}
			}
			console.log("changeRole OUT ");
		};
	
		$scope.isExecuteParameterDisabled = function() {
			if($scope.documentParameters.length > 0) {
				for(var i = 0; i < $scope.documentParameters.length; i++ ) {
					if($scope.documentParameters[i].mandatory 
							&& (!$scope.documentParameters[i].parameterValue
									|| $scope.documentParameters[i].parameterValue == '' )) {
						return true;
					}
				}
			}
			return false
		};
		
		/*
		 * GET PARAMETERS 
		 * Check if parameters exist.
		 * exist - open parameters panel
		 * no exist - get iframe url  
		 */
		$scope.getParametersForExecution = function(role) {		
			var params = 
				"label=" + execProperties.executionInstance.OBJECT_LABEL
				+ "&role=" + role;
			sbiModule_restServices.get("1.0/documentexecution", "filters", params)
			.success(function(response, status, headers, config){
				console.log('getParametersForExecution response OK -> ', response);
				//check if document has parameters 
				if(response && response.filterStatus && response.filterStatus.length>0){
					//check default parameter control TODO										
					$scope.showParametersPanel=true;
					if(!($mdSidenav('parametersPanelSideNav').isOpen())) {
						$mdSidenav('parametersPanelSideNav').open();
					}
					$scope.documentParameters = response.filterStatus;
					//$scope.getViewPoints(role, execContextId); 
					//$scope.getParameterValues();
				}else{
					$scope.showParametersPanel = false;
					if($mdSidenav('parametersPanelSideNav').isOpen()) {
						$mdSidenav('parametersPanelSideNav').close();
					}
					//$scope.getURLForExecution(role, execContextId, data);
				}
			})
			.error(function(response, status, headers, config) {
				console.log('getParametersForExecution response ERROR -> ', response);
				sbiModule_messaging.showErrorMessage(response.errors[0].message, 'Error');
			});
		};

		$scope.toggleCheckboxParameter = function(parameter, defaultParameter) {
//			console.log('toggleCheckboxParameter: parameter-> ', parameter);
			
//			var tempNewParameterValue = '';
			var tempNewParameterValue = [];
			for(var i = 0; i < parameter.defaultValues.length; i++) {
				var defaultValue = parameter.defaultValues[i];
				if(defaultValue.isSelected == true) {
//					if(tempNewParameterValue != '') {
//						tempNewParameterValue += ',';
//					}
//					tempNewParameterValue += "'" + defaultValue.value + "'";
//					tempNewParameterValue += defaultValue.value;
					tempNewParameterValue.push(defaultValue.value);
				}
			}
			parameter.parameterValue = tempNewParameterValue;
		};
		
		$scope.popupLookupParameterDialog = function(parameter) {
			$mdDialog.show({
				$type: "confirm",
				clickOutsideToClose: false,
				theme: "knowage",
//				ok: sbiModule_translate.load("sbi.browser.defaultRole.save"),
//				cancel: sbiModule_translate.load("sbi.browser.defaultRole.cancel"),
				openFrom: '#' + parameter.urlName,
				closeTo: '#' + parameter.urlName,
//				title: sbiModule_translate.load("sbi.kpis.parameter") + ': ' + parameter.label,
				templateUrl : sbiModule_config.contextName
					+ '/js/src/angular_1.4/tools/documentexecution/templates/popupLookupParameterDialogTemplate.htm',
				
				locals : {
					parameter: parameter,
					toggleCheckboxParameter: $scope.toggleCheckboxParameter,
					sbiModule_translate: $scope.translate,
				},
				controllerAs: "lookupParamCtrl",
				
				controller : function($mdDialog, parameter, toggleCheckboxParameter, sbiModule_translate) {
					var lookupParamCtrl = this;
					
					lookupParamCtrl.toggleCheckboxParameter = toggleCheckboxParameter;
					
					lookupParamCtrl.initialParameterState = {};
					
					angular.copy(parameter, lookupParamCtrl.initialParameterState);
					lookupParamCtrl.parameter = parameter;
					
					lookupParamCtrl.dialogTitle = sbiModule_translate.load("sbi.kpis.parameter") + ': ' + parameter.label;
					lookupParamCtrl.dialogCancelLabel = sbiModule_translate.load("sbi.browser.defaultRole.cancel");
					lookupParamCtrl.dialogSaveLabel = sbiModule_translate.load("sbi.browser.defaultRole.save");
					
					lookupParamCtrl.abort = function(){
						angular.copy(lookupParamCtrl.initialParameterState, lookupParamCtrl.parameter);
						$mdDialog.hide();
					};
					
					lookupParamCtrl.save = function(){
						$mdDialog.hide();
					};
				}
			});
		};
		
		
		$scope.showRequiredFieldMessage = function(parameter) {
			return (
				parameter.mandatory 
				&& (
						!parameter.parameterValue
						|| (Array.isArray(parameter.parameterValue) && parameter.parameterValue.length == 0) 
						|| parameter.parameterValue == '')
				) == true;
		};		

		$scope.isParameterPanelDisabled = function(){
			return (!$scope.documentParameters || $scope.documentParameters.length == 0);
		};
		
		$scope.checkParameterRolePanelDisabled = function(){
			return ((!$scope.documentParameters || $scope.documentParameters.length == 0)
					&& (execProperties.roles.length==1));
		};
		
		$scope.executeDocument = function(){
			console.log('Executing document -> ', execProperties);
		};
	
		$scope.editDocument = function(){
			alert('Editing document');
			console.log('Editing document -> ', execProperties);
		};
	
		$scope.deleteDocument = function(){
			alert('Deleting document');
			console.log('Deleting document -> ', execProperties);
		};
		
		$scope.clearListParametersForm = function(){
			if($scope.documentParameters.length > 0){
				for(var i = 0; i < $scope.documentParameters.length; i++){
					var parameter = $scope.documentParameters[i];
					documentExecuteUtils.resetParameter(parameter);
				}
			}
		};
		
		/*
		 * Create new viewpoint document execution
		 */
		$scope.createNewViewpoint = function(){
			$mdDialog.show({
				scope : $scope,
				preserveScope : true,
				
				templateUrl : sbiModule_config.contextName + '/js/src/angular_1.4/tools/glossary/commons/templates/dialog-new-parameters-document-execution.html',
					
				controllerAs : 'vpCtrl',
				controller : function($mdDialog) {
					var vpctl = this;
					vpctl.headerTitle = sbiModule_translate.load("sbi.execution.executionpage.toolbar.saveas");
					vpctl.submit = function() {
						vpctl.newViewpoint.OBJECT_LABEL = execProperties.executionInstance.OBJECT_LABEL;
						vpctl.newViewpoint.ROLE = $scope.selectedRole.name;
						vpctl.newViewpoint.VIEWPOINT = documentExecuteUtils.buildStringParameters($scope.documentParameters);
						sbiModule_restServices.post(
								"1.0/documentviewpoint",
								"addViewpoint", vpctl.newViewpoint)
						   .success(function(data, status, headers, config) {
							if(data.errors && data.errors.length > 0 ){
								documentExecuteUtils.showToast(data.errors[0].message);
							}else{
								$mdDialog.hide();
								documentExecuteUtils.showToast(sbiModule_translate.load("sbi.execution.viewpoints.msg.saved"), 3000);
							}							
						})
						.error(function(data, status, headers, config) {
							documentExecuteUtils.showToast(sbiModule_translate.load("sbi.execution.viewpoints.msg.error.save"),3000);	
						});
					};
					
					vpctl.annulla = function($event) {
						$mdDialog.hide();
						$scope.newViewpoint = JSON.parse(JSON.stringify(documentExecuteUtils.EmptyViewpoint));
					};
				},

				templateUrl : sbiModule_config.contextName + '/js/src/angular_1.4/tools/documentexecution/templates/dialog-new-parameters-document-execution.html'
			});
		};
		
		/*
		 * GET Viewpoint document execution
		 */
		$scope.getViewpoints = function(){
			$scope.currentView='PARAMETERS';
			$scope.parameterView='FILTER_SAVED';
			$scope.isParameterRolePanelDisabled=true;
			//gvpctl.headerTitle = sbiModule_translate.load("sbi.execution.viewpoints.title");
			sbiModule_restServices.get(
					"1.0/documentviewpoint", 
					"getViewpoints",
					"label=" + execProperties.executionInstance.OBJECT_LABEL + "&role="+ $scope.selectedRole.name)
					.success(function(data, status, headers, config) {	
						console.log('data viewpoints '  ,  data.viewpoints);
						$scope.gvpCtrlViewpoints = data.viewpoints;
					})
					.error(function(data, status, headers, config) {});																	
		};
		
		
		
		$scope.gvpCtrlVpSpeedMenuOpt = 
			[ 			 		               	
			 { // Fill Form
				 label: sbiModule_translate.load("sbi.execution.parametersselection.executionbutton.fill.tooltip"),
				 icon:"fa fa-pencil",
				 color:'#222222',
				 action : function(item) {
					 var params = documentExecuteUtils.decodeRequestStringToJson(decodeURIComponent(item.vpValueParams));
					 fillParametersPanel(params);
					 $scope.returnToDocument();
				 }	
			 },
			 { //Execute Url
				 label: sbiModule_translate.load("sbi.execution.parametersselection.executionbutton.message"),
				 icon:"fa fa-play",
				 color:'#222222',
				 action : function(item) {
					 //decodeURIComponent						 		               		
					 var params = documentExecuteUtils.decodeRequestStringToJson(decodeURIComponent(item.vpValueParams));
					 fillParametersPanel(params);
					 $scope.executionProcesRestV1($scope.selectedRole.name, JSON.stringify(params));
					 $scope.returnToDocument();
				 }	
			 }
			 ,{   //Delete Action
				 label: sbiModule_translate.load("sbi.generic.delete"),
				 icon:"fa fa-trash-o",
				 //backgroundColor:'red',
				 color:'#222222',
				 action : function(item) {
					 var confirm = $mdDialog
						.confirm()
						.title(sbiModule_translate.load("sbi.execution.parametersselection.delete.filters.title"))
						.content(
							sbiModule_translate
							.load("sbi.execution.parametersselection.delete.filters.message"))
							.ok(sbiModule_translate.load("sbi.general.continue"))
							.cancel(sbiModule_translate.load("sbi.general.cancel")
						);
					$mdDialog.show(confirm).then(function() {
						var index =$scope.gvpCtrlViewpoints.indexOf(item);
						 var objViewpoint = JSON.parse('{ "VIEWPOINT" : "'+ item.vpId +'"}');
							sbiModule_restServices.post(
									"1.0/documentviewpoint",
									"deleteViewpoint", objViewpoint)
							   .success(function(data, status, headers, config) {
								   if(data.errors && data.errors.length > 0 ){
										 documentExecuteUtils.showToast(data.errors[0].message);
									 }else{
										 $scope.gvpCtrlViewpoints.splice(index, 1);
											 //message success 
									 }
								   //gvpctl.selectedParametersFilter = [];
							})
							.error(function(data, status, headers, config) {});
//							$scope.getViewpoints();
					}, function() {
						console.log('Annulla');
						$scope.getViewpoints();
					});	
				 }
			 } 	
		 ];
		
			
		$scope.openInfoMetadata = function(){
		    $mdDialog.show({
		    	scope : $scope,
				preserveScope : true,
		    	templateUrl: sbiModule_config.contextName + '/js/src/angular_1.4/tools/documentexecution/templates/documentMetadata.html',
		    	locals : {
					sbiModule_translate: $scope.translate,
					sbiModule_config: sbiModule_config,
					executionInstance: $scope.executionInstance
				},
		    	parent: angular.element(document.body),
		    	clickOutsideToClose:false,
		    	controllerAs: "metadataDlgCtrl",
		    	controller : function($mdDialog, sbiModule_translate, sbiModule_config, executionInstance) {
		    		var metadataDlgCtrl = this;
		    		metadataDlgCtrl.lblTitle = sbiModule_translate.load('sbi.execution.executionpage.toolbar.metadata');
		    		metadataDlgCtrl.lblClose = sbiModule_translate.load('sbi.general.close');
		    		metadataDlgCtrl.lblSave = sbiModule_translate.load('sbi.generic.update');
		    		metadataDlgCtrl.close = function(){
		    			$mdDialog.hide();
		    		}
		    		sbiModule_restServices.get('1.0/documentexecution/' + executionInstance.OBJECT_ID,'documentMetadata',null)
		    		.success(function(response, status, headers, config){
		    			//"GENERAL_META", "LONG_TEXT", "SHORT_TEXT"
		    			
		    		})
		    		.error(function(response, status, headers, config){
		    			console.log(response);
		    		});
		    	}
		    })
	        .then(function(answer) {
	          $scope.status = 'You said the information was "' + answer + '".';
	        }, function() {
	          $scope.status = 'You cancelled the dialog.';
	        });
		};
		
		/*
		 * Fill Parameters Panel 
		 */
		function fillParametersPanel(params){
			if($scope.documentParameters.length > 0){
				for(var i = 0; i < $scope.documentParameters.length; i++){
					var parameter = $scope.documentParameters[i];
					
					if(!params[parameter.urlName]) {
						documentExecuteUtils.resetParameter(parameter);
					} else {
						//Type params
						if(parameter.type=='NUM'){
							parameter.parameterValue = parseFloat(params[parameter.urlName],10);
						}else if(parameter.type=='STRING'){
							parameter.parameterValue = params[parameter.urlName];
							
							if(parameter.defaultValues && parameter.defaultValues.length > 0) {
								var parameterValues = parameter.parameterValue;

								for(var j = 0; j < parameter.defaultValues.length; j++) {
									var defaultValue = parameter.defaultValues[j];

									for(var k = 0; k < parameterValues.length; k++) {
										if(defaultValue.value == parameterValues[k]) {
											defaultValue.isSelected = true;
											break;
										} else {
											defaultValue.isSelected = false;
										}
									}
								}
							}
						}
					}
				}
			}			
		}

		console.log("documentExecutionControllerFn OUT ");
	};
	
	documentExecutionApp.directive('documentParamenterElement', 
			['sbiModule_config',
			 function(sbiModule_config){
		return {
			restrict: 'E',
			templateUrl: sbiModule_config.contextName + '/js/src/angular_1.4/tools/documentexecution/templates/documentParamenterElementTemplate.htm',
		};
	}]);
	
	documentExecutionApp.directive('documentParamenterFilterHandler', 
			['sbiModule_config',
			 function(sbiModule_config){
		return {
			restrict: 'E',
			templateUrl: sbiModule_config.contextName + '/js/src/angular_1.4/tools/documentexecution/templates/document-execution-viewpoints.html',
		};
	}]);
	
	
	documentExecutionApp.directive('iframeSetDimensionsOnload', [function(){
		return {
			restrict: 'A',
			link: function(scope, element, attrs){
				element.on('load', function(){
					var iFrameHeight = element[0].parentElement.scrollHeight + 'px';
					element.css('height', iFrameHeight);				
					element.css('width', '100%');
				});
			}
		};
		}]
	);
})();	