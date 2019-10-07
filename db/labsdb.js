const mysql = require('mysql');
const fs = require('fs');
const path = require('path');


const appDir = path.dirname('index.js');
const dbSecret = fs.readFileSync(`${appDir}/private/.db.json`).toString();
const vault = JSON.parse(dbSecret);

class LabsDB {
    constructor(db) {
        this.connection = mysql.createConnection({
            host: vault.labs.host,
            port: vault.labs.port,
            user: vault.labs.user,
            password: vault.labs.password,
            database: db
        });
    }
    connectionTest() {
        return new Promise((resolve, reject) => {
            this.connection.connect((error) => {
                if (error)
                    return reject(error);
                resolve(true);
            });
        });
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (error, rows) => {
                if (error)
                    return reject(error);
                resolve(rows);
            });
        });
    }

    changeDatabase(db) {
        return new Promise((resolve, reject) => {
            this.connection.changeUser({
                database: databaseName
            }, (error) => {
                if (error)
                    return reject(error);
                resolve(true);
            });
        });
    }

    close() { 
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (error)
                    return reject(error);
                resolve(true);
            });
        });
    }
}; 

module.exports = LabsDB;