function renderProducts(vm){
const c=document.getElementById('productsContainer');
if(!c)return;
const list=vm.getPage();
c.className='product-grid'+(vm.view==='list'?' list-view':'');
c.innerHTML=list.map(p=>`
<div class="product-card" onclick="viewProduct(${p.id})">
<img src="${p.img || 'https://via.placeholder.com/300x200/1a1a1a/666?text=No+Image'}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/300x200/1a1a1a/666?text=No+Image'">
<h4>${p.title}</h4>
<div class="rating">${p.stars} ${p.rating}</div>
<div class="price">${p.price} ₽</div>
<div class="actions">
<button onclick="event.stopPropagation();addToCartAction(${p.id})"><i class="fas fa-shopping-bag"></i> В корзину</button>
<button onclick="event.stopPropagation();toggleFavAction(${p.id})" style="color:${vm.isFav(p.id)?'var(--fg)':'var(--fg2)'}"><i class="fas fa-heart"></i></button>
</div>
</div>
`).join('');
const more=document.getElementById('loadMore');
if(more)more.style.display=vm.filtered.length>list.length?'block':'none';
}

function renderCart(vm){
const c=document.getElementById('cartContainer');
if(!c)return;
if(vm.cart.length===0){c.innerHTML='<p style="color:var(--fg2);padding:60px 0;text-align:center;font-size:18px">корзина пуста</p>';return;}
c.innerHTML=vm.cart.map(i=>`
<div class="cart-item">
<div style="display:flex;align-items:center;gap:12px">
<img src="${i.img || 'https://via.placeholder.com/50x50/1a1a1a/666?text=No'}" style="width:50px;height:50px;object-fit:cover;border-radius:6px">
<span>${i.title}</span>
</div>
<div>${i.price} ₽</div>
<div class="qty">
<button onclick="updateQty(${i.id},${i.qty-1})">−</button>
<span style="min-width:30px;text-align:center">${i.qty}</span>
<button onclick="updateQty(${i.id},${i.qty+1})">+</button>
</div>
<button onclick="removeFromCartAction(${i.id})" style="background:transparent;border:none;color:var(--fg2);cursor:pointer;font-size:20px;padding:0 8px">×</button>
</div>
`).join('');
const total=document.getElementById('cartTotal');
if(total)total.innerHTML=`<span>итого: ${vm.getTotal()} ₽</span>`;
const chk=document.getElementById('checkoutBtn');
if(chk)chk.style.display=vm.cart.length>0&&currentUser?'block':'none';
}

function renderFavs(vm){
const c=document.getElementById('favoritesContainer');
if(!c)return;
const list=vm.favs.map(id=>vm.products.find(p=>p.id===id)).filter(Boolean);
if(list.length===0){c.innerHTML='<p style="color:var(--fg2);padding:60px 0;text-align:center;font-size:18px">нет избранных товаров</p>';return;}
c.innerHTML=list.map(p=>`
<div class="product-card" onclick="viewProduct(${p.id})">
<img src="${p.img || 'https://via.placeholder.com/300x200/1a1a1a/666?text=No+Image'}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/300x200/1a1a1a/666?text=No+Image'">
<h4>${p.title}</h4>
<div class="price">${p.price} ₽</div>
<div class="actions">
<button onclick="event.stopPropagation();addToCartAction(${p.id})"><i class="fas fa-shopping-bag"></i> В корзину</button>
<button onclick="event.stopPropagation();toggleFavAction(${p.id})"><i class="fas fa-heart" style="color:var(--fg)"></i></button>
</div>
</div>
`).join('');
}

function renderProfile(vm){
if(!vm.user){window.location='/';return;}
document.getElementById('profileName').textContent=vm.user.name;
document.getElementById('profileEmail').textContent=vm.user.email;
document.getElementById('bonusCount').textContent=vm.user.bonus||0;
document.getElementById('orderCount').textContent=(vm.user.orders||[]).length;
document.getElementById('editName').value=vm.user.name||'';
document.getElementById('editEmail').value=vm.user.email||'';
const orders=document.getElementById('ordersList');
if(orders){
const ords=getOrders(vm.user.id);
orders.innerHTML=ords.length?ords.map(o=>`<div style="padding:12px;border:1px solid var(--border);border-radius:8px;margin:6px 0">заказ #${o.id} | ${o.items.length} товаров | ${o.total} ₽ | ${new Date(o.date).toLocaleDateString()}</div>`).join(''):'<p style="color:var(--fg2)">нет заказов</p>';
}
const revs=document.getElementById('reviewsList');
if(revs){
const rvs=getUserReviews(vm.user.id);
revs.innerHTML=rvs.length?rvs.map(r=>`<div style="padding:12px;border:1px solid var(--border);border-radius:8px;margin:6px 0">${r.text} | ${'★'.repeat(r.rating)}</div>`).join(''):'<p style="color:var(--fg2)">нет отзывов</p>';
}
}

function renderGame(vm){
if(!vm.user){window.location='/';return;}
document.getElementById('gameBonus').textContent=vm.user.bonus||0;
const codes=document.getElementById('promoCodes');
if(codes){
codes.innerHTML=vm.user.bonus>500?'<div class="promo-code">🎁 PROMO50 - скидка 50%</div><div class="promo-code">🎁 BONUS100 - +100 бонусов</div>':'<div style="color:var(--fg2);padding:20px;text-align:center">накопить 500 бонусов для промокодов</div>';
}
}

function renderRecently(vm){
const c=document.getElementById('recentlyViewed');
if(!c)return;
const list=vm.getRecentProducts().slice(0,4);
c.innerHTML=list.length?list.map(p=>`
<div class="mini-card" onclick="viewProduct(${p.id})">
<img src="${p.img || 'https://via.placeholder.com/150x120/1a1a1a/666?text=No'}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/150x120/1a1a1a/666?text=No'">
<p>${p.title}</p>
<p class="mini-price">${p.price} ₽</p>
</div>
`).join(''):'<p style="color:var(--fg2);padding:20px 0">нет просмотров</p>';
}

function renderPopular(vm){
const c=document.getElementById('popularProducts');
if(!c)return;
const list=vm.getPopularProducts();
c.innerHTML=list.map(p=>`
<div class="mini-card" onclick="viewProduct(${p.id})">
<img src="${p.img || 'https://via.placeholder.com/150x120/1a1a1a/666?text=No'}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/150x120/1a1a1a/666?text=No'">
<p>${p.title}</p>
<p class="mini-price">${p.price} ₽</p>
</div>
`).join('');
}

function viewProduct(id){
const vm=window.__vm;
if(vm)vm.addRecent(id);
window.location.href=`/product.html?id=${id}`;
}
