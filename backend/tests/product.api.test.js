// Tests the controllers, validators, service rules and error handler against an in-memory fake
// Product model, so no MongoDB is needed.   Run: npm test
const path=require('path'),assert=require('assert'),test=require('node:test');
const B=path.join(__dirname,'..','src')+'/';
// ---- fake in-memory Product model (mongoose is not installed in this sandbox) ----
let seq=1; const docs=[];
const ci=(a,b)=>String(a).toLowerCase()===String(b).toLowerCase();
function match(f,d){
  if(f.$or && !f.$or.some(c=>Object.entries(c).every(([k,rx])=>rx.test(d[k])))) return false;
  if(f.category && f.category!==d.category) return false;
  if(f.price){ if(f.price.$gte!==undefined&&d.price<f.price.$gte) return false; if(f.price.$lte!==undefined&&d.price>f.price.$lte) return false;}
  if(f.title && !ci(f.title,d.title)) return false;
  if(f._id && f._id.$ne && String(f._id.$ne)===d._id) return false;
  if(f.id!==undefined){ if(f.id && f.id.$in){ if(!f.id.$in.includes(d.id)) return false; } else if(f.id!==d.id) return false; }
  return true;
}
class Q{constructor(fn){this.fn=fn;this.o={};this.n=0;this.l=1e9;}
 sort(o){this.o=o;return this} skip(n){this.n=n;return this} limit(n){this.l=n;return this} collation(){return this} select(){return this}
 then(res,rej){try{let r=this.fn();if(Array.isArray(r)){const ks=Object.keys(this.o);r=[...r].sort((a,b)=>{for(const k of ks){const g=x=>k.split('.').reduce((v,p)=>v[p],x);if(g(a)!==g(b))return (g(a)>g(b)?1:-1)*this.o[k]}return 0}).slice(this.n,this.n+this.l)}return Promise.resolve(r).then(res,rej)}catch(e){return Promise.reject(e).then(res,rej)}}}
const mk=d=>Object.assign(d,{set(o){Object.assign(this,o)},async save(){return this},toJSON(){const{set,save,toJSON,...r}=this;r.id=r._id;delete r._id;return r}});
const Product={DEFAULT_IMAGE:'images/placeholder.svg',
 find:f=>new Q(()=>docs.filter(d=>match(f,d))),
 countDocuments:async f=>docs.filter(d=>match(f,d)).length,
 findOne:f=>new Q(()=>docs.find(d=>match(f,d))||null),
 findOneAndDelete:async f=>{const i=docs.findIndex(d=>d.id===f.id);return i<0?null:docs.splice(i,1)[0]},
 distinct:async k=>[...new Set(docs.map(d=>d[k]))],
 create:async d=>{const n=seq++;const x=mk({_id:'mongo'+n,id:n,...d});docs.push(x);return x}};
const mp=require.resolve(B+'models/product.model.js');
require.cache[mp]={id:mp,filename:mp,loaded:true,exports:Product};

const ctrl=require(B+'controllers/product.controller'); const cartCtrl=require(B+'controllers/cart.controller'); const CV=require(B+'middleware/cart.validator'); const V=require(B+'middleware/product.validator'); const eh=require(B+'middleware/errorHandler');
// run validators then controller like the router does
function call(chain,req){return new Promise(resolve=>{
 const res={statusCode:200,status(c){this.statusCode=c;return this},json(b){resolve({status:this.statusCode,body:b})}};
 req={params:{},query:{},body:{},...req}; let i=0;
 const next=err=>{ if(err) return eh(err,req,res,()=>{}); const h=chain[i++]; if(h) h(req,res,next); };
 next();});}
