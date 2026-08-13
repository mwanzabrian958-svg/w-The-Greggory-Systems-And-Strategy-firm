function formatActivityLog(row) {
  const description = row.action_description || '';
  const normalized = description.toLowerCase();

  let status = 'completed';
  if (normalized.includes('queued') || normalized.includes('pending')) {
    status = 'queued';
  } else if (normalized.includes('failed') || normalized.includes('error')) {
    status = 'failed';
  }

  return {
    id: row.id,
    type: row.action_type,
    description,
    actor: row.admin_display_name || 'System',
    target: row.affected_table,
    targetId: row.affected_record_id,
    createdAt: row.created_at,
    status
  };
}

module.exports = {
  formatActivityLog
};
