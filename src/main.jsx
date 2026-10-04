import React, { useEffect, useMemo, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Clock3, Crown, MapPin, Minus, PackageCheck, Plus, Search, ShoppingBag,
  Truck, Utensils, X, CreditCard, ShieldCheck, Settings2, WalletCards, Pencil, Save, Eye, EyeOff, Trash2, CircleHelp
} from "lucide-react";
import "./styles.css";
import InstallApp from "./InstallApp.jsx";
import PaymentReturn from "./PaymentReturn.jsx";
import { initialMenu, initialCategories } from "./catalog.js";
import { db, configured, readCatalog, saveCatalog, adminOrders, placeOrder, trackOrders, request } from "./store.js";

/* FCC-001 shared-ordering milestone.
   The server and Neon own authentication, the catalogue, orders and audit records.
   This device stores only the cart, retry identifier and private tracking tokens.
   Card checkout remains gated until verified webhook processing is implemented.
*/

const defaultAddons = [];
const initialSettings = { restaurantName: "FOURTH CROWN", tagline: "The Taste of Ghana, Delivered.", pickupAddress: "Atlanta, Georgia", phone: "850 465 6422", minimumOrder: 0, deliveryFee: 5, taxRate: 0, acceptingOrders: false };

function money(value) {
  if (value === null || value === undefined) return "Price coming soon";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [view, setView] = useState("home");
  const [menu, setMenu] = useState(initialMenu);
  const [categories, setCategories] = useState(initialCategories);
  const [settings, setSettings] = useState(initialSettings);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(() => load("fcc_cart_v2", []));
  const [selectedCategory, setSelectedCategory] = useState("popular");
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const adminRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const isAdminPage = window.location.pathname === "/admin";
  const edit = setter => value => { dirtyRef.current = true; setDirty(true); setter(value); };

  // Catalog and orders are shared; only the cart and private tracking tokens stay on this device.
  useEffect(() => localStorage.setItem("fcc_cart_v2", JSON.stringify(cart)), [cart]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2200); return () => clearTimeout(id); }, [toast]);
  useEffect(() => {
    if (!db) return;
    let active = true;
    async function refresh() {
      try {
        const data = await readCatalog();
        if (!active) return;
        if (!dirtyRef.current) { setMenu(data.menu); setCategories(data.categories); setSettings(data.settings); }
        const list = isAdminPage && adminRef.current ? await adminOrders() : await trackOrders();
        if (active) { setOrders(list); setError(""); }
      } catch (e) { if (active) setError(e.message); }
      finally { if (active) setLoading(false); }
    }
    refresh();
    const timer = setInterval(refresh, 15000);
    async function checkSession() {
      const { data, error: roleError } = await db.rpc("is_admin");
      if (!active) return;
      adminRef.current = !roleError && data === true;
      setAdminAuthed(adminRef.current);
      if (isAdminPage) { setOrders([]); dirtyRef.current = false; setDirty(false); refresh(); }
    }
    checkSession();
    const { data: listener } = db.auth.onAuthStateChange(() => { setTimeout(checkSession, 0); });
    return () => { active = false; clearInterval(timer); listener.subscription.unsubscribe(); };
  }, []);
  async function persistCatalog() {
    setSaving(true); setError("");
    try { await saveCatalog(menu, categories, settings); dirtyRef.current = false; setDirty(false); showToast({name:"Changes saved"}); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function logout() {
    await db?.auth.signOut(); adminRef.current = false; setAdminAuthed(false); setOrders([]);
    dirtyRef.current = false; setDirty(false);
    if (db) { const data = await readCatalog(); setMenu(data.menu); setCategories(data.categories); setSettings(data.settings); }
  }
  const cartCount = cart.reduce((s, x) => s + x.quantity, 0);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  function showToast(item) {
    setToast({ name: item.name, id: Date.now() });
  }

  function addToCart(item, addon = null) {
    if (!configured || !settings.acceptingOrders || !item.available || item.price === null) return;
    const key = `${item.id}-${addon?.id || "none"}`;
    setCart(current => {
      const existing = current.find(x => x.key === key);
      if (existing) return current.map(x => x.key === key ? { ...x, quantity: x.quantity + 1 } : x);
      return [...current, { key, itemId: item.id, name: item.name, price: item.price + (addon?.price || 0), quantity: 1, addon: addon?.name || "", addonIds: addon?.ids || (addon?.id ? addon.id.split("+") : []), image: item.image }];
    });
    setSelectedItem(null);
    showToast(item);
  }

  function changeQty(key, delta) {
    setCart(current => current.flatMap(item => {
      if (item.key !== key) return [item];
      const quantity = item.quantity + delta;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  }

  async function createOrder(customer, idempotencyKey) {
    const order = await placeOrder(customer, cart, idempotencyKey);
    setOrders(current => [order, ...current.filter(o => o.id !== order.id)]);
    setCart([]); setView("orders");
    if (["stripe","paypal"].includes(customer.paymentMethod)) {
      const saved={id:order.id,token:order.trackingToken};localStorage.setItem("fcc_pending_payment",JSON.stringify(saved));
      localStorage.removeItem("fcc_order_key_v2");
      try{const payment=await request("payment-start",saved);if(!payment.url)throw new Error("Payment approval link unavailable");window.location.assign(payment.url);}catch(e){setError("Your order was saved but payment could not start. Retry from My Orders. "+e.message);}
    }
  }
  async function updateOrderStatus(id, status) {
    try {
      const { error: e } = await db.rpc("set_order_status", {p_order_id:id, p_status:status});
      if (e) throw e;
      setOrders(await adminOrders());
    } catch(e) { setError(e.message); }
  }
  const notice = <div className="system-notice" role="status">{loading ? "Loading restaurant…" : !configured ? "Preview mode. Ordering is unavailable until restaurant setup is complete." : error || (!settings.acceptingOrders ? "Online ordering is currently paused." : "")}</div>;
  if (window.location.pathname === "/payment-success") return <PaymentReturn/>;
  if (isAdminPage) return <>{notice}<AdminView authed={adminAuthed} menu={menu} setMenu={edit(setMenu)} categories={categories} setCategories={edit(setCategories)} settings={settings} setSettings={edit(setSettings)} orders={orders} updateOrderStatus={updateOrderStatus} logout={logout} onSave={persistCatalog} dirty={dirty} saving={saving}/></>;

  return (
    <div className="app-shell">
      {notice}<InstallApp/><Header cartCount={cartCount} onNavigate={setView} />
      {view === "home" && <Home menu={menu} onBrowse={() => setView("menu")} settings={settings} onAdd={addToCart} />}
      {view === "menu" && <MenuView menu={menu} categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onSelect={setSelectedItem} onAdd={addToCart} />}
      {view === "cart" && <CartView cart={cart} total={cartTotal} onQty={changeQty} onCheckout={() => setView("checkout")} onBrowse={() => setView("menu")} />}
      {view === "checkout" && <CheckoutView settings={settings} cart={cart} total={cartTotal} onSubmit={createOrder} onBack={() => setView("cart")} />}
      {view === "orders" && <OrdersView orders={orders} />}

      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={addToCart} />}
      {toast && <AddToast name={toast.name} onClose={() => setToast(null)} onViewCart={() => { setToast(null); setView("cart"); }} />}
      {view !== "admin" && !toast && <CartFloat count={cartCount} total={cartTotal} onClick={() => setView("cart")} />}
    </div>
  );
}

function Header({ cartCount, onNavigate }) {
  return <>
    <header className="site-header fc-modern-header">
      <button className="brand fc-brand" onClick={() => onNavigate("home")} aria-label="FOURTH CROWN home">
        <img className="brand-logo" src="/images/fourth-crown-logo-transparent.png" alt="FOURTH CROWN" />
      </button>
      <nav className="fc-nav">
        <button onClick={() => onNavigate("home")}>Home</button>
        <button onClick={() => onNavigate("menu")}>Menu</button>
        <button onClick={() => onNavigate("orders")}>My Orders</button>
        <button className="nav-cart fc-cart-nav" onClick={() => onNavigate("cart")}><ShoppingBag size={16}/> Cart <span>{cartCount}</span></button>
      </nav>
    </header>
    <nav className="fc-mobile-nav" aria-label="Mobile navigation">
      <button onClick={() => onNavigate("home")}><span className="mobile-nav-icon">⌂</span><span>Home</span></button>
      <button onClick={() => onNavigate("menu")}><Utensils size={18}/><span>Menu</span></button>
      <button onClick={() => onNavigate("cart")} className="mobile-cart"><ShoppingBag size={18}/><span>Cart</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
    </nav>
  </>;
}

function Home({ menu, onBrowse, settings, onAdd }) {
  const featured = [menu[0], menu[1], menu[8]];
  const best = [menu[0], menu[12], menu[13]];
  const [serviceSlide, setServiceSlide] = useState(0);
  const [foodSlide, setFoodSlide] = useState(0);
  const foodCarousel = menu.slice(0, 8);
  const serviceStories = [
    {
      title: "Served with care",
      label: "FROM OUR KITCHEN",
      text: "Our team prepares each order with the same care you would expect from a meal made for family — packed fresh and ready to enjoy.",
      image: "https://images.pexels.com/photos/3796810/pexels-photo-3796810.jpeg?auto=compress&cs=tinysrgb&w=1600"
    },
    {
      title: "Pickup, ready when you are",
      label: "EASY PICKUP",
      text: "Order ahead, arrive at the pickup point and collect a carefully packed Ghanaian meal without the wait.",
      image: "https://images.pexels.com/photos/6969978/pexels-photo-6969978.jpeg?cs=srgb&dl=pexels-mikhail-nilov-6969978.jpg&fm=jpg"
    },
    {
      title: "Delivered to your door",
      label: "DELIVERY",
      text: "When you would rather stay home, choose delivery and let your FOURTH CROWN meal make its way to you.",
      image: "https://images.pexels.com/photos/7363064/pexels-photo-7363064.jpeg?cs=srgb&dl=pexels-rdne-7363064.jpg&fm=jpg"
    }
  ];

  useEffect(() => {
    const timer = window.setInterval(() => setServiceSlide(current => (current + 1) % serviceStories.length), 4200);
    const foodTimer = window.setInterval(() => setFoodSlide(current => (current + 1) % foodCarousel.length), 3200);
    return () => { window.clearInterval(timer); window.clearInterval(foodTimer); };
  }, [serviceStories.length]);

  return <main className="fc-home">
    <section className="fc-hero">
      <div className="fc-hero-copy">
        <div className="fc-kicker"><span></span> ATLANTA · GHANAIAN FOOD</div>
        <h1>Bold flavour.<br/><em>Ghanaian soul.</em></h1>
        <p>Real Ghanaian dishes, freshly prepared and delivered across Atlanta — or ready when you arrive for pickup.</p>
        <div className="fc-hero-actions"><button className="fc-primary" onClick={onBrowse}>Explore menu <ArrowRight size={17}/></button><button className="fc-ghost" onClick={onBrowse}>Order now</button></div>
        <div className="fc-hero-meta"><span>01</span><i></i><span>Freshly prepared · Pickup & delivery</span></div>
      </div>
      <div className="fc-hero-art">
        <div className="fc-art-orbit"></div>
        <div className="fc-food-main"><img src={featured[0].image} alt="Ghanaian jollof rice with chicken and plantain"/><span>GHANAIAN<br/>JOLLOF</span></div>
        <div className="fc-food-small fc-food-small-one"><img src={featured[1].image} alt="Gari Fortor with fried plantain"/></div>
        <div className="fc-food-small fc-food-small-two"><img src={featured[2].image} alt="Kelewele"/></div>
        <div className="fc-art-note"><b>Made with Ghanaian soul.</b><span>Prepared fresh. Packed with care.</span></div>
      </div>
    </section>

    <section className="fc-craving">
      <div className="fc-craving-copy">
        <span className="fc-label">WHAT ARE YOU CRAVING FOR?</span>
        <h2>Choose your plate.<br/><em>Know what goes in it.</em></h2>
        <p>Every FOURTH CROWN plate starts with familiar Ghanaian ingredients — slow-cooked tomato, fresh pepper, warm spices and carefully selected proteins.</p>
        <div className="ingredient-cloud">{["Tomato", "Red pepper", "Onion", "Ginger", "Garlic", "Plantain", "Gari", "Rice", "Ghanaian spices"].map(x => <span key={x}>{x}</span>)}</div>
      </div>
      <div className="fc-craving-side">
        <div className="fc-carousel" aria-label="FOURTH CROWN food carousel">
          {foodCarousel.map((item, index) => <div className={`fc-slide ${index===foodSlide?"active":""}`} key={item.id}>
            <img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/>
            <div className="fc-slide-overlay"><span>0{index+1}</span><div><b>{item.name}</b><small>{(item.ingredients || []).slice(0,5).join(" · ")}</small></div></div>
          </div>)}
          <div className="fc-carousel-dots">{foodCarousel.map((item,index)=><i key={item.id} className={index===foodSlide?"active":""}></i>)}</div>
        </div>
      </div>
    </section>

    <section className="fc-promo fc-service-promo">
      <div className="fc-promo-copy">
        <span className="fc-label">FOURTH CROWN EXPERIENCE</span>
        <h2>Good food deserves<br/><em>a proper moment.</em></h2>
        <p className="fc-promo-lead">We do more than put food in a box. We prepare it with care, pack it beautifully and make getting your meal simple — whether you are picking it up or waiting at home.</p>
        <div className="fc-promo-points">
          <div><span>01</span><strong>Freshly prepared</strong><small>Cooked for your order, not sitting around.</small></div>
          <div><span>02</span><strong>Carefully packed</strong><small>Ready for pickup or a smooth trip to your door.</small></div>
          <div><span>03</span><strong>Your choice</strong><small>Pickup when you are nearby or delivery when you are not.</small></div>
        </div>
        <button className="fc-primary" onClick={onBrowse}>Order your meal <ArrowRight size={16}/></button>
      </div>
      <div className="fc-service-carousel" aria-label="FOURTH CROWN service carousel">
        {serviceStories.map((story, index) => <article className={`fc-service-slide ${index === serviceSlide ? "active" : ""}`} key={story.title}>
          <img src={story.image} alt={story.title} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/>
          <div className="fc-service-overlay"><span>{story.label}</span><h3>{story.title}</h3><p>{story.text}</p></div>
          <b className="fc-service-number">0{index + 1}</b>
        </article>)}
        <div className="fc-service-controls">
          <button aria-label="Previous service slide" onClick={() => setServiceSlide(current => (current - 1 + serviceStories.length) % serviceStories.length)}><ChevronLeft size={17}/></button>
          {serviceStories.map((story, index) => <button key={story.title} className={index === serviceSlide ? "active" : ""} aria-label={`Show ${story.title}`} onClick={() => setServiceSlide(index)}><span></span></button>)}
          <button aria-label="Next service slide" onClick={() => setServiceSlide(current => (current + 1) % serviceStories.length)}><ChevronRight size={17}/></button>
        </div>
      </div>
    </section>

    <section className="fc-section fc-feature-section">
      <div className="fc-section-heading"><div><span className="fc-label">OUR BEST DELIVERED</span><h2>Made to crave.<br/><em>Made to order.</em></h2></div><button className="fc-text-button" onClick={onBrowse}>See all dishes <ArrowRight size={15}/></button></div>
      <div className="fc-dish-grid">
        {best.map((item, i) => <DishCard key={item.id} item={item} index={i} onAdd={onAdd}/>) }
      </div>
    </section>

    <section className="fc-menu-highlight">
      <div className="fc-menu-highlight-head"><div><span className="fc-label">FROM OUR KITCHEN</span><h2>Ghana on your table.</h2></div><button className="fc-primary" onClick={onBrowse}>Explore the menu <ArrowRight size={16}/></button></div>
      <div className="fc-menu-mini-grid">{[menu[1], menu[11], menu[12]].map(item => <button key={item.id} className="mini-food" onClick={onBrowse}><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/><span>{item.name}</span><b>{money(item.price)}</b></button>)}</div>
    </section>

    <section className="fc-testimonials">
      <div className="fc-section-heading"><div><span className="fc-label">WHAT THEY SAY</span><h2>Good food.<br/><em>Good feelings.</em></h2></div></div>
      <div className="quote-grid"><article><span>★★★★★</span><p>“The jollof arrived looking just as good as it tasted. Rich, smoky and full of flavour.”</p><b>Atlanta customer</b></article><article><span>★★★★★</span><p>“The ordering experience was simple, the food was packed well and everything tasted fresh.”</p><b>Pickup customer</b></article><article><span>★★★★★</span><p>“Kelewele and small chops are exactly what I wanted for a relaxed evening at home.”</p><b>Delivery customer</b></article></div>
    </section>

    <section className="fc-story">
      <div className="fc-story-image"><img src={menu[1].image} alt="Acheke with grilled fish and plantain"/><span>ROOTED IN<br/>GHANA.</span></div>
      <div className="fc-story-copy"><span className="fc-label">THE FOURTH CROWN STORY</span><h2>Heritage in every<br/><em>plate.</em></h2><p>FOURTH CROWN brings Ghanaian comfort food into a modern pickup and delivery experience. The goal is simple: food that feels familiar, looks beautiful and arrives ready to enjoy.</p><div className="fc-story-points"><span><b>01</b>Authentic Ghanaian flavours</span><span><b>02</b>Freshly prepared for every order</span><span><b>03</b>Pickup and delivery across our service area</span></div><button className="fc-primary" onClick={onBrowse}>Order from FOURTH CROWN <ArrowRight size={16}/></button></div>
    </section>

    <section className="fc-catering-banner"><div className="fc-catering-copy"><span className="fc-label">CATERING FOR EVERY OCCASION</span><h2>Planning an event?<br/><em>Let us handle the food.</em></h2><p>We also take catering orders for all kinds of events — birthdays, weddings, corporate gatherings, graduations, family celebrations and more.</p><div className="fc-catering-tags"><span>Birthdays</span><span>Weddings</span><span>Corporate events</span><span>Graduations</span><span>Private celebrations</span></div></div><div className="fc-catering-contact"><span>CALL OR TEXT</span><strong>850 465 6422</strong><p>Ask about catering menus, guest counts and event orders.</p><a href="tel:8504656422">Contact us <ArrowRight size={16}/></a></div></section>

    <section className="fc-delivery"><div><span className="fc-label">PICKUP OR DELIVERY</span><h2>Your next Ghanaian meal is closer.</h2></div><p>Choose pickup when you are nearby or delivery when you want FOURTH CROWN brought to your door. Final delivery availability and fees are managed by the restaurant.</p><button className="fc-primary" onClick={onBrowse}>Start your order <ArrowRight size={16}/></button></section>

    <footer className="fc-footer"><div><img src="/images/fourth-crown-logo-transparent.png" alt="FOURTH CROWN"/><p>{settings.tagline}</p><a className="fc-footer-phone" href="tel:8504656422">850 465 6422</a></div><div className="fc-footer-links"><button onClick={onBrowse}>Menu</button></div><details className="photo-credits"><summary>Food photo credits</summary><p>Food photography used in the menu is sourced from Wikimedia Commons dish photographs. Individual licenses and photographer credits are listed in the project README.</p></details><small>© {new Date().getFullYear()} FOURTH CROWN</small></footer>
    <button className="fc-top-float" aria-label="Back to top" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}><ChevronUp size={18}/><span>Top</span></button>
  </main>;
}

function DishCard({ item, index, onAdd }) {
  const [open, setOpen] = useState(false);
  return <article className="fc-dish-card">
    <div className="fc-dish-image"><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/><span>{item.badge || "FOURTH CROWN"}</span><button aria-label={`Quick add ${item.name}`} disabled={!item.available || item.price === null} onClick={() => onAdd(item)}><Plus size={18}/></button></div>
    <div className="fc-dish-info"><span>0{index+1}</span><div><h3>{item.name}</h3><p>{item.description}</p><div className="dish-ingredients">{(item.ingredients || []).slice(0,5).map(x=><small key={x}>{x}</small>)}</div><div className="dish-purchase"><div><small>Starting price</small><strong>{money(item.price)}</strong></div><button className="card-customize" onClick={() => setOpen(true)}>Customize & add <ArrowRight size={13}/></button></div></div></div>
    {open && <ItemModal item={item} onClose={() => setOpen(false)} onAdd={(food, addon) => { onAdd(food, addon); setOpen(false); }} />}
  </article>;
}

function MenuView({ menu, categories, selectedCategory, setSelectedCategory, onSelect, onAdd }) {
  const [search, setSearch] = useState("");
  const filtered = (selectedCategory === "popular" ? menu : menu.filter(x => x.category === selectedCategory)).filter(x => `${x.name} ${x.description}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="content menu-page"><div className="page-heading"><div><span className="eyebrow">FOURTH CROWN MENU</span><h1>Choose your plate.</h1><p className="menu-helper"><CircleHelp size={14}/> Tap <b>Customize & add</b> if you want extras. Use <b>Quick add</b> for the regular plate.</p></div><div className="search-box"><Search size={16}/><input placeholder="Search jollof, fufu, ampesi..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div><div className="category-tabs">{categories.map(c => <button key={c.id} className={selectedCategory===c.id?"active":""} onClick={() => setSelectedCategory(c.id)}>{c.name}</button>)}</div><div className="menu-grid">{filtered.map(item => <article className="menu-card" key={item.id}><button className="food-placeholder" onClick={() => onSelect(item)}><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/>{item.badge && <b>{item.badge}</b>}</button><div className="menu-card-body"><div className="menu-card-title"><h3>{item.name}</h3></div><div className="menu-price-row"><span>Starting price</span><strong>{money(item.price)}</strong></div><p>{item.description}</p><div className="card-actions"><span className={item.available?"available":"sold"}>{item.available?"Available":"Sold out"}</span><div className="menu-card-buttons"><button className="small-add secondary" disabled={!item.available || item.price === null} onClick={() => onSelect(item)}>Customize & add</button><button className="small-add" disabled={!item.available || item.price === null} onClick={() => onAdd(item)}><Plus size={14}/> Quick add</button></div></div></div></article>)}</div></main>;
}

function ItemModal({ item, onClose, onAdd }) {
  const [addons, setAddons] = useState([]);
  const options = item.addons || defaultAddons;
  const toggle = a => setAddons(current => current.some(x=>x.id===a.id) ? current.filter(x=>x.id!==a.id) : [...current,a]);
  const extraTotal = addons.reduce((s,a)=>s+a.price,0);
  return <div className="modal-backdrop" onMouseDown={e => e.target===e.currentTarget && onClose()}><div className="modal food-detail-modal"><button className="modal-close" onClick={onClose}><X/></button><div className="modal-food"><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/></div><span className="eyebrow">{item.badge || "FOURTH CROWN"}</span><h2>{item.name}</h2><p>{item.description}</p><div className="easy-order-note"><Settings2 size={15}/><span><b>Make it yours.</b> Extras are optional. Tap anything you want, then add your plate.</span></div><div className="addon-list"><label>Choose optional extras</label>{options.map(a => <button disabled={a.price === null} type="button" className={`addon ${addons.some(x=>x.id===a.id)?"selected":""}`} key={a.id} onClick={() => toggle(a)}><span><i>{addons.some(x=>x.id===a.id)?"✓":"+"}</i>{a.name}</span><b>{a.price ? `+${money(a.price)}` : "Included"}</b></button>)}</div><button className="btn btn-dark full" onClick={() => onAdd(item, addons.length ? {id:addons.map(a=>a.id).join("+"),ids:addons.map(a=>a.id),name:addons.map(a=>a.name).join(", "),price:extraTotal}:null)}>Add to cart · {money(item.price+extraTotal)}</button></div></div>;
}

function AddToast({ name, onClose, onViewCart }) {
  return <div className="add-toast" role="status"><div className="toast-icon"><Check size={17}/></div><div className="toast-copy"><b>Added to cart</b><span>{name}</span></div><button onClick={onViewCart}>View cart</button><button className="toast-close" aria-label="Dismiss" onClick={onClose}><X size={15}/></button></div>;
}

function CartFloat({count,total,onClick}) { if(!count)return null; return <button className="cart-float" onClick={onClick}><span><ShoppingBag size={18}/>{count} item{count>1?"s":""}</span><strong>{money(total)}</strong><ChevronDown size={16}/></button>; }

function CartView({ cart, total, onQty, onCheckout, onBrowse }) {
  return <main className="content narrow"><div className="page-heading"><div><span className="eyebrow">YOUR ORDER</span><h1>Cart.</h1></div></div>{!cart.length?<Empty title="Your cart is empty." action={onBrowse}/>:<><div className="cart-list">{cart.map(item=><div className="cart-row" key={item.key}><div><b>{item.name}</b>{item.addon&&<small>{item.addon}</small>}<span>{money(item.price)} each</span></div><div className="qty"><button onClick={() => onQty(item.key,-1)}><Minus size={14}/></button><b>{item.quantity}</b><button onClick={() => onQty(item.key,1)}><Plus size={14}/></button></div><strong>{money(item.price*item.quantity)}</strong></div>)}</div><div className="summary"><span>Subtotal</span><strong>{money(total)}</strong></div><button className="btn btn-gold full" onClick={onCheckout}>Continue to checkout <ArrowRight size={16}/></button></>}</main>;
}

function CheckoutView({ settings, cart, total, onSubmit, onBack }) {
  const [fulfillment, setFulfillment] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("pay-later");
  const [form, setForm] = useState({ name:"", phone:"", email:"", address:"" });
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const fee=fulfillment==="delivery"?Number(settings.deliveryFee):0, tax=total*Number(settings.taxRate)/100, grand=total+fee+tax;
  const orderKey = useRef(load("fcc_order_key_v2", null) || crypto.randomUUID());
  const submit=async e=>{
    e.preventDefault(); if(paying) return;
    setPaymentError("");
    if(!configured) return setPaymentError("Restaurant ordering has not been configured.");
    if(!form.name.trim()||!form.phone.trim())return setPaymentError("Please enter your name and phone number.");
    if(fulfillment==="delivery"&&!form.address.trim())return setPaymentError("Please enter your delivery address.");
    try {
      setPaying(true); localStorage.setItem("fcc_order_key_v2", JSON.stringify(orderKey.current));
      await onSubmit({...form,fulfillment,paymentMethod},orderKey.current);
      localStorage.removeItem("fcc_order_key_v2");
    } catch(err) { setPaymentError(err.message || "Order could not be sent. Please retry."); }
    finally { setPaying(false); }
  };
  if(!cart.length)return <Empty title="There is nothing to checkout." action={onBack}/>;
  return <main className="content narrow"><div className="page-heading"><div><span className="eyebrow">CHECKOUT</span><h1>Almost there.</h1><p className="checkout-intro">Choose pickup or delivery, enter your details, then send your order. Payment is arranged with the restaurant.</p></div></div><form className="checkout" onSubmit={submit}><div className="checkout-step"><span>01</span><div><b>How do you want your order?</b><small>Pick up yourself or have it delivered.</small></div></div><div className="fulfillment"><button type="button" className={fulfillment==="pickup"?"selected":""} onClick={()=>setFulfillment("pickup")}><ShoppingBag/> <span>Pickup</span><small>Collect your order</small></button><button type="button" className={fulfillment==="delivery"?"selected":""} onClick={()=>setFulfillment("delivery")}><Truck/> <span>Delivery</span><small>Bring it to me</small></button></div><div className="checkout-step"><span>02</span><div><b>Your details</b><small>We only need what is necessary to complete your order.</small></div></div><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Emmanuel Boateng"/></label><label>Phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="e.g. 404 555 0198"/></label><label>Email <small>(optional)</small><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>{fulfillment==="delivery"&&<label>Delivery address<textarea required value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Street, city, ZIP code"/></label>}<div className="checkout-step"><span>03</span><div><b>Payment</b><small>Choose how you want to pay.</small></div></div><div className="payment-methods"><button type="button" disabled={!settings.paymentOptions?.paypal} className={paymentMethod==="paypal"?"selected":""} onClick={()=>setPaymentMethod("paypal")}><span><b>PayPal</b><small>Eligible wallets depend on your PayPal checkout</small></span></button><button type="button" disabled={!settings.paymentOptions?.zelle} className={paymentMethod==="zelle"?"selected":""} onClick={()=>setPaymentMethod("zelle")}><span><b>Zelle</b><small>Manual restaurant verification</small></span></button><button type="button" disabled={!settings.paymentOptions?.stripe} className={paymentMethod==="stripe"?"selected":""} onClick={()=>setPaymentMethod("stripe")}><CreditCard size={18}/><span><b>Pay securely online</b><small>Cards and eligible Apple Pay, Google Pay or Cash App Pay</small></span><ShieldCheck size={16}/></button><button type="button" className={paymentMethod==="pay-later"?"selected":""} onClick={()=>setPaymentMethod("pay-later")}><WalletCards size={18}/><span><b>Pay with restaurant</b><small>Use only if the restaurant enables it</small></span></button></div>{settings.paymentMode==="test"&&<p className="warning">Payment testing mode. Use test accounts/cards only.</p>}{paymentMethod==="zelle"&&<p className="warning">Send payment to {settings.zelleRecipient}. Include your order ID as the reference after placing the order. The restaurant verifies receipt.</p>}<div className="summary"><span>Subtotal</span><b>{money(total)}</b><span>Delivery</span><b>{fee?money(fee):"Free"}</b><span>Tax</span><b>{money(tax)}</b><strong>Total</strong><strong>{money(grand)}</strong></div>{paymentError&&<div className="payment-error"><CircleHelp size={16}/>{paymentError}</div>}<button className="btn btn-dark full payment-submit" disabled={!configured||!settings.acceptingOrders||paying}>{paying?"Sending your order…":paymentMethod==="stripe"?`Continue to secure payment · ${money(grand)}`:`Place order · ${money(grand)}`}</button>{!settings.acceptingOrders&&<p className="warning">Online ordering is currently paused by the restaurant.</p>}<p className="secure-note"><ShieldCheck size={14}/> Payment is arranged with the restaurant. This checkout does not collect card details.</p></form></main>;
}

function OrdersView({ orders }) { return <main className="content narrow"><div className="page-heading"><div><span className="eyebrow">ORDER HISTORY</span><h1>Your orders.</h1></div></div>{!orders.length?<Empty title="No orders yet." action={()=>{}}/>:<div className="orders-list">{orders.map(o=><article className="order-card" key={o.id}><div><b>{o.id}</b><small>{new Date(o.createdAt).toLocaleString()}</small></div><span className={`status ${o.status.toLowerCase().replaceAll(" ","-")}`}>{o.status}</span><strong>{money(o.total)}</strong><small>{o.items.reduce((s,i)=>s+i.quantity,0)} item(s) · {o.customer.fulfillment} · {o.paymentStatus}</small>{o.customer.paymentMethod==="zelle"&&o.paymentStatus!=="Paid"&&<small>Zelle payment awaits restaurant verification. Use this order ID as your payment reference.</small>}{["stripe","paypal"].includes(o.customer.paymentMethod)&&o.paymentStatus==="Unpaid"&&o.status!=="Cancelled"&&<button className="btn btn-dark" onClick={async()=>{try{const saved={id:o.id,token:o.trackingToken};localStorage.setItem("fcc_pending_payment",JSON.stringify(saved));const payment=await request("payment-start",saved);if(!payment.url)throw new Error("Payment approval link unavailable");window.location.assign(payment.url);}catch(e){window.alert(e.message)}}}>Continue payment</button>}</article>)}</div>}</main>; }

function AdminView({ authed,menu,setMenu,categories,setCategories,settings,setSettings,orders,updateOrderStatus,logout,onSave,dirty,saving }) {
  const [tab,setTab]=useState("dashboard"),[credentials,setCredentials]=useState({email:"",password:""}),[editing,setEditing]=useState(null),[newItem,setNewItem]=useState({name:"",price:"",category:"rice",description:""});
  const [loginError,setLoginError]=useState("");
  const [loggingIn,setLoggingIn]=useState(false);
  async function login() {
    if (!db) { setLoginError("Configure the restaurant connection before signing in."); return; }
    setLoggingIn(true); setLoginError("");
    try {
      const {error}=await db.auth.signInWithPassword(credentials); if(error) throw error;
      const {data,error:roleError}=await db.rpc("is_admin");
      if(roleError || !data) { await db.auth.signOut(); throw new Error("This account does not have administrator access."); }
    } catch(e) { setLoginError(e.message); }
    finally { setLoggingIn(false); }
  }
  if(!authed)return <main className="admin-login"><div className="admin-login-card"><img className="admin-login-logo" src="/images/fourth-crown-logo-transparent.png" alt="FOURTH CROWN"/><span className="eyebrow">FOURTH CROWN ADMIN</span><h1>Restaurant control centre</h1><p>Simple controls for everyday restaurant work. You do not need to know how to code.</p><label>Email<input placeholder="Email" value={credentials.email} onChange={e=>setCredentials({...credentials,email:e.target.value})}/></label><label>Password<input type="password" placeholder="Password" value={credentials.password} onChange={e=>setCredentials({...credentials,password:e.target.value})}/></label><button className="btn btn-dark full" disabled={loggingIn || !configured} onClick={login}>{loggingIn?"Signing in…":"Sign in"}</button>{loginError&&<p role="alert">{loginError}</p>}<small>Use your restaurant administrator account.</small></div></main>;
  const revenue=orders.filter(o=>o.paymentStatus==="Paid"&&o.status!=="Cancelled").reduce((s,o)=>s+o.total,0);
  const updateItem=(id,patch)=>setMenu(current=>current.map(item=>item.id===id?{...item,...patch}:item));
  const addItem=()=>{if(!newItem.name||newItem.price===""||Number(newItem.price)<0)return;setMenu([...menu,{id:crypto.randomUUID(),...newItem,price:Number(newItem.price),available:true,badge:"",image:initialMenu[0].image,addons:defaultAddons}]);setNewItem({name:"",price:"",category:"rice",description:""});};
  return <main className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><img src="/images/fourth-crown-logo-transparent.png" alt="FOURTH CROWN"/></div>{[["dashboard","Overview"],["orders","Orders"],["menu","Menu & prices"],["settings","Restaurant settings"]].map(([id,label])=><button className={tab===id?"active":""} onClick={()=>setTab(id)} key={id}>{label}</button>)}<a href="/" className="admin-view-site">View customer site</a><button onClick={logout}>Sign out</button></aside><section className="admin-main"><button className="btn btn-dark" disabled={!dirty||saving} onClick={onSave}>{saving?"Saving…":dirty?"Save changes":"All changes saved"}</button><div className="admin-top"><div><span className="eyebrow">RESTAURANT CONTROL CENTRE</span><h1>{tab==="dashboard"?"Today’s overview":tab==="menu"?"Menu & prices":tab==="orders"?"Orders":"Restaurant settings"}</h1></div><span className="live-dot">● {settings.acceptingOrders?"Accepting orders":"Ordering paused"}</span></div>
    {tab==="dashboard"&&<div className="dashboard"><div className="stats"><Stat label="Orders" value={orders.length}/><Stat label="Revenue" value={money(revenue)}/><Stat label="Menu items" value={menu.length}/><Stat label="Available today" value={menu.filter(x=>x.available).length}/></div><section className="panel admin-help"><h2>What do you want to do?</h2><div className="admin-quick"><button onClick={()=>setTab("menu")}><Utensils/><b>Change a food</b><span>Price, name, photo or sold-out status</span></button><button onClick={()=>setTab("orders")}><ShoppingBag/><b>Check new orders</b><span>See what customers have ordered</span></button><button onClick={()=>setTab("settings")}><Settings2/><b>Change restaurant settings</b><span>Delivery fee, tax and ordering</span></button></div></section><section className="panel"><h2>Recent orders</h2>{orders.slice(0,6).map(o=><div className="admin-order" key={o.id}><b>{o.id}</b><span>{o.customer.name}</span><span>{money(o.total)}</span><select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>{["Received","Preparing","Ready","Out for delivery","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></div>)}{!orders.length&&<p className="muted">No orders yet.</p>}</section></div>}
    {tab==="orders"&&<section className="panel"><div className="panel-head"><div><h2>Customer orders</h2><span>Change the status as the kitchen works.</span></div></div>{orders.map(o=><div className="admin-order expanded" key={o.id}><div><b>{o.id}</b><small>{o.customer.name} · {o.customer.phone}</small>{o.customer.fulfillment==="delivery"&&<small>{o.customer.address}</small>}{o.items.map((item,index)=><small key={index}>{item.quantity} × {item.name}{item.addon?` — ${item.addon}`:""}</small>)}</div><span>{o.customer.fulfillment} · {o.paymentStatus}</span><strong>{money(o.total)}</strong>{["cash","pay-later","zelle"].includes(o.customer.paymentMethod)&&o.paymentStatus!=="Paid"&&<button onClick={async()=>{const reference=window.prompt("Enter bank receipt or cash receipt reference after verifying payment:");if(!reference)return;try{await request("confirm-manual",{id:o.id,paymentStatus:"Paid",reference});window.location.reload();}catch(e){window.alert(e.message)}}}>Confirm received payment</button>}<select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>{["Received","Preparing","Ready","Out for delivery","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></div>)}{!orders.length&&<p className="muted">No orders.</p>}</section>}
    {tab==="menu"&&<section className="panel menu-manager"><div className="panel-head"><div><h2>Easy menu editor</h2><span>Edit below, then choose Save changes to publish your menu updates.</span></div></div><div className="admin-tip"><CircleHelp size={16}/><span><b>Quick rule:</b> Turn a food off when you run out. Change the price when you need to. Choose Save changes when your edits are ready.</span></div><div className="add-item easy-add"><input placeholder="Food name" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})}/><input type="number" placeholder="Price ($)" value={newItem.price} onChange={e=>setNewItem({...newItem,price:e.target.value})}/><select value={newItem.category} onChange={e=>setNewItem({...newItem,category:e.target.value})}>{categories.filter(c=>c.id!=="popular").map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><input placeholder="Short description" value={newItem.description} onChange={e=>setNewItem({...newItem,description:e.target.value})}/><button className="small-add" onClick={addItem}><Plus/> Add food</button></div><div className="admin-menu-list">{menu.map(item=><article className={`admin-menu-card ${item.available?"":"is-off"}`} key={item.id}><img src={item.image} alt=""/><div className="admin-menu-main">{editing===item.id?<><input value={item.name} onChange={e=>updateItem(item.id,{name:e.target.value})}/><label>Photo URL<input value={item.image||""} onChange={e=>updateItem(item.id,{image:e.target.value})} placeholder="https://... or /images/food.jpg"/></label><textarea value={item.description} onChange={e=>updateItem(item.id,{description:e.target.value})}/><select value={item.category} onChange={e=>updateItem(item.id,{category:e.target.value})}>{categories.filter(c=>c.id!=="popular").map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></>:<><h3>{item.name}</h3><p>{item.description}</p><span>{categories.find(c=>c.id===item.category)?.name || "Menu"}</span></>}</div><div className="admin-menu-price"><label>Price<input type="number" min="0" step="0.01" value={item.price ?? ""} onChange={e=>updateItem(item.id,{price:e.target.value === "" ? null : Number(e.target.value)})}/></label>{item.addons?.map(addon=><label key={addon.id}>{addon.name}<input type="number" min="0" step="0.01" value={addon.price??""} onChange={e=>updateItem(item.id,{addons:item.addons.map(a=>a.id===addon.id?{...a,price:e.target.value===""?null:Number(e.target.value)}:a)})}/></label>)}<label className="admin-switch"><input type="checkbox" checked={item.available} onChange={e=>updateItem(item.id,{available:e.target.checked})}/><span>{item.available?<><Eye size={14}/> On menu</>:<><EyeOff size={14}/> Sold out</>}</span></label><button className="icon-admin" onClick={()=>setEditing(editing===item.id?null:item.id)}>{editing===item.id?<Save size={16}/>:<Pencil size={16}/>}<span>{editing===item.id?"Done":"Edit"}</span></button></div></article>)}</div></section>}
    {tab==="settings"&&<section className="panel settings-form"><div className="settings-intro"><Settings2/><div><h2>Restaurant settings</h2><p>Use plain settings here. These are the things you normally change during the week.</p></div></div><label>Restaurant name<input value={settings.restaurantName} onChange={e=>setSettings({...settings,restaurantName:e.target.value})}/></label><label>Tagline<input value={settings.tagline} onChange={e=>setSettings({...settings,tagline:e.target.value})}/></label><label>Business phone<input value={settings.phone||""} onChange={e=>setSettings({...settings,phone:e.target.value})}/></label><label>Pickup location<input value={settings.pickupAddress} onChange={e=>setSettings({...settings,pickupAddress:e.target.value})}/></label><label>Delivery fee ($)<input type="number" min="0" step="0.01" value={settings.deliveryFee} onChange={e=>setSettings({...settings,deliveryFee:Number(e.target.value)})}/></label><label>Tax rate (%)<input type="number" min="0" max="100" step="0.01" value={settings.taxRate} onChange={e=>setSettings({...settings,taxRate:Number(e.target.value)})}/></label><label>Minimum order ($)<input type="number" min="0" step="0.01" value={settings.minimumOrder} onChange={e=>setSettings({...settings,minimumOrder:Number(e.target.value)})}/></label><label className="checkline"><input type="checkbox" checked={settings.acceptingOrders} onChange={e=>setSettings({...settings,acceptingOrders:e.target.checked})}/> Accept online orders</label><div className="settings-callout"><CreditCard size={18}/><div><b>Online payments</b><p>Payment options appear after the restaurant configures its own provider credentials. Test/live mode is controlled by server environment variables.</p></div></div></section>}</section></main>;
}

function Stat({label,value}){return <div className="stat"><small>{label}</small><strong>{value}</strong></div>}
function Empty({title,action}){return <div className="empty"><ShoppingBag size={30}/><h2>{title}</h2><button className="btn btn-dark" onClick={action}>Browse menu</button></div>}

createRoot(document.getElementById("root")).render(<App/>);

// Enable install-to-home-screen support on HTTPS deployments.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
