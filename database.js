const { Connection, Request } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "markus", // update me
      password: "Alpha2469!" // update me
    },
    type: "default"
  },
  server: "cpvias.database.windows.net",
  options: {
    database: "CPIVAS", //update me
    encrypt: true
  }
};

const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on("connect", err => {
  if (err) {
    console.error(err.message);
  } else {
    queryDatabase();
  }
});



function queryDatabase() {
  console.log("Reading rows from the Table...");

  // Read all rows from table
  const request = new Request(
    `Select * from [dbo].[Persons]`,
    (err, rowCount) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) returned`);
      }
    }
  );

  request.on("row", columns => {
    columns.forEach(column => {
      console.log("%s\t%s", column.metadata.colName, column.value);
    });
  });

  connection.execSql(request);
}

  var creation = function (Lib) {
        
        DB = {};
		DB.runSQL = function (sql) {
		  console.log("runSQL(" + sql + ")");

		  // Read all rows from table
		  const request = new Request(
			sql,
			(err, rowCount) => {
			  if (err) {
				console.error(err.message);
			  } else {
				console.log(`${rowCount} row(s) returned`);
			  }
			}
		  );

		  request.on("row", columns => {
			columns.forEach(column => {
			  console.log("%s\t%s", column.metadata.colName, column.value);
			});
		  });

		  connection.execSql(request);
        };
    };
    creation.call();

module.exports = connection;