(function(){
var $=function(i){return document.getElementById(i)},role=(location.search.match(/role=(admin|student)/)||[])[1]||'student';
if(A.session.get('token')&&A.session.get('role')){location.replace(A.session.get('role')==='admin'?'admin.html':'student.html');return}
function pick(r){role=r;$('tS').setAttribute('aria-selected',r==='student');$('tA').setAttribute('aria-selected',r==='admin');$('fS').classList.toggle('hide',r!=='student');$('fA').classList.toggle('hide',r!=='admin')}
$('tS').onclick=function(){pick('student')};$('tA').onclick=function(){pick('admin')};pick(role);
if(/expired=1/.test(location.search))$('exp').textContent='Your session has ended. Please log in again.';
var needMobile=true;
A.api('public',{},false).then(function(d){needMobile=d.settings.student_login_check==='mobile';$('mrow').classList.toggle('hide',!needMobile)}).catch(function(){});
function go(form,btn,err,action,body,dest,nm){
  form.addEventListener('submit',function(e){e.preventDefault();err.textContent='';var b=form.querySelector('button');b.disabled=true;
    var p=body();if(!p){b.disabled=false;return}
    A.api(action,p,false).then(function(d){A.setSession({token:d.token,role:d.role,name:nm(d)});location.replace(dest)}).catch(function(x){err.textContent=x.message;b.disabled=false})})}
go($('fS'),null,$('eS'),'studentLogin',function(){var n=$('sn').value.trim(),i=$('si').value.trim(),m=$('sm').value.trim();
  if(!n||!i){$('eS').textContent='Enter your name and Student ID.';return null}
  if(needMobile&&!m){$('eS').textContent='Enter your registered mobile number.';return null}
  return{name:n,studentId:i,mobile:m}},'student.html',function(d){return d.name});
go($('fA'),null,$('eA'),'adminLogin',function(){var u=$('au').value.trim(),p=$('ap').value;
  if(!u||!p){$('eA').textContent='Enter username and password.';return null}return{username:u,password:p}},'admin.html',function(d){return d.username});
})();
