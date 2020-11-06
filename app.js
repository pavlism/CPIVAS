'use strict';

// [START gae_node_request_example]
require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database');

app.use(express.static(__dirname + '/public')); //__dir and not _dir

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json({limit:'1mb'}));

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;

var fs = require('fs');


var runSQL = function(sql, response){
	console.log(sql);
	logInfo(sql);
	
	DB.runSQL(sql);
}

var logInfo = function(info){
	return false;
	var date = new Date();
	fs.appendFile('sqlLog.txt', date.toString() + " - " + info + "\n", function (err) {
	  if (err) throw err;
	  console.log('Saved!');
	});
}

app.get('/api/login',(request, response)=>{
	console.log('login');
	console.log(request.query.username);
	console.log(request.query.password);
	var sql = '';
	
	if (process.env.PROD ==='0' || (request.query.username === 'Small Parcel Team' && request.query.password === 'Revenue')) {
        response.json(true);
    }else{
		response.json(false);
	}
});

app.get('/api',(request, response)=>{
	
	var sql = '';
	if (typeof request.query.company === 'undefined') {
        sql = "call get_All()";
    }else{
		sql = "call get_All_From_Carrier('"+request.query.company+"');";
	}

	runSQL(sql, response);
});
app.get('/api/test',(request, response)=>{
	
	var sql = "Select * from [dbo].[Persons]";

	runSQL(sql, response);
});
app.get('/api/matchedByCarrier',(request, response)=>{
	
	var sql = '';

	if (typeof request.query.carrier1 === 'undefined' || request.query.carrier1==='undefined') {
        sql = "call get_merged()";
    }else{
		sql = "call getMerged_byCarrier(";
	
		if (typeof request.query.carrier1 === 'undefined') {
			sql = sql + "'',";
		}else{
			sql = sql + "'"+request.query.carrier1+"',";
		}
		
		if (typeof request.query.carrier2 === 'undefined') {
			sql = sql + "'',";
		}else{
			sql = sql + "'"+request.query.carrier2+"',";
		}
		
		if (typeof request.query.carrier3 === 'undefined') {
			sql = sql + "'')";
		}else{
			sql = sql + "'"+request.query.carrier3+"')";
		}
	}


	
	
	
	runSQL(sql, response);
});
app.get('/api/getNoMerged_byCarrier',(request, response)=>{
	
	var sql = '';

	if (typeof request.query.carrier1 === 'undefined' || request.query.carrier1==='undefined') {
        sql = "call get_notMerged()";
    }else{
		sql = "call getNoMerged_byCarrier(";
	
		if (typeof request.query.carrier1 === 'undefined') {
			sql = sql + "'',";
		}else{
			sql = sql + "'"+request.query.carrier1+"',";
		}
		
		if (typeof request.query.carrier2 === 'undefined') {
			sql = sql + "'',";
		}else{
			sql = sql + "'"+request.query.carrier2+"',";
		}
		
		if (typeof request.query.carrier3 === 'undefined') {
			sql = sql + "'')";
		}else{
			sql = sql + "'"+request.query.carrier3+"')";
		}
	}
	
	runSQL(sql, response);
});

app.get('/api/clean',(request, response)=>{
	
	var sql = '';
	sql = "call clean()";
	runSQL(sql, response);
});




