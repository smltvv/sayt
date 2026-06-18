let __vm=null;
let sliderInterval=null;

function updateAuthUI(){
const isAuth = !!currentUser;
const profileLink = document.getElementById('profileLink');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = document.getElementById('loginBtn');

if(profileLink) {
profileLink.style.display = isAuth ? 'flex' : 'none';
}
if(logoutBtn) {
logoutBtn.style.display = isAuth ? 'flex' : 'none';
}
if(loginBtn) {
loginBtn.style.display = isAuth ? 'none' : 'flex';
}
}

document.addEventListener('DOMContentLoaded',async function(){
await loadProducts();
loadUsers();
loadCart();
loadFavs();
loadOrders();
loadReviews();

const token = localStorage.getItem('token');
if(token){
try{
const decoded = atob(token);
const [email, pass] = decoded.split(':');
const user = findUser(email, pass);
if(user){
currentUser = user;
localStorage.setItem('user', JSON.stringify(user));
}
}catch(e){}
}

if(!currentUser){
const savedUser = localStorage.getItem('user');
if(savedUser){
try{
currentUser = JSON.parse(savedUser);
const user = getUser(currentUser.id);
if(user) currentUser = user;
}catch(e){}
}
}

const vm=new AppViewModel();
window.__vm=vm;
vm.init();

if(document.getElementById('productsContainer')){
renderProducts(vm);
renderRecently(vm);
renderPopular(vm);
vm.updateCounters();
initCatalogEvents(vm);
initSlider();
initAuth(vm);
initTheme();
initAccess();
}

if(document.getElementById('cartContainer')){
renderCart(vm);
initCartEvents(vm);
vm.updateCounters();
}

if(document.getElementById('favoritesContainer')){
renderFavs(vm);
initFavEvents(vm);
vm.updateCounters();
}

if(document.getElementById('profileName')){
renderProfile(vm);
initProfileEvents(vm);
}

if(document.getElementById('gameBonus')){
renderGame(vm);
initGameEvents(vm);
}

updateAuthUI();

document.getElementById('logoutBtn')?.addEventListener('click',function(){
localStorage.removeItem('token');
localStorage.removeItem('user');
currentUser = null;
vm.user = null;
updateAuthUI();
window.location.reload();
});
});

function initCatalogEvents(vm){
document.getElementById('searchInput')?.addEventListener('input',function(){
vm.applyFilters();renderProducts(vm);
});
document.querySelectorAll('#filterCat,#filterMin,#filterMax,#filterBrand,#filterRating,#filterStock').forEach(el=>{
el?.addEventListener('change',function(){vm.applyFilters();renderProducts(vm);});
});
document.getElementById('sortSelect')?.addEventListener('change',function(){vm.applyFilters();renderProducts(vm);});
document.getElementById('loadMore')?.addEventListener('click',function(){vm.loadMore();renderProducts(vm);});
document.getElementById('gridView')?.addEventListener('click',function(){vm.view='grid';this.classList.add('active');document.getElementById('listView').classList.remove('active');renderProducts(vm);});
document.getElementById('listView')?.addEventListener('click',function(){vm.view='list';this.classList.add('active');document.getElementById('gridView').classList.remove('active');renderProducts(vm);});
}

function initCartEvents(vm){
document.getElementById('checkoutBtn')?.addEventListener('click',function(){
if(!currentUser){showNotif('войдите в систему');return;}
if(vm.cart.length===0){showNotif('корзина пуста');return;}
const order=addOrder(currentUser.id,vm.cart,vm.getTotal());
if(order){vm.cart=[];saveCart();renderCart(vm);vm.updateCounters();showNotif('заказ оформлен!');}
});
}

function initFavEvents(vm){}

function initProfileEvents(vm){
document.getElementById('saveProfile')?.addEventListener('click',function(){
const name=document.getElementById('editName').value;
const email=document.getElementById('editEmail').value;
if(name&&email){
const updated=updateUser(vm.user.id,{name,email});
if(updated){vm.user=updated;currentUser=updated;localStorage.setItem('user',JSON.stringify(updated));renderProfile(vm);showNotif('профиль обновлен');}
}
});
}

function initGameEvents(vm){
document.getElementById('spinBtn')?.addEventListener('click',function(){
const bonus=Math.floor(Math.random()*200)+50;
const user=getUser(vm.user.id);
if(user){user.bonus=(user.bonus||0)+bonus;updateUser(user.id,user);vm.user=user;currentUser=user;localStorage.setItem('user',JSON.stringify(user));document.getElementById('gameBonus').textContent=user.bonus;document.getElementById('gameResult').textContent=`+${bonus} бонусов!`;renderGame(vm);showNotif(`выиграно ${bonus} бонусов!`);}
});
}

