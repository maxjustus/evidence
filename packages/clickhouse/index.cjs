const path = require('path');
const { processQueryResults } = require('@evidence-dev/db-commons');
// TODO: use official clickhouse client
const { ClickHouse } = require('clickhouse');
const { getEnv } = require('@evidence-dev/db-commons');

const envMap = {
    url: [
        { key: 'EVIDENCE_CLICKHOUSE_URL', deprecated: false },
        { key: 'CLICKHOUSE_URL', deprecated: false },
        { key: 'url', deprecated: true },
        { key: 'URL', deprecated: true }
    ],
    port: [
        { key: 'EVIDENCE_CLICKHOUSE_PORT', deprecated: false },
        { key: 'CLICKHOUSE_PORT', deprecated: false },
        { key: 'port', deprecated: true },
        { key: 'PORT', deprecated: true }
    ],
    user: [
        { key: 'EVIDENCE_CLICKHOUSE_USER', deprecated: false },
        { key: 'CLICKHOUSE_USER', deprecated: false },
        { key: 'user', deprecated: true },
        { key: 'USER', deprecated: true }
    ],
    password: [
        { key: 'EVIDENCE_CLICKHOUSE_PASSWORD', deprecated: false },
        { key: 'CLICKHOUSE_PASSWORD', deprecated: false },
        { key: 'password', deprecated: true },
        { key: 'PASSWORD', deprecated: true }
    ],
    database: [
        { key: 'EVIDENCE_CLICKHOUSE_DATABASE', deprecated: false },
        { key: 'CLICKHOUSE_DATABASE', deprecated: false },
        { key: 'database', deprecated: true },
        { key: 'DATABASE', deprecated: true }
    ]
};

const runQuery = async (queryString, database) => {
	try {
                const opts = {
                    url: database?.url || getEnv(envMap, 'url'),
                    port: database?.port || getEnv(envMap, 'port'),
                    basicAuth: {
                        username: database?.user || getEnv(envMap, 'user'),
                        password: database?.password || getEnv(envMap, 'password')
                    },
                    format: 'json',
                    config: {
                        database: database?.database || getEnv(envMap, 'database')
                    }
                };

		const clickhouse = new ClickHouse(opts);
		const rows = await clickhouse.query(queryString).toPromise();
		return processQueryResults(rows);
	} catch (err) {
		if (err.message) {
			throw err.message;
		} else {
			throw err;
		}
	}
};

module.exports = runQuery;
