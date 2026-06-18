let DB={products:[],users:[],cart:[],favorites:[],orders:[],reviews:[]};
let currentUser=null;
let authToken=null;
const API='https://dummyjson.com/products';

async function loadProducts(){
try{
const r=await fetch(API+'?limit=100');
const d=await r.json();
DB.products=d.products.map(p=>({id:p.id,title:p.title,price:p.price,desc:p.description,cat:p.category,brand:p.brand,rating:p.rating,stock:p.stock,img:p.thumbnail,images:p.images}));
localStorage.setItem('products',JSON.stringify(DB.products));
}catch(e){
DB.products=JSON.parse(localStorage.getItem('products')||'[]');
}
}

function loadUsers(){
DB.users=JSON.parse(localStorage.getItem('users')||'[]');
if(!DB.users.find(u=>u.email==='liubovsheyda@gmail.com')){
DB.users.push({id:999,email:'liubovsheyda@gmail.com',pass:btoa('Teacher_2026'),name:'Преподаватель',bonus:1000,orders:[],favs:[],reviews:[]});
localStorage.setItem('users',JSON.stringify(DB.users));
}
}

function loadCart(){DB.cart=JSON.parse(localStorage.getItem('cart')||'[]');}
function loadFavs(){DB.favorites=JSON.parse(localStorage.getItem('favorites')||'[]');}
function loadOrders(){DB.orders=JSON.parse(localStorage.getItem('orders')||'[]');}
function loadReviews(){DB.reviews=JSON.parse(localStorage.getItem('reviews')||'[]');}
function saveCart(){localStorage.setItem('cart',JSON.stringify(DB.cart));}
function saveFavs(){localStorage.setItem('favorites',JSON.stringify(DB.favorites));}
function saveUsers(){localStorage.setItem('users',JSON.stringify(DB.users));}
function saveOrders(){localStorage.setItem('orders',JSON.stringify(DB.orders));}
function saveReviews(){localStorage.setItem('reviews',JSON.stringify(DB.reviews));}

function findUser(email,pass){
return DB.users.find(u=>u.email===email&&u.pass===btoa(pass));
}

function getUser(id){return DB.users.find(u=>u.id===id);}

function updateUser(id,data){
const idx=DB.users.findIndex(u=>u.id===id);
if(idx>-1){DB.users[idx]={...DB.users[idx],...data};saveUsers();return DB.users[idx];}
return null;
}

function addOrder(userId,items,total){
const order={id:Date.now(),userId,items,total,date:new Date().toISOString(),status:'новый'};
DB.orders.push(order);saveOrders();
const u=getUser(userId);if(u){u.orders.push(order.id);updateUser(userId,u);}
return order;
}

function addReview(productId,userId,text,rating){
const rev={id:Date.now(),productId,userId,text,rating,date:new Date().toISOString()};
DB.reviews.push(rev);saveReviews();
const u=getUser(userId);if(u){u.reviews.push(rev.id);updateUser(userId,u);}
return rev;
}

function getProductReviews(id){return DB.reviews.filter(r=>r.productId===id);}
function getProduct(id){return DB.products.find(p=>p.id===id);}
function getCartTotal(){return DB.cart.reduce((s,i)=>s+i.price*i.qty,0);}
function getFavs(){return DB.favorites.map(id=>getProduct(id)).filter(Boolean);}
function getOrders(userId){return DB.orders.filter(o=>o.userId===userId);}
function getUserReviews(userId){return DB.reviews.filter(r=>r.userId===userId);}

function addToCart(id,qty=1){
const exist=DB.cart.find(i=>i.id===id);
if(exist){exist.qty+=qty;}else{const p=getProduct(id);if(p)DB.cart.push({id,title:p.title,price:p.price,qty,img:p.img});}
saveCart();return DB.cart;
}

function removeFromCart(id){
DB.cart=DB.cart.filter(i=>i.id!==id);
saveCart();return DB.cart;
}

function updateCartQty(id,qty){
const item=DB.cart.find(i=>i.id===id);
if(item){item.qty=qty;if(qty<=0)DB.cart=DB.cart.filter(i=>i.id!==id);saveCart();}
return DB.cart;
}

function toggleFav(id){
const idx=DB.favorites.indexOf(id);
if(idx>-1){DB.favorites.splice(idx,1);}else{DB.favorites.push(id);}
saveFavs();return DB.favorites;
}

function isFav(id){return DB.favorites.includes(id);}

let slideIdx=0;
function nextSlide(){slideIdx=(slideIdx+1)%3;return slideIdx;}
function prevSlide(){slideIdx=(slideIdx-1+3)%3;return slideIdx;}