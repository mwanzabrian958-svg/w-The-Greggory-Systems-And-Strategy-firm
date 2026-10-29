"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveBackupDatabaseNames } = require("../../scripts/backupDatabaseNames");

test("backup uses the configured XAMPP database separately from the cloud database", () => {
  assert.deepEqual(
    resolveBackupDatabaseNames({
      DB_NAME: "defaultdb",
      DB_NAME_2: "the_greggory_systems_and_strategy_firm_db_main",
    }),
    {
      cloudDatabase: "defaultdb",
      localDatabase: "the_greggory_systems_and_strategy_firm_db_main",
    },
  );
});

test("backup falls back to one configured database name when no XAMPP name is set", () => {
  assert.deepEqual(
    resolveBackupDatabaseNames({ DB_NAME: "defaultdb" }),
    { cloudDatabase: "defaultdb", localDatabase: "defaultdb" },
  );
});