function initSlider(){
let idx=0;
const track=document.getElementById('sliderTrack');
const prev=document.getElementById('sliderPrev');
const next=document.getElementById('sliderNext');
function goTo(i){idx=(i+3)%3;if(track)track.style.transform=`translateX(-${idx*100}%)`;}
if(prev)prev.onclick=function(){goTo(idx-1);resetInterval();};
if(next)next.onclick=function(){goTo(idx+1);resetInterval();};
function resetInterval(){clearInterval(sliderInterval);sliderInterval=setInterval(function(){goTo(idx+1);},4000);}
sliderInterval=setInterval(function(){goTo(idx+1);},4000);
}

function initAuth(vm){
const modal=document.getElementById('authModal');
const loginBtn=document.getElementById('loginBtn');
const closeBtn=document.getElementById('modalClose');
const tabs=document.querySelectorAll('.tab');
const loginForm=document.getElementById('loginForm');
const registerForm=document.getElementById('registerForm');

if(loginBtn)loginBtn.onclick=function(){modal.style.display='flex';};
if(closeBtn)closeBtn.onclick=function(){modal.style.display='none';};
modal.onclick=function(e){if(e.target===modal)modal.style.display='none';};

tabs.forEach(t=>{
t.onclick=function(){
tabs.forEach(x=>x.classList.remove('active'));
this.classList.add('active');
const tab=this.dataset.tab;
loginForm.style.display=tab==='login'?'block':'none';
registerForm.style.display=tab==='register'?'block':'none';
};
});

if(loginForm){
loginForm.onsubmit=function(e){
e.preventDefault();
const email=document.getElementById('loginEmail').value;
const pass=document.getElementById('loginPass').value;
const u=findUser(email,pass);
if(u){
currentUser=u;
localStorage.setItem('token',btoa(email+':'+pass));
localStorage.setItem('user',JSON.stringify(u));
vm.user=u;
modal.style.display='none';
showNotif('добро пожаловать!');
updateAuthUI();
window.location.reload();
} else {
showNotif('неверные данные','error');
}
};
}

if(registerForm){
registerForm.onsubmit=function(e){
e.preventDefault();
const name=document.getElementById('regName').value;
const email=document.getElementById('regEmail').value;
const pass=document.getElementById('regPass').value;
if(DB.users.find(u=>u.email===email)){showNotif('email уже используется','error');return;}
const u={id:Date.now(),email,pass:btoa(pass),name,bonus:100,orders:[],favs:[],reviews:[]};
DB.users.push(u);saveUsers();
currentUser=u;
localStorage.setItem('token',btoa(email+':'+pass));
localStorage.setItem('user',JSON.stringify(u));
vm.user=u;
modal.style.display='none';
showNotif('регистрация успешна!');
updateAuthUI();
window.location.reload();
};
}
}

function initTheme(){
const btn=document.getElementById('themeToggle');
if(!btn)return;
const dark=localStorage.getItem('theme')||'dark';
document.documentElement.setAttribute('data-theme',dark);
btn.onclick=function(){
const current=document.documentElement.getAttribute('data-theme');
const next=current==='dark'?'light':'dark';
document.documentElement.setAttribute('data-theme',next);
localStorage.setItem('theme',next);
};
}

function initAccess(){
const btn=document.getElementById('accessToggle');
if(!btn)return;
btn.onclick=function(){
document.body.classList.toggle('access-mode');
};
}

function addToCartAction(id){
const vm=window.__vm;
if(vm){vm.addToCart(id);vm.updateCounters();showNotif('добавлено в корзину');}
}

function toggleFavAction(id){
const vm=window.__vm;
if(vm){vm.toggleFav(id);vm.updateCounters();renderProducts(vm);}
}

function removeFromCartAction(id){
const vm=window.__vm;
if(vm){vm.removeFromCart(id);renderCart(vm);vm.updateCounters();showNotif('удалено из корзины');}
}

function updateQty(id,qty){
const vm=window.__vm;
if(vm){if(qty<=0)vm.removeFromCart(id);else{const item=vm.cart.find(i=>i.id===id);if(item)item.qty=qty;saveCart();}renderCart(vm);vm.updateCounters();}
}

function showNotif(msg,type='info'){
const d=document.createElement('div');
d.style.cssText='position:fixed;bottom:20px;right:20px;background:var(--bg2);border:1px solid var(--border);padding:12px 24px;color:var(--fg);z-index:9999;border-radius:8px;animation:fadeIn .3s;max-width:300px;';
d.textContent=msg;
document.body.appendChild(d);
setTimeout(()=>d.remove(),3000);
}

window.addToCartAction=addToCartAction;
window.toggleFavAction=toggleFavAction;
window.removeFromCartAction=removeFromCartAction;
window.updateQty=updateQty;
window.viewProduct=viewProduct;
window.showNotif=showNotif;