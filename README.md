# SimpleSqlite

## Requirements

[SQLite storage plugin^1.4.6](https://www.npmjs.com/package/cordova-sqlite-storage)

## Usage example

```
function initSqlite () {
    sqlite = new Sqlite({name: 'aixmaville'});

    const initQuery = sqlite.initTable(
        'userPrefs',
        {
            id: ['VARCHAR', 'PRIMARY KEY'],
            data: 'TEXT'
        }
    );

    sqlite.execute(
        [initQuery],
        () => console.info('Table created'),
        (err) => console.log(err)
    );
}

function setUserPref (key, val) {
    val = String(val);
    const insertQuery = sqlite.insert('userPrefs', ['id', 'data'], [key, val], true);

    sqlite.execute(
        [insertQuery],
        () => console.info(`${val} inserted in ${key}`),
        (err) => console.log(err)
    );
}

function getUserPref (key) {
    return new Promise((resolve, reject) => {
        sqlite.select('*', `id = "${key}"`, 'userPrefs')
        .then((res) => {
            const rawData = res.rows.item(0).data;
            if (typeof rawData === 'string') {
                return resolve(JSON.parse(rawData));
            } else {
                return reject(`Stored data for ${key} is invalid.`);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}
```

## API

TBD.