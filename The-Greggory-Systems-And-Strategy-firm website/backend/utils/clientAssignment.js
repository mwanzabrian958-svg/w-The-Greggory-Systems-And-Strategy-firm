async function getActiveClientAccount(db, userId) {
  const clientId = Number(userId);
  if (!Number.isSafeInteger(clientId) || clientId <= 0) return null;

  const [rows] = await db.query(
    `SELECT id, email, display_name, first_name, last_name, phone_number, id_number
     FROM users
     WHERE id = ? AND is_active = 1 AND deleted_at IS NULL
     LIMIT 1`,
    [clientId]
  );

  return rows[0] || null;
}

function getClientDisplayName(client) {
  return client.display_name || [client.first_name, client.last_name].filter(Boolean).join(" ") || client.email;
}

module.exports = { getActiveClientAccount, getClientDisplayName };
