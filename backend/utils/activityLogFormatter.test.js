const test = require('node:test');
const assert = require('node:assert/strict');
const { formatActivityLog } = require('./activityLogFormatter');

test('formats relay activity rows into a readable admin activity feed', () => {
  const row = {
    id: 42,
    action_type: 'SMS_SENT',
    action_description: 'SMS queued for delivery to company',
    affected_table: 'users',
    affected_record_id: 7,
    created_at: '2026-08-02T10:00:00.000Z',
    admin_display_name: 'Amaka K.'
  };

  const formatted = formatActivityLog(row);

  assert.equal(formatted.id, 42);
  assert.equal(formatted.type, 'SMS_SENT');
  assert.equal(formatted.description, 'SMS queued for delivery to company');
  assert.equal(formatted.actor, 'Amaka K.');
  assert.equal(formatted.status, 'queued');
});
