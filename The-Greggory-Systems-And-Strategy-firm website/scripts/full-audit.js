const http=require("http");const BASE="http://localhost:3000";let P=0,F=0;const R=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function api(M,P2,B,T){return new Promise(r=>{const u=new URL(BASE+P2);const d=B?JSON.stringify(B):null;const h={};if(d){h["Content-Type"]="application/json";h["Content-Length"]=Buffer.byteLength(d);}if(T)h["Authorization"]="Bearer "+T;const q=http.request({hostname:u.hostname,port:3000,path:u.pathname+u.search,method:M,headers:h},s=>{let b="";s.on("data",c=>b+=c);s.on("end",()=>{try{r({s:s.statusCode,b:JSON.parse(b)})}catch{r({s:s.statusCode})}})});q.on("error",e=>r({s:0}));if(d)q.write(d);q.end();});}
async function t(L,M,P2,B,T,E){await sleep(1000);const r=await api(M,P2,B,T);if(r.s===E){P++;R.push({L,s:r.s});}else{F++;R.push({L,s:r.s});console.log("FAIL: "+L+" got "+r.s+" expected "+E);}}
(async()=>{const e="audit"+Date.now()+"@test.com";const s=Date.now();
await t("Admin register","POST","/api/admin-verification/register",{email:e,password:"Audit123",first_name:"Audit",last_name:"User",role:"admin"},null,201);
const l=await api("POST","/api/admin-verification/authenticate-enhanced",{email:e,password:"Audit123"});const k=l.b?.token;
await t("Home","GET","/",null,null,200);await t("About","GET","/about",null,null,200);await t("Services","GET","/services",null,null,200);await t("Blog","GET","/blog",null,null,200);await t("Case Studies","GET","/case-studies",null,null,200);await t("Contact","GET","/contact",null,null,200);await t("Companies","GET","/companies",null,null,200);await t("Pricing","GET","/pricing",null,null,200);await t("Login","GET","/login",null,null,200);await t("Signup","GET","/signup",null,null,200);
await t("Dashboard","GET","/api/admin/dashboard",null,k,200);await t("Pending","GET","/api/admin/pending-approvals",null,k,200);
await t("Users list","GET","/api/users",null,k,200);await t("User detail","GET","/api/admin/users/18?role_type=client",null,k,200);await t("Update user","PUT","/api/admin/users/18?role_type=client",{first_name:"T",last_name:"U",email:"t@t.com",role:"user",is_active:true},k,200);
await t("Projects","GET","/api/user-projects",null,k,200);await t("Project","GET","/api/user-projects/4",null,k,200);await t("New task","POST","/api/projects/4/tasks",{task_name:"A"+s,status:"not_started",priority:"medium"},k,201);await t("Tasks","GET","/api/projects/4/tasks",null,k,200);
await t("Invoices","GET","/api/invoices",null,k,200);await t("New invoice","POST","/api/invoices",{title:"A"+s,total_amount_kes:5000,client_name:"A"},k,201);await t("Edit invoice","PUT","/api/invoices/1",{status:"pending"},k,200);
await t("Accounting","POST","/api/accounting-entries",{description:"A"+s,amount:1000,entry_type:"expense",category:"A"},k,201);await t("Edit acct","PUT","/api/accounting/entries/1",{description:"U",amount:500},k,200);
await t("CRM list","GET","/api/admin/crm/contacts",null,k,200);await t("CRM new","POST","/api/admin/crm/contacts",{name:"A"+s,email:"c"+s+"@t.com"},k,201);
await t("Blog list","GET","/api/blog-articles",null,k,200);await t("Blog one","GET","/api/blog-articles/1",null,k,200);await t("Web content","GET","/api/website-content",null,k,200);await t("Edit web","PUT","/api/website-content/a_"+s,{value:"A"},k,200);
await t("Personnel","GET","/api/company-personnel",null,k,200);await t("New person","POST","/api/company-personnel",{name:"A"+s,position:"D"},k,201);await t("Edit person","PUT","/api/company-personnel/1",{name:"U"},k,200);
await t("Contacts","GET","/api/contact-forms",null,k,200);await t("Changes","GET","/api/admin/change-requests",null,k,200);await t("Signatures","GET","/api/admin/signature-requests",null,k,200);
await t("Images","GET","/api/images",null,k,200);await t("Upload","POST","/api/images",{dataBase64:"iVBORw0KGgo=",contentType:"image/png",fileName:"a.png"},k,201);await t("Image","GET","/api/images/1",null,k,200);
await t("Budget","GET","/api/admin-complete/budget-overview",null,k,200);await t("Team list","GET","/api/admin/team",null,k,200);await t("Team new","POST","/api/admin-complete/team",{name:"A"+s,role:"dev"},k,201);
await t("Safety","GET","/api/admin/data-safety-summary",null,k,200);await t("Audit logs","GET","/api/admin/audit-logs",null,k,200);await t("Activity","GET","/api/admin/activity-logs",null,k,200);await t("Access","GET","/api/admin/data-access-logs",null,k,200);
await t("Settings","GET","/api/admin/node-settings",null,k,200);await t("Calibrate","POST","/api/admin/system-calibration",{},k,200);await t("Reports","GET","/api/admin/reports",null,k,200);
await t("Backup","GET","/api/admin/backup/status",null,k,200);await t("Backup run","POST","/api/admin/backup/run",{},k,200);await t("Search","GET","/api/admin/search?q=test",null,k,200);
console.log("\n"+"=".repeat(50));console.log("FULL AUDIT: "+P+" passed, "+F+" failed, "+(P+F)+" total");console.log("=".repeat(50));
if(F>0){console.log("\nFAILURES:");R.filter(r=>!r.s).forEach(r=>console.log("  FAIL: "+r.L+" ("+r.s+")"));}
process.exit(0);})();
