import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Clock3, Crown, MapPin, Minus, PackageCheck, Plus, Search, ShoppingBag,
  Truck, Utensils, X, CreditCard, ShieldCheck, Settings2, WalletCards, Pencil, Save, Eye, EyeOff, Trash2, CircleHelp
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
  { id: "rice", name: "Rice & Grains" },
  { id: "swallows", name: "Swallows & Soups" },
  { id: "traditional", name: "Traditional Plates" },
  { id: "grills", name: "Grills & Fish" },
  { id: "sides", name: "Sides & Snacks" }
];

const foodImages = {
  // Real Ghanaian food photographs researched from Wikimedia Commons.
  // The filenames below point to the exact dish photos rather than generic stock images.
  jollof: "https://upload.wikimedia.org/wikipedia/commons/1/16/Ghanian_food.jpg",
  waakye: "https://upload.wikimedia.org/wikipedia/commons/7/7e/LOCAL_FOOD_CALLED_WAAKYE_IN_GHANA.jpg",
  gariFotor: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Gari_Fotor.jpg",
  braised: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Home_made_Braised_rice_with_egg.jpg",
  plain: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Plain_rice_with_stew.jpg",
  kelewele: "https://upload.wikimedia.org/wikipedia/commons/5/52/Kelewele_%28Ghana_Food%29.jpg",
  smallChops: "https://upload.wikimedia.org/wikipedia/commons/e/e9/A_box_of_small_chops.jpg",
  fufu: "https://upload.wikimedia.org/wikipedia/commons/d/da/Fufu_and_%27light_soup.jpg",
  fufuGroundnut: "https://upload.wikimedia.org/wikipedia/commons/1/18/Fufuo_and_peanut_butter_soup.jpg",
  fufuPalmnut: "https://upload.wikimedia.org/wikipedia/commons/2/26/Fufu_with_palmnut_soup_and_chicken.jpg",
  ampesi: "https://upload.wikimedia.org/wikipedia/commons/5/58/Ampesi.jpg",
  redRed: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Beans%2C_gari%2C_red_oil_and_ripe_plantain.jpg",
  bankuTilapia: "https://upload.wikimedia.org/wikipedia/commons/8/86/Banku_and_Grilled_Tilapia.jpg",
  kenkeyFish: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Ghana_Kenkey.jpg",
  grilledTilapia: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Grilled_Tilapia_Ghana.JPG",
  friedYam: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Fried_yam_with_shito.jpg",
  yamEgg: "https://upload.wikimedia.org/wikipedia/commons/7/73/Boiled_yam_with_egg_stew.jpg",
  okroBanku: "https://upload.wikimedia.org/wikipedia/commons/0/06/Banku_with_Okro_Soup.jpg",
  kokonte: "https://upload.wikimedia.org/wikipedia/commons/9/94/Konkonte_and_groundnut_soup.jpg",
  tzo: "https://upload.wikimedia.org/wikipedia/commons/5/57/Tuo_zaafi.jpg",
  friedRice: "https://upload.wikimedia.org/wikipedia/commons/a/af/Ghanaian_fried_rice.jpg",
  acheke: "/images/acheke.jpg"
};

const defaultAddons = [
  { id: "plantain", name: "Extra fried plantain", price: 3 },
  { id: "protein", name: "Extra grilled chicken", price: 5 },
  { id: "shito", name: "Kpakpo shito", price: 1.5 }
];

