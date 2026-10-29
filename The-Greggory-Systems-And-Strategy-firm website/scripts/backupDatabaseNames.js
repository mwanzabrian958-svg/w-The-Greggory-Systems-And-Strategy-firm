"use strict";

const DEFAULT_DATABASE = "the_greggory_systems_and_strategy_firm_db_main";

function resolveBackupDatabaseNames(env = process.env) {
  const cloudDatabase = env.DB_NAME || DEFAULT_DATABASE;
  return {
    cloudDatabase,
    localDatabase: env.DB_NAME_2 || cloudDatabase,
  };
}

module.exports = { resolveBackupDatabaseNames };
