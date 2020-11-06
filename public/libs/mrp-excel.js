if (Lib.JS.isUndefined(Lib.Excel)) {	
	Lib.Excel = {};

    var creation = function () {
		Lib.Excel.excelToWorkBook = function(file,caller, callback){
			var reader = new FileReader();
			var triggerString = "text";

			reader.onload = async function(e) {
				var data = e.target.result;
				var workbook = XLSX.read(data, {type: 'binary'});
				callback.call(caller, workbook);
			};

			reader.onerror = function(ex) {
				debugger;
				console.log(ex);
			};

			reader.readAsBinaryString(file);
		}
        Lib.Excel.excelToJSON = function(file,caller, callback, numHeaderRows = 1) {		
			var reader = new FileReader();
			var triggerString = "text";

			reader.onload = async function(e) {
				var data = e.target.result;
				var workbook = XLSX.read(data, {type: 'binary'});

				workbook.SheetNames.forEach(function(sheetName) {
					// Here is your object
					EventBroker.trigger("Lib.Excel.excel-file-parsed",{rawData:workbook.Sheets[sheetName], callback, numHeaderRows});
				});
			};

			reader.onerror = function(ex) {
				debugger;
				console.log(ex);
			};

			reader.readAsBinaryString(file);
		};
		Lib.Excel.parseExcelFileIntoArray = function(comoponent,triggerArg){
			var rawData = triggerArg.rawData;
			var numHeaderRows = triggerArg.numHeaderRows;
			var data = [];
			var row = 1;
			var col = 'A';
			var cell = '';
			var headerCounter = 0;
			
			//get the headers
			var headers = [];
			debugger;
			do {
				
				if(numHeaderRows === 1){
					if(Lib.JS.isDefined(rawData[col + row.toString()])){
						cell = rawData[col + row.toString()].v;
					}else{
						break;
					}
				}else{
					var cellFound = false;
					for (rowCounter = 0; rowCounter < numHeaderRows; rowCounter++) {
						if(Lib.JS.isDefined(rawData[col + (row+rowCounter).toString()])){							
							cell = rawData[col + (row+rowCounter).toString()].v;
							cellFound = true;
							break;
						}
					}
					if(!cellFound){
						break
					}
				}
				
				headers.push(cell)
				col = Lib.Excel.increasCol(col);
			}while (col !== 'BZ');

			if(numHeaderRows > 1){
				var realHeaderRows = [];
				for (rowCounter = 1; rowCounter <= numHeaderRows; rowCounter++) {
					var rowArr = [];
					col = 'A';
					//get all the cols
					
					for (colCounter = 0; colCounter < headers.length; colCounter++) {
						if(Lib.JS.isDefined(rawData[col + rowCounter.toString()])){							
							cell = rawData[col + rowCounter.toString()].v;
						}else{
							cell = "";
						}
						rowArr.push(cell)
						col = Lib.Excel.increasCol(col);
					}

					realHeaderRows.push(rowArr);
				}
			}
			
			//loop through rest of data
			row = row + numHeaderRows;
			col = 'A';
			
			do {
				var rowObject = {};

				for (headerCounter = 0; headerCounter < headers.length; headerCounter++) {
					
					if(Lib.JS.isDefined(rawData[col + row.toString()])){
						cell = rawData[col + row.toString()].v;
						
						if(cell === undefined){
							cell = rawData[col + row.toString()].l.display;
						}
						
						if(cell === undefined){
							cell = "";
							debugger;
						}
						
						//check for quotes
						if(cell.toString().indexOf('"')>-1){
							console.log(cell);
							cell = Lib.JS.replaceQuotes(cell);
						}
						
						
						rowObject[headers[headerCounter]] = cell;
					}else{
						rowObject[headers[headerCounter]] = '';
					}
					col = Lib.Excel.increasCol(col);
				}
				
				row++;
				data.push(rowObject);
				col = 'A';
				if(!Lib.JS.isDefined(rawData[col + row.toString()])){
					if(Lib.Excel.isRowBlank(rawData, headers, row)){
						if(Lib.Excel.isRowBlank(rawData, headers, row+1)){
							if(Lib.Excel.isRowBlank(rawData, headers, row+2)){
								if(Lib.Excel.isRowBlank(rawData, headers, row+3)){
									break;
								}
							}
						}else{
							row++;
						}
					}
				}			
			}while (row <= 50000);
			triggerArg.callback(data,realHeaderRows)
		}
		Lib.Excel.increasCol = function(col){
			var newCol = "";

			if(col =='Z'){
				newCol = "AA";
			}else if(col.length ==1){
				var ascii = col.charCodeAt(0);
				ascii = ascii + 1;		
				newCol = String.fromCharCode(ascii);
			}else{
				var ascii = col.charCodeAt(1);
				var firstLetter = col.substring(0, 1);
				ascii = ascii + 1;		
				newCol = firstLetter + String.fromCharCode(ascii);
			}
		
			return newCol;
		}
		Lib.Excel.isRowBlank = function(rawData, headers, row){
			var col = 'A'
			for (var headerCounter = 0; headerCounter < headers.length; headerCounter++) {
				if(Lib.JS.isDefined(rawData[col + row.toString()])){
					return false;
				}
				col = this.increasCol(col);
			}
			return true;
		}
		Lib.Excel.printFile = function(workbook,filename="report.xlsl"){
			XLSX.writeFile(workbook, "sheetjs.xlsx");
			
			
			/*
			
			var wb = XLSX.utils.book_new();
			wb.Props = {
					Title: "SheetJS Tutorial",
					Subject: "Test",
					Author: "Red Stapler",
					CreatedDate: new Date(2017,12,19)
			};
			wb.SheetNames.push("Test Sheet");
			
			//var ws_data = [['hello' , 'world']];
			var ws_data = data;
			
			var ws = XLSX.utils.aoa_to_sheet(ws_data);
			
			wb.Sheets["Test Sheet"] = ws;
			
			debugger;
			
			var wbout = XLSX.write(workbook, {bookType:'xlsx',  type: 'binary'});
			
			function s2ab(s) { 
				var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
				var view = new Uint8Array(buf);  //create uint8array as viewer
				for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
				return buf;    
			}
			
			var blob = new Blob([workbook],{type:"application/octet-stream"});
			if (navigator.msSaveBlob) { // IE 10+
				navigator.msSaveBlob(blob, filename);
			} else {
				var link = document.createElement("a");
				if (link.download !== undefined) { // feature detection
					// Browsers that support HTML5 download attribute
					var url = URL.createObjectURL(blob);
					link.setAttribute("href", url);
					link.setAttribute("download", filename);
					link.style.visibility = 'hidden';
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
			}*/
		}
		EventBroker.listen("Lib.Excel.excel-file-parsed", this, Lib.Excel.parseExcelFileIntoArray);
	};
    creation.call(Lib.Excel);
}