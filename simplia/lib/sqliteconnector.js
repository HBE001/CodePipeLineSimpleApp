/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * � 2010-2015 Lotus Interworks Inc. (�LIW�) Proprietary and Trade Secret.
 * Do not copy distribute or otherwise use without explicit written permission from B. Gopinath President.
 * Do not communicate or share the information contained herein with any one else except employees of LIW  on a need to know basis.
 * LIW values its intellectual properties and excepts all those who work with LIW to protect all work, including ideas, designs, processes,
 * software and documents shared or created in any engagement with LIW as proprietary to LIW.
 * This document may make references to open sourced software being considered or used by LIW.
 * Extensions, including modifications to such open source software are deemed proprietary and trade secret to LIW  until
 * and unless LIW formally and with explicit written consent contributes specific modified open source code back to open source.
 * In any event, including cases where modified open sourced components are placed in open source, the selection, interconnection,
 * configuration, processes, designs, implementation of all technology, including opens source software,
 * that is being developed or is part of LIW deployed systems are proprietary and trade secret to LIW and
 * such information shall not be shared with any one else except employees of LIW on a need to know basis.
 *
 */
var sqlite3 = require('sqlite3').verbose();
var doc = require('dynamodb-doc');
var AWS = require('aws-sdk');
var async = require('async');


function SqliteConnector(config) {
    this.db = new sqlite3.Database(':memory:');

    this.config = config;
    AWS.config.update(config.get('aws.awsRegion'));
    this.awsClient = new AWS.DynamoDB();
    this.docClient = new doc.DynamoDB(this.awsClient);
}

/**
 *
 * @param tableName
 * @param fields - object - The object would consist of field names as attributes with the SQL type as the value, e.g. ID:int(11)
 */
SqliteConnector.prototype.createTable = function (tableName, fields, callback) {
    console.log("Creatre Table Start");

    var createStatement = "CREATE TABLE if not exists " + tableName + " (";
    for (var i in fields) {
        createStatement += i + " " + fields[i] + ",";
    }
    createStatement = createStatement.slice(0, -1);
    createStatement += ")";

    console.log('create-statement:', createStatement);
    this.db.run(createStatement, function (error) {
        if (error) {
            console.log('create-table-error:', error);
        }
        callback(error);
    });
};

/**
 *
 * @param tableName
 * @param conditionData
 * @param callback
 */
SqliteConnector.prototype.getDataFromDynamicDB = function (tableName, conditionData, callback) {
    console.log('Table Name:', tableName);
    console.log('conditionData:', conditionData);
    console.log('callback:', callback);

    var params = {
        TableName: tableName,
        //Limit: 20,
        IndexName: "MediaType-StartingTime-index", /*we have to provide the global secondary index name and you
         can get it from table description*/
        ConsistentRead: false, /*Should be false as long as we are quering global secondary Index*/

        //KeyConditionExpression: this.createKeyConditionExpression(conditionData),
        KeyConditionExpression: '#mediaType = :mediaValue AND #startingTime BETWEEN :lowrangekey AND :highrangekey',
        ExpressionAttributeNames: {
            '#mediaType': conditionData.mediaType,
            '#startingTime': conditionData.startingTime
        },
        ExpressionAttributeValues: {
            ':mediaValue': conditionData.mediaValue,
            ':lowrangekey': conditionData.lowRangeKey,
            ':highrangekey': conditionData.highRangeKey
        },
        Select: conditionData.attributes,
        ScanIndexForward: true,
    };

    this.docClient.query(params, function (err, data) {
        if (err) {
            console.log('ddb-query-error:', err);
        }
        console.log('ddb-query-data:', data);
        callback(data);
    });
};

SqliteConnector.prototype.scanDataFromDynamicDB = function (tableName, callback) {
    console.log('Table Name:', tableName);
    console.log('callback:', callback);

    var params = {
        TableName: tableName,
        Limit: 20,
    };

    this.docClient.scan(params, function (err, data) {
        if (err) {
            console.log('ddb-query-error:', err);
        }
        console.log('ddb-query-data:', data);
        callback(data);
    });
};


/**
 *
 * @param data
 * @param tableName
 * @param fields
 * @param callback
 */
SqliteConnector.prototype.addDynamicDBDataToSqlite = function (data, tableName, fields, callback) {
    var statement = "INSERT OR IGNORE INTO " + tableName + " VALUES (";
    for (var i in fields) {
        statement += "?,";
    }
    statement = statement.slice(0, -1);
    statement += ")";


    console.log("Statment = " + dbStmt);
    var dbStmt = this.db.prepare(statement);

    console.log("Insert Data to SQLite from DynamoDB");
    console.log("AddDynamicDBDataToSqlite");
    console.log("dbstmt = " + dbStmt);
    console.log("Data = " + data);


    async.each(data.Items, function (item, cb) {
        var values = [];
        for (var i in fields) {
            if (typeof item[i] !== "undefined") {
                var value = (typeof item[i] === "object") ? (JSON.stringify(item[i])) : (item[i]);
                //values += i + " '" + data.Items[index][i] + "',";
                values.push(value);
            }
            else {
                values.push("");
            }
        }
        console.log('values:', values);
        dbStmt.run(values, function (error) {
            if (error) {
                console.log('dbstmt-run-error:', error);
            }
            cb(error);
        });
    }, function (error) {
        if (error) {
            console.log('async-each-error:', error);
        }
        dbStmt.finalize(function () {
            callback(error);
        });
    });
};

SqliteConnector.prototype.deleteAllDatafromSqlite = function ( tableName, callback) {

    console.log("Creatre Table Start");
    var statement = "DELETE from "+ tableName;
    console.log('statement:', statement);
    this.db.run(statement, function (error) {
        if (error) {
            console.log('create-table-error:', error);
        }
        callback(error);
    });
};


/**
 *
 * @param conditionData
 * @returns {*}
 */
SqliteConnector.prototype.createKeyConditionExpression = function (conditionData) {
    var that = this;

    var expression = {
        'range': function () {
            var str = '#mediaType = :mediaValue AND #startingTime BETWEEN :lowrangekey AND :highrangekey';
            console.log('expr:', str);
            return str;
        }
    };
    return expression[conditionData.type]();
};

/**
 *
 * @param tableName
 * @param rowData
 * @param idCols
 * @param callback
 */
SqliteConnector.prototype.updateDynamoDBItem = function (tableName, tableId, rowData, idCols, callback) {
    var updateData = this.createUpdateExpressionWithValues(tableId, rowData);

    var params = {
        TableName: tableName,
        Key: idCols,
        UpdateExpression: updateData.expression,
        ExpressionAttributeValues: updateData.values,
        ExpressionAttributeNames: updateData.names
    };
    this.docClient.updateItem(params, function (error, data) {
        if (error) {
            console.log('update-item-error:', error);
        }
        callback(error);
    });
};

/**
 *
 * @param rowData
 * @returns {{expression: string, values: {}}}
 */
SqliteConnector.prototype.createUpdateExpressionWithValues = function (tableId, rowData) {
    var expression = 'SET ';
    var values = {};
    var names = {};

    for (var colName in rowData) {
        expression += '#' + colName + '1 = :' + colName + ',';
        values[':' + colName] = (this.config.get('sqlite.tables.' + tableId + '.dynamodbTypes.' + colName) == 'Map') ? JSON.parse(rowData[colName]) : rowData[colName];
        names['#' + colName + 1] = colName;
    }
    expression = expression.slice(0, -1);
    return {
        expression: expression,
        values: values,
        names: names
    };
};

module.exports = SqliteConnector;