/* Student portal. Shows only the logged-in student's own data (the server enforces this). */
(function(){
A.guard('student');
var h=A.h,root=document.getElementById('root'),MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],FULL=['January','February','March','April','May','June','July','August','September','October','November','December'];
var D=null,tab='home',pickExam=null,calM=null,pickMonth=null;
function dmy(s){var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(s||'');return m?(+m[3])+' '+MON[+m[2]-1]+' '+m[1]:(s||'')}
function pct(a,b){return b>0?Math.round(a*100/b):0}
function col(p){return p>=75?'var(--gr)':p>=50?'var(--blue)':p>=33?'var(--gold)':'var(--co)'}
function todayIso(){return new Date(Date.now()+330*60000).toISOString().slice(0,10)}
function hello(){var H=new Date().getHours();return H<12?'Good morning':H<17?'Good afternoon':'Good evening'}
function si(s){return{Mathematics:'calc',Science:'flask',English:'book'}[s]||'pen'}
function sc(s){return{Mathematics:'var(--blue)',Science:'var(--teal)',English:'var(--co)'}[s]||'var(--p)'}
function stars(p){return h('div',{class:'stars'},[35,60,80].map(function(t){return A.ic('star',p>=t?'g':'l')}))}
function cheer(e,a){if(e===null&&a===null)return 'Welcome! Your marks and attendance will show here soon.';if(e!==null){if(e>=80)return 'Wow! Excellent marks. Keep shining!';if(e>=60)return 'Very good work! A little more practice and you will be at the top.';if(e>=40)return 'Good try! Practise a little every day to get better.';return 'Do not worry. Ask your teacher for help and keep trying!'}return a>=90?'Great attendance! Keep coming to class.':'Try to come to class every day.'}
function empty(icon,msg){return h('div',{class:'panel',style:'text-align:center;padding:2rem 1rem'},A.chip(icon,'var(--p)'),h('p',{class:'note',style:'margin-top:.8rem'},msg))}
function exams(){var o={},order=[];D.results.forEach(function(r){if(!o[r.exam]){o[r.exam]=[];order.push(r.exam)}o[r.exam].push(r)});
  return order.map(function(n){var rows=o[n],e=D.exams.filter(function(x){return x.exam===n})[0];return{name:n,date:e?e.date:'',rows:rows,full:rows.reduce(function(a,r){return a+Number(r.fullMarks)},0),got:rows.reduce(function(a,r){return a+Number(r.obtained)},0)}}).sort(function(a,b){return a.date<b.date?1:-1})}
function passMark(r){var e=D.exams.filter(function(x){return x.exam===r.exam&&x.subject===r.subject})[0];return e?Number(e.passMarks):0}
function bars(e){return h('div',null,e.rows.map(function(r){var p=pct(r.obtained,r.fullMarks),pm=passMark(r);
  return h('div',{class:'sb'},h('span',{class:'subj'},A.chip(si(r.subject),sc(r.subject)),r.subject),h('div',{class:'bar',style:'--c:'+col(p)},h('i',{style:'width:'+p+'%'}),pm?h('u',{style:'left:'+pct(pm,r.fullMarks)+'%',title:'Pass mark '+pm}):null),h('b',null,r.obtained+'/'+r.fullMarks,stars(p)))}))}
function upcoming(){var t=todayIso();return D.exams.filter(function(e){return e.date>=t}).sort(function(a,b){return a.date<b.date?-1:1})}
function daysTo(d){var n=Math.round((Date.parse(d)-Date.parse(todayIso()))/864e5);return n<=0?'today':n===1?'tomorrow':'in '+n+' days'}
function notices(n){var l=D.notices.slice(0,n);return l.length?h('div',null,l.map(function(x){return h('div',{class:'row2'},A.chip('mail','var(--gold)'),h('div',{class:'t'},h('b',null,x.title),h('small',null,dmy(x.date)),h('p',{style:'margin-top:.2rem'},x.body)))})):h('p',{class:'note'},'No notices right now.')}
function go(t){tab=t;draw();window.scrollTo(0,0)}
var V={
home:function(){
  var s=D.student,a=D.attendanceSummary,r=D.register,ex=exams()[0],ap=pct(a.present+a.late,a.total),up=upcoming().slice(0,4);
  return h('div',null,
    h('div',{class:'greet'},h('h2',null,hello()+', '+s.name.split(' ')[0]),h('p',null,'Class '+s.class+'  |  '+s.board+'  |  ID '+s.studentId),h('p',{class:'cheer'},cheer(ex?pct(ex.got,ex.full):null,a.total?ap:null))),
    h('div',{class:'kpis'},
      A.kpi('cal','Attendance',a.total?ap+'%':'No data','var(--gr)',function(){go('attendance')}),
      A.kpi('wallet','Fees due till now',r?(r.dueTillNow>0?A.money(r.dueTillNow):'All clear'):'Not set','var(--co)',function(){go('fees')}),
      A.kpi('star',ex?'Latest: '+ex.name:'Latest result',ex?pct(ex.got,ex.full)+'%':'Not yet','var(--blue)',function(){go('results')}),
      A.kpi('shield','Certificates',String(D.certificates.length),'var(--gold)',function(){go('awards')})),
    ex?h('div',{class:'panel'},h('div',{class:'tools'},h('h2',{style:'margin:0'},ex.name),h('span',{class:'sp'}),A.btn('See all results','right',function(){go('results')},'o s')),bars(ex)):null,
    up.length?h('div',{class:'panel'},h('h2',null,'Coming up'),up.map(function(e){return h('div',{class:'row2'},A.chip('pen','var(--teal)'),h('div',{class:'t'},h('b',null,e.exam+': '+e.subject),h('small',null,dmy(e.date)+'  ('+daysTo(e.date)+')')),h('small',null,'Full marks '+e.fullMarks))})):null,
    h('div',{class:'panel'},h('div',{class:'tools'},h('h2',{style:'margin:0'},'Latest notices'),h('span',{class:'sp'}),A.btn('All notices','right',function(){go('notices')},'o s')),notices(2)))},
results:function(){
  var ex=exams();if(!ex.length)return empty('star','Your results will appear here after the school publishes them.');
  var cur=ex.filter(function(e){return e.name===pickExam})[0]||ex[0],p=pct(cur.got,cur.full);
  var chips=A.seg(ex.map(function(e){return[e.name,e.name]}),cur.name,function(n){pickExam=n;draw()});
  return h('div',null,h('div',{class:'exs noprint'},chips),
    h('div',{class:'panel'},h('div',{class:'flex'},A.ring(p,col(p),'Score '+p+' percent'),h('div',null,h('h2',{style:'margin:0 0 .2rem'},cur.name),h('p',{class:'note'},cur.date?'Exam date: '+dmy(cur.date):''),h('p',null,h('b',null,cur.got+' out of '+cur.full+' marks')),h('div',{class:'noprint'},A.btn('Print result card','print',function(){window.print()},'o s')))),h('hr',{style:'border:0;border-top:1px solid var(--lav2);margin:1rem 0'}),bars(cur),h('p',{class:'note'},'The thin line on each bar shows the pass mark.'),
      h('div',{class:'scroll'},h('table',{class:'rt'},h('tr',null,['Subject','Full marks','Obtained','Result'].map(function(x){return h('th',null,x)})),cur.rows.map(function(r){return h('tr',null,h('td',{'data-l':'Subject'},r.subject),h('td',{'data-l':'Full marks'},r.fullMarks),h('td',{'data-l':'Obtained'},r.obtained),h('td',{'data-l':'Result'},A.badge(Number(r.obtained)>=passMark(r)?'Pass':'Low')))})))),
    ex.length>1?h('div',{class:'panel noprint'},h('h2',null,'Your progress'),ex.slice().reverse().map(function(e){var q=pct(e.got,e.full);return h('div',{class:'sb',style:'cursor:pointer',onclick:function(){pickExam=e.name;draw();window.scrollTo(0,0)}},h('span',{style:'font-size:.85rem'},e.name),h('div',{class:'bar',style:'--c:'+col(q)},h('i',{style:'width:'+q+'%'})),h('b',null,q+'%'))})):null)},
attendance:function(){
  var a=D.attendanceSummary,p=pct(a.present+a.late,a.total);
  if(!a.total)return empty('cal','Attendance records will appear here once your teacher starts marking them.');
  var map={};D.attendance.forEach(function(x){map[x.date]=x.status});
  var months=Array.from(new Set(D.attendance.map(function(x){return x.date.slice(0,7)}))).sort();
  var cm=calM&&months.indexOf(calM)>=0?calM:months[months.length-1],ix=months.indexOf(cm),y=+cm.slice(0,4),m=+cm.slice(5,7),first=new Date(Date.UTC(y,m-1,1)).getUTCDay(),days=new Date(Date.UTC(y,m,0)).getUTCDate();
  var cnt={Present:0,Absent:0,Late:0},cells=['S','M','T','W','T','F','S'].map(function(d){return h('div',{class:'h'},d)});
  for(var i=0;i<first;i++)cells.push(h('div'));
  for(var d=1;d<=days;d++){var iso=cm+'-'+(d<10?'0':'')+d,st=map[iso];if(st)cnt[st]++;cells.push(h('div',{class:'d '+(st||''),title:st?iso+': '+st:iso},d))}
  var streak=0,list=D.attendance.slice().sort(function(a,b){return a.date<b.date?1:-1});for(var k=0;k<list.length;k++){if(list[k].status==='Absent')break;streak++}
  return h('div',null,
    h('div',{class:'panel'},h('div',{class:'flex'},A.ring(p,col(p),'Attendance '+p+' percent'),h('div',null,h('h2',{style:'margin:0 0 .3rem'},'Overall attendance'),h('p',null,a.present+' present, '+a.late+' late, '+a.absent+' absent'),h('p',{class:'note'},a.total+' days recorded.  Current run: '+streak+' day'+(streak===1?'':'s')+' without absence.')))),
    h('div',{class:'panel'},h('div',{class:'tools'},A.btn('','left',function(){calM=months[ix-1];draw()},'o s ico-b'),h('h2',{style:'margin:0;flex:1;text-align:center'},FULL[m-1]+' '+y),A.btn('','right',function(){calM=months[ix+1];draw()},'o s ico-b')),
      h('div',{class:'cal'},cells),h('div',{class:'legend'},h('span',null,h('i',{style:'background:#DDF3E5'}),'Present ('+cnt.Present+')'),h('span',null,h('i',{style:'background:#FFF0CC'}),'Late ('+cnt.Late+')'),h('span',null,h('i',{style:'background:#FBE1DD'}),'Absent ('+cnt.Absent+')'))))},
fees:function(){
  var r=D.register,now=new Date(),curM=D.feeYear===now.getFullYear()?now.getMonth():(D.feeYear<now.getFullYear()?11:-1);
  if(!r)return empty('wallet','Your fee plan has not been set up yet. Please contact the office.');
  var sel=pickMonth||MON[Math.max(0,Math.min(curM,11))],paidNow=0,expNow=0;MON.forEach(function(m,i){if(i<=curM){paidNow+=r.months[m].paid;expNow+=r.monthlyFee}});
  var pays=D.fees.filter(function(f){return f.forMonth===sel&&f.year===D.feeYear});
  return h('div',null,
    h('div',{class:'kpis'},A.kpi('wallet','Monthly fee',A.money(r.monthlyFee),'var(--p)'),A.kpi('check','Paid in '+D.feeYear,A.money(r.paidTotal),'var(--gr)'),A.kpi('clock','Due till now',A.money(r.dueTillNow),'var(--co)')),
    h('div',{class:'panel'},h('h2',null,'Fees for '+D.feeYear),h('div',{class:'bar',style:'--c:var(--gr)'},h('i',{style:'width:'+pct(paidNow,expNow)+'%'})),h('p',{class:'note'},'Paid '+A.money(paidNow)+' of '+A.money(expNow)+' due so far this year. Tap a month for details.'),
      h('div',{class:'mth'},MON.map(function(m,i){var c=r.months[m],future=i>curM&&c.paid===0,st=future?'Upcoming':c.status,bg=st==='Paid'?'#DDF3E5':st==='Partial'?'#FFF0CC':st==='Pending'?'#FBE1DD':'#ECE8F0',fg=st==='Paid'?'#14663a':st==='Partial'?'#8a5a00':st==='Pending'?'#9b1c13':'#5E5068';
        return h('button',{style:'background:'+bg+';color:'+fg,'aria-pressed':m===sel,onclick:function(){pickMonth=m;draw()}},m,h('small',null,st==='Upcoming'?'Upcoming':st==='Paid'||st==='Partial'?A.money(c.paid):'Due'))}))),
    h('div',{class:'panel'},h('h2',null,sel+' '+D.feeYear),pays.length?pays.map(function(f){return h('div',{class:'row2'},A.chip('check','var(--gr)'),h('div',{class:'t'},h('b',null,A.money(f.amount)),h('small',null,'Received '+dmy(f.date)+' by '+f.mode)))}):h('p',{class:'note'},r.months[sel].status==='Free'?'No fee for this month.':'No payment recorded for this month yet.')),
    D.fees.length?h('div',{class:'panel'},h('h2',null,'All payments'),h('div',{class:'scroll'},h('table',{class:'rt'},h('tr',null,['Date','For','Amount','Mode'].map(function(x){return h('th',null,x)})),D.fees.map(function(f){return h('tr',null,h('td',{'data-l':'Date'},dmy(f.date)),h('td',{'data-l':'For'},f.forMonth+' '+f.year),h('td',{'data-l':'Amount'},A.money(f.amount)),h('td',{'data-l':'Mode'},f.mode))})))):null)},
awards:function(){
  if(!D.certificates.length)return empty('shield','Your certificates will appear here when they are issued.');
  return h('div',null,D.certificates.map(function(c){return h('div',{class:'panel'},h('div',{class:'flex'},A.chip('star','var(--gold)'),h('div',{style:'flex:1;min-width:180px'},h('h2',{style:'margin:0'},c.type),h('p',null,c.award||''),h('p',{class:'note'},'Issued '+dmy(c.date)+'  |  Code '+c.code)),A.btn('Copy code','copy',function(){if(navigator.clipboard)navigator.clipboard.writeText(c.code).then(function(){A.toast('Code copied')},function(){A.toast('Could not copy',true)});else A.toast(c.code)},'o s')))}))},
notices:function(){return h('div',{class:'panel'},h('h2',null,'Notices'),notices(30))}
};
var TABS=[['home','Home','home'],['results','Results','star'],['attendance','Attendance','cal'],['fees','Fees','wallet'],['awards','Awards','shield'],['notices','Notices','mail']];
function draw(){
  var side=h('nav',{class:'side bn','aria-label':'Sections'},TABS.map(function(t){return h('button',{'aria-current':tab===t[0],onclick:function(){go(t[0])}},A.ic(t[2]),t[1])}));
  root.replaceChildren(A.topbar('Student portal',D.student.name),h('div',{class:'shell has-bn'},side,h('main',{class:'main',id:'main'},V[tab]())))}
A.api('dashboard').then(function(d){if(d.role!=='student')throw new Error('Not a student session');D=d;draw()}).catch(function(e){root.replaceChildren(h('div',{class:'main'},h('div',{class:'panel'},h('h2',null,'Could not load your portal'),h('p',null,e.message),h('p',null,A.btn('Back to login','logout',A.logout)))))});
})();