app.post('/api/ups',(request, response)=>{	
	var sql = 'call add_ups("'+request.body["ClaimNum"]+'","'+request.body["PRO Number"]+'","'+request.body["CarrierComment"];
	sql = sql + '")'
	logInfo(sql);

	runSQL(sql, response);
});
app.post('/api/usps',(request, response)=>{	
	var sql = 'call add_USPS("'+request.body["ClaimNum"]+'","'+request.body["CarrierComment"]+'","'+request.body["review"]+'","'+request.body["submitted"]+'","'+request.body["ProNumber"]+'","'+request.body["reasonForClaim"];
	sql = sql + '")'
	logInfo(sql);

	runSQL(sql, response);
});
app.post('/api/fx',(request, response)=>{

	var sql = 'call add_FX("'+request.body["ProNumber"]+'","'+request.body["CarrierComment"]+'","'+request.body["deliveryDate"]+'","'+request.body["shipDate"]+'","'+request.body["shipperCity"]+'","'+request.body["recipiantCity"]+'","'+request.body["terminal"];
	sql = sql + '")'
	logInfo(sql);

	runSQL(sql, response);
});
app.post('/api/dhl',(request, response)=>{		
	var sql = 'call add_dhl("'+request.body["PRO Number"]+'","'+request.body["DHL Comments"]+'","'+request.body["AccountNumber"]+'","'+request.body["DHL_BolNumber"];
	sql = sql + '")'
	logInfo(sql);
	runSQL(sql, response);
});
app.post('/api/record',(request, response)=>{	

	//console.log(request.body);
	
	var sql = 'call add_myEZY("'+request.body["Status Code"]+'","'+request.body["Carrier Name"]+'","'+request.body["Freight Bill (PRO) Document"]+'","'+request.body["Consignee Name"];
	sql = sql + '","'+request.body["Consignee Address Line3"]+'","'+request.body["Claim Number"]+'","'+request.body["Claim Amount"]+'","'+request.body["Date Filed"];
	sql = sql + '","'+request.body["Date Mailed"]+'","'+request.body["Company Name"]+'","'+request.body["Shipper Name"]+'","'+request.body["Consignee Name1"];
	sql = sql + '","'+request.body["Reason Code"]+'","'+request.body["Date Requested"]+'","'+request.body["Shipment Date"]+'","'+request.body["Date Paid (Last)"];
	sql = sql + '","'+request.body["Date Closed"]+'","'+request.body["Date Filed1"]+'","'+request.body["Date Mailed1"]+'","'+request.body["Date Requested1"];
	sql = sql + '")'
	logInfo(sql);

	runSQL(sql, response);
});


/*
app.get('/api/noMatch',(request, response)=>{
	
	var sql = '';
	if (typeof request.query.company === 'undefined') {
        sql = "call get_noMatch_All()";
    }else{
		sql = "call get_noMatch_Carrier('"+request.query.company+"');";
	}
	runSQL(sql, response);
});
app.get('/api/approved',(request, response)=>{
	
	var sql = '';
	if (typeof request.query.company === 'undefined') {
        sql = "call get_Approved_All()";
    }else{
		sql = "call get_Approved_Carrier('"+request.query.company+"');";
	}
	runSQL(sql, response);
});
app.get('/api/closed',(request, response)=>{
	
	var sql = '';
	if (typeof request.query.company === 'undefined') {
        sql = "call get_Closed_All()";
    }else{
		sql = "call get_Closed_Carrier('"+request.query.company+"');";
	}
	runSQL(sql, response);
});
app.get('/api/investigationComplete',(request, response)=>{
	
	var sql = '';
	if (typeof request.query.company === 'undefined') {
        sql = "call get_investigationComplete_All()";
    }else{
		sql = "call get_investigationComplete_Carrier('"+request.query.company+"');";
	}
	runSQL(sql, response);
});
app.get('/api/paid',(request, response)=>{
	
	var sql = '';
	if (typeof request.query.company === 'undefined') {
        sql = "call get_paid_All()";
    }else{
		sql = "call get_paid_Carrier('"+request.query.company+"');";
	}
	runSQL(sql, response);
});
app.get('/api/unapproved',(request, response)=>{
	
	var sql = '';
	if (typeof request.query.company === 'undefined') {
        sql = "call get_unapproved_All()";
    }else{
		sql = "call get_unapproved_Carrier('"+request.query.company+"');";
	}
	runSQL(sql, response);
});
app.get('/api/underInvestigation',(request, response)=>{
	
	var sql = '';
	if (typeof request.query.company === 'undefined') {
        sql = "call get_underInvestigation_All()";
    }else{
		sql = "call get_underInvestigation_Carrier('"+request.query.company+"');";
	}
	runSQL(sql, response);
});

*/



