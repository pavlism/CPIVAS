const Report_template = document.createElement('template');
Report_template.innerHTML = `
	<mrp-table id="reportTable" search download pages sort sortCol="2" pageSize="50"></mrp-table>
`
class ReportPage extends HTMLElement {
	constructor() {
		super();
		//	Carrier<mrp-drop-down id="carrierList"></mrp-drop-down>Report Type<mrp-drop-down id="reportTypes"></mrp-drop-down>
		//var data = this.getTabelData();
		var list = this.getList();
		var carrierList = this.getCarrierList();
		
		this.carrier = "All";
		this.report = "Full Report";
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Report_template.content.cloneNode(true));
		//this.shadowRoot.querySelector('mrp-table').loadData(data);
		//this.shadowRoot.querySelector('#reportTypes').addList(list);
		//this.shadowRoot.querySelector('#carrierList').addList(carrierList);
		
		EventBroker.listen("reportTable_print_Each_mrp-button_clicked", this, this.printAllReports);
		EventBroker.listen("carrierList_mrp-drop-down_changed", this, this.carrierListChanged);
		EventBroker.listen("reportTypes_mrp-drop-down_changed", this, this.reportListChanged);
		EventBroker.listen("login Successful", this, this.updateTable);
		EventBroker.listen("print_reports_mrp-button_clicked", this, this.printReports);
		//EventBroker.listen("pageChanged", this, this.updateTable);
		EventBroker.listen("data-processing-finsihed", this, this.updateTableWith);
		EventBroker.listen("print_MEXC_Report_mrp-button_clicked", this, this.printTable);
	}
	printTable(component){
		debugger;
		component.shadowRoot.querySelector('mrp-table').printData_excel('MEXC.xlsx');
	}
	updateTableWith(component, triggerObj){
		debugger;
		var parsedData = component.objectsTo2DArray(triggerObj.data);
		//parsedData.shift();
		//parsedData = triggerObj.realHeaderRows.concat(parsedData);
		component.shadowRoot.querySelector('mrp-table').loadData(parsedData, triggerObj.realHeaderRows);
	}
	printFromTable(component){
		component.shadowRoot.querySelector('mrp-table').printData_excel("MEXC.xlsx")
	}
	
	printReports(component,triggerObj){
		component.updateTable(component,triggerObj, true);
	}
	
	carrierListChanged(component,triggerObj){
		component.carrier = triggerObj.element.shadowRoot.querySelector('#carrierList').value;
		component.updateTable(component,triggerObj);
	}
	reportListChanged(component,triggerObj){
		component.report = triggerObj.element.shadowRoot.querySelector('#reportTypes').value;
		component.updateTable(component,triggerObj);
	}
	updateTable(component,triggerObj, printReport = false){
		var api = "";
		var company = "";
		
		if(component.report == "Full Report"){
			api = "/api";
		}else if(component.report == "Approved"){
			api = "/api/approved";
		}else if(component.report == "Closed"){
			api = "/api/closed";
		}else if(component.report == "Investigation Complete"){
			api = "/api/investigationComplete";
		}else if(component.report == "No Match"){
			api = "/api/noMatch";
		}else if(component.report == "Paid"){
			api = "/api/paid";
		}else if(component.report == "Unapproved"){
			api = "/api/unapproved";
		}else if(component.report == "Under Investigation"){
			api = "/api/underInvestigation";
		}
		
		if(component.carrier == "UPS"){
			company = "?company=UPS";
		}else if(component.carrier == "DHL"){
			company = "?company=DHL Global Forwarding";
		}
		
		setupTable(component, api + company);
		
		async function setupTable(component, api){			
			const response = await fetch(api);
			const data = await response.json();
			
			var parsedData = component.objectsTo2DArray(data[0]);
			
			component.shadowRoot.querySelector('mrp-table').loadData(parsedData);
			if(printReport){
				debugger;
				component.carrier = "All"
				component.printAllReports(component,triggerObj);
			}
		}
	}
	printAllReports(component,triggerObj){
		var company = 'DHL Global Forwarding';
		
		/*getReport(this.listenerArgs, company, 'noMatch');
		getReport(this.listenerArgs, company, 'approved');
		getReport(this.listenerArgs, company, 'closed');
		getReport(this.listenerArgs, company, 'investigationComplete');
		getReport(this.listenerArgs, company, 'paid');
		getReport(this.listenerArgs, company, 'unapproved');
		getReport(this.listenerArgs, company, 'underInvestigation');*/
		
		debugger;
		//TODO get the value from the drop download
		
		if(component.carrier === "All"){
			getReport(component,'matchedByCarrier');
			getReport(component,'getNoMerged_byCarrier');
		}else if(component.carrier === "UPS"){
			getReport(component,'matchedByCarrier',"United Parcel Service", "UPS - Mail Innovations", "");
			getReport(component,'getNoMerged_byCarrier',"United Parcel Service", "UPS - Mail Innovations", "UPS");
		}else if(component.carrier === "DHL"){
			getReport(component,'matchedByCarrier',"DHL Global Forwarding");
			getReport(component,'getNoMerged_byCarrier',"DHL Global Forwarding");
		}
		
		async function getReport(component,reportName,carrier1,carrier2,carrier3){	
			const response = await fetch('/api/'+reportName+'/?carrier1=' + carrier1 + '&carrier2=' + carrier2+ '&carrier3=' + carrier3);
			const data = await response.json();
			
			var parsedData = component.objectsTo2DArray(data[0]);			
			component.shadowRoot.querySelector('mrp-table').printData_excel(reportName + '.xlsx', parsedData);

		}
	}
	objectsTo2DArray(data){
		
		if(Lib.JS.isUndefined(data)){
			return [];
		}
		
		var headers = [];
			
		for (const property in data[0]) {
			headers.push(property);
		}
		
		var parsedData = [];
		parsedData.push(headers);
		
		for (var dataCounter = 0; dataCounter < data.length; dataCounter++) {
			var row = [];
			for (var headerCounter = 0; headerCounter < headers.length; headerCounter++) {
				row.push(data[dataCounter][headers[headerCounter]]);
			}
			parsedData.push(row);
		}
		
		return parsedData;
	}
	getDefaultTabelData(){
		var data = [];
		data.push(['Status','Carrier Name','PRO','MEZ Claim #', 'Date Filed', 'Date Mailed', 'Carrier Claim #', 'Inquiery Date', 'Claim Status']);
		data.push(['Closed','UPS',1,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',71,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',8,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',10,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',25,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',14,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',17,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',11,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']); 
		data.push(['Closed','UPS',1,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',71,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',8,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',10,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',25,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',14,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',17,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',11,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']); 
		data.push(['Closed','UPS',1,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',71,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',8,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',10,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',25,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',14,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',17,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',11,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']); 
		data.push(['Closed','UPS',1,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',71,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',8,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',10,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',25,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',14,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',17,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',11,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']); 
		data.push(['Closed','UPS',1,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',71,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',8,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',10,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',25,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',14,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',17,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',11,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']); 
		data.push(['Closed','UPS',1,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',71,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',8,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',3,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',10,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',2,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',25,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',14,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',17,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',11,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']);
		data.push(['Closed','UPS',4,'MI5492','10/03/2019','10/03/2019','74917057','10/30/2019','Claim Issued']); 
		
		return data;
	}
	getList(){
		var list = [];
		list.push("Full Report");
		list.push("Approved");
		list.push("Closed");
		list.push("Investigation Complete");
		list.push("No Match");
		list.push("Paid");
		list.push("Unapproved");
		list.push("Under Investigation");
		return list;
	}
	getCarrierList(){
		var list = [];
		list.push("All");
		list.push("UPS");
		list.push("DHL");
		return list;
	}
}

window.customElements.define('report-page', ReportPage);