const initialMenu = [
  { id: "jollof", category: "rice", name: "Ghanaian Jollof Rice", description: "Smoky Ghana-style jollof with grilled chicken, fried plantain and fresh tomato-onion relish.", ingredients: ["Tomato", "Red pepper", "Onion", "Ginger", "Garlic", "Jasmine rice", "Chicken"], price: 16, available: true, badge: "Signature", image: foodImages.jollof, addons: defaultAddons },
  { id: "acheke", category: "rice", name: "Acheke", description: "Cassava couscous served with grilled fish, fried plantain and fresh tomato-onion relish.", ingredients: ["Acheke", "Grilled fish", "Plantain", "Tomato", "Onion", "Pepper"], price: 19, available: true, badge: "Featured", image: foodImages.acheke, addons: [{id:"fish",name:"Extra grilled fish",price:6},{id:"plantain",name:"Extra fried plantain",price:3},{id:"shito",name:"Kpakpo shito",price:1.5}] },
  { id: "gari-fortor", category: "traditional", name: "Gari Fortor", description: "Ghanaian gari cooked into a rich tomato stew with egg, plantain and a hearty protein.", ingredients: ["Gari", "Tomato", "Onion", "Pepper", "Plantain", "Egg", "Goat meat"], price: 19, available: true, badge: "Ghanaian favourite", image: foodImages.gariFotor, addons: defaultAddons },
  { id: "braised", category: "rice", name: "Braised Rice & Chicken", description: "Seasoned braised rice paired with tender chicken and a fresh side.", ingredients: ["Rice", "Onion", "Garlic", "Ginger", "Stock", "Chicken", "Spices"], price: 17, available: true, badge: "Classic", image: foodImages.braised, addons: defaultAddons },
  { id: "plain", category: "rice", name: "Plain Rice & Stew", description: "Steamed white rice with rich Ghanaian tomato stew and tender protein.", ingredients: ["White rice", "Tomato", "Onion", "Pepper", "Garlic", "Ginger", "Chicken"], price: 15, available: true, badge: "Classic", image: foodImages.plain, addons: defaultAddons },
  { id: "kelewele", category: "sides", name: "Kelewele", description: "Spiced fried plantain seasoned with ginger, pepper and warm Ghanaian spices.", ingredients: ["Ripe plantain", "Ginger", "Pepper", "Garlic", "Salt"], price: 9, available: true, badge: "Classic", image: foodImages.kelewele, addons: [{id:"peanuts",name:"Roasted peanuts",price:1.5},{id:"shito",name:"Kpakpo shito",price:1.5}] },
  { id: "smallchops", category: "sides", name: "Ghanaian Small Chops", description: "A shareable selection of crispy bites made for gatherings and celebrations.", ingredients: ["Chicken", "Beef", "Flour", "Onion", "Pepper", "Ginger"], price: 14, available: true, badge: "Shareable", image: foodImages.smallChops, addons: [{id:"large",name:"Make it a large box",price:7},{id:"shito",name:"Kpakpo shito",price:1.5}] },
  { id: "fufu-light", category: "swallows", name: "Fufu & Light Soup", description: "Soft Ghanaian fufu served with a bright, peppery light soup and tender protein.", ingredients: ["Fufu", "Tomato", "Pepper", "Onion", "Chicken", "Spices"], price: 20, available: true, badge: "Traditional", image: foodImages.fufu, addons: [{id:"goat",name:"Goat meat",price:5},{id:"fish",name:"Extra fish",price:6},{id:"pepper",name:"Extra pepper",price:1}] },
  { id: "fufu-groundnut", category: "swallows", name: "Fufu & Groundnut Soup", description: "Fufu with creamy groundnut soup, rich spices and your choice of protein.", ingredients: ["Fufu", "Groundnut", "Tomato", "Pepper", "Chicken", "Spices"], price: 21, available: true, badge: "Comfort food", image: foodImages.fufuGroundnut, addons: [{id:"goat",name:"Goat meat",price:5},{id:"fish",name:"Extra fish",price:6}] },
  { id: "fufu-palmnut", category: "swallows", name: "Fufu & Palm Nut Soup", description: "Traditional fufu paired with rich palm nut soup and a hearty protein.", ingredients: ["Fufu", "Palm nut", "Tomato", "Pepper", "Meat", "Spices"], price: 21, available: true, badge: "Traditional", image: foodImages.fufuPalmnut, addons: [{id:"goat",name:"Goat meat",price:5},{id:"fish",name:"Extra fish",price:6}] },
  { id: "ampesi", category: "traditional", name: "Ampesi & Kontomire", description: "Boiled yam and ripe plantain served with rich kontomire stew and egg.", ingredients: ["Yam", "Plantain", "Kontomire", "Egg", "Onion", "Pepper"], price: 18, available: true, badge: "Ghanaian classic", image: foodImages.ampesi, addons: [{id:"egg",name:"Extra egg",price:2},{id:"fish",name:"Smoked fish",price:5}] },
  { id: "waakye", category: "traditional", name: "Waakye", description: "Ghanaian rice and beans served with stew, plantain, egg and your choice of protein.", ingredients: ["Rice", "Beans", "Stew", "Plantain", "Egg", "Shito"], price: 18, available: true, badge: "Popular", image: foodImages.waakye, addons: [{id:"egg",name:"Extra egg",price:2},{id:"plantain",name:"Extra plantain",price:3},{id:"beef",name:"Extra beef",price:5}] },
  { id: "red-red", category: "traditional", name: "Red Red & Plantain", description: "Slow-cooked bean stew with ripe fried plantain and a comforting Ghanaian finish.", ingredients: ["Beans", "Plantain", "Tomato", "Onion", "Palm oil", "Pepper"], price: 16, available: true, badge: "Plant-based", image: foodImages.redRed, addons: [{id:"egg",name:"Add egg",price:2},{id:"fish",name:"Add fish",price:5}] },
  { id: "banku-tilapia", category: "grills", name: "Banku & Grilled Tilapia", description: "Soft banku with grilled tilapia, pepper sauce and fresh tomato-onion relish.", ingredients: ["Banku", "Tilapia", "Pepper", "Tomato", "Onion", "Lime"], price: 23, available: true, badge: "Signature", image: foodImages.bankuTilapia, addons: [{id:"fish",name:"Extra tilapia",price:9},{id:"shito",name:"Kpakpo shito",price:1.5}] },
  { id: "kenkey-fish", category: "grills", name: "Kenkey & Fried Fish", description: "Traditional fermented corn kenkey with fried fish, hot pepper and fresh tomato relish.", ingredients: ["Kenkey", "Fried fish", "Tomato", "Onion", "Pepper"], price: 20, available: true, badge: "Traditional", image: foodImages.kenkeyFish, addons: [{id:"fish",name:"Extra fish",price:6},{id:"pepper",name:"Extra pepper",price:1}] },
  { id: "grilled-tilapia", category: "grills", name: "Whole Grilled Tilapia", description: "Seasoned whole tilapia grilled until smoky, served with plantain and pepper relish.", ingredients: ["Tilapia", "Plantain", "Pepper", "Tomato", "Onion"], price: 24, available: true, badge: "From the grill", image: foodImages.grilledTilapia, addons: [{id:"plantain",name:"Extra plantain",price:3},{id:"fish",name:"Extra fish portion",price:9}] },
  { id: "fried-yam", category: "sides", name: "Fried Yam & Shito", description: "Crisp fried yam served with house shito and a fresh pepper-tomato dip.", ingredients: ["Yam", "Shito", "Pepper", "Tomato"], price: 10, available: true, badge: "Snack", image: foodImages.friedYam, addons: [{id:"chicken",name:"Add grilled chicken",price:5}] },
  { id: "yam-egg", category: "traditional", name: "Boiled Yam & Egg Stew", description: "Tender boiled yam with rich Ghanaian egg stew and fresh pepper.", ingredients: ["Yam", "Egg", "Tomato", "Onion", "Pepper"], price: 16, available: true, badge: "Homestyle", image: foodImages.yamEgg, addons: [{id:"egg",name:"Extra egg",price:2},{id:"plantain",name:"Extra plantain",price:3}] },
  { id: "okro-banku", category: "swallows", name: "Banku & Okro Stew", description: "Soft banku with rich okro stew and a choice of fish or meat.", ingredients: ["Banku", "Okro", "Tomato", "Pepper", "Fish", "Meat"], price: 21, available: true, badge: "Ghanaian favourite", image: foodImages.okroBanku, addons: [{id:"fish",name:"Extra fish",price:6},{id:"goat",name:"Goat meat",price:5}] },
  { id: "kokonte", category: "swallows", name: "Kokonte & Groundnut Soup", description: "Traditional kokonte paired with rich groundnut soup and tender protein.", ingredients: ["Kokonte", "Groundnut", "Tomato", "Pepper", "Meat", "Spices"], price: 21, available: true, badge: "Heritage plate", image: foodImages.kokonte, addons: [{id:"goat",name:"Goat meat",price:5},{id:"fish",name:"Extra fish",price:6}] },
  { id: "tzo", category: "swallows", name: "Tuo Zaafi & Ayoyo Soup", description: "Northern Ghana-inspired tuo zaafi served with ayoyo soup and a hearty protein.", ingredients: ["Tuo Zaafi", "Ayoyo", "Tomato", "Pepper", "Meat"], price: 21, available: true, badge: "Northern Ghana", image: foodImages.tzo, addons: [{id:"goat",name:"Goat meat",price:5},{id:"fish",name:"Extra fish",price:6}] },
  { id: "fried-rice", category: "rice", name: "Ghanaian Fried Rice", description: "Ghana-style fried rice with omelette, salad and spicy house sauce.", ingredients: ["Rice", "Egg", "Vegetables", "Chicken", "Pepper"], price: 17, available: true, badge: "Favourite", image: foodImages.friedRice, addons: defaultAddons }
];

