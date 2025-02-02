/*global history */
sap.ui.define([
	"mjzsoft/sapui5/tutorial/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"mjzsoft/sapui5/tutorial/model/formatter",
	"mjzsoft/sapui5/tutorial/model/grouper",
	"mjzsoft/sapui5/tutorial/model/GroupSortState",
	"mjzsoft/sapui5/tutorial/controller/ListManager"
], function (BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, Device, formatter, grouper, GroupSortState,
	ListManager) {
	"use strict";

	return BaseController.extend("mjzsoft.sapui5.tutorial.controller.Master", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit: function () {

			
			// Control state model
			var oList = this.byId("list"),
				oViewModel = this._createViewModel(),
				// Put down master list's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the master list is
				// taken care of by the master list itself.
				iOriginalBusyDelay = oList.getBusyIndicatorDelay();
				console.log(iOriginalBusyDelay)

			this._oGroupSortState = new GroupSortState(oViewModel, grouper.groupUnitNumber(this.getResourceBundle()));

			this._oList = oList;
			// keeps the filter and search state
			this._oListFilterState = {
				aFilter: [],
				aSearch: []
			};

			this.setModel(oViewModel, "masterView");
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			// oList.attachEventOnce("updateFinished", function (oEvent) {
				oList.attachEventOnce("updateStarted", function (oEvent) {
				// Restore original busy indicator delay for the list
				this.initP13N(oEvent.getSource());
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
				// this._oGroupSortState.
				
			}.bind(this));

			this.getView().addEventDelegate({
				onBeforeFirstShow: function () {
					this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
				}.bind(this)
			});

			this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onTest: function(){
			var aSorters =  this._oGroupSortState.group('CategoryID');
			// this.initP13N
			// this._applyGroupSort(aSorters);
			this._oList.getBinding("items").sort(aSorters)
			// this._oListManager.group
			console.log("yup yup!")
		},
		initP13N: function (oList) {
			this._oP13nManagerSettings = {
				oListener: this,
				bAddNoneItem: false,
				oI18nIds: {
					sSortPanelTitleId: "SortPanelTitle",
					sFilterPanelTitleId: "FilterPanelTitle",
					sGroupPanelTitleId: "GroupPanelTitle",
					sNoneItemId: "None"
				},
				aFilterItems: [{
					sColumnKey: "CategoryID",
					sColumnI18nKey: "CategoryID"
				}, {
					sColumnKey: "CategoryName",
					sColumnI18nKey: "CategoryName"
				}],
				aSortItems: [{
					sColumnKey: "CategoryID",
					sColumnI18nKey: "CategoryID"
				}, {
					sColumnKey: "CategoryName",
					sColumnI18nKey: "CategoryName"
				}],
				aGroupItems: [{
					sColumnKey: "CategoryID",
					sColumnI18nKey: "CategoryID",
					fnVGroup: function (oContext) {
						var sName = "" + oContext.getProperty("CategoryID");
						return {
							key: sName,
							text: "{i18n>" + "CategoryID" + "}: " + sName.replace(/^[0]+/g, "")
						};
					}.bind(this)
				}, {
					sColumnKey: "CategoryName",
					sColumnI18nKey: "CategoryName"
				}],
				aFilters: [],
				aSort: [{
					sColumnKey: "CategoryName",
					sOperation: "Ascending"
				}],
				aGroup: [
					// { // https://sapui5.hana.ondemand.com/1.38.16/#docs/api/symbols/sap.m.P13nGroupItem.html#constructor
					// 	sColumnKey: "CategoryID",
					// 	sOperation: "Ascending",
					// 	bShowIfGrouped: true
					// }
				]
			};
			var oListManager = new ListManager(this.getOwnerComponent(), this._oList, this.byId("__button_P13N"), this._oP13nManagerSettings);
			// console.log(oListManager.getDialogObj())
			// oListManager.setDefaultGrouping( )
			// this._oList.getBinding("items").group("CategoryID")

			// oListManager.group(this._oGroupSortState.group('CategoryID'))
			
		
		},
		
		onAfterRendering:function(oEvent){
			var aSorters =  this._oGroupSortState.group('CategoryID');
			// this.initP13N.aGroup.push(
				// { // https://sapui5.hana.ondemand.com/1.38.16/#docs/api/symbols/sap.m.P13nGroupItem.html#constructor
				// 	sColumnKey: "CategoryID",
				// 	sOperation: "Ascending",
				// 	bShowIfGrouped: true
				// }
			// )
			// this._applyGroupSort(aSorters);
			// this._oList.getBinding("items").aSorters = aSorters
			// this._oList.getBinding("items").sort();
			// this._oListManager.group
			// console.log("yup yup!",this._oList.getBinding("items"))
			
			// console.log(this.initP13N)
			// console.log(this._oListManager)
		
		},
		/**
		 * After list data is available, this handler method updates the
		 * master list counter and hides the pull to refresh control, if
		 * necessary.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the master list object counter after new data is loaded
			this._updateListItemCount(oEvent.getParameter("total"));
			// hide pull to refresh if necessary
			this.byId("pullToRefresh").hide();
			// var aSorters =  this._oGroupSortState.group('CategoryID');
			// this._oList.getBinding("items").sort(aSorters)

			
		},

		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
				return;
			}

			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				this._oListFilterState.aSearch = [new Filter("CategoryName", FilterOperator.Contains, sQuery)];
			} else {
				this._oListFilterState.aSearch = [];
			}
			this._applyFilterSearch();

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			this._oList.getBinding("items").refresh();
		},

		/**
		 * Event handler for the sorter selection.
		 * @param {sap.ui.base.Event} oEvent the select event
		 * @public
		 */
		onSort: function (oEvent) {
			var sKey = oEvent.getSource().getSelectedItem().getKey(),
				aSorters = this._oGroupSortState.sort(sKey);

			this._applyGroupSort(aSorters);
		},

		/**
		 * Event handler for the grouper selection.
		 * @param {sap.ui.base.Event} oEvent the search field event
		 * @public
		 */
		onGroup: function (oEvent) {
			var sKey = oEvent.getSource().getSelectedItem().getKey(),
				aSorters = this._oGroupSortState.group(sKey);
				console.log(sKey)
			this._applyGroupSort(aSorters);
		},

		/**
		 * Event handler for the filter button to open the ViewSettingsDialog.
		 * which is used to add or remove filters to the master list. This
		 * handler method is also called when the filter bar is pressed,
		 * which is added to the beginning of the master list when a filter is applied.
		 * @public
		 */
		onOpenViewSettings: function () {
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = sap.ui.xmlfragment("mjzsoft.sapui5.tutorial.view.ViewSettingsDialog", this);
				this.getView().addDependent(this._oViewSettingsDialog);
				// forward compact/cozy style into Dialog
				this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			this._oViewSettingsDialog.open();
		},

		/**
		 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
		 * has been closed with 'OK'. In the case, the currently chosen filters
		 * are applied to the master list, which can also mean that the currently
		 * applied filters are removed from the master list, in case the filter
		 * settings are removed in the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
		onConfirmViewSettingsDialog: function (oEvent) {
			var aFilterItems = oEvent.getParameters().filterItems,
				aFilters = [],
				aCaptions = [];
			console.log('hererere')

			// update filter state:
			// combine the filter array and the filter string
			aFilterItems.forEach(function (oItem) {
				switch (oItem.getKey()) {
				case "Filter1":
					aFilters.push(new Filter("CategoryID", FilterOperator.LE, 100));
					break;
				case "Filter2":
					aFilters.push(new Filter("CategoryID", FilterOperator.GT, 100));
					break;
				default:
					break;
				}
				aCaptions.push(oItem.getText());
			});

			
			this._oListFilterState.aFilter = aFilters;
			this._updateFilterBar(aCaptions.join(", "));
			this._applyFilterSearch();
		},

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
		onSelectionChange: function (oEvent) {
			// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		/**
		 * Event handler for the bypassed event, which is fired when no routing pattern matched.
		 * If there was an object selected in the master list, that selection is removed.
		 * @public
		 */
		onBypassed: function () {
			this._oList.removeSelections(true);
		},

		/**
		 * Used to create GroupHeaders with non-capitalized caption.
		 * These headers are inserted into the master list to
		 * group the master list's items.
		 * @param {Object} oGroup group whose text is to be displayed
		 * @public
		 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
		 */
		createGroupHeader: function (oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.text,
				upperCase: false
			});
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser historz
		 * @public
		 */
		onNavBack: function () {
			history.go(-1);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		_createViewModel: function () {
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: this.getResourceBundle().getText("masterTitleCount", [0]),
				noDataText: this.getResourceBundle().getText("masterListNoDataText"),
				sortBy: "CategoryName",
				groupBy: "None"
			});
		},

		/**
		 * If the master route was hit (empty hash) we have to set
		 * the hash to to the first item in the list as soon as the
		 * listLoading is done and the first item in the list is known
		 * @private
		 */
		_onMasterMatched: function () {
			this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
				function (mParams) {
					if (mParams.list.getMode() === "None") {
						return;
					}
					var sObjectId = mParams.firstListitem.getBindingContext().getProperty("CategoryID");
					this.getRouter().navTo("object", {
						objectId: sObjectId
					}, true);
				}.bind(this),
				function (mParams) {
					if (mParams.error) {
						return;
					}
					this.getRouter().getTargets().display("detailNoObjectsAvailable");
				}.bind(this)
			);
		},

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail: function (oItem) {
			var bReplace = !Device.system.phone;
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("CategoryID")
			}, bReplace);
		},

		/**
		 * Sets the item count on the master list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount: function (iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oList.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
				this.getModel("masterView").setProperty("/title", sTitle);
			}
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		_applyFilterSearch: function () {
			var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
				oViewModel = this.getModel("masterView");
			this._oList.getBinding("items").filter(aFilters, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aFilters.length !== 0) {
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
			} else if (this._oListFilterState.aSearch.length > 0) {
				// only reset the no data text to default when no new search was triggered
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
			}
		},

		/**
		 * Internal helper method to apply both group and sort state together on the list binding
		 * @param {sap.ui.model.Sorter[]} aSorters an array of sorters
		 * @private
		 */
		_applyGroupSort: function (aSorters) {
			this._oList.getBinding("items").sort(aSorters);
		},

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param {string} sFilterBarText the selected filter value
		 * @private
		 */
		_updateFilterBar: function (sFilterBarText) {
			var oViewModel = this.getModel("masterView");
			oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
			oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
		}

	});

});