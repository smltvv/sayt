class AppViewModel{
constructor(){
this.products=[];
this.filtered=[];
this.cart=[];
this.favs=[];
this.user=null;
this.view='grid';
this.page=1;
this.perPage=12;
this.recent=[];
}

init(){
this.products=DB.products.map(p=>new ProductModel(p));
this.cart=DB.cart;
this.favs=DB.favorites;
this.user=currentUser;
this.recent=JSON.parse(localStorage.getItem('recent')||'[]');
this.applyFilters();
this.updateCounters();
}

applyFilters(){
let list=[...this.products];
const cat=document.getElementById('filterCat')?.value;
const min=parseInt(document.getElementById('filterMin')?.value)||0;
const max=parseInt(document.getElementById('filterMax')?.value)||Infinity;
const brand=document.getElementById('filterBrand')?.value;
const rating=parseInt(document.getElementById('filterRating')?.value)||0;
const stock=document.getElementById('filterStock')?.checked;
const search=document.getElementById('searchInput')?.value.toLowerCase();

if(cat)list=list.filter(p=>p.cat===cat);
list=list.filter(p=>p.price>=min&&p.price<=max);
if(brand)list=list.filter(p=>p.brand===brand);
if(rating)list=list.filter(p=>p.rating>=rating);
if(stock)list=list.filter(p=>p.inStock);
if(search)list=list.filter(p=>p.title.toLowerCase().includes(search));

const sort=document.getElementById('sortSelect')?.value;
if(sort==='price_asc')list.sort((a,b)=>a.price-b.price);
else if(sort==='price_desc')list.sort((a,b)=>b.price-a.price);
else if(sort==='rating')list.sort((a,b)=>b.rating-a.rating);
else list.sort((a,b)=>b.id-a.id);

this.filtered=list;
this.page=1;
return list;
}

getPage(){
const start=0;
const end=this.page*this.perPage;
return this.filtered.slice(start,end);
}

loadMore(){
this.page++;
return this.getPage();
}

addToCart(id){
const p=this.products.find(x=>x.id===id);
if(!p)return;
const item=this.cart.find(i=>i.id===id);
if(item){item.qty++;}else{this.cart.push({id,title:p.title,price:p.price,qty:1,img:p.img});}
saveCart();
this.updateCounters();
}

removeFromCart(id){
this.cart=this.cart.filter(i=>i.id!==id);
saveCart();
this.updateCounters();
}

toggleFav(id){
const idx=this.favs.indexOf(id);
if(idx>-1)this.favs.splice(idx,1);
else this.favs.push(id);
saveFavs();
this.updateCounters();
}

isFav(id){return this.favs.includes(id);}

addRecent(id){
this.recent=this.recent.filter(x=>x!==id);
this.recent.unshift(id);
if(this.recent.length>10)this.recent.pop();
localStorage.setItem('recent',JSON.stringify(this.recent));
}

getRecentProducts(){
return this.recent.map(id=>this.products.find(p=>p.id===id)).filter(Boolean);
}

getPopularProducts(){
return [...this.products].sort((a,b)=>b.rating-a.rating).slice(0,4);
}

updateCounters(){
const c=document.getElementById('cartCount');
const f=document.getElementById('favCount');
if(c)c.textContent=this.cart.reduce((s,i)=>s+i.qty,0);
if(f)f.textContent=this.favs.length;
}

getTotal(){
return this.cart.reduce((s,i)=>s+i.price*i.qty,0);
}
}