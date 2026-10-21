/* Shared helpers for login, admin and student pages. No innerHTML anywhere: text is always inserted safely. */
(function(){
var API="https://script.google.com/macros/s/AKfycbw6nzH7S4zINPMRdBrcXF8GQ0g2SE7YXTKVsTMh4mM-h53OnU7WIJRau3IKIDHlETRUGA/exec";
var S=window.localStorage;
function h(tag,attrs){
  var e=document.createElement(tag);
  for(var k in (attrs||{})){var v=attrs[k];if(v==null||v===false)continue;
    if(k==='class')e.className=v;else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);else if(k==='value')e.value=v;else e.setAttribute(k,v===true?'':v)}
  for(var i=2;i<arguments.length;i++)add(e,arguments[i]);return e}
function add(e,c){if(c==null||c===false)return;if(Array.isArray(c))c.forEach(function(x){add(e,x)});else e.appendChild(c.nodeType?c:document.createTextNode(String(c)))}
function ic(n,v){return h('img',{class:'ico',src:'assets/icons/'+n+'-'+(v||'p')+'.png',alt:'',width:20,height:20})}
var spins=0,sp;
function busy(on){spins+=on?1:-1;if(spins>0&&!sp){sp=h('div',{class:'spin'});document.body.appendChild(sp)}if(spins<=0){spins=0;if(sp){sp.remove();sp=null}}}
var tt;function toast(m,bad){var t=document.querySelector('.toast');if(t)t.remove();t=h('div',{class:'toast'+(bad?' bad':''),role:'status'},m);document.body.appendChild(t);clearTimeout(tt);tt=setTimeout(function(){t.remove()},bad?6000:3000)}
function setSession(d){S.setItem('isfa_token',d.token);S.setItem('isfa_role',d.role);S.setItem('isfa_name',d.name||d.username||'')}
function clearSession(){['isfa_token','isfa_role','isfa_name'].forEach(function(k){S.removeItem(k)})}
function guard(role){if(S.getItem('isfa_role')!==role||!S.getItem('isfa_token'))location.replace('login.html?role='+role)}
function api(action,body,auth){
  var p=Object.assign({action:action},body||{});if(auth!==false&&S.getItem('isfa_token'))p.token=S.getItem('isfa_token');
  busy(true);
  return fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)}).then(function(r){return r.json()}).then(function(j){
    if(!j.ok){var e=new Error(j.error||'Request failed');e.expired=/Session expired|Please log in/.test(j.error||'');throw e}return j.data
  }).catch(function(e){
    if(e.expired&&auth!==false){var r=S.getItem('isfa_role')||'student';clearSession();location.replace('login.html?role='+r+'&expired=1')}
    if(e instanceof TypeError)e=new Error('Could not reach the server. Check your internet and try again.');throw e
  }).finally(function(){busy(false)})}
function logout(){var t=S.getItem('isfa_token'),r=S.getItem('isfa_role');(t?api('logout',{},true).catch(function(){}):Promise.resolve()).then(function(){clearSession();location.replace('index.html')})}
function modal(title,body,buttons,big){
  var ov=h('div',{class:'ov',role:'dialog','aria-modal':'true'}),close=function(){ov.remove();document.removeEventListener('keydown',esc)};
  function esc(e){if(e.key==='Escape')close()}
  document.addEventListener('keydown',esc);
  var m=h('div',{class:'mod'+(big?' big':'')},h('div',{class:'hd'},h('h2',{style:'margin:0'},title),h('button',{class:'btn o s',onclick:close,'aria-label':'Close'},ic('x'))),body,h('div',{class:'ft'},(buttons||[]).map(function(b){return h('button',{class:'btn '+(b.cls||''),onclick:function(){b.fn(close)}},b.label)})));
  ov.appendChild(m);ov.addEventListener('mousedown',function(e){if(e.target===ov)close()});document.body.appendChild(ov);var f=m.querySelector('input,select,textarea');if(f)f.focus();return close}
function confirmBox(msg,yes){modal('Please confirm',h('p',null,msg),[{label:'Cancel',cls:'o',fn:function(c){c()}},{label:'Yes, continue',cls:'d',fn:function(c){c();yes()}}])}
/* field: {k,l,t:'text|num|date|sel|area',o:[options],ro,hint} */
function fieldNode(f,val){
  var id='f_'+f.k,inp;
  if(f.t==='sel'){inp=h('select',{id:id,name:f.k},h('option',{value:''},'Select'),f.o.map(function(o){return h('option',{value:o},o)}));inp.value=val==null?'':String(val)}
  else if(f.t==='area'){inp=h('textarea',{id:id,name:f.k,rows:4});inp.value=val==null?'':val}
  else{inp=h('input',{id:id,name:f.k,type:f.t==='date'?'date':f.t==='num'?'number':'text',min:f.t==='num'?'0':null,step:f.t==='num'?'any':null,inputmode:f.t==='num'?'decimal':null,autocomplete:'off'});inp.value=val==null?'':val}
  if(f.ro)inp.disabled=true;
  return h('div',null,h('label',{for:id},f.l+(f.req?' *':'')),inp,f.hint?h('p',{class:'note'},f.hint):null)}
