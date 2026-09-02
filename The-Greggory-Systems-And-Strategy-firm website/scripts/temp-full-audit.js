const http=require('http');
function api(p,m,b,t){return new Promise((res,rej)=>{const d=b?JSON.stringify(b):'',h={'Content-Type':'application/json'};if(d)h['Content-Length']=Buffer.byteLength(d);if(t)h['Authorization']='Bearer '+t;const r=http.request({hostname:'127.0.0.1',port:3000,path:p,method:m,headers:h},x=>{let s='';x.on('data',c=>s+=c);x.on('end',()=>res({status:x.statusCode,body:s}))});r.on('error',rej);if(d)r.write(d);r.end()})}
function sj(b){try{return JSON.parse(b)}catch{return null}}
const R=[];
async function check(n,p,m,b,t){try{const r=await api('/api'+p,m,b,t),j=sj(r.body),ok=r.status<400&&(!j||j.success!==false);console.log(`  ${ok?'OK':'FAIL'} ${m} ${p} (${r.status})`);R.push({n:`${m} ${p}`,ok});return{r,j}}catch(e){console.log(`  ERR ${m} ${p}`);R.push({n:`${m} ${p}`,ok:false});return{r:{status:0,body:''},j:null}}}
(async()=>{
const email='audit'+Date.now()+'@test.com';
await check('Reg','/admin-verification/register','POST',{email,password:'AuditPass123',first_name:'Audit',last_name:'User',role:'admin'});
const l=await api('/api/admin-verification/authenticate-enhanced','POST',{email,password:'AuditPass123'});
const t=sj(l.body)?.token;if(!t){console.log('NO TOKEN');process.exit(1)}
const uid=sj(l.body)?.user?.id;console.log('Token OK, uid:',uid,'\n');
console.log('--- AUTH ---');
await check('Session','/admin/session','GET',null,t);
await check('ProfileRead','/admin-verification/profile/'+uid,'GET',null,t);
await check('ProfileUpd','/admin-verification/profile/'+uid,'PUT',{department:'QA'},t);
console.log('\n--- USERS ---');
await check('UsersList','/users','GET',null,t);
await check('UserRead','/admin/users/'+uid+'?role_type=admin','GET',null,t);
await check('UserDel','/admin/users/'+uid+'?role_type=admin','DELETE',null,t);
await check('WhatsAppReset','/admin/users/11/whatsapp-password-reset','POST',null,t);
console.log('\n--- PROJECTS ---');
await check('ProjList','/user-projects','GET',null,t);
const p=await check('ProjCreate','/user-projects','POST',{user_id:11,project_name:'Audit'},t);
const pid=p.j?.id;
if(pid){await check('ProjRead','/user-projects/'+pid,'GET',null,t);await check('ProjUpd','/user-projects/'+pid,'PUT',{project_name:'Upd'},t);await check('ProjDel','/user-projects/'+pid,'DELETE',null,t)}
console.log('\n--- TEAM & TASKS ---');
await check('TeamFetch','/admin/project-team/1','GET',null,t);
await check('TeamAdd','/admin/project-team/1','POST',{user_id:11,role:'dev'},t);
await check('TasksFetch','/projects/1/tasks','GET',null,t);
await check('TaskCreate','/projects/1/tasks','POST',{task_name:'Test'},t);
console.log('\n--- DASHBOARD ---');
await check('Dashboard','/admin/dashboard','GET',null,t);
await check('Budget','/admin/budget-overview','GET',null,t);
await check('Pending','/admin/pending-approvals','GET',null,t);
await check('TeamList','/admin/team','GET',null,t);
await check('TeamCreate','/admin/team','POST',{name:'M',email:'m'+Date.now()+'@t.com'},t);
console.log('\n--- CONTENT ---');
await check('Content','/website-content','GET',null,t);
await check('ContentUpd','/website-content/site_name','PUT',{value:'T'},t);
await check('BlogCreate','/blog-articles','POST',{title:'B',content:'C'},t);
console.log('\n--- PERSONNEL ---');
await check('Personnel','/company-personnel','GET',null,t);
await check('PersonCreate','/company-personnel','POST',{name:'P',email:'p'+Date.now()+'@t.com'},t);
console.log('\n--- BILLING ---');
await check('InvCreate','/invoices','POST',{title:'I',total_amount_kes:100},t);
await check('ManualEntry','/accounting-entries','POST',{description:'E',amount:10,entry_type:'expense'},t);
console.log('\n--- CRM ---');
await check('CRM','/admin/crm/contacts','GET',null,t);
await check('CRMCreate','/admin/crm/contacts','POST',{name:'C',email:'c'+Date.now()+'@t.com'},t);
console.log('\n--- APPS & PROPS ---');
await check('Apps','/applications','GET',null,t);
await check('Props','/properties','GET',null,t);
await check('PropCreate','/properties','POST',{title:'P',price:500},t);
console.log('\n--- ACT & SEARCH ---');
await check('Activity','/admin/activity-logs','GET',null,t);
await check('Search','/admin/search?q=test','GET',null,t);
console.log('\n--- SETTINGS & REPORTS ---');
await check('Settings','/admin/settings','GET',null,t);
await check('SettingsUpd','/admin/settings','PUT',{site_name:'U'},t);
await check('Reports','/admin/projects/all','GET',null,t);
console.log('\n--- SUPPORT & SECURITY ---');
await check('Support','/contact-forms','GET',null,t);
await check('Audit','/audit-logs','GET',null,t);
await check('DataLogs','/data-access-logs','GET',null,t);
console.log('\n=== SUMMARY ===');
const pass=R.filter(r=>r.ok).length,fail=R.filter(r=>!r.ok);
console.log(`Passed: ${pass}/${R.length} (${Math.round(pass/R.length*100)}%)`);
if(fail.length){console.log('\nFAILED:');fail.forEach(f=>console.log(`  - ${f.n}`))}
})().catch(e=>{console.error('ERR:',e.message);process.exit(1)});