const body=(o={})=>({title:'Gold Ring',price:999,description:'A nice gold ring for everyone.',category:'Jewelry',...o});
test('product CRUD flow with validation and error handling', async()=>{
 let r=await call([V.validateProductBody,ctrl.createProduct],{body:body()}); assert(r.status===201&&r.body.data.category==='jewelry','create');
 const id=String(r.body.data.id); assert.strictEqual(r.body.data.id,1,'first product gets id 1');
 r=await call([V.validateProductBody,ctrl.createProduct],{body:body({title:'gold RING'})}); assert(r.status===409,'duplicate title '+r.status);
 r=await call([V.validateProductBody,ctrl.createProduct],{body:body({price:-1})}); assert(r.status===400&&r.body.errors[0].field==='price','invalid');
 await call([V.validateProductBody,ctrl.createProduct],{body:body({title:'Silver Watch',price:500,category:'watches'})});
 await call([V.validateProductBody,ctrl.createProduct],{body:body({title:'Black Bag (xl)',price:1500,category:'bags'})});
 r=await call([V.validateProductQuery,ctrl.getProducts],{query:{}}); assert(r.body.total===3&&r.body.pages===1);
 r=await call([V.validateProductQuery,ctrl.getProducts],{query:{sort:'low-high'}}); assert(r.body.data[0].title==='Silver Watch','sort');
 r=await call([V.validateProductQuery,ctrl.getProducts],{query:{search:'(xl)'}}); assert(r.body.total===1,'regex-escaped search');
 r=await call([V.validateProductQuery,ctrl.getProducts],{query:{search:'.*'}}); assert(r.body.total===0,'.* treated as text');
 r=await call([V.validateProductQuery,ctrl.getProducts],{query:{category:'Bags',minPrice:'1000'}}); assert(r.body.total===1);
 r=await call([V.validateProductQuery,ctrl.getProducts],{query:{limit:'2',page:'2'}}); assert(r.body.count===1&&r.body.pages===2,'pagination');
 r=await call([V.validateProductQuery,ctrl.getProducts],{query:{sort:'bad'}}); assert(r.status===400);
 r=await call([V.validateProductId,ctrl.getProduct],{params:{id:'999'}}); assert(r.status===404,'not found');
 r=await call([V.validateProductId,ctrl.getProduct],{params:{id:'abc'}}); assert(r.status===400,'bad id');
 r=await call([V.validateProductId,V.validateProductBody,ctrl.updateProduct],{params:{id},body:body({price:1200,title:'Gold Ring XL'})});
 assert(r.status===200&&r.body.data.price===1200&&r.body.data.stock===0,'update resets defaults');
 r=await call([V.validateProductId,V.validateProductBody,ctrl.updateProduct],{params:{id},body:body({title:'silver watch'})}); assert(r.status===409,'update dup');
 r=await call([V.validateProductId,ctrl.deleteProduct],{params:{id}}); assert(r.status===200);
 r=await call([V.validateProductId,ctrl.deleteProduct],{params:{id}}); assert(r.status===404,'delete twice');
 r=await call([ctrl.getCategories],{}); assert(r.body.data.join()==='bags,watches');

 // ---- cart summary: server decides the price, browser prices are ignored ----
 await call([V.validateProductBody,ctrl.createProduct],{body:body({title:'Cap',price:200,category:'hats',stock:5})});
 const capId=(await call([V.validateProductQuery,ctrl.getProducts],{query:{search:'cap'}})).body.data[0].id;
 r=await call([CV.validateCartItems,cartCtrl.getSummary],{body:{items:[{productId:capId,quantity:2,price:1},{productId:capId,quantity:1}]}});
 assert(r.status===200&&r.body.data.total===600&&r.body.data.itemCount===3&&r.body.data.items.length===1,'summary ignores client price, merges duplicates');
 r=await call([CV.validateCartItems,cartCtrl.getSummary],{body:{items:[{productId:capId,quantity:6}]}}); assert(r.status===409&&/in stock/.test(r.body.errors[0].message),'stock rule');
 r=await call([CV.validateCartItems,cartCtrl.getSummary],{body:{items:[{productId:9999,quantity:1}]}}); assert(r.status===409,'unknown product');
 r=await call([CV.validateCartItems,cartCtrl.getSummary],{body:{items:[{productId:'x',quantity:0}]}}); assert(r.status===400&&r.body.errors.length===2,'bad cart input');
 r=await call([CV.validateCartItems,cartCtrl.getSummary],{body:{items:[]}}); assert(r.status===400,'empty cart');
 });
