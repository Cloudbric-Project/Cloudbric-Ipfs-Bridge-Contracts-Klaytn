const fs = require('fs')
const path = require('path')
const mysql = require('mysql')
const APP_ROOT_PATH = path.join(__dirname, '..')

const dbSecret = fs.readFileSync(path.join(APP_ROOT_PATH, 'private/.db.json')).toString()
const vault = JSON.parse(dbSecret)

/**
 * @notice mysql npm library dosen't support Promise interface officially.
 * This project use mostly Async / Await, so we decided to use custom Promise interface for mysql npm library. 
 * What we did is just wrapping mysql code with Promise interface.
 */
class DBpromiseInterface {
    constructor(db) {
        this.connection = mysql.createConnection({
            host: vault.labs.host,
            port: vault.labs.port,
            user: vault.labs.user,
            password: vault.labs.password,
            database: db
        })
    }
    connectionTest() {
        return new Promise((resolve, reject) => {
            this.connection.connect((error) => {
                if (error)
                    return reject(error)
                resolve(true)
            })
        })
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (error, rows) => {
                if (error)
                    return reject(error)
                resolve(rows)
            })
        })
    }

    changeDatabase(db) {
        return new Promise((resolve, reject) => {
            this.connection.changeUser({
                database: databaseName
            }, (error) => {
                if (error)
                    return reject(error)
                resolve(true)
            })
        })
    }

    close() { 
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (error)
                    return reject(error)
                resolve(true)
            })
        })
    }
} 

module.exports = DBpromiseInterface