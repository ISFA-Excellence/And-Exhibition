(function(){
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});
var standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone;if(standalone)return;
var K='isfa_pwa_hide',role=/admin\.html/.test(location.pathname)?'Admin':'Student';
try{if(Date.now()-Number(localStorage.getItem(K)||0)<6048e5)return}catch(e){}
function bar(text,onInstall){var b=document.createElement('div');b.className='pwa-bar';var t=document.createElement('span');t.textContent=text;b.appendChild(t);
 if(onInstall){var i=document.createElement('button');i.className='btn s g';i.textContent='Install';i.onclick=function(){onInstall();b.remove()};b.appendChild(i)}
 var x=document.createElement('button');x.className='btn s o';x.textContent='Not now';x.onclick=function(){try{localStorage.setItem(K,String(Date.now()))}catch(e){}b.remove()};b.appendChild(x);document.body.appendChild(b)}
var ev=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();ev=e;bar('Install the ISFA '+role+' app on your phone for quick access.',function(){ev.prompt()})});
if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream)setTimeout(function(){if(!ev)bar('To install: tap the Share button, then Add to Home Screen.')},2500);
})();
