export const initialCategories = [
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
  { id: "plantain", name: "Extra fried plantain", price: null },
  { id: "protein", name: "Extra grilled chicken", price: null },
  { id: "shito", name: "Kpakpo shito", price: null }
];

export const initialMenu = [
  { id: "jollof", category: "rice", name: "Ghanaian Jollof Rice", description: "Smoky Ghana-style jollof with grilled chicken, fried plantain and fresh tomato-onion relish.", ingredients: ["Tomato", "Red pepper", "Onion", "Ginger", "Garlic", "Jasmine rice", "Chicken"], price: null, available: true, badge: "Signature", image: foodImages.jollof, addons: defaultAddons },
  { id: "acheke", category: "rice", name: "Acheke", description: "Cassava couscous served with grilled fish, fried plantain and fresh tomato-onion relish.", ingredients: ["Acheke", "Grilled fish", "Plantain", "Tomato", "Onion", "Pepper"], price: null, available: true, badge: "Featured", image: foodImages.acheke, addons: [{id:"fish",name:"Extra grilled fish",price: null},{id:"plantain",name:"Extra fried plantain",price: null},{id:"shito",name:"Kpakpo shito",price: null}] },
  { id: "gari-fortor", category: "traditional", name: "Gari Fortor", description: "Ghanaian gari cooked into a rich tomato stew with egg, plantain and a hearty protein.", ingredients: ["Gari", "Tomato", "Onion", "Pepper", "Plantain", "Egg", "Goat meat"], price: null, available: true, badge: "Ghanaian favourite", image: foodImages.gariFotor, addons: defaultAddons },
  { id: "braised", category: "rice", name: "Braised Rice & Chicken", description: "Seasoned braised rice paired with tender chicken and a fresh side.", ingredients: ["Rice", "Onion", "Garlic", "Ginger", "Stock", "Chicken", "Spices"], price: null, available: true, badge: "Classic", image: foodImages.braised, addons: defaultAddons },
  { id: "plain", category: "rice", name: "Plain Rice & Stew", description: "Steamed white rice with rich Ghanaian tomato stew and tender protein.", ingredients: ["White rice", "Tomato", "Onion", "Pepper", "Garlic", "Ginger", "Chicken"], price: null, available: true, badge: "Classic", image: foodImages.plain, addons: defaultAddons },
  { id: "kelewele", category: "sides", name: "Kelewele", description: "Spiced fried plantain seasoned with ginger, pepper and warm Ghanaian spices.", ingredients: ["Ripe plantain", "Ginger", "Pepper", "Garlic", "Salt"], price: null, available: true, badge: "Classic", image: foodImages.kelewele, addons: [{id:"peanuts",name:"Roasted peanuts",price: null},{id:"shito",name:"Kpakpo shito",price: null}] },
  { id: "smallchops", category: "sides", name: "Ghanaian Small Chops", description: "A shareable selection of crispy bites made for gatherings and celebrations.", ingredients: ["Chicken", "Beef", "Flour", "Onion", "Pepper", "Ginger"], price: null, available: true, badge: "Shareable", image: foodImages.smallChops, addons: [{id:"large",name:"Make it a large box",price: null},{id:"shito",name:"Kpakpo shito",price: null}] },
  { id: "fufu-light", category: "swallows", name: "Fufu & Light Soup", description: "Soft Ghanaian fufu served with a bright, peppery light soup and tender protein.", ingredients: ["Fufu", "Tomato", "Pepper", "Onion", "Chicken", "Spices"], price: null, available: true, badge: "Traditional", image: foodImages.fufu, addons: [{id:"goat",name:"Goat meat",price: null},{id:"fish",name:"Extra fish",price: null},{id:"pepper",name:"Extra pepper",price: null}] },
  { id: "fufu-groundnut", category: "swallows", name: "Fufu & Groundnut Soup", description: "Fufu with creamy groundnut soup, rich spices and your choice of protein.", ingredients: ["Fufu", "Groundnut", "Tomato", "Pepper", "Chicken", "Spices"], price: null, available: true, badge: "Comfort food", image: foodImages.fufuGroundnut, addons: [{id:"goat",name:"Goat meat",price: null},{id:"fish",name:"Extra fish",price: null}] },
  { id: "fufu-palmnut", category: "swallows", name: "Fufu & Palm Nut Soup", description: "Traditional fufu paired with rich palm nut soup and a hearty protein.", ingredients: ["Fufu", "Palm nut", "Tomato", "Pepper", "Meat", "Spices"], price: null, available: true, badge: "Traditional", image: foodImages.fufuPalmnut, addons: [{id:"goat",name:"Goat meat",price: null},{id:"fish",name:"Extra fish",price: null}] },
  { id: "ampesi", category: "traditional", name: "Ampesi & Kontomire", description: "Boiled yam and ripe plantain served with rich kontomire stew and egg.", ingredients: ["Yam", "Plantain", "Kontomire", "Egg", "Onion", "Pepper"], price: null, available: true, badge: "Ghanaian classic", image: foodImages.ampesi, addons: [{id:"egg",name:"Extra egg",price: null},{id:"fish",name:"Smoked fish",price: null}] },
  { id: "waakye", category: "traditional", name: "Waakye", description: "Ghanaian rice and beans served with stew, plantain, egg and your choice of protein.", ingredients: ["Rice", "Beans", "Stew", "Plantain", "Egg", "Shito"], price: null, available: true, badge: "Popular", image: foodImages.waakye, addons: [{id:"egg",name:"Extra egg",price: null},{id:"plantain",name:"Extra plantain",price: null},{id:"beef",name:"Extra beef",price: null}] },
  { id: "red-red", category: "traditional", name: "Red Red & Plantain", description: "Slow-cooked bean stew with ripe fried plantain and a comforting Ghanaian finish.", ingredients: ["Beans", "Plantain", "Tomato", "Onion", "Palm oil", "Pepper"], price: null, available: true, badge: "Plant-based", image: foodImages.redRed, addons: [{id:"egg",name:"Add egg",price: null},{id:"fish",name:"Add fish",price: null}] },
  { id: "banku-tilapia", category: "grills", name: "Banku & Grilled Tilapia", description: "Soft banku with grilled tilapia, pepper sauce and fresh tomato-onion relish.", ingredients: ["Banku", "Tilapia", "Pepper", "Tomato", "Onion", "Lime"], price: null, available: true, badge: "Signature", image: foodImages.bankuTilapia, addons: [{id:"fish",name:"Extra tilapia",price: null},{id:"shito",name:"Kpakpo shito",price: null}] },
  { id: "kenkey-fish", category: "grills", name: "Kenkey & Fried Fish", description: "Traditional fermented corn kenkey with fried fish, hot pepper and fresh tomato relish.", ingredients: ["Kenkey", "Fried fish", "Tomato", "Onion", "Pepper"], price: null, available: true, badge: "Traditional", image: foodImages.kenkeyFish, addons: [{id:"fish",name:"Extra fish",price: null},{id:"pepper",name:"Extra pepper",price: null}] },
  { id: "grilled-tilapia", category: "grills", name: "Whole Grilled Tilapia", description: "Seasoned whole tilapia grilled until smoky, served with plantain and pepper relish.", ingredients: ["Tilapia", "Plantain", "Pepper", "Tomato", "Onion"], price: null, available: true, badge: "From the grill", image: foodImages.grilledTilapia, addons: [{id:"plantain",name:"Extra plantain",price: null},{id:"fish",name:"Extra fish portion",price: null}] },
  { id: "fried-yam", category: "sides", name: "Fried Yam & Shito", description: "Crisp fried yam served with house shito and a fresh pepper-tomato dip.", ingredients: ["Yam", "Shito", "Pepper", "Tomato"], price: null, available: true, badge: "Snack", image: foodImages.friedYam, addons: [{id:"chicken",name:"Add grilled chicken",price: null}] },
  { id: "yam-egg", category: "traditional", name: "Boiled Yam & Egg Stew", description: "Tender boiled yam with rich Ghanaian egg stew and fresh pepper.", ingredients: ["Yam", "Egg", "Tomato", "Onion", "Pepper"], price: null, available: true, badge: "Homestyle", image: foodImages.yamEgg, addons: [{id:"egg",name:"Extra egg",price: null},{id:"plantain",name:"Extra plantain",price: null}] },
  { id: "okro-banku", category: "swallows", name: "Banku & Okro Stew", description: "Soft banku with rich okro stew and a choice of fish or meat.", ingredients: ["Banku", "Okro", "Tomato", "Pepper", "Fish", "Meat"], price: null, available: true, badge: "Ghanaian favourite", image: foodImages.okroBanku, addons: [{id:"fish",name:"Extra fish",price: null},{id:"goat",name:"Goat meat",price: null}] },
  { id: "kokonte", category: "swallows", name: "Kokonte & Groundnut Soup", description: "Traditional kokonte paired with rich groundnut soup and tender protein.", ingredients: ["Kokonte", "Groundnut", "Tomato", "Pepper", "Meat", "Spices"], price: null, available: true, badge: "Heritage plate", image: foodImages.kokonte, addons: [{id:"goat",name:"Goat meat",price: null},{id:"fish",name:"Extra fish",price: null}] },
  { id: "tzo", category: "swallows", name: "Tuo Zaafi & Ayoyo Soup", description: "Northern Ghana-inspired tuo zaafi served with ayoyo soup and a hearty protein.", ingredients: ["Tuo Zaafi", "Ayoyo", "Tomato", "Pepper", "Meat"], price: null, available: true, badge: "Northern Ghana", image: foodImages.tzo, addons: [{id:"goat",name:"Goat meat",price: null},{id:"fish",name:"Extra fish",price: null}] },
  { id: "fried-rice", category: "rice", name: "Ghanaian Fried Rice", description: "Ghana-style fried rice with omelette, salad and spicy house sauce.", ingredients: ["Rice", "Egg", "Vegetables", "Chicken", "Pepper"], price: null, available: true, badge: "Favourite", image: foodImages.friedRice, addons: defaultAddons }
];

