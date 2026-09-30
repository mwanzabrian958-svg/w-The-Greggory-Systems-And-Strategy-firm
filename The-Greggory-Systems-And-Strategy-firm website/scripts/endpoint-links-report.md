# Endpoint link report
Backend endpoints: 269 (187 paths) | Website call paths: 115

## 1. Backend endpoints NOT called by the website (59)
- `DELETE /api/admin-complete/accounting/entries/*` — backend\routes\admin-complete.js:30
- `DELETE /api/admin-complete/blog-articles/*` — backend\routes\admin-complete.js:32
- `GET /api/admin-complete/crm-telemetry` — backend\routes\admin-complete.js:26
- `DELETE /api/admin-complete/invoices/*` — backend\routes\admin-complete.js:31
- `GET /api/admin-complete/ledger` — backend\routes\admin-complete.js:28
- `GET /api/admin-complete/mpesa/transactions` — backend\routes\admin-complete.js:29
- `GET /api/admin-complete/node-settings` — backend\routes\admin-complete.js:27
- `GET /api/admin-complete/search` — backend\routes\admin-complete.js:24
- `POST /api/admin-complete/team` — backend\routes\admin-complete.js:25
- `GET /api/admin-verification/health` — backend\routes\admin-verification.js:341
- `DELETE /api/admin/accounting/entries/*` — backend\routes\admin.js:1445
- `GET /api/admin/admin-users` — backend\routes\admin.js:142
- `GET /api/admin/assigned-tasks` — backend\routes\admin.js:1145
- `DELETE /api/admin/blog-articles/*` — backend\routes\admin.js:1455
- `POST /api/admin/create-admin` — backend\routes\admin.js:249
- `GET /api/admin/crm-telemetry` — backend\routes\admin.js:1152
- `PUT /api/admin/crm/contacts/*` — backend\routes\admin.js:1322
- `DELETE /api/admin/crm/contacts/*` — backend\routes\admin.js:1338
- `DELETE /api/admin/invoices/*` — backend\routes\admin.js:1450
- `GET /api/admin/live-users` — backend\routes\admin.js:46
- `GET /api/admin/mpesa/transactions` — backend\routes\admin.js:1423
- `POST /api/admin/relay-alert` — backend\routes\admin.js:1255
- `GET /api/admin/risk-alerts` — backend\routes\admin.js:1097
- `GET /api/admin/users/*/export-pdf` — backend\routes\admin.js:330
- `PUT /api/admin/users/*/status` — backend\routes\admin.js:489
- `POST /api/developer-verification/authenticate` — backend\routes\developer-verification.js:17
- `GET /api/developer-verification/health` — backend\routes\developer-verification.js:170
- `GET /api/developer-verification/profile/*` — backend\routes\developer-verification.js:111
- `PUT /api/developer-verification/profile/*` — backend\routes\developer-verification.js:134
- `POST /api/fcm/register-token` — backend\routes\fcm.js:113
- `POST /api/fcm/unregister-token` — backend\routes\fcm.js:168
- `POST /api/mpesa/callback` — backend\routes\mpesa.js:79
- `POST /api/sms/send` — backend\routes\sms.js:40
- `POST /api/sms/send-all` — backend\routes\sms.js:179
- `POST /api/sms/send-bulk` — backend\routes\sms.js:116
- `GET /api/sms/test` — backend\routes\sms.js:35
- `POST /api/whatsapp/send` — backend\routes\whatsapp.js:40
- `POST /api/whatsapp/send-bulk` — backend\routes\whatsapp.js:116
- `GET /api/whatsapp/test` — backend\routes\whatsapp.js:35
- `GET /api/admin/crm/contacts` — server.js:7690
- `POST /api/admin/crm/contacts` — server.js:7695
- `GET /api/admin/projects/all` — server.js:7589
- `GET /api/admin/reports` — server.js:7738
- `POST /api/admin/reports` — server.js:7743
- `POST /api/currencies/*/set-default` — server.js:5135
- `POST /api/currencies/convert` — server.js:5172
- `GET /api/db/*/table/*` — server.js:1135
- `GET /api/db/*/tables` — server.js:1120
- `GET /api/documents/client/*` — server.js:4716
- `POST /api/pdf/generate-completion` — server.js:4887
- `GET /api/projects/*/documents` — server.js:4759
- `GET /api/projects/*/photos` — server.js:2434
- `POST /api/projects/*/photos` — server.js:2484
- `DELETE /api/projects/*/photos/*` — server.js:2564
- `GET /api/quotes/*/activities` — server.js:4296
- `POST /api/quotes/*/convert-to-invoice` — server.js:4094
- `GET /api/quotes/*/items` — server.js:4215
- `POST /api/quotes/*/items` — server.js:4238
- `GET /api/videos/stream/*` — server.js:6285

## 2. Website calls with NO backend route (404 risk) (0)

## 3. Method gaps (path linked, some verbs never called) (0)
