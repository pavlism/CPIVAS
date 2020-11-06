const MEXC_template = document.createElement('template');
MEXC_template.innerHTML = `
	<div style="padding-left: 757px;">
	<mrp-file-button primary id="Upload_MEXC">Upload MEXC:</mrp-file-button>
	</div>
`

class MEXCPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MEXC_template.content.cloneNode(true));
		this.workbook = undefined;
		
		EventBroker.listen("Upload_MEXC_mrp-file-button_fileSelected", this, this.uploadMEXC);
		EventBroker.listen("Upload_MEXC_fileReady", this, this.finishMEXC);
		EventBroker.listen("Upload_MEXC_fileReady", this, this.finishMEXC);
	}
	uploadMEXC(comoponent,event){	
		comoponent.triggerString = "Upload_MEXC_fileReady";
		//Lib.Excel.excelToJSON(event.files[0], comoponent, comoponent.finishMEXC, 2);
		Lib.Excel.excelToWorkBook(event.files[0], comoponent, comoponent.fixWorkBook);
	}
	fixWorkBook(workbook){
		debugger;
		var sheetName = workbook.SheetNames[0];
		
		var numMissed = 0;
		
		for (var rowCounter = 3; rowCounter < 10000; rowCounter++) {
			var cellCoor = "N" + rowCounter.toString();
			
			if(workbook.Sheets[sheetName][cellCoor] !== undefined){
				var address = workbook.Sheets[sheetName][cellCoor].v;
				debugger;
				var delPos = address.lastIndexOf(",");
			
				if(delPos >-1){
					var city = address.substring(0,delPos);
					address = address.substring(delPos+2);
					
					delPos = address.indexOf(" ");
					if(delPos >-1){
						var state = address.substring(0,delPos);
						var zip = address.substring(delPos+1);
						debugger;
						workbook.Sheets[sheetName][cellCoor].v = city;
						workbook.Sheets[sheetName]["O" + rowCounter.toString()] = {};
						workbook.Sheets[sheetName]["R" + rowCounter.toString()] = {};
						
						Object.assign(workbook.Sheets[sheetName]["O" + rowCounter.toString()], workbook.Sheets[sheetName][cellCoor]);
						Object.assign(workbook.Sheets[sheetName]["R" + rowCounter.toString()], workbook.Sheets[sheetName][cellCoor]);
						
						workbook.Sheets[sheetName]["O" + rowCounter.toString()].v = state;
						workbook.Sheets[sheetName]["R" + rowCounter.toString()].v = zip;
					}else{
						console.error("address can't be parsed (missing Space after ,): " + address);
					}
				}else{
					console.error("address can't be parsed (missing ,): " + address);
				}
			}else{
				numMissed++;
				if(numMissed>10){
					break;
				}
			}
		}
		
		XLSX.writeFile(workbook, "MEXC split.xlsx");
		debugger;
	}
	finishMEXC(data, realHeaderRows){	
		for (var rowCounter = 1; rowCounter < data.length; rowCounter++) {
			var address = data[rowCounter]['Consignee City'];
			var delPos = address.indexOf(",");
			
			if(delPos >-1){
				var city = address.substring(0,delPos);
				address = address.substring(delPos+2);
				
				delPos = address.indexOf(" ");
				if(delPos >-1){
					var state = address.substring(0,delPos);
					var zip = address.substring(delPos+1);
					
					data[rowCounter]['Consignee City'] = city;
					data[rowCounter]['Consignee State'] = state;
					data[rowCounter]['Consignee Zip'] = zip;
				}else{
					console.error("address can't be parsed (missing Space after ,): " + address);
				}
			}else{
				console.error("address can't be parsed (missing ,): " + address);
			}
		}
		alert("Finished You can download the file now");
		EventBroker.trigger("data-processing-finsihed", {data,realHeaderRows});
	}
	
}

window.customElements.define('mexc-page', MEXCPage);