function loadMenu() {
  const stored = load("fcc_menu", initialMenu);
  // Migrate built-in items and append any newly introduced built-ins to an older local cache.
  const canonical = Object.fromEntries(initialMenu.map(item => [item.id, item]));
  const migrated = stored.map(item => {
    const base = canonical[item.id];
    if (!base) return item;
    return { ...base, ...item, image: base.image, ingredients: base.ingredients, addons: item.addons || base.addons, name: base.name, description: base.description, badge: base.badge };
  });
  const existingIds = new Set(migrated.map(item => item.id));
  return [...migrated, ...initialMenu.filter(item => !existingIds.has(item.id))];
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
  const [adminAuthed, setAdminAuthed] = useState(() => sessionStorage.getItem("fcc_admin") === "1");

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

  function createPaidOrder(pending, payment) {
    const order = {
      id: `FCC-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customer: pending.customer,
      items: pending.items,
      subtotal: pending.subtotal,
      deliveryFee: pending.deliveryFee,
      tax: pending.tax,
      total: pending.total,
      status: "Received",
      paymentStatus: "Paid",
      paymentSessionId: payment.id
    };
    setOrders(current => [order, ...current]);
    sessionStorage.removeItem("fcc_pending_order");
    setCart([]);
    setView("orders");
  }

  function updateOrderStatus(id, status) {
    setOrders(current => current.map(order => order.id === id ? { ...order, status } : order));
  }

  if (window.location.pathname === "/payment-success") return <PaymentSuccessView onPaid={createPaidOrder} />;
  if (window.location.pathname === "/admin") return <AdminView authed={adminAuthed} setAuthed={setAdminAuthed} menu={menu} setMenu={setMenu} categories={categories} setCategories={setCategories} settings={settings} setSettings={setSettings} orders={orders} updateOrderStatus={updateOrderStatus} logout={() => {sessionStorage.removeItem("fcc_admin");setAdminAuthed(false);}} />;

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

function Home({ onBrowse, settings, onAdd }) {
  const featured = [initialMenu[0], initialMenu[1], initialMenu[8]];
  const best = [initialMenu[0], initialMenu[12], initialMenu[13]];
  const [serviceSlide, setServiceSlide] = useState(0);
  const [foodSlide, setFoodSlide] = useState(0);
  const foodCarousel = initialMenu.slice(0, 8);
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
      <div className="fc-menu-mini-grid">{[initialMenu[1], initialMenu[11], initialMenu[12]].map(item => <button key={item.id} className="mini-food" onClick={onBrowse}><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/><span>{item.name}</span><b>{money(item.price)}</b></button>)}</div>
    </section>

    <section className="fc-testimonials">
      <div className="fc-section-heading"><div><span className="fc-label">WHAT THEY SAY</span><h2>Good food.<br/><em>Good feelings.</em></h2></div></div>
      <div className="quote-grid"><article><span>★★★★★</span><p>“The jollof arrived looking just as good as it tasted. Rich, smoky and full of flavour.”</p><b>Atlanta customer</b></article><article><span>★★★★★</span><p>“The ordering experience was simple, the food was packed well and everything tasted fresh.”</p><b>Pickup customer</b></article><article><span>★★★★★</span><p>“Kelewele and small chops are exactly what I wanted for a relaxed evening at home.”</p><b>Delivery customer</b></article></div>
    </section>

    <section className="fc-story">
      <div className="fc-story-image"><img src={initialMenu[1].image} alt="Acheke with grilled fish and plantain"/><span>ROOTED IN<br/>GHANA.</span></div>
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
    <div className="fc-dish-image"><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/><span>{item.badge || "FOURTH CROWN"}</span><button aria-label={`Quick add ${item.name}`} onClick={() => onAdd(item)}><Plus size={18}/></button></div>
    <div className="fc-dish-info"><span>0{index+1}</span><div><h3>{item.name}</h3><p>{item.description}</p><div className="dish-ingredients">{(item.ingredients || []).slice(0,5).map(x=><small key={x}>{x}</small>)}</div><div className="dish-purchase"><div><small>Starting price</small><strong>{money(item.price)}</strong></div><button className="card-customize" onClick={() => setOpen(true)}>Customize & add <ArrowRight size={13}/></button></div></div></div>
    {open && <ItemModal item={item} onClose={() => setOpen(false)} onAdd={(food, addon) => { onAdd(food, addon); setOpen(false); }} />}
  </article>;
}

function MenuView({ menu, categories, selectedCategory, setSelectedCategory, onSelect, onAdd }) {
  const [search, setSearch] = useState("");
  const filtered = (selectedCategory === "popular" ? menu : menu.filter(x => x.category === selectedCategory)).filter(x => `${x.name} ${x.description}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="content menu-page"><div className="page-heading"><div><span className="eyebrow">FOURTH CROWN MENU</span><h1>Choose your plate.</h1><p className="menu-helper"><CircleHelp size={14}/> Tap <b>Customize & add</b> if you want extras. Use <b>Quick add</b> for the regular plate.</p></div><div className="search-box"><Search size={16}/><input placeholder="Search jollof, fufu, ampesi..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div><div className="category-tabs">{categories.map(c => <button key={c.id} className={selectedCategory===c.id?"active":""} onClick={() => setSelectedCategory(c.id)}>{c.name}</button>)}</div><div className="menu-grid">{filtered.map(item => <article className="menu-card" key={item.id}><button className="food-placeholder" onClick={() => onSelect(item)}><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/>{item.badge && <b>{item.badge}</b>}</button><div className="menu-card-body"><div className="menu-card-title"><h3>{item.name}</h3></div><div className="menu-price-row"><span>Starting price</span><strong>{money(item.price)}</strong></div><p>{item.description}</p><div className="card-actions"><span className={item.available?"available":"sold"}>{item.available?"Available":"Sold out"}</span><div className="menu-card-buttons"><button className="small-add secondary" disabled={!item.available} onClick={() => onSelect(item)}>Customize & add</button><button className="small-add" disabled={!item.available} onClick={() => onAdd(item)}><Plus size={14}/> Quick add</button></div></div></div></article>)}</div></main>;
}

function ItemModal({ item, onClose, onAdd }) {
  const [addons, setAddons] = useState([]);
  const options = item.addons || defaultAddons;
  const toggle = a => setAddons(current => current.some(x=>x.id===a.id) ? current.filter(x=>x.id!==a.id) : [...current,a]);
  const extraTotal = addons.reduce((s,a)=>s+a.price,0);
  return <div className="modal-backdrop" onMouseDown={e => e.target===e.currentTarget && onClose()}><div className="modal food-detail-modal"><button className="modal-close" onClick={onClose}><X/></button><div className="modal-food"><img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.style.display="none"; e.currentTarget.parentElement.classList.add("image-failed")}}/></div><span className="eyebrow">{item.badge || "FOURTH CROWN"}</span><h2>{item.name}</h2><p>{item.description}</p><div className="easy-order-note"><Settings2 size={15}/><span><b>Make it yours.</b> Extras are optional. Tap anything you want, then add your plate.</span></div><div className="addon-list"><label>Choose optional extras</label>{options.map(a => <button type="button" className={`addon ${addons.some(x=>x.id===a.id)?"selected":""}`} key={a.id} onClick={() => toggle(a)}><span><i>{addons.some(x=>x.id===a.id)?"✓":"+"}</i>{a.name}</span><b>{a.price ? `+${money(a.price)}` : "Included"}</b></button>)}</div><button className="btn btn-dark full" onClick={() => onAdd(item, addons.length ? {id:addons.map(a=>a.id).join("+"),name:addons.map(a=>a.name).join(", "),price:extraTotal}:null)}>Add to cart · {money(item.price+extraTotal)}</button></div></div>;
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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [form, setForm] = useState({ name:"", phone:"", email:"", address:"" });
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const fee=fulfillment==="delivery"?Number(settings.deliveryFee):0, tax=total*Number(settings.taxRate)/100, grand=total+fee+tax;
  const submit=async e=>{
    e.preventDefault();
    setPaymentError("");
    if(!form.name||!form.phone)return setPaymentError("Please enter your name and phone number.");
    if(fulfillment==="delivery"&&!form.address)return setPaymentError("Please enter your delivery address.");
    if(paymentMethod==="pay-later") return onSubmit({...form,fulfillment,paymentMethod,status:"Payment pending"});
    try {
      setPaying(true);
      const response = await fetch("/api/create-checkout-session", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ customer:form, fulfillment, items:cart, totals:{subtotal:total,deliveryFee:fee,tax,total:grand} }) });
      const data = await response.json();
      if(!response.ok || !data.url) throw new Error(data.error || "Online payment is not configured yet.");
      sessionStorage.setItem("fcc_pending_order", JSON.stringify({ customer:{...form,fulfillment},items:cart,subtotal:total,deliveryFee:fee,tax,total:grand,createdAt:new Date().toISOString() }));
      window.location.href = data.url;
    } catch(err) { setPaymentError(err.message || "Payment could not be started. Please try again."); setPaying(false); }
  };
  if(!cart.length)return <Empty title="There is nothing to checkout." action={onBack}/>;
  return <main className="content narrow"><div className="page-heading"><div><span className="eyebrow">CHECKOUT</span><h1>Almost there.</h1><p className="checkout-intro">Choose pickup or delivery, enter your details, then pay securely.</p></div></div><form className="checkout" onSubmit={submit}><div className="checkout-step"><span>01</span><div><b>How do you want your order?</b><small>Pick up yourself or have it delivered.</small></div></div><div className="fulfillment"><button type="button" className={fulfillment==="pickup"?"selected":""} onClick={()=>setFulfillment("pickup")}><ShoppingBag/> <span>Pickup</span><small>Collect your order</small></button><button type="button" className={fulfillment==="delivery"?"selected":""} onClick={()=>setFulfillment("delivery")}><Truck/> <span>Delivery</span><small>Bring it to me</small></button></div><div className="checkout-step"><span>02</span><div><b>Your details</b><small>We only need what is necessary to complete your order.</small></div></div><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Emmanuel Boateng"/></label><label>Phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="e.g. 404 555 0198"/></label><label>Email <small>(optional)</small><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>{fulfillment==="delivery"&&<label>Delivery address<textarea required value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Street, city, ZIP code"/></label>}<div className="checkout-step"><span>03</span><div><b>Payment</b><small>Choose how you want to pay.</small></div></div><div className="payment-methods"><button type="button" className={paymentMethod==="card"?"selected":""} onClick={()=>setPaymentMethod("card")}><CreditCard size={18}/><span><b>Pay securely online</b><small>Card, Apple Pay or Google Pay where available</small></span><ShieldCheck size={16}/></button><button type="button" className={paymentMethod==="pay-later"?"selected":""} onClick={()=>setPaymentMethod("pay-later")}><WalletCards size={18}/><span><b>Pay at pickup</b><small>Use only if the restaurant enables it</small></span></button></div><div className="summary"><span>Subtotal</span><b>{money(total)}</b><span>Delivery</span><b>{fee?money(fee):"Free"}</b><span>Tax</span><b>{money(tax)}</b><strong>Total</strong><strong>{money(grand)}</strong></div>{paymentError&&<div className="payment-error"><CircleHelp size={16}/>{paymentError}</div>}<button className="btn btn-dark full payment-submit" disabled={!settings.acceptingOrders||paying}>{paying?"Opening secure payment…":paymentMethod==="card"?`Continue to secure payment · ${money(grand)}`:`Place order · ${money(grand)}`}</button>{!settings.acceptingOrders&&<p className="warning">Online ordering is currently paused by the restaurant.</p>}<p className="secure-note"><ShieldCheck size={14}/> Your payment details are handled by the payment provider; FOURTH CROWN does not store card numbers in this app.</p></form></main>;
}

