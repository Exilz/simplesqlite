'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (config) {
    return new Sqlite(config);
};

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sqlite = exports.Sqlite = function () {
    function Sqlite(config) {
        _classCallCheck(this, Sqlite);

        var defaultConfig = {
            name: 'sqlite',
            location: 'default',
            androidDatabaseImplementation: 2,
            iosDatabaseLocation: 'default'
        };
        var finalConfig = _extends({}, defaultConfig, config);

        this._plugin = config.plugin || window.sqlitePlugin;
        this.db = this._plugin.openDatabase(finalConfig);
    }

    _createClass(Sqlite, [{
        key: 'checkDb',
        value: function checkDb() {
            if (!this.db) {
                throw new Error('No database initialized.');
            }
        }
    }, {
        key: 'initTable',
        value: function initTable(name, columns) {
            var checkExists = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            var parsedColumns = '';
            var addComa = false;
            var exists = checkExists ? 'IF NOT EXISTS' : '';

            for (var i in columns) {
                if (addComa) {
                    parsedColumns += ', ';
                }
                var columnOptions = columns[i];
                if (typeof columnOptions === 'string') {
                    parsedColumns += i + ' ' + columnOptions;
                } else if ((typeof columnOptions === 'undefined' ? 'undefined' : _typeof(columnOptions)) === 'object' && columnOptions.length) {
                    parsedColumns += i + ' ';
                    for (var j = 0; j < columnOptions.length; j++) {
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
            return 'CREATE TABLE ' + exists + ' ' + name + ' (' + parsedColumns + ');';
        }
    }, {
        key: 'select',
        value: function select(selection) {
            var _this = this;

            var where = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
            var table = arguments[2];

            return new Promise(function (resolve, reject) {
                _this.checkDb();
                var whereClause = where ? 'WHERE ' + where : '';
                var selectQuery = 'SELECT ' + selection + ' FROM ' + table + ' ' + whereClause;

                _this.db.executeSql(selectQuery, [], function (res) {
                    return resolve(res);
                }, function (err) {
                    return reject(err);
                });
            });
        }
    }, {
        key: 'insert',
        value: function insert(table, columns, values) {
            var replace = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            var sqlFunc = replace ? 'REPLACE' : 'INSERT';

            var specificColumns = '';
            var assignMarks = '';

            if (columns) {
                for (var i = 0; i < columns.length; i++) {
                    specificColumns += columns[i];
                    if (i + 1 !== columns.length) {
                        specificColumns += ', ';
                    }
                }
                specificColumns = '(' + specificColumns + ')';
            }

            for (var j = 0; j < values.length; j++) {
                assignMarks += j + 1 !== values.length ? '?,' : '?';
            }
            assignMarks = '(' + assignMarks + ')';

            return [sqlFunc + ' INTO ' + table + ' ' + specificColumns + ' VALUES ' + assignMarks, values];
        }
    }, {
        key: 'execute',
        value: function execute(queries, success, err) {
            this.checkDb();
            if ((typeof queries === 'undefined' ? 'undefined' : _typeof(queries)) !== 'object') {
                queries = [queries];
            }
            this.db.sqlBatch(queries, success, err);
        }
    }]);

    return Sqlite;
}();