<%@ page language="java" pageEncoding="utf-8" session="true"%>


<%-- ---------------------------------------------------------------------- --%>
<%-- JAVA IMPORTS															--%>
<%-- ---------------------------------------------------------------------- --%>


<%@include file="/WEB-INF/jsp/commons/angular/includeMessageResource.jspf"%>



<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html ng-app="layerWordManager">

<head>
	
	<%@include file="/WEB-INF/jsp/commons/angular/angularImport.jsp"%>
<!-- non c'entra	<script type="text/javascript" src="/athena/js/src/angular_1.4/tools/glossary/commons/LayerTree.js"></script> -->
	<link rel="stylesheet" type="text/css" href="/athena/themes/glossary/css/tree-style.css">
	<link rel="stylesheet" type="text/css" href="/athena/themes/glossary/css/generalStyle.css">
	<link rel="stylesheet" type="text/css" href="/athena/themes/layer/css/layerStyle.css">
	<!-- controller -->
	<script type="text/javascript" src="/athena/js/src/angular_1.4/tools/layer/layerCatalogue.js"></script>
	
	
</head>


<body class="bodyStyle" >

	<div ng-controller="Controller " layout="row" layout-wrap layout-fill>
		<!-- left BOX -->
		<div flex="20" layout-fill class="leftBox h100">
			
			<md-toolbar class="md-blue minihead ">
					<div class="md-toolbar-tools">
						<div  ng-model="selectLayer">{{translate.load("sbi.layer");}}</div>
						<md-button ng-click="loadLayerList(null)" aria-label="new Label"
							class="md-fab md-ExtraMini addButton" 
							style="position:absolute; right:11px; top:0px;"> 
							<md-icon md-font-icon="fa fa-plus"
								style=" margin-top: 6px ; color: white;">
							</md-icon> 
						</md-button>
					</div>
					</md-toolbar>
					
					<md-content layout-padding class="ToolbarBox miniToolbar noBorder leftListbox">
						<angular-list ng-click="showme=true" layout-fill 
							id='layer' 
	                		ng-model=layerList
	                		item-name='name'
	                		show-search-bar=true
	                		highlights-selected-item=true
	                		click-function="loadLayerList(item)"
	                		menu-option= menuLayer
	                	>
        		
                		</angular-list>
                		
					</md-content>
		
		</div>
		
		<!-- RIGHT -->
		<div flex layout-fill ng-show="showme" class="h100">
			<form name="contactForm"  layout-fill ng-submit="contactForm.$valid && saveLayer()" class="detailBody md-whiteframe-z1" novalidate>
				<md-toolbar class="md-blue minihead">
					<div class="md-toolbar-tools h100">
						<div style="text-align: center; font-size: 30px;"></div>
						<div style="position: absolute; right: 0px" class="h100">
							<md-button type="button" tabindex="-1" aria-label="cancel"
								class="md-raised md-ExtraMini " style=" margin-top: 2px;"
								ng-click="cancel()">
								{{translate.load("sbi.browser.defaultRole.cancel");}} 
							</md-button>
							<md-button type="submit"  aria-label="save layer"
								class="md-raised md-ExtraMini " style=" margin-top: 2px;"
								ng-disabled=" selectedItem.name.length === 0 ||  selectedItem.type.length === 0">
								{{translate.load("sbi.browser.defaultRole.save");}}
							</md-button>
						</div>
					</div>
				</md-toolbar>
	
				<md-content flex style="margin-left:20px;" class="ToolbarBox miniToolbar noBorder">
					<div layout="row" layout-wrap>
						<div flex=2  style="margin-top:30px;"><md-icon  md-font-icon="fa fa-pencil-square-o"></md-icon></div>
							<div flex=45><md-input-container><label>{{translate.load("sbi.tools.layer.props.label")}}:</label><input ng-model="selectedLayer.label"  required maxlength="100" ng-maxlength="100" md-maxlength="100" > 
							</md-input-container>
						</div>
						<div flex=2 style="margin-top:30px;"><md-icon md-font-icon="fa fa-pencil-square-o"></md-icon></div>
						<div flex=50>
							<md-input-container>
								<label>{{translate.load("sbi.tools.layer.props.name")}}:</label>
								<input ng-model="selectedLayer.name"  required maxlength="100" ng-maxlength="100" md-maxlength="100" > 
							</md-input-container>
						</div>
					</div>
					<div layout="row" layout-wrap>
						<div flex=2 style="margin-top:30px;">
							<md-icon md-font-icon="fa fa-text-o"></md-icon>
						</div>
						<div flex=95>
							<md-input-container>
								<label>{{translate.load("sbi.tools.layer.props.descprition")}}:</label>
								<input ng-model="selectedLayer.description"  required maxlength="100" ng-maxlength="100" md-maxlength="100" > 
							</md-input-container>
						</div>
					</div>
					
					<div layout="row" layout-wrap>
						<div flex=2 style="margin-top:25px;">
							<md-icon md-font-icon="fa fa-check-square-o"></md-icon>
							<label>{{translate.load("sbi.tools.layer.baseLayer")}}</label>
						</div>
						<div flex=10 style="margin-top:10px;">
							<md-input-container>
								<md-checkbox ng-model="selectedLayer.baseLayer" aria-label="BaseLayer"> </md-checkbox> 
							</md-input-container>
						</div>
						<div flex=2 style="margin-top:30px;">
							<md-icon md-font-icon="fa fa-caret-down"></md-icon>
						</div>
						<div flex=80>
							<md-input-container> 
								<label>{{translate.load("sbi.tools.layer.props.type")}}</label>
									<md-select aria-label="aria-label" ng-model="selectedLayer.type"
										ng-change=""> 
											<md-option ng-repeat="type in listType" 
												value="{{type.value}}">{{type.label}}</md-option> 
									</md-select> 
							</md-input-container>
						</div>
					</div>
					
					<div layout="row" layout-wrap>
						<div flex=2 style="margin-top:30px;">
							<md-icon  md-font-icon="fa fa-pencil-square-o"></md-icon>
						</div>
						
						<div flex= 45>
						<md-input-container>
							<label>{{translate.load("sbi.tools.layer.props.label")}}:</label>
							<input ng-model="selectedLayer.layerLabel"  required maxlength="100" ng-maxlength="100" md-maxlength="100" > 
						</md-input-container>
						</div>
						<div flex=2 style="margin-top:30px;">
							<md-icon  md-font-icon="fa fa-pencil-square-o"></md-icon>
						</div>
						
						<div flex= 50>
							<md-input-container>
								<label>{{translate.load("sbi.tools.layer.props.name")}}:</label>
								<input ng-model="selectedLayer.layerName"  required maxlength="100" ng-maxlength="100" md-maxlength="100" > 
							</md-input-container>
						</div>
						
					
					</div>
					
					<div layout="row" layout-wrap>
						<div flex=2 style="margin-top:30px;">
							<md-icon  md-font-icon="fa fa-search-plus"></md-icon>
						</div>	
						<div flex= 25>
							<md-input-container>
								<label>{{translate.load("sbi.tools.layer.props.zoom")}}:</label>
								<input ng-model="selectedLayer.layerZoom"  type = "number" required > 
							</md-input-container>
						</div>	
						<div flex=2 style="margin-top:30px;">
							<md-icon  md-font-icon="fa fa-tag"></md-icon>
						</div>	
						<div flex=30>
							<md-input-container>
								<label>{{translate.load("sbi.tools.layer.props.id")}}:</label>
								<input ng-model="selectedLayer.layerId"  type = "number" required > 
							</md-input-container>
						</div>
						<div flex=35>
							<md-input-container>
								<label>{{translate.load("sbi.tools.layer.props.central.point")}}:</label>
								<input ng-model="selectedLayer.layerCentralPoint" required maxlength="100" ng-maxlength="100" md-maxlength="100" > 
							</md-input-container>
						</div>	
						<div>
							<md-button class="md-icon-button" aria-label="More">
		      					  <md-icon md-font-icon="fa fa-map-pin"></md-icon>
		    				</md-button>
						</div>
					</div>
					<!-- inizio campi variabili -->
					<div layout="row" layout-wrap ng-if="selectedLayer.type == 'File'">
						<div flex=2 style="margin-top:25px;">
							<md-icon md-font-icon="fa fa-upload"></md-icon>
						</div>
						<div>
							<md-input-container>
								<label>{{translate.load("sbi.tools.layer.props.file")}}:</label>
								<input ng-model="selectedLayer.layerFile" type="file" > 
							</md-input-container>
						</div>
					</div>
					
					
					<div layout="row" layout-wrap ng-if="selectedLayer.type == 'WFS' || selectedLayer.type == 'WMS' || selectedLayer.type == 'TMS' ">
						<div flex=2 style="margin-top:25px;">
							<md-icon md-font-icon="fa fa-link"></md-icon>
						</div>
						<div flex= 95>
							<md-input-container>
								<label>{{translate.load("sbi.tools.layer.props.url")}}:</label>
								<input ng-model="selectedLayer.layerURL" required maxlength="100" ng-maxlength="100" md-maxlength="100" > 
							</md-input-container>
						</div>
					</div>
					<div layout="row" layout-wrap ng-if="selectedLayer.type == 'Google' || selectedLayer.type == 'WMS' || selectedLayer.type == 'TMS' ">
						<div flex=2 style="margin-top:25px;">
							<md-icon md-font-icon="fa fa-cogs"></md-icon>
						</div>
						<div flex= 95>
							<md-input-container>
								<label>{{translate.load("sbi.tools.layer.props.options")}}:</label>
								<input ng-model="selectedLayer.layerOptions" required maxlength="100" ng-maxlength="100" md-maxlength="100" > 
							</md-input-container>
						</div>
					</div>
					<div layout="row" layout-wrap ng-if="selectedLayer.type == 'WMS'">
						<div flex=2 style="margin-top:30px;">
							<md-icon md-font-icon="fa fa-ellipsis-v"></md-icon>
						</div>
						<div flex=95>
							<md-input-container >
								<label>{{translate.load("sbi.tools.layer.props.params")}}:</label>
								<input ng-model="selectedLayer.layerParams" required maxlength="100" ng-maxlength="100" md-maxlength="100" > 
							</md-input-container>
						</div>
					</div>
										
				</md-content>

		</form>
		</div>
		
	</div>

	
	
	
  
	

</body>
</html>








