import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Clock3, Crown, MapPin, Minus, PackageCheck, Plus, Search, ShoppingBag,
  Truck, Utensils, X
} from "lucide-react";
import "./styles.css";

/*
  FCC-001 Build 04
  ----------------
  The customer-facing experience is intentionally inspired by the supplied
  Dribbble reference: dark editorial sections, large food photography,
  promotional strip, featured dishes, testimonials and chef story.

  The prototype still uses localStorage/sessionStorage. Production work will
  move auth, orders, menu, payments and settings behind a secure backend.
*/

const initialCategories = [
  { id: "popular", name: "Popular" },
  { id: "rice", name: "Rice & Mains" },
  { id: "sides", name: "Sides" },
  { id: "small-chops", name: "Small Chops" }
];

// Real food photography references. Replace with restaurant-owned/licensed
// photography before commercial launch.
const initialMenu = [
  { id: "jollof", category: "rice", name: "Ghanaian Jollof Rice", description: "Smoky Ghana-style jollof served with grilled chicken, fried plantain and fresh sides.", ingredients: ["Tomato", "Red pepper", "Onion", "Ginger", "Garlic", "Thyme", "Jasmine rice", "Chicken"], price: 16, available: true, badge: "Signature", image: "https://i.etsystatic.com/65604732/r/il/e10a26/8049315113/il_794xN.8049315113_3aeb.jpg" },
  { id: "acheke", category: "rice", name: "Gari Fortor", description: "Ghanaian gari mixed with rich tomato stew, served with fried plantain and fresh garnish.", ingredients: ["Gari", "Tomato", "Onion", "Pepper", "Plantain", "Egg", "Goat meat", "Seasoning"], price: 19, available: true, badge: "Ghanaian favourite", image: "https://i.pinimg.com/originals/e5/88/5a/e5885ab2ababedf4ea86adca20e31b56.jpg" },
  { id: "braised", category: "rice", name: "Braised Rice & Chicken", description: "Seasoned braised rice paired with tender, juicy chicken and a fresh side.", ingredients: ["Rice", "Onion", "Garlic", "Ginger", "Stock", "Mixed vegetables", "Chicken", "Spices"], price: 17, available: true, badge: "", image: "https://images.bolt.eu/store/2024/2024-09-10/706f884f-1e55-4580-aedc-430196572216.jpeg" },
  { id: "plain", category: "rice", name: "Plain Rice & Stew", description: "Steamed white rice with a rich tomato-based Ghanaian stew and tender protein.", ingredients: ["White rice", "Tomato", "Onion", "Pepper", "Garlic", "Ginger", "Chicken", "Seasoning"], price: 15, available: true, badge: "Classic", image: "https://cdn.menu-res.com/suncityjointrestauranttema/32336-albums-9.jpg" },
  { id: "kelewele", category: "sides", name: "Kelewele", description: "Spiced fried plantain seasoned with ginger, pepper and warm Ghanaian spices.", ingredients: ["Ripe plantain", "Ginger", "Pepper", "Garlic", "Salt", "Oil"], price: 9, available: true, badge: "Classic", image: "https://images.squarespace-cdn.com/content/v1/65cfd1369377d32bcd0051fa/34764d34-bba3-4c87-bbaf-57438fee7616/362886327_658675622814247_3440017675938964884_n%281%29.jpg" },
  { id: "smallchops", category: "small-chops", name: "Ghanaian Small Chops", description: "A shareable selection of crispy bites made for gatherings and celebrations.", ingredients: ["Chicken", "Beef", "Flour", "Onion", "Pepper", "Ginger", "Garlic", "Seasoning"], price: 14, available: true, badge: "Shareable", image: "https://i.pinimg.com/736x/02/b3/29/02b3294c1a631b62f6ab3a4b46e3501a.jpg" }
];

function loadMenu() {
  const stored = load("fcc_menu", initialMenu);
  // Migrate every built-in demo item so an older browser cache cannot keep broken image URLs.
  const canonical = Object.fromEntries(initialMenu.map(item => [item.id, item]));
  return stored.map(item => {
    const base = canonical[item.id];
    if (!base) return item;
    return { ...base, ...item, image: base.image, ingredients: base.ingredients, name: base.name, description: base.description, badge: base.badge };
  });
}

const initialSettings = {
  restaurantName: "FOURTH CROWN",
  tagline: "The Taste of Ghana, Delivered.",
  pickupAddress: "Atlanta, Georgia",
  phone: "850 465 6422",
  minimumOrder: 0,
  deliveryFee: 5,
  taxRate: 0,
  acceptingOrders: true
};

