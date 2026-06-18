class ProductModel{
constructor(data){Object.assign(this,data);}
get discounted(){return this.price*0.9;}
get inStock(){return this.stock>0;}
get stars(){return '★'.repeat(Math.floor(this.rating))+'☆'.repeat(5-Math.floor(this.rating));}
}

class UserModel{
constructor(data){Object.assign(this,data);}
get fullName(){return this.name||'Пользователь';}
get bonusPoints(){return this.bonus||0;}
get orderCount(){return this.orders?this.orders.length:0;}
}

class CartModel{
constructor(items){this.items=items||[];}
get total(){return this.items.reduce((s,i)=>s+i.price*i.qty,0);}
get count(){return this.items.reduce((s,i)=>s+i.qty,0);}
get isEmpty(){return this.items.length===0;}
}

class OrderModel{
constructor(data){Object.assign(this,data);}
get formattedDate(){return new Date(this.date).toLocaleDateString('ru-RU');}
get totalSum(){return this.items.reduce((s,i)=>s+i.price*i.qty,0);}
}

class ReviewModel{
constructor(data){Object.assign(this,data);}
get formattedDate(){return new Date(this.date).toLocaleDateString('ru-RU');}
get userName(){const u=getUser(this.userId);return u?u.name:'Аноним';}
}