function form(fields,vals){
  vals=vals||{};var nodes=fields.map(function(f){return fieldNode(f,vals[f.k])});
  var box=h('div',{class:'grid2'},nodes);
  return{node:box,get:function(){var o={};fields.forEach(function(f){var e=box.querySelector('[name="'+f.k+'"]');if(e&&!f.ro)o[f.k]=e.value});return o}}}
function badge(v){return h('span',{class:'badge b-'+v},v)}
/* table(cols,rows,opt): cols [{k,l,f:function(row)->node|text}] ; opt {actions:function(row)->nodes, filters, empty, limit} */
function table(cols,rows,opt){
  opt=opt||{};var q='',limit=opt.limit||100,wrap=h('div'),info=h('p',{class:'note'}),host=h('div'),search=h('input',{type:'search',placeholder:'Search',class:'sr','aria-label':'Search'});
  var tools=h('div',{class:'tools'},search,opt.tools||null);wrap.appendChild(tools);wrap.appendChild(info);wrap.appendChild(host);
  function draw(){
    var t=q.toLowerCase(),list=rows.filter(function(r){return(!opt.filter||opt.filter(r))&&(!t||Object.keys(r).some(function(k){return String(r[k]).toLowerCase().indexOf(t)>=0}))});
    var shown=list.slice(0,limit);info.textContent=list.length+' of '+rows.length+' records'+(list.length>shown.length?' (showing first '+shown.length+')':'');
    var tb=h('table',{class:'rt'},h('tr',null,cols.map(function(c){return h('th',null,c.l)}),opt.actions?h('th',null,'Actions'):null),
      shown.map(function(r){return h('tr',null,cols.map(function(c){var v=c.f?c.f(r):r[c.k];return h('td',{'data-l':c.l},v==null?'':v)}),opt.actions?h('td',{class:'ac'},h('div',{class:'acts'},opt.actions(r))):null)}));
    host.replaceChildren(shown.length?h('div',{class:'scroll'},tb):h('p',{class:'note'},opt.empty||'No records found.'));
    if(list.length>shown.length){host.appendChild(h('p',null,h('button',{class:'btn o s',onclick:function(){limit+=100;draw()}},'Show more')))}}
  search.addEventListener('input',function(){q=search.value;draw()});wrap.redraw=draw;draw();return wrap}
function istTime(iso){var d=new Date(iso);return isNaN(d)?String(iso):d.toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'})}
function money(n){return '\u20B9'+Number(n||0).toLocaleString('en-IN')}
function topbar(roleLabel,name,extra){var ini=String(name||'?').trim().charAt(0).toUpperCase();
  return h('header',{class:'top'},h('a',{class:'brand',href:'index.html','aria-label':'ISFA website'},h('img',{src:'assets/logo.jpg',alt:''}),h('span',null,'ISFA',h('small',null,roleLabel))),h('span',{class:'sp'}),extra||null,h('div',{class:'who',title:name},h('span',{class:'av'},ini),h('b',null,name)),h('button',{class:'btn o s',onclick:logout,'aria-label':'Logout'},ic('logout'),h('span',{class:'lbl'},'Logout')))}
function csv(name,cols,rows){var q=function(v){v=v==null?'':String(v);if(/^[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
  var lines=[cols.map(function(c){return q(c.l)}).join(',')].concat(rows.map(function(r){return cols.map(function(c){return q(c.v?c.v(r):r[c.k])}).join(',')}));
  var u=URL.createObjectURL(new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'})),a=h('a',{href:u,download:name});document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},3000)}
function kpi(icon,label,value,color,fn){var b=h(fn?'button':'div',{class:'kpi'+(fn?' click':''),style:'--c:'+color},h('span',{class:'chip'},ic(icon,'w')),h('div',null,h('b',null,value),h('span',null,label)));if(fn)b.addEventListener('click',fn);return b}
function chip(icon,color){return h('span',{class:'chip',style:'--c:'+color},ic(icon,'w'))}
function btn(label,icon,fn,cls){return h('button',{class:'btn '+(cls||''),onclick:fn},icon?ic(icon):null,label)}
function seg(items,cur,fn){var w=h('div',{class:'seg2',role:'tablist'});items.forEach(function(it){var b=h('button',{role:'tab','aria-selected':it[0]===cur,onclick:function(){[].forEach.call(w.children,function(x){x.setAttribute('aria-selected','false')});b.setAttribute('aria-selected','true');fn(it[0])}},it[1]);w.appendChild(b)});return w}
function ring(pct,color,label){return h('div',{class:'ring',style:'--c:'+color+';--v:'+pct,role:'img','aria-label':label||pct+'%'},h('i',null,pct+'%'))}
window.A={h:h,ic:ic,api:api,toast:toast,modal:modal,confirmBox:confirmBox,form:form,table:table,badge:badge,guard:guard,setSession:setSession,logout:logout,istTime:istTime,money:money,topbar:topbar,csv:csv,kpi:kpi,chip:chip,btn:btn,seg:seg,ring:ring,session:{get:function(k){return S.getItem('isfa_'+k)}}};
})();