const demoOrders = [];

function money(value) {
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
  const [menu, setMenu] = useState(loadMenu);
  const [categories, setCategories] = useState(() => load("fcc_categories", initialCategories));
  const [settings, setSettings] = useState(() => load("fcc_settings", initialSettings));
  const [orders, setOrders] = useState(() => load("fcc_orders", demoOrders));
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("popular");
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => localStorage.setItem("fcc_menu", JSON.stringify(menu)), [menu]);
  useEffect(() => localStorage.setItem("fcc_categories", JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem("fcc_settings", JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem("fcc_orders", JSON.stringify(orders)), [orders]);

  const cartCount = cart.reduce((s, x) => s + x.quantity, 0);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  function showToast(item) {
    setToast({ name: item.name, id: Date.now() });
  }

  function addToCart(item, addon = null) {
    const key = `${item.id}-${addon?.id || "none"}`;
    setCart(current => {
      const existing = current.find(x => x.key === key);
      if (existing) return current.map(x => x.key === key ? { ...x, quantity: x.quantity + 1 } : x);
      return [...current, { key, itemId: item.id, name: item.name, price: item.price + (addon?.price || 0), quantity: 1, addon: addon?.name || "", image: item.image }];
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

  function createOrder(customer) {
    const deliveryFee = customer.fulfillment === "delivery" ? Number(settings.deliveryFee) : 0;
    const tax = cartTotal * (Number(settings.taxRate) / 100);
    const total = cartTotal + deliveryFee + tax;
    const order = {
      id: `FCC-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customer,
      items: cart,
      subtotal: cartTotal,
      deliveryFee,
      tax,
      total,
      status: "Received"
    };
    setOrders(current => [order, ...current]);
    setCart([]);
    setView("orders");
  }

  function updateOrderStatus(id, status) {
    setOrders(current => current.map(order => order.id === id ? { ...order, status } : order));
  }

  return (
    <div className="app-shell">
      <Header cartCount={cartCount} onNavigate={setView} />
      {view === "home" && <Home onBrowse={() => setView("menu")} settings={settings} onAdd={addToCart} />}
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
        <img className="brand-logo" src="/images/logo-original.png" alt="FOURTH CROWN" />
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

function Home({ onBrowse, settings, onAdd }) {
  const featured = [initialMenu[0], initialMenu[1], initialMenu[4]];
  const best = [initialMenu[0], initialMenu[1], initialMenu[2]];
  const [serviceSlide, setServiceSlide] = useState(0);
  const serviceStories = [
    {
      title: "Served with care",
      label: "FROM OUR KITCHEN",
      text: "Our team prepares each order with the same care you would expect from a meal made for family — packed fresh and ready to enjoy.",
      image: "https://images.pexels.com/photos/5812876/pexels-photo-5812876.jpeg?cs=srgb&dl=pexels-khoa-vo-2347168-5812876.jpg&fm=jpg"
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
    return () => window.clearInterval(timer);
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
        <div className="fc-logo-card"><img src="/images/logo-original.png" alt="FOURTH CROWN"/></div>
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
          {initialMenu.map((item, index) => <div className={`fc-slide ${index===0?"active":""}`} key={item.id}>
            <img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/>
            <div className="fc-slide-overlay"><span>0{index+1}</span><div><b>{item.name}</b><small>{(item.ingredients || []).slice(0,5).join(" · ")}</small></div></div>
          </div>)}
          <div className="fc-carousel-dots">{initialMenu.map((item,index)=><i key={item.id} className={index===0?"active":""}></i>)}</div>
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
      <div className="fc-menu-mini-grid">{initialMenu.slice(3,6).map(item => <button key={item.id} className="mini-food" onClick={onBrowse}><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/><span>{item.name}</span><b>{money(item.price)}</b></button>)}</div>
    </section>

    <section className="fc-testimonials">
      <div className="fc-section-heading"><div><span className="fc-label">WHAT THEY SAY</span><h2>Good food.<br/><em>Good feelings.</em></h2></div></div>
      <div className="quote-grid"><article><span>★★★★★</span><p>“The jollof arrived looking just as good as it tasted. Rich, smoky and full of flavour.”</p><b>Atlanta customer</b></article><article><span>★★★★★</span><p>“The ordering experience was simple, the food was packed well and everything tasted fresh.”</p><b>Pickup customer</b></article><article><span>★★★★★</span><p>“Kelewele and small chops are exactly what I wanted for a relaxed evening at home.”</p><b>Delivery customer</b></article></div>
    </section>

    <section className="fc-story">
      <div className="fc-story-image"><img src={initialMenu[1].image} alt="Ghanaian food prepared for delivery"/><span>ROOTED IN<br/>GHANA.</span></div>
      <div className="fc-story-copy"><span className="fc-label">THE FOURTH CROWN STORY</span><h2>Heritage in every<br/><em>plate.</em></h2><p>FOURTH CROWN brings Ghanaian comfort food into a modern pickup and delivery experience. The goal is simple: food that feels familiar, looks beautiful and arrives ready to enjoy.</p><div className="fc-story-points"><span><b>01</b>Authentic Ghanaian flavours</span><span><b>02</b>Freshly prepared for every order</span><span><b>03</b>Pickup and delivery across our service area</span></div><button className="fc-primary" onClick={onBrowse}>Order from FOURTH CROWN <ArrowRight size={16}/></button></div>
    </section>

    <section className="fc-catering-banner"><div className="fc-catering-copy"><span className="fc-label">CATERING FOR EVERY OCCASION</span><h2>Planning an event?<br/><em>Let us handle the food.</em></h2><p>We also take catering orders for all kinds of events — birthdays, weddings, corporate gatherings, graduations, family celebrations and more.</p><div className="fc-catering-tags"><span>Birthdays</span><span>Weddings</span><span>Corporate events</span><span>Graduations</span><span>Private celebrations</span></div></div><div className="fc-catering-contact"><span>CALL OR TEXT</span><strong>850 465 6422</strong><p>Ask about catering menus, guest counts and event orders.</p><a href="tel:8504656422">Contact us <ArrowRight size={16}/></a></div></section>

    <section className="fc-delivery"><div><span className="fc-label">PICKUP OR DELIVERY</span><h2>Your next Ghanaian meal is closer.</h2></div><p>Choose pickup when you are nearby or delivery when you want FOURTH CROWN brought to your door. Final delivery availability and fees are managed by the restaurant.</p><button className="fc-primary" onClick={onBrowse}>Start your order <ArrowRight size={16}/></button></section>

    <footer className="fc-footer"><div><img src="/images/logo-original.png" alt="FOURTH CROWN"/><p>{settings.tagline}</p><a className="fc-footer-phone" href="tel:8504656422">850 465 6422</a></div><div className="fc-footer-links"><button onClick={onBrowse}>Menu</button></div><small>© {new Date().getFullYear()} FOURTH CROWN</small></footer>
    <button className="fc-top-float" aria-label="Back to top" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}><ChevronUp size={18}/><span>Top</span></button>
  </main>;
}

function DishCard({ item, index, onAdd }) {
  return <article className="fc-dish-card"><div className="fc-dish-image"><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/><span>{item.badge || "FOURTH CROWN"}</span><button aria-label={`Add ${item.name}`} onClick={() => onAdd(item)}><Plus size={18}/></button></div><div className="fc-dish-info"><span>0{index+1}</span><div><h3>{item.name}</h3><p>{item.description}</p><div className="dish-ingredients">{(item.ingredients || []).slice(0,5).map(x=><small key={x}>{x}</small>)}</div><strong>{money(item.price)}</strong></div></div></article>;
}

function MenuView({ menu, categories, selectedCategory, setSelectedCategory, onSelect, onAdd }) {
  const filtered = selectedCategory === "popular" ? menu : menu.filter(x => x.category === selectedCategory);
  return <main className="content menu-page"><div className="page-heading"><div><span className="eyebrow">FOURTH CROWN MENU</span><h1>Choose your plate.</h1></div><div className="search-box"><Search size={16}/><input placeholder="Search menu" onChange={() => {}}/></div></div><div className="category-tabs">{categories.map(c => <button key={c.id} className={selectedCategory===c.id?"active":""} onClick={() => setSelectedCategory(c.id)}>{c.name}</button>)}</div><div className="menu-grid">{filtered.map(item => <article className="menu-card" key={item.id}><button className="food-placeholder" onClick={() => onSelect(item)}><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/>{item.badge && <b>{item.badge}</b>}</button><div className="menu-card-body"><div><h3>{item.name}</h3><strong>{money(item.price)}</strong></div><p>{item.description}</p><div className="card-actions"><span className={item.available?"available":"sold"}>{item.available?"Available":"Sold out"}</span><button className="small-add" disabled={!item.available} onClick={() => onAdd(item)}><Plus size={14}/> Add</button></div></div></article>)}</div></main>;
}

function ItemModal({ item, onClose, onAdd }) {
  const [addon, setAddon] = useState(null);
  const addons = [{id:"plantain",name:"Extra fried plantain",price:3},{id:"chicken",name:"Extra grilled chicken",price:5},{id:"shito",name:"Kpakpo shito",price:1.5}];
  return <div className="modal-backdrop" onMouseDown={e => e.target===e.currentTarget && onClose()}><div className="modal"><button className="modal-close" onClick={onClose}><X/></button><div className="modal-food"><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/></div><span className="eyebrow">{item.badge || "FOURTH CROWN"}</span><h2>{item.name}</h2><p>{item.description}</p><div className="addon-list"><label>Optional extras</label>{addons.map(a => <button className={`addon ${addon?.id===a.id?"selected":""}`} key={a.id} onClick={() => setAddon(addon?.id===a.id?null:a)}><span>{a.name}</span><b>+{money(a.price)}</b></button>)}</div><button className="btn btn-dark full" onClick={() => onAdd(item, addon)}>Add to cart · {money(item.price+(addon?.price||0))}</button></div></div>;
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
  const [form, setForm] = useState({ name:"", phone:"", email:"", address:"" });
  const fee=fulfillment==="delivery"?Number(settings.deliveryFee):0, tax=total*Number(settings.taxRate)/100, grand=total+fee+tax;
  const submit=e=>{e.preventDefault();if(!form.name||!form.phone)return alert("Please enter your name and phone number.");onSubmit({...form,fulfillment});};
  if(!cart.length)return <Empty title="There is nothing to checkout." action={onBack}/>;
  return <main className="content narrow"><div className="page-heading"><div><span className="eyebrow">CHECKOUT</span><h1>Complete your order.</h1></div></div><form className="checkout" onSubmit={submit}><div className="fulfillment"><button type="button" className={fulfillment==="pickup"?"selected":""} onClick={()=>setFulfillment("pickup")}><ShoppingBag/> Pickup</button><button type="button" className={fulfillment==="delivery"?"selected":""} onClick={()=>setFulfillment("delivery")}><Truck/> Delivery</button></div><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>{fulfillment==="delivery"&&<label>Delivery address<textarea required value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>}<div className="summary"><span>Subtotal</span><b>{money(total)}</b><span>Delivery</span><b>{fee?money(fee):"Free"}</b><span>Tax</span><b>{money(tax)}</b><strong>Total</strong><strong>{money(grand)}</strong></div><button className="btn btn-dark full" disabled={!settings.acceptingOrders}>Place order · {money(grand)}</button>{!settings.acceptingOrders&&<p className="warning">Online ordering is currently paused by the restaurant.</p>}</form></main>;
}

function OrdersView({ orders }) { return <main className="content narrow"><div className="page-heading"><div><span className="eyebrow">ORDER HISTORY</span><h1>Your orders.</h1></div></div>{!orders.length?<Empty title="No orders yet." action={()=>{}}/>:<div className="orders-list">{orders.map(o=><article className="order-card" key={o.id}><div><b>{o.id}</b><small>{new Date(o.createdAt).toLocaleString()}</small></div><span className={`status ${o.status.toLowerCase().replaceAll(" ","-")}`}>{o.status}</span><strong>{money(o.total)}</strong><small>{o.items.reduce((s,i)=>s+i.quantity,0)} item(s) · {o.customer.fulfillment}</small></article>)}</div>}</main>; }

function AdminView({ authed,setAuthed,menu,setMenu,categories,setCategories,settings,setSettings,orders,updateOrderStatus,logout }) {
  const [tab,setTab]=useState("dashboard"),[credentials,setCredentials]=useState({email:"",password:""}),[newItem,setNewItem]=useState({name:"",price:"",category:"rice",description:""});
  if(!authed)return <main className="admin-login"><div className="admin-login-card"><span className="brand-mark large"><Crown/></span><span className="eyebrow">FOURTH CROWN ADMIN</span><h1>Operations portal</h1><p>Demo access for local testing. Replace with secure server authentication before launch.</p><input placeholder="Email" value={credentials.email} onChange={e=>setCredentials({...credentials,email:e.target.value})}/><input type="password" placeholder="Password" value={credentials.password} onChange={e=>setCredentials({...credentials,password:e.target.value})}/><button className="btn btn-dark full" onClick={()=>{if(credentials.email==="admin@fourthcrown.com"&&credentials.password==="FourthCrownDemo!"){sessionStorage.setItem("fcc_admin","1");setAuthed(true)}else alert("Demo credentials are incorrect.")}}>Sign in</button></div></main>;
  const revenue=orders.reduce((s,o)=>s+o.total,0);
  return <main className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><span className="brand-mark"><Crown size={17}/></span><b>FOURTH CROWN</b></div>{["dashboard","orders","menu","settings"].map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}<button onClick={logout}>Sign out</button></aside><section className="admin-main"><div className="admin-top"><div><span className="eyebrow">ADMINISTRATION</span><h1>{tab==="dashboard"?"Overview":tab[0].toUpperCase()+tab.slice(1)}</h1></div><span className="live-dot">● {settings.acceptingOrders?"Accepting orders":"Paused"}</span></div>{tab==="dashboard"&&<div className="dashboard"><div className="stats"><Stat label="Orders" value={orders.length}/><Stat label="Revenue" value={money(revenue)}/><Stat label="Menu items" value={menu.length}/><Stat label="Available" value={menu.filter(x=>x.available).length}/></div><section className="panel"><h2>Recent orders</h2>{orders.slice(0,5).map(o=><div className="admin-order" key={o.id}><b>{o.id}</b><span>{o.customer.name}</span><span>{money(o.total)}</span><select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>{["Received","Preparing","Ready","Out for delivery","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></div>)}{!orders.length&&<p className="muted">No orders yet. Place a customer test order to populate this area.</p>}</section></div>}{tab==="orders"&&<section className="panel">{orders.map(o=><div className="admin-order expanded" key={o.id}><div><b>{o.id}</b><small>{o.customer.name} · {o.customer.phone}</small></div><span>{o.customer.fulfillment}</span><strong>{money(o.total)}</strong><select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>{["Received","Preparing","Ready","Out for delivery","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></div>)}{!orders.length&&<p className="muted">No orders.</p>}</section>}{tab==="menu"&&<section className="panel"><div className="panel-head"><h2>Menu management</h2><span>Edit prices, availability and descriptions here.</span></div><div className="add-item"><input placeholder="Item name" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})}/><input type="number" placeholder="Price" value={newItem.price} onChange={e=>setNewItem({...newItem,price:e.target.value})}/><select value={newItem.category} onChange={e=>setNewItem({...newItem,category:e.target.value})}>{categories.filter(c=>c.id!=="popular").map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><input placeholder="Description" value={newItem.description} onChange={e=>setNewItem({...newItem,description:e.target.value})}/><button className="small-add" onClick={()=>{if(!newItem.name||!newItem.price)return;setMenu([...menu,{id:crypto.randomUUID(),...newItem,price:Number(newItem.price),available:true,badge:"",image:initialMenu[0].image}]);setNewItem({name:"",price:"",category:"rice",description:""})}}><Plus/> Add</button></div>{menu.map((item,i)=><div className="menu-admin-row" key={item.id}><input value={item.name} onChange={e=>setMenu(menu.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/><input type="number" value={item.price} onChange={e=>setMenu(menu.map((x,j)=>j===i?{...x,price:Number(e.target.value)}:x))}/><label className="switch"><input type="checkbox" checked={item.available} onChange={e=>setMenu(menu.map((x,j)=>j===i?{...x,available:e.target.checked}:x))}/><span>{item.available?"Available":"Sold out"}</span></label></div>)}</section>}{tab==="settings"&&<section className="panel settings-form"><label>Restaurant name<input value={settings.restaurantName} onChange={e=>setSettings({...settings,restaurantName:e.target.value})}/></label><label>Tagline<input value={settings.tagline} onChange={e=>setSettings({...settings,tagline:e.target.value})}/></label><label>Pickup location<input value={settings.pickupAddress} onChange={e=>setSettings({...settings,pickupAddress:e.target.value})}/></label><label>Delivery fee<input type="number" value={settings.deliveryFee} onChange={e=>setSettings({...settings,deliveryFee:Number(e.target.value)})}/></label><label>Tax rate (%)<input type="number" value={settings.taxRate} onChange={e=>setSettings({...settings,taxRate:Number(e.target.value)})}/></label><label className="checkline"><input type="checkbox" checked={settings.acceptingOrders} onChange={e=>setSettings({...settings,acceptingOrders:e.target.checked})}/> Accept online orders</label><p className="muted">These settings persist locally in this prototype. Production settings must be stored server-side with audit controls.</p></section>}</section></main>;
}

function Stat({label,value}){return <div className="stat"><small>{label}</small><strong>{value}</strong></div>}
function Empty({title,action}){return <div className="empty"><ShoppingBag size={30}/><h2>{title}</h2><button className="btn btn-dark" onClick={action}>Browse menu</button></div>}

createRoot(document.getElementById("root")).render(<App/>);
