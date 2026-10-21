(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return document.querySelectorAll(s)};
var ENDPOINT="https://script.google.com/macros/s/AKfycbw6nzH7S4zINPMRdBrcXF8GQ0g2SE7YXTKVsTMh4mM-h53OnU7WIJRau3IKIDHlETRUGA/exec";
var t=$('#toast'),tt;
function toast(m){t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('show')},3200)}
var menu=$('#menu'),bg=$('#burger');
bg.onclick=function(){var o=menu.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.firstElementChild.src='assets/icons/'+(o?'x':'menu')+'-p.png'};
menu.addEventListener('click',function(e){if(e.target.tagName==='A'&&menu.classList.contains('open'))bg.click()});
var dd=$('#dd');
dd.firstElementChild.onclick=function(e){e.stopPropagation();var o=dd.classList.toggle('open');this.setAttribute('aria-expanded',o)};
document.addEventListener('click',function(){dd.classList.remove('open')});
document.addEventListener('keydown',function(e){if(e.key==='Escape')dd.classList.remove('open')});
$$('[data-soon]').forEach(function(b){b.onclick=function(){toast(b.dataset.soon+' login will be available soon.')}});
var yr=$('#yr');if(yr)yr.textContent=new Date().getFullYear();
var car=$('#car');
if(car){
var tr=$('#track'),n=tr.children.length,i=0,timer,dots=$('#dots'),sx=null;
for(var k=0;k<n;k++){(function(k){var b=document.createElement('button');b.setAttribute('aria-label','Go to slide '+(k+1));b.onclick=function(){go(k);play()};dots.appendChild(b)})(k)}
function go(x){i=(x+n)%n;tr.style.transform='translateX(-'+i*100+'%)';[].forEach.call(dots.children,function(d,j){d.setAttribute('aria-current',j===i)});[].forEach.call(tr.querySelectorAll('img'),function(im){im.loading='eager'})}
function play(){clearInterval(timer);timer=setInterval(function(){go(i+1)},5000)}
$('#prev').onclick=function(){go(i-1);play()};$('#next').onclick=function(){go(i+1);play()};
car.addEventListener('mouseenter',function(){clearInterval(timer)});car.addEventListener('mouseleave',play);
car.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;clearInterval(timer)},{passive:true});
car.addEventListener('touchend',function(e){if(sx!==null){var d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>40)go(d<0?i+1:i-1);sx=null}play()});
go(0);play();
}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});$$('.rv').forEach(function(el){io.observe(el)})}else{$$('.rv').forEach(function(el){el.classList.add('in')})}
var forms=$$('#connect form'),tabs=$$('.tabs button');
function tab(id){tabs.forEach(function(b){b.setAttribute('aria-selected',b.dataset.t===id)});forms.forEach(function(f){f.hidden=f.id!==id})}
tabs.forEach(function(b){b.onclick=function(){tab(b.dataset.t)}});
var q=location.search.match(/form=(f[123])/);if(q&&forms.length)tab(q[1]);
/* forms */
var opened=Date.now();
function cleanMobile(v){v=v.replace(/[\s\-]/g,'');return v.replace(/^(\+91|91|0)(?=\d{10}$)/,'')}
forms.forEach(function(f){
var msg=f.querySelector('.msg'),btn=f.querySelector('button[type=submit]'),lab=btn.querySelector('span');
f.addEventListener('submit',function(e){
e.preventDefault();msg.className='msg';var bad=false,d={};
[].forEach.call(f.elements,function(el){
if(!el.name||el.name==='website')return;
var v=el.value.trim(),m='';
if(el.name==='mobile'){v=cleanMobile(v);if(!/^[6-9]\d{9}$/.test(v))m='Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.'}
else if(el.required&&!v)m='This field is required.';
else if(el.minLength>0&&v&&v.length<el.minLength)m='Please write at least '+el.minLength+' characters.';
el.parentNode.querySelector('.err').textContent=m;el.setAttribute('aria-invalid',m?'true':'false');
if(m)bad=true;d[el.name]=v});
if(bad){var x=f.querySelector('[aria-invalid=true]');if(x)x.focus();return}
if(f.elements.website.value)return;
d.type=f.dataset.type;d.website='';d.elapsed=String(Date.now()-opened);
btn.disabled=true;lab.textContent='Sending...';
fetch(ENDPOINT,{method:'POST',body:new URLSearchParams(d)}).then(function(r){return r.json()}).then(function(j){
if(!j||!j.ok)throw (j&&j.error)||0;
msg.className='msg ok';msg.textContent=f.dataset.ok;f.reset();opened=Date.now()
}).catch(function(er){
var t='ISFA '+d.type+' - '+Object.keys(d).filter(function(k){return k!=='type'&&k!=='website'&&k!=='elapsed'&&d[k]}).map(function(k){return k+': '+d[k]}).join(', ');
msg.className='msg bad';msg.innerHTML=(typeof er==='string'?er:'We could not confirm that your message was delivered.')+' You can also send it on <a href="https://wa.me/919798926161?text='+encodeURIComponent(t)+'" target="_blank" rel="noopener"><b>WhatsApp</b></a> or call +91 9798926161.'
}).finally(function(){btn.disabled=false;lab.textContent=f.dataset.type==='enquiry'?'Submit enquiry':f.dataset.type==='complaint'?'Submit complaint':'Send message'})
})});
})();
