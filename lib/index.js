export class Sqlite {
    constructor (config) {
        const defaultConfig = {
            name: 'sqlite',
            location: 'default',
            androidDatabaseImplementation: 2,
            iosDatabaseLocation: 'default'
        };
        const finalConfig = {
            ...defaultConfig,
            ...config
        };

        this._plugin = config.plugin || window.sqlitePlugin;
        this.db = this._plugin.openDatabase(finalConfig);
    }

    checkDb () {
        if (!this.db) {
            throw new Error('No database initialized.');
        }
    }

    initTable (name, columns, checkExists = true) {
        let parsedColumns = '';
        let addComa = false;
        const exists = checkExists ? 'IF NOT EXISTS' : '';

        for (let i in columns) {
            if (addComa) {
                parsedColumns += ', ';
            }
            const columnOptions = columns[i];
            if (typeof columnOptions === 'string') {
                parsedColumns += `${i} ${columnOptions}`;
            } else if (typeof columnOptions === 'object' && columnOptions.length) {
                parsedColumns += `${i} `;
                for (let j = 0; j < columnOptions.length; j++) {
                    parsedColumns += columnOptions[j];
                    if (j + 1 !== columnOptions.length) {
                        parsedColumns += ' ';
                    }
                }
            } else {
                console.error('Invalid column option type ' + i);
                return false;
            }
            addComa = true;
        }
        return `CREATE TABLE ${exists} ${name} (${parsedColumns});`;
    }

    select (selection, where = false, table) {
        return new Promise((resolve, reject) => {
            this.checkDb();
            const whereClause = where ? `WHERE ${where}` : '';
            const selectQuery = `SELECT ${selection} FROM ${table} ${whereClause}`;

            this.db.executeSql(
                selectQuery,
                [],
                (res) => resolve(res),
                (err) => reject(err)
            );
        });
    }

    insert (table, columns, values, replace = false) {
        const sqlFunc = replace ? 'REPLACE' : 'INSERT';

        let specificColumns = '';
        let assignMarks = '';

        if (columns) {
            for (let i = 0; i < columns.length; i++) {
                specificColumns += columns[i];
                if (i + 1 !== columns.length) {
                    specificColumns += ', ';
                }
            }
            specificColumns = `(${specificColumns})`;
        }

        for (let j = 0; j < values.length; j++) {
            assignMarks += j + 1 !== values.length ? '?,' : '?';
        }
        assignMarks = `(${assignMarks})`;

        return [`${sqlFunc} INTO ${table} ${specificColumns} VALUES ${assignMarks}`, values];
    }

    execute (queries, success, err) {
        this.checkDb();
        if (typeof queries !== 'object') {
            queries = [queries];
        }
        this.db.sqlBatch(queries, success, err);
    }
}

export default function (config) {
    return new Sqlite(config);
}