function PaymentSuccessView({ onPaid }) {
  const [state,setState]=useState("checking");
  const [message,setMessage]=useState("Confirming your payment securely…");
  useEffect(()=>{
    const run=async()=>{
      const pending=JSON.parse(sessionStorage.getItem("fcc_pending_order")||"null");
      const sessionId=new URLSearchParams(window.location.search).get("session_id");
      if(!pending || !sessionId){setState("error");setMessage("We could not find the order session. Please contact FOURTH CROWN before paying again.");return;}
      try{
        const r=await fetch(`/api/verify-checkout-session?session_id=${encodeURIComponent(sessionId)}`);
        const data=await r.json();
        if(!r.ok || !data.paid) throw new Error(data.error||"Payment has not been confirmed.");
        setState("success");setMessage("Payment received. Your order has been sent to FOURTH CROWN.");
        window.setTimeout(()=>onPaid(pending,data),900);
      }catch(err){setState("error");setMessage(err.message||"Payment could not be verified.");}
    }; run();
  },[]);
  return <main className="payment-result"><div className={`payment-result-card ${state}`}><div className="payment-result-icon">{state==="success"?<CheckCircle2 size={34}/>:state==="error"?<CircleHelp size={34}/>:<CreditCard size={34}/>}</div><span className="eyebrow">FOURTH CROWN PAYMENT</span><h1>{state==="success"?"Thank you.":state==="error"?"Payment check needed":"Checking payment…"}</h1><p>{message}</p>{state==="error"&&<a href="tel:8504656422">Call 850 465 6422</a>}</div></main>;
}

