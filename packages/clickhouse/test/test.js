import { test } from 'uvu';
import * as assert from 'uvu/assert';
import runQuery from '../index.cjs';
import { TypeFidelity } from '@evidence-dev/db-commons';
import 'dotenv/config';

let results;

test('query runs', async () => {
	if (!process.env.CLICHOUSE_URL) {
		try {
			results = await runQuery(
				"select 100 as number_col, toDate(now()) as date_col, now() as timestamp_col, 'Evidence' as string_col, false as bool_col"
			);
			console.log(results);
			assert.instance(results.rows, Array);
			assert.instance(results.columnTypes, Array);
			assert.type(results.rows[0], 'object');
			assert.equal(results.rows[0].number_col, 100);

			let actualColumnTypes = results.columnTypes.map((columnType) => columnType.evidenceType);
			let actualColumnNames = results.columnTypes.map((columnType) => columnType.name);
			let actualTypePrecisions = results.columnTypes.map((columnType) => columnType.typeFidelity);

			let expectedColumnTypes = ['number', 'date', 'date', 'string', 'boolean'];
			let expectedColumnNames = [
				'number_col',
				'date_col',
				'timestamp_col',
				'string_col',
				'bool_col'
			];
			let expectedTypePrecision = Array(5).fill(TypeFidelity.INFERRED);

			assert.equal(
				true,
				expectedColumnTypes.length === actualColumnTypes.length &&
					expectedColumnTypes.every((value, index) => value === actualColumnTypes[index])
			);
			assert.equal(
				true,
				expectedColumnNames.length === actualColumnNames.length &&
					expectedColumnNames.every((value, index) => value === actualColumnNames[index])
			);
			assert.equal(
				true,
				expectedTypePrecision.length === actualTypePrecisions.length &&
					expectedTypePrecision.every((value, index) => value === actualTypePrecisions[index])
			);
		} catch (e) {
			throw Error(e);
		}
	} else {
		console.log('ClickHouse tests not currently configured to run during the automated builds');
	}
});

test.run();