function OrdersView({ orders }) { return <main className="content narrow"><div className="page-heading"><div><span className="eyebrow">ORDER HISTORY</span><h1>Your orders.</h1></div></div>{!orders.length?<Empty title="No orders yet." action={()=>{}}/>:<div className="orders-list">{orders.map(o=><article className="order-card" key={o.id}><div><b>{o.id}</b><small>{new Date(o.createdAt).toLocaleString()}</small></div><span className={`status ${o.status.toLowerCase().replaceAll(" ","-")}`}>{o.status}</span><strong>{money(o.total)}</strong><small>{o.items.reduce((s,i)=>s+i.quantity,0)} item(s) · {o.customer.fulfillment}</small></article>)}</div>}</main>; }

function AdminView({ authed,setAuthed,menu,setMenu,categories,setCategories,settings,setSettings,orders,updateOrderStatus,logout }) {
  const [tab,setTab]=useState("dashboard"),[credentials,setCredentials]=useState({email:"",password:""}),[editing,setEditing]=useState(null),[newItem,setNewItem]=useState({name:"",price:"",category:"rice",description:""});
  if(!authed)return <main className="admin-login"><div className="admin-login-card"><img className="admin-login-logo" src="/images/fourth-crown-logo-transparent.png" alt="FOURTH CROWN"/><span className="eyebrow">FOURTH CROWN ADMIN</span><h1>Restaurant control centre</h1><p>Simple controls for everyday restaurant work. You do not need to know how to code.</p><label>Email<input placeholder="Email" value={credentials.email} onChange={e=>setCredentials({...credentials,email:e.target.value})}/></label><label>Password<input type="password" placeholder="Password" value={credentials.password} onChange={e=>setCredentials({...credentials,password:e.target.value})}/></label><button className="btn btn-dark full" onClick={()=>{if(credentials.email==="admin@fourthcrown.com"&&credentials.password==="FourthCrownDemo!"){sessionStorage.setItem("fcc_admin","1");setAuthed(true)}else alert("Demo credentials are incorrect.")}}>Sign in</button><small className="admin-demo-note">Demo login: admin@fourthcrown.com · FourthCrownDemo!</small></div></main>;
  const revenue=orders.reduce((s,o)=>s+o.total,0);
  const updateItem=(id,patch)=>setMenu(current=>current.map(item=>item.id===id?{...item,...patch}:item));
  const addItem=()=>{if(!newItem.name||!newItem.price)return;setMenu([...menu,{id:crypto.randomUUID(),...newItem,price:Number(newItem.price),available:true,badge:"",image:foodImages.jollof,addons:defaultAddons}]);setNewItem({name:"",price:"",category:"rice",description:""});};
  return <main className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><img src="/images/fourth-crown-logo-transparent.png" alt="FOURTH CROWN"/></div>{[["dashboard","Overview"],["orders","Orders"],["menu","Menu & prices"],["settings","Restaurant settings"]].map(([id,label])=><button className={tab===id?"active":""} onClick={()=>setTab(id)} key={id}>{label}</button>)}<a href="/" className="admin-view-site">View customer site</a><button onClick={logout}>Sign out</button></aside><section className="admin-main"><div className="admin-top"><div><span className="eyebrow">RESTAURANT CONTROL CENTRE</span><h1>{tab==="dashboard"?"Today’s overview":tab==="menu"?"Menu & prices":tab==="orders"?"Orders":"Restaurant settings"}</h1></div><span className="live-dot">● {settings.acceptingOrders?"Accepting orders":"Ordering paused"}</span></div>
    {tab==="dashboard"&&<div className="dashboard"><div className="stats"><Stat label="Orders" value={orders.length}/><Stat label="Revenue" value={money(revenue)}/><Stat label="Menu items" value={menu.length}/><Stat label="Available today" value={menu.filter(x=>x.available).length}/></div><section className="panel admin-help"><h2>What do you want to do?</h2><div className="admin-quick"><button onClick={()=>setTab("menu")}><Utensils/><b>Change a food</b><span>Price, name, photo or sold-out status</span></button><button onClick={()=>setTab("orders")}><ShoppingBag/><b>Check new orders</b><span>See what customers have ordered</span></button><button onClick={()=>setTab("settings")}><Settings2/><b>Change restaurant settings</b><span>Delivery fee, tax and ordering</span></button></div></section><section className="panel"><h2>Recent orders</h2>{orders.slice(0,6).map(o=><div className="admin-order" key={o.id}><b>{o.id}</b><span>{o.customer.name}</span><span>{money(o.total)}</span><select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>{["Received","Preparing","Ready","Out for delivery","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></div>)}{!orders.length&&<p className="muted">No orders yet.</p>}</section></div>}
    {tab==="orders"&&<section className="panel"><div className="panel-head"><div><h2>Customer orders</h2><span>Change the status as the kitchen works.</span></div></div>{orders.map(o=><div className="admin-order expanded" key={o.id}><div><b>{o.id}</b><small>{o.customer.name} · {o.customer.phone}</small></div><span>{o.customer.fulfillment}</span><strong>{money(o.total)}</strong><select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>{["Received","Preparing","Ready","Out for delivery","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></div>)}{!orders.length&&<p className="muted">No orders.</p>}</section>}
    {tab==="menu"&&<section className="panel menu-manager"><div className="panel-head"><div><h2>Easy menu editor</h2><span>Everything below changes what customers see. No coding required.</span></div></div><div className="admin-tip"><CircleHelp size={16}/><span><b>Quick rule:</b> Turn a food off when you run out. Change the price when you need to. Customers see the change immediately.</span></div><div className="add-item easy-add"><input placeholder="Food name" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})}/><input type="number" placeholder="Price ($)" value={newItem.price} onChange={e=>setNewItem({...newItem,price:e.target.value})}/><select value={newItem.category} onChange={e=>setNewItem({...newItem,category:e.target.value})}>{categories.filter(c=>c.id!=="popular").map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><input placeholder="Short description" value={newItem.description} onChange={e=>setNewItem({...newItem,description:e.target.value})}/><button className="small-add" onClick={addItem}><Plus/> Add food</button></div><div className="admin-menu-list">{menu.map(item=><article className={`admin-menu-card ${item.available?"":"is-off"}`} key={item.id}><img src={item.image} alt=""/><div className="admin-menu-main">{editing===item.id?<><input value={item.name} onChange={e=>updateItem(item.id,{name:e.target.value})}/><textarea value={item.description} onChange={e=>updateItem(item.id,{description:e.target.value})}/><select value={item.category} onChange={e=>updateItem(item.id,{category:e.target.value})}>{categories.filter(c=>c.id!=="popular").map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></>:<><h3>{item.name}</h3><p>{item.description}</p><span>{categories.find(c=>c.id===item.category)?.name || "Menu"}</span></>}</div><div className="admin-menu-price"><label>Price<input type="number" value={item.price} onChange={e=>updateItem(item.id,{price:Number(e.target.value)})}/></label><label className="admin-switch"><input type="checkbox" checked={item.available} onChange={e=>updateItem(item.id,{available:e.target.checked})}/><span>{item.available?<><Eye size={14}/> On menu</>:<><EyeOff size={14}/> Sold out</>}</span></label><button className="icon-admin" onClick={()=>setEditing(editing===item.id?null:item.id)}>{editing===item.id?<Save size={16}/>:<Pencil size={16}/>}<span>{editing===item.id?"Done":"Edit"}</span></button></div></article>)}</div></section>}
    {tab==="settings"&&<section className="panel settings-form"><div className="settings-intro"><Settings2/><div><h2>Restaurant settings</h2><p>Use plain settings here. These are the things you normally change during the week.</p></div></div><label>Restaurant name<input value={settings.restaurantName} onChange={e=>setSettings({...settings,restaurantName:e.target.value})}/></label><label>Tagline<input value={settings.tagline} onChange={e=>setSettings({...settings,tagline:e.target.value})}/></label><label>Pickup location<input value={settings.pickupAddress} onChange={e=>setSettings({...settings,pickupAddress:e.target.value})}/></label><label>Delivery fee ($)<input type="number" value={settings.deliveryFee} onChange={e=>setSettings({...settings,deliveryFee:Number(e.target.value)})}/></label><label>Tax rate (%)<input type="number" value={settings.taxRate} onChange={e=>setSettings({...settings,taxRate:Number(e.target.value)})}/></label><label className="checkline"><input type="checkbox" checked={settings.acceptingOrders} onChange={e=>setSettings({...settings,acceptingOrders:e.target.checked})}/> Accept online orders</label><div className="settings-callout"><CreditCard size={18}/><div><b>Online payments</b><p>Stripe Checkout is prepared in this build. Add your Stripe secret key in Vercel before taking live card payments.</p></div></div></section>}</section></main>;
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
