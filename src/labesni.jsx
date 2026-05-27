import { useState, useRef, useEffect } from "react";

/* ══════════════════════════════════════════
   TUNISIAN STORE CATALOGUE — VERIFIED URLS
══════════════════════════════════════════ */
const STORES = {
  // ── International brands with TN sites ──
  "Zara Tunisia":      { url:"https://www.zara.com/tn/en/search?searchTerm=",           logo:"Z",  color:"#1a1a1a", tag:"Int'l" },
  "Mango Tunisia":     { url:"https://shop.mango.com/tn/en/search?q=",                  logo:"M",  color:"#8b4513", tag:"Int'l" },
  "Bershka TN":        { url:"https://www.bershka.com/tn/en/search?q=",                 logo:"B",  color:"#e65c00", tag:"Int'l" },
  "Pull&Bear TN":      { url:"https://www.pullandbear.com/tn/en/search?q=",             logo:"PB", color:"#5a4a3a", tag:"Int'l" },
  "Stradivarius TN":   { url:"https://www.stradivarius.com/tn/en/search?q=",            logo:"S",  color:"#7a6a5a", tag:"Int'l" },
  "H&M Tunisia":       { url:"https://www2.hm.com/tn_ar/search-results.html?q=",        logo:"H&M",color:"#cc0000", tag:"Int'l" },
  // ── Sports brands ──
  "Nike Tunisia":      { url:"https://www.jumia.com.tn/nike-shoes/?q=",               logo:"✓",  color:"#111111", tag:"Sport" },
  "Adidas Tunisia":    { url:"https://www.jumia.com.tn/adidas/?q=",             logo:"A",  color:"#000000", tag:"Sport" },
  "New Balance TN":    { url:"https://www.jumia.com.tn/new-balance/?q=",        logo:"NB", color:"#cf142b", tag:"Sport" },
  "Puma Tunisia":      { url:"https://www.jumia.com.tn/puma/?q=",               logo:"P",  color:"#00552c", tag:"Sport" },
  // ── Budget / Local ──
  "LC Waikiki TN":     { url:"https://www.lcwaikiki.com/tn-TN/TN/search?q=",            logo:"LC", color:"#0066cc", tag:"Budget" },
  "Defacto TN":        { url:"https://www.defacto.com/search?q=",                       logo:"D",  color:"#003d99", tag:"Budget" },
  // ── Tunisian marketplace ──
  "Jumia Tunisia":     { url:"https://www.jumia.com.tn/mltn/?q=",                    logo:"J",  color:"#f68b1e", tag:"Marketplace" },
  "Tayara Fashion":    { url:"https://www.tayara.tn/ads/c/Mode_et_Vetements/?q=",       logo:"T",  color:"#e84b4b", tag:"Local" },
  // ── Local Tunisian brands ──
  "Azura TN":          { url:"https://www.azura-boutique.com/search?q=",                logo:"Az", color:"#0080ff", tag:"Local" },
  "Lyoum":             { url:"https://www.lyoum.com/search?q=",                         logo:"Ly", color:"#c4a882", tag:"Local" },
};

const STORE_NAMES = Object.keys(STORES);

const OCCASIONS = ["Casual Friday","Work / Office","Job Interview","Family Visit","3ors (Wedding)","Khotba (Engagement)","Eid Outfit","Ramadan Evening","Beach / Sidi Bou Said","Night Out Tunis","University","Travel"];
const STYLES    = ["Minimal","Elegant","Streetwear","Sporty","Classic","Bohemian","Smart Casual","Traditional Fusion"];
const BUDGETS   = [
  { label:"Budget",    sub:"Under 50 TND",  val:"under 50 TND",  usd:"~$15" },
  { label:"Mid-range", sub:"50–150 TND",    val:"50–150 TND",    usd:"~$15–50" },
  { label:"Premium",   sub:"150–400 TND",   val:"150–400 TND",   usd:"~$50–130" },
  { label:"Luxury",    sub:"400+ TND",      val:"400+ TND",      usd:"$130+" },
];
const GENDERS = ["Men","Women","Unisex"];
const CITIES  = ["Tunis","Ariana","Ben Arous","Manouba","Nabeul","Zaghouan","Bizerte","Béja","Jendouba","Le Kef","Siliana","Sousse","Monastir","Mahdia","Sfax","Kairouan","Kasserine","Sidi Bouzid","Gabès","Medenine","Tataouine","Gafsa","Tozeur","Kebili"];
const CAT_EMOJI = { tops:"👕",bottoms:"👖",shoes:"👟",outerwear:"🧥",accessories:"👜",dresses:"👗",unknown:"👔" };
const CATS = ["tops","bottoms","shoes","outerwear","accessories","dresses"];
const VIBE_CLR = { Sharp:"#2c3e50",Relaxed:"#27ae60",Bold:"#c0392b",Elegant:"#8e44ad",Classic:"#d4a017",Fresh:"#2980b9",Fusion:"#e67e22",default:"#b8975a" };

/* ─── TOKENS ─── */
const BG="#faf8f5",GOLD="#c9a96e",CREAM="#1a1a1a",DIM="#7a6a5a",MUTE="#b0a090",BORDER="rgba(180,150,100,.18)";
const CARD="rgba(255,255,255,.9)",CARDBORDER="rgba(180,150,100,.2)";
const SL = { fontSize:10,color:GOLD,letterSpacing:2,fontFamily:"'Outfit',sans-serif",fontWeight:600,marginBottom:10,marginTop:20,textTransform:"uppercase" };

/* ─── HELPERS ─── */
const toB64 = f => new Promise((r,j)=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result.split(",")[1]); fr.onerror=j; fr.readAsDataURL(f); });
const parseJSON = raw => { try{ return JSON.parse(raw.replace(/```json|```/g,"").trim()); }catch{ return null; } };

/* Build a DIRECT product URL for a store */
function buildBuyUrl(store, productName, color="") {
  // Always use Google Shopping - always works, no broken links
  return `https://www.google.com/search?q=${encodeURIComponent(productName+" "+color+" buy Tunisia")}&tbm=shop`;
}

/* ─── CLAUDE API ─── */
async function callClaude(prompt, imgB64=null, imgMime=null) {
  const content = [];
  if(imgB64) content.push({ type:"image", source:{ type:"base64", media_type:imgMime, data:imgB64 }});
  content.push({ type:"text", text:prompt });
  const res = await fetch("https://labesni-d9bj.onrender.com/api/claude",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ messages:[{role:"user",content}] })
  });
  const d = await res.json();
  if(d.error) throw new Error(JSON.stringify(d.error));
  if(!d.content) throw new Error('Bad response: '+JSON.stringify(d).slice(0,200));
  return d.content.map(b=>b.text||"").join("");
}

/* ── Analyse photo ── */
async function analyseImage(b64, mime, profile) {
  const raw = await callClaude(
    `You are Labesni, a Tunisian AI fashion stylist. Analyse this clothing photo.
User: gender=${profile.gender||"unisex"}, styles=${profile.styles?.join(",")||"any"}.
Return ONLY valid JSON (no markdown):
{"name":"short descriptive name","category":"tops|bottoms|shoes|outerwear|accessories|dresses|unknown","color":"main color","colorHex":"closest hex","style":"Casual|Formal|Sporty|Elegant|Streetwear|Classic|Traditional","material":"Cotton|Denim|Leather|Wool|Synthetic|Linen|Unknown","season":"All|Summer|Winter|Spring|Autumn"}`,
    b64, mime
  );
  return parseJSON(raw)||{name:"Clothing item",category:"unknown",color:"",colorHex:"#888",style:"Casual",material:"Unknown",season:"All"};
}

/* ── Analyse body photo ── */
async function analyseBodyPhoto(b64, mime, gender) {
  const raw = await callClaude(
    `You are Labesni, a respectful Tunisian AI fashion stylist. Analyse this full-body photo to help with clothing suggestions.
Gender: ${gender||"unisex"}.
Focus ONLY on fashion-relevant body attributes. Be kind, positive, and professional.
Return ONLY valid JSON (no markdown):
{
  "bodyType": "one of: Slim | Athletic | Average | Curvy | Plus-size | Petite | Tall-slim | Tall-athletic",
  "heightImpression": "Petite | Average | Tall",
  "skinTone": "one of: Fair | Light | Medium | Olive | Tan | Brown | Deep",
  "shoulderWidth": "Narrow | Medium | Broad",
  "keyFeatures": ["list up to 3 features to dress for e.g. Long legs, Broad shoulders, Petite frame"],
  "fitTips": ["up to 3 practical fit tips based on body type"],
  "colorsToWear": ["3-4 colors that suit this skin tone"],
  "avoidColors": ["1-2 colors that may not flatter"],
  "styleNotes": "one warm sentence about their natural style strengths"
}`,
    b64, mime
  );
  return parseJSON(raw) || null;
}

/* ── Search clothes from internet (text query) ── */
async function searchInternetClothes(query, profile) {
  const bodyCtx = profile.body ? `Body type: ${profile.body.bodyType}, ${profile.body.heightImpression}, skin tone: ${profile.body.skinTone}. Fit tips: ${profile.body.fitTips?.join(", ")}.` : "";
  const raw = await callClaude(
    `You are Labesni, a Tunisian AI fashion stylist. The user is searching for: "${query}".
User: gender=${profile.gender||"unisex"}, budget=${profile.budget||"mid-range"}, city=${profile.city||"Tunis"}.
${bodyCtx}
Find 6 real clothing items matching this search that are available from Tunisian or international stores shipping to Tunisia.
Mix brands — use different stores for each item. Consider the user's body type and skin tone when selecting colors and fits.
Available stores: ${STORE_NAMES.join(", ")}.

Return ONLY valid JSON:
{"results":[{
  "name":"exact product name",
  "brand":"store name from the list above",
  "category":"tops|bottoms|shoes|outerwear|accessories|dresses",
  "color":"color",
  "colorHex":"#hex",
  "style":"Casual|Formal|Sporty|Elegant|Streetwear|Classic",
  "material":"material",
  "priceTND":"estimated price e.g. 80–120 TND",
  "description":"one sentence description",
  "imageKeyword":"specific clothing photo keyword e.g. black nike sneakers, white linen shirt"
}]}`
  );
  const parsed = parseJSON(raw);
  if(!parsed?.results) return [];
  // attach direct buy URLs
  return parsed.results.map(item=>({
    ...item,
    buyUrl: buildBuyUrl(item.brand, item.name, item.color)
  }));
}

async function getItemSuggestions(item, wardrobe, profile) {
  const others = wardrobe.filter(w=>w.id!==item.id&&!w.analyzing).map(w=>`${w.name}(${w.category},${w.color})`).join("; ")||"none";
  const raw = await callClaude(
    `You are Labesni, a Tunisian AI fashion stylist. Respond in English only. Be specific and personal — reference the actual item by name and color.
User: gender=${profile.gender||"unisex"}, styles=${profile.styles?.join(",")||"any"}, budget=${profile.budget||"mid"}, city=${profile.city||"Tunis"}.
IMPORTANT — City context: The user is in ${profile.city||"Tunis"}. Suggest stores that ship to or are accessible from ${profile.city||"Tunis"}. For users in smaller cities (Kasserine, Gabès, Sidi Bouzid, Tataouine, Tozeur, Kebili, Medenine, etc.), prioritize online stores like Jumia Tunisia and Tayara that deliver nationwide, plus any local Tunisian brands. For larger cities (Tunis, Sfax, Sousse, Bizerte), include all store types.
Item: "${item.name}" – ${item.category}, ${item.color}${item.colorHex?" ("+item.colorHex+")":""}, style: ${item.style||"casual"}.
Wardrobe: ${others}.
Available stores: ${STORE_NAMES.join(", ")}.

Be specific — e.g. "Your ${item.color} ${item.name} pairs perfectly with slim navy chinos" or "This ${item.color} ${item.category} works great for a casual Tunisian summer look".
Mix different brands/stores for buyItems.

Return ONLY valid JSON:
{
  "closetPairs":[{"name":"wardrobe item name","reason":"specific reason referencing the ${item.color} ${item.name} and how they work together"}],
  "buyItems":[{
    "name":"product name",
    "brand":"store name from available list — prefer delivery-friendly stores for ${profile.city||"Tunis"}",
    "category":"clothing type",
    "color":"color",
    "colorHex":"#hex",
    "why":"specific styling tip: how this item pairs with the ${item.color} ${item.name} for ${profile.city||"Tunis"} context",
    "priceTND":"xx–xx TND",
    "description":"short product description"
  }],
  "styleTip":"one practical tip specifically about styling this ${item.color} ${item.name} in ${profile.city||"Tunis"}"
}
closetPairs: up to 3. buyItems: exactly 3, ALL from DIFFERENT stores.`
  );
  const parsed = parseJSON(raw)||{closetPairs:[],buyItems:[],styleTip:""};
  if(parsed.buyItems) {
    parsed.buyItems = parsed.buyItems.map(b=>({
      ...b,
      buyUrl: buildBuyUrl(b.brand, b.name, b.color)
    }));
  }
  return parsed;
}

async function getStarterSuggestions(profile) {
  const raw = await callClaude(
    `You are Labesni, a Tunisian AI fashion stylist. The user just set up their profile.
User: name=${profile.name||"User"}, gender=${profile.gender}, city=${profile.city}, styles=${profile.styles.join(", ")}, occasions=${profile.occasions.join(", ")||"general"}, budget=${profile.budget}, brands=${profile.brands.join(", ")||"any"}.
City context: User is in ${profile.city}. ${["Kasserine","Gabès","Sidi Bouzid","Tataouine","Tozeur","Kebili","Medenine","Gafsa","Siliana","Le Kef","Jendouba","Béja","Zaghouan","Mahdia"].includes(profile.city)?"Prioritize Jumia Tunisia and Tayara (nationwide delivery) plus Tunisian local brands for this city. Avoid suggesting stores that only have physical locations in Tunis or Sfax.":"Mix online and physical store options available in "+profile.city+"."}
Available stores: ${STORE_NAMES.join(", ")}.
Prices in TND. 8–10 items total. Mix brands — each item from a different store that serves ${profile.city}.

TONE: Be warm, confident and direct. Write like a professional stylist.

Return ONLY valid JSON:
{
  "headline":"short punchy headline e.g. 'Your Minimal ${profile.city} Wardrobe'",
  "intro":"2 sentences. Warm and professional. Reference their style and city.",
  "categories":[{
    "name":"category e.g. Tops",
    "items":[{
      "name":"product name",
      "brand":"store name from the list — must deliver to or be in ${profile.city}",
      "category":"tops|bottoms|shoes|outerwear|accessories|dresses",
      "color":"color",
      "colorHex":"#hex",
      "why":"why it fits their profile — professional, specific to ${profile.city} context",
      "priceTND":"xx–xx TND",
      "description":"short clean description"
    }]
  }]
}`
  );
  const parsed = parseJSON(raw);
  if(parsed?.categories) {
    parsed.categories = parsed.categories.map(cat=>({
      ...cat,
      items: cat.items.map(item=>({
        ...item,
        buyUrl: buildBuyUrl(item.brand, item.name, item.color)
      }))
    }));
  }
  return parsed;
}

/* ── Generate outfits (mix-brand completions) ── */
async function generateOutfits(wardrobe, occasion, styleVision, profile) {
  const desc = wardrobe.filter(w=>!w.analyzing).map(i=>`${i.name}(${i.category},${i.color})`).join("; ");
  const isSmallCity = ["Kasserine","Gabès","Sidi Bouzid","Tataouine","Tozeur","Kebili","Medenine","Gafsa","Siliana","Le Kef","Jendouba","Béja","Zaghouan","Mahdia"].includes(profile.city||"");
  const raw = await callClaude(
    `You are Labesni, a Tunisian AI fashion stylist. Respond in English only.
User: gender=${profile.gender||"unisex"}, styles=${profile.styles?.join(",")||"any"}, budget=${profile.budget||"mid"}, city=${profile.city||"Tunis"}.
City: ${profile.city||"Tunis"}. ${isSmallCity?"Prefer stores with nationwide delivery (Jumia Tunisia, Tayara) for buy recommendations.":"Mix online and in-store options."}
Wardrobe: ${desc}. Occasion: ${occasion}. Style: ${styleVision}.
Available stores: ${STORE_NAMES.join(", ")}.

Build 3 outfit combinations from ONLY the wardrobe items. Reference each item specifically by its name and color (e.g. "the blue denim jacket" not just "jacket").
For each outfit suggest 1 item to buy to complete/elevate it — pick the BEST store accessible from ${profile.city||"Tunis"}.

Return ONLY valid JSON:
{"outfits":[{
  "name":"outfit name",
  "items":["exact item name","exact item name"],
  "tip":"specific style tip referencing the actual item colors and ${profile.city||"Tunis"} context",
  "vibe":"Sharp|Relaxed|Bold|Elegant|Classic|Fresh|Fusion",
  "buyToComplete":{
    "name":"product name",
    "brand":"best store accessible from ${profile.city||"Tunis"}",
    "category":"clothing type",
    "color":"color",
    "colorHex":"#hex",
    "why":"why this specific item completes this outfit — reference the wardrobe items by color and name",
    "priceTND":"xx–xx TND"
  }
}]}`
  );
  const parsed = parseJSON(raw);
  const outfits = parsed?.outfits||[];
  return outfits.map(o=>({
    ...o,
    buyToComplete: o.buyToComplete ? {
      ...o.buyToComplete,
      buyUrl: buildBuyUrl(o.buyToComplete.brand, o.buyToComplete.name, o.buyToComplete.color)
    } : null
  }));
}

/* ══════════════════════
   MICRO COMPONENTS
══════════════════════ */
function Dots({ text="Loading…" }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"16px 0"}}>
      <div style={{display:"flex",gap:5}}>
        {[0,.18,.36].map((d,i)=>(
          <div key={i} style={{width:7,height:7,borderRadius:"50%",background:GOLD,
            animation:`dot 1.1s ${d}s ease-in-out infinite`}}/>
        ))}
      </div>
      <span style={{fontSize:11,color:MUTE,fontFamily:"'Outfit',sans-serif",letterSpacing:1.5,textTransform:"uppercase"}}>{text}</span>
      <style>{`@keyframes dot{0%,80%,100%{transform:scale(.6);opacity:.35}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

function Chip({ children, active, onClick, small }) {
  return (
    <button onClick={onClick} style={{
      padding:small?"6px 12px":"9px 16px", borderRadius:30,
      border:`1.5px solid ${active?GOLD:"rgba(180,150,100,.25)"}`,
      background:active?"rgba(201,169,110,.15)":"rgba(255,255,255,.7)",
      color:active?"#1a1a1a":DIM, fontFamily:"'Outfit',sans-serif",
      fontSize:small?12:13, cursor:"pointer", transition:"all .18s", whiteSpace:"nowrap", outline:"none"
    }}>{children}</button>
  );
}

function GoldBtn({ children, onClick, disabled, ghost, style:sx={} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", border:ghost?`1.5px solid rgba(201,169,110,.4)`:"none",
      borderRadius:14, padding:"15px 24px", fontSize:14,
      fontFamily:"'Outfit',sans-serif", fontWeight:600,
      cursor:disabled?"not-allowed":"pointer", letterSpacing:1.5, textTransform:"uppercase",
      transition:"all .2s",
      background:ghost?"transparent":disabled?"rgba(201,169,110,.15)":"linear-gradient(135deg,#c9a96e,#a07840)",
      color:ghost?DIM:disabled?MUTE:"#fff",
      boxShadow:(!ghost&&!disabled)?"0 4px 20px rgba(201,169,110,.3)":"none", ...sx
    }}>{children}</button>
  );
}

/* Store badge */
function StoreBadge({ storeName, small }) {
  const s = STORES[storeName];
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      fontSize:small?10:11, fontFamily:"'Outfit',sans-serif",
      color:"#8a6a3a", background:"rgba(201,169,110,.12)",
      border:"1px solid rgba(201,169,110,.3)",
      borderRadius:20, padding:small?"2px 8px":"3px 10px",
      whiteSpace:"nowrap"
    }}>
      {s?.tag&&<span style={{fontSize:9,background:"rgba(201,169,110,.2)",borderRadius:10,padding:"1px 5px",color:DIM}}>{s.tag}</span>}
      {storeName}
    </span>
  );
}

/* Direct buy button */
function BuyBtn({ url, label="Buy Now →" }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center", gap:5,
      padding:"9px 16px", borderRadius:10, textDecoration:"none",
      background:"linear-gradient(135deg,#c9a96e,#a07840)",
      color:"#fff", fontSize:12, fontFamily:"'Outfit',sans-serif", letterSpacing:.5,
      fontWeight:600, transition:"all .18s", boxShadow:"0 2px 10px rgba(201,169,110,.25)"
    }}>🛍 {label}</a>
  );
}

/* ══════════════════════════
   INTERNET SEARCH SCREEN
══════════════════════════ */
function SearchClothesScreen({ profile, onAddToCloset, onClose }) {
  const [query,setQuery]     = useState("");
  const [results,setResults] = useState([]);
  const [searchError,setSearchError] = useState(null);
  const [loading,setLoading] = useState(false);
  const [added,setAdded]     = useState({});
  const [filter,setFilter]   = useState("all");

  const doSearch = async () => {
    if(!query.trim()) return;
    setLoading(true); setResults([]); setSearchError(null);
    try {
      const r = await searchInternetClothes(query, profile);
      setResults(r);
      if(!r||r.length===0) setSearchError("No results found. Try a different search.");
    } catch(e) {
      setSearchError("AI search failed: " + e.message);
    }
    setLoading(false);
  };

  const handleAdd = (item) => {
    setAdded(p=>({...p,[item.name]:true}));
    onAddToCloset(item);
  };

  const filtered = filter==="all" ? results : results.filter(r=>r.category===filter);

  return (
    <div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(250,248,245,.98)",
      backdropFilter:"blur(18px)",display:"flex",flexDirection:"column",
      overflowY:"auto",animation:"slideUp .25s ease"}}>
      <div style={{maxWidth:580,width:"100%",margin:"0 auto",padding:"20px 16px 80px"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:18,fontWeight:600,color:CREAM,fontFamily:"'Playfair Display',serif"}}>Search Clothes</div>
            <div style={{fontSize:11,color:MUTE,fontFamily:"'Outfit',sans-serif",marginTop:2}}>Find & add items from Tunisian stores</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(201,169,110,.1)",border:`1px solid rgba(201,169,110,.3)`,
            borderRadius:"50%",width:34,height:34,color:GOLD,cursor:"pointer",fontSize:16,
            display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        {/* search bar */}
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&doSearch()}
            placeholder="e.g. white linen shirt, black sneakers, summer dress…"
            style={{flex:1,padding:"13px 15px",borderRadius:12,
              border:`1.5px solid rgba(201,169,110,.3)`,background:"#fff",
              color:CREAM,fontFamily:"'Outfit',sans-serif",fontSize:14,outline:"none"}}
          />
          <button onClick={doSearch} style={{
            background:"linear-gradient(135deg,#c9a96e,#a07840)",border:"none",
            borderRadius:12,padding:"0 18px",color:"#fff",cursor:"pointer",
            fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:600,letterSpacing:1,flexShrink:0
          }}>Search</button>
        </div>

        {/* quick searches */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:MUTE,fontFamily:"'Outfit',sans-serif",letterSpacing:1.5,marginBottom:8}}>QUICK SEARCH</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {["White shirt men","Black sneakers","Summer dress","Slim jeans","Linen pants","Sport tee","Formal jacket","Casual shorts"].map(q=>(
              <button key={q} onClick={()=>{setQuery(q);}} style={{
                padding:"6px 12px",borderRadius:20,border:`1px solid rgba(184,151,90,.18)`,
                background:"rgba(255,255,255,.03)",color:DIM,
                fontFamily:"'Outfit',sans-serif",fontSize:12,cursor:"pointer"
              }}>{q}</button>
            ))}
          </div>
        </div>

        {loading && <Dots text="Searching Tunisian stores…"/>}

        {results.length>0&&(
          <>
            {/* category filter */}
            <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:18,paddingBottom:4}}>
              {["all",...CATS].map(c=>(
                <button key={c} onClick={()=>setFilter(c)} style={{
                  padding:"5px 12px",borderRadius:20,flexShrink:0,
                  border:`1px solid ${filter===c?GOLD:"rgba(184,151,90,.18)"}`,
                  background:filter===c?"rgba(184,151,90,.13)":"transparent",
                  color:filter===c?CREAM:DIM,fontFamily:"'Outfit',sans-serif",fontSize:11,cursor:"pointer"
                }}>{c==="all"?"All":c}</button>
              ))}
            </div>

            <div style={{fontSize:11,color:MUTE,fontFamily:"'Outfit',sans-serif",letterSpacing:1,marginBottom:14}}>
              {filtered.length} RESULTS · TAP + TO ADD TO YOUR CLOSET
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {filtered.map((item,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.03)",borderRadius:16,
                  border:`1px solid ${added[item.name]?"rgba(90,154,90,.3)":BORDER}`,
                  overflow:"hidden",transition:"border-color .2s"}}>
                  <img
                    src={`https://loremflickr.com/400/300/${encodeURIComponent((item.imageKeyword||item.name).split(" ").slice(0,3).join(","))}`}
                    alt={item.name}
                    style={{width:"100%",height:180,objectFit:"cover",display:"block"}}
                    onError={e=>{e.target.style.display="none";}}
                  />
                  <div style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{flex:1,marginRight:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                        {item.colorHex&&<div style={{width:10,height:10,borderRadius:"50%",background:item.colorHex,border:"1px solid rgba(255,255,255,.15)",flexShrink:0}}/>}
                        <span style={{fontSize:14,color:CREAM,fontFamily:"'Outfit',sans-serif",fontWeight:500}}>{item.name}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                        <StoreBadge storeName={item.brand} small/>
                        <span style={{fontSize:11,color:MUTE,fontFamily:"'Outfit',sans-serif",textTransform:"capitalize"}}>{item.category}</span>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:13,color:"#7aba7a",fontFamily:"'Outfit',sans-serif",fontWeight:600}}>{item.priceTND}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:MUTE,fontFamily:"'Outfit',sans-serif",lineHeight:1.65,marginBottom:12}}>{item.description}</div>
                  <div style={{display:"flex",gap:8}}>
                    <BuyBtn url={item.buyUrl} label="Search in Store →"/>
                    <button onClick={()=>handleAdd(item)} disabled={added[item.name]} style={{
                      flex:1,padding:"9px 12px",borderRadius:10,cursor:added[item.name]?"default":"pointer",
                      border:added[item.name]?"1px solid rgba(90,154,90,.3)":"1px solid rgba(184,151,90,.22)",
                      background:added[item.name]?"rgba(90,154,90,.1)":"rgba(255,255,255,.04)",
                      color:added[item.name]?"#7aba7a":CREAM,
                      fontFamily:"'Outfit',sans-serif",fontSize:12,letterSpacing:.5,transition:"all .2s"
                    }}>{added[item.name]?"✓ In Closet":"+ Add to Closet"}</button>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading&&searchError&&(
          <div style={{textAlign:"center",padding:"32px 0",color:"#c0392b"}}>
            <div style={{fontSize:40,marginBottom:10}}>⚠️</div>
            <p style={{fontFamily:"'Outfit',sans-serif",fontSize:13}}>{searchError}</p>
          </div>
        )}

        {!loading&&results.length===0&&query&&!searchError&&(
          <div style={{textAlign:"center",padding:"32px 0",color:MUTE}}>
            <div style={{fontSize:40,marginBottom:10}}>🔍</div>
            <p style={{fontFamily:"'Outfit',sans-serif",fontSize:13}}>No results yet — try searching above</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════
   STARTER WARDROBE SCREEN
══════════════════════════ */
function StarterScreen({ profile, onDone, onAddToCloset }) {
  const [data,setData]     = useState(null);
  const [loading,setLoading] = useState(true);
  const [added,setAdded]   = useState({});

  useEffect(()=>{
    (async()=>{
      try{ const r=await getStarterSuggestions(profile); setData(r); }catch{}
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const handleAdd = item => { setAdded(p=>({...p,[item.name]:true})); onAddToCloset(item); };

  if(loading) return (
    <div style={{minHeight:"80vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 22px"}}>
      <div style={{fontSize:52,marginBottom:18}}>✨</div>
      <h2 style={{fontSize:24,fontWeight:400,color:CREAM,fontFamily:"'Playfair Display',serif",marginBottom:8}}>Building your wardrobe…</h2>
      <p style={{color:DIM,fontSize:13,fontFamily:"'Outfit',sans-serif",lineHeight:1.8,maxWidth:280,marginBottom:24}}>
        Labesni is curating the perfect starter wardrobe from Tunisian stores, mixed brands, at your budget.
      </p>
      <Dots text="Styling for you…"/>
    </div>
  );

  if(!data) return (
    <div style={{padding:"40px 22px",textAlign:"center"}}>
      <p style={{color:DIM,fontFamily:"'Outfit',sans-serif",marginBottom:20}}>Couldn't load. You can add clothes manually.</p>
      <GoldBtn onClick={onDone}>Go to My Closet</GoldBtn>
    </div>
  );

  return (
    <div style={{animation:"fadeIn .4s ease"}}>
      <div style={{marginBottom:24}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(184,151,90,.1)",
          border:`1px solid rgba(184,151,90,.22)`,borderRadius:20,padding:"4px 12px",marginBottom:14}}>
          <span style={{fontSize:10,color:GOLD,fontFamily:"'Outfit',sans-serif",letterSpacing:2}}>🇹🇳 CURATED FOR YOU · MIXED BRANDS</span>
        </div>
        <h2 style={{fontSize:26,fontWeight:400,color:CREAM,fontFamily:"'Playfair Display',serif",marginBottom:7,lineHeight:1.3}}>{data.headline||"Your Starter Wardrobe"}</h2>
        <p style={{color:DIM,fontSize:13,fontFamily:"'Outfit',sans-serif",lineHeight:1.75}}>{data.intro}</p>
      </div>

      {data.categories?.map((cat,ci)=>(
        <div key={ci} style={{marginBottom:26}}>
          <div style={{fontSize:11,color:GOLD,letterSpacing:2,fontFamily:"'Outfit',sans-serif",fontWeight:500,marginBottom:12,display:"flex",alignItems:"center",gap:7}}>
            <span>{CAT_EMOJI[cat.items?.[0]?.category]||"👔"}</span>
            <span>{cat.name.toUpperCase()}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {cat.items?.map((item,ii)=>(
              <div key={ii} style={{background:"rgba(255,255,255,.03)",borderRadius:15,
                border:`1px solid ${added[item.name]?"rgba(90,154,90,.3)":BORDER}`,padding:"14px 15px",transition:"border-color .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                  <div style={{flex:1,marginRight:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                      {item.colorHex&&<div style={{width:9,height:9,borderRadius:"50%",background:item.colorHex,border:"1px solid rgba(255,255,255,.15)",flexShrink:0}}/>}
                      <span style={{fontSize:14,color:CREAM,fontFamily:"'Outfit',sans-serif",fontWeight:500}}>{item.name}</span>
                    </div>
                    <StoreBadge storeName={item.brand} small/>
                  </div>
                  <div style={{fontSize:13,color:"#7aba7a",fontFamily:"'Outfit',sans-serif",fontWeight:600,flexShrink:0}}>{item.priceTND}</div>
                </div>
                <div style={{fontSize:12,color:MUTE,fontFamily:"'Outfit',sans-serif",lineHeight:1.65,marginBottom:11}}>{item.why}</div>
                <div style={{display:"flex",gap:8}}>
                  <BuyBtn url={item.buyUrl} label="Buy Directly"/>
                  <button onClick={()=>handleAdd(item)} disabled={added[item.name]} style={{
                    flex:1,padding:"9px 10px",borderRadius:10,cursor:added[item.name]?"default":"pointer",
                    border:added[item.name]?"1px solid rgba(90,154,90,.3)":"1px solid rgba(184,151,90,.2)",
                    background:added[item.name]?"rgba(90,154,90,.1)":"rgba(255,255,255,.03)",
                    color:added[item.name]?"#7aba7a":CREAM,
                    fontFamily:"'Outfit',sans-serif",fontSize:12,letterSpacing:.5,transition:"all .2s"
                  }}>{added[item.name]?"✓ Added":"+ Closet"}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{position:"sticky",bottom:0,background:"rgba(12,10,7,.96)",borderTop:`1px solid ${BORDER}`,padding:"12px 0 12px",marginTop:8}}>
        <GoldBtn onClick={onDone}>Go to My Closet →</GoldBtn>
        <p style={{textAlign:"center",marginTop:7,fontSize:11,color:MUTE,fontFamily:"'Outfit',sans-serif"}}>Add any item to your closet anytime</p>
      </div>
    </div>
  );
}

/* ══════════════════════════
   ITEM DETAIL PANEL
══════════════════════════ */
function ItemPanel({ item, wardrobe, onClose, onRefresh }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(250,248,245,.98)",
      backdropFilter:"blur(18px)",display:"flex",flexDirection:"column",overflowY:"auto",animation:"slideUp .25s ease"}}>
      <div style={{maxWidth:580,width:"100%",margin:"0 auto",padding:"20px 16px 80px"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span style={{fontSize:11,color:GOLD,fontFamily:"'Outfit',sans-serif",letterSpacing:2}}>ITEM DETAILS</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.06)",border:`1px solid rgba(184,151,90,.2)`,
            borderRadius:"50%",width:34,height:34,color:GOLD,cursor:"pointer",fontSize:16,
            display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        {/* hero */}
        <div style={{display:"flex",gap:13,marginBottom:18,background:"rgba(255,255,255,.03)",border:`1px solid ${BORDER}`,borderRadius:16,padding:13,alignItems:"flex-start"}}>
          <div style={{width:90,height:116,borderRadius:11,overflow:"hidden",flexShrink:0,background:"#1a1410",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {item.url
              ?<img alt="clothing item" src={item.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              :<div style={{fontSize:34,opacity:.5}}>{CAT_EMOJI[item.category]||"👔"}</div>
            }
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,color:CREAM,fontFamily:"'Playfair Display',serif",marginBottom:7,lineHeight:1.3}}>{item.name}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:7}}>
              {item.brand&&<StoreBadge storeName={item.brand} small/>}
              <span style={{fontSize:11,background:"rgba(184,151,90,.12)",color:GOLD,borderRadius:20,padding:"2px 9px",fontFamily:"'Outfit',sans-serif",textTransform:"capitalize"}}>{item.category}</span>
              {item.style&&<span style={{fontSize:11,background:"rgba(255,255,255,.05)",color:DIM,borderRadius:20,padding:"2px 9px",fontFamily:"'Outfit',sans-serif"}}>{item.style}</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              {item.colorHex&&<div style={{width:9,height:9,borderRadius:"50%",background:item.colorHex,border:"1px solid rgba(255,255,255,.15)"}}/>}
              <span style={{fontSize:11,color:DIM,fontFamily:"'Outfit',sans-serif"}}>{item.color}{item.material&&item.material!=="Unknown"?` · ${item.material}`:""}</span>
            </div>
            {item.buyUrl&&(
              <div style={{marginTop:9}}>
                <BuyBtn url={item.buyUrl} label="Buy This Item →"/>
              </div>
            )}
          </div>
        </div>

        {item.loadingSugg&&<Dots text="Finding suggestions from Tunisian stores…"/>}

        {item.suggestions&&(
          <>
            {item.suggestions.styleTip&&(
              <div style={{background:"rgba(184,151,90,.07)",border:`1px solid rgba(184,151,90,.17)`,borderRadius:13,padding:"12px 15px",marginBottom:16}}>
                <div style={{fontSize:10,color:GOLD,letterSpacing:2,fontFamily:"'Outfit',sans-serif",marginBottom:5}}>AI STYLE TIP</div>
                <p style={{margin:0,color:"#c0a878",fontSize:13,fontFamily:"'Outfit',sans-serif",lineHeight:1.75,fontStyle:"italic"}}>{item.suggestions.styleTip}</p>
              </div>
            )}

            {item.suggestions.closetPairs?.length>0&&(
              <>
                <div style={{fontSize:10,color:GOLD,letterSpacing:2,fontFamily:"'Outfit',sans-serif",marginBottom:9}}>PAIRS WITH FROM YOUR CLOSET</div>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
                  {item.suggestions.closetPairs.map((cp,i)=>{
                    const match=wardrobe.find(w=>w.name===cp.name||w.name?.toLowerCase().includes(cp.name?.toLowerCase()));
                    return (
                      <div key={i} style={{display:"flex",gap:11,alignItems:"center",background:"rgba(255,255,255,.03)",borderRadius:11,border:`1px solid rgba(184,151,90,.1)`,padding:"10px 12px"}}>
                        <div style={{width:40,height:52,borderRadius:8,overflow:"hidden",flexShrink:0,background:"#1a1410",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {match?.url?<img alt="wardrobe item" src={match.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            :<span style={{fontSize:16}}>{CAT_EMOJI[match?.category]||"👔"}</span>}
                        </div>
                        <div>
                          <div style={{fontSize:13,color:CREAM,fontFamily:"'Outfit',sans-serif",fontWeight:500,marginBottom:2}}>{cp.name}</div>
                          <div style={{fontSize:11,color:MUTE,fontFamily:"'Outfit',sans-serif",lineHeight:1.5}}>{cp.reason}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {item.suggestions.buyItems?.length>0&&(
              <>
                <div style={{fontSize:10,color:GOLD,letterSpacing:2,fontFamily:"'Outfit',sans-serif",marginBottom:9}}>SHOP TO COMPLETE YOUR LOOK · MIXED BRANDS</div>
                <div style={{display:"flex",flexDirection:"column",gap:11}}>
                  {item.suggestions.buyItems.map((b,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,.03)",borderRadius:13,border:`1px solid rgba(184,151,90,.1)`,padding:"13px 14px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div>
                          <div style={{fontSize:14,color:CREAM,fontFamily:"'Outfit',sans-serif",fontWeight:500,marginBottom:4}}>{b.name}</div>
                          <StoreBadge storeName={b.brand} small/>
                        </div>
                        <div style={{fontSize:13,color:"#7aba7a",fontFamily:"'Outfit',sans-serif",fontWeight:600,flexShrink:0,marginLeft:8}}>{b.priceTND}</div>
                      </div>
                      <div style={{fontSize:12,color:MUTE,fontFamily:"'Outfit',sans-serif",lineHeight:1.65,marginBottom:10}}>{b.why}</div>
                      <BuyBtn url={b.buyUrl} label="Buy Directly →"/>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {!item.loadingSugg&&!item.suggestions&&(
          <GoldBtn onClick={()=>onRefresh(item)}>Get Suggestions</GoldBtn>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   COMMUNITY FEED — OOTD SHARING + VOTING
══════════════════════════════════════════ */
const DEMO_POSTS = [
  { id:1, username:"@rana.nour", city:"Tunis", time:"2 min ago", caption:"Beige aesthetic today 🤍 minimal & clean", category:"tops", colorName:"Beige", loves:218, passes:8, emoji:"👗", bg:"linear-gradient(145deg,#f5e6d3,#ecdcc8)" },
  { id:2, username:"@sana.mode", city:"Sousse", time:"18 min ago", caption:"Sage green era 🌿 #labesni", category:"outerwear", colorName:"Sage", loves:154, passes:6, emoji:"🧥", bg:"linear-gradient(145deg,#dce8e0,#c8ddd2)" },
  { id:3, username:"@adam.style", city:"Sfax", time:"34 min ago", caption:"All black everything — office ready 🖤", category:"bottoms", colorName:"Black", loves:312, passes:14, emoji:"👔", bg:"linear-gradient(145deg,#e8e0f0,#d8d0e4)" },
  { id:4, username:"@lina.looks", city:"Monastir", time:"1h ago", caption:"Summer dress szn officially started ☀️", category:"dresses", colorName:"White", loves:89, passes:3, emoji:"👗", bg:"linear-gradient(145deg,#fdf0e0,#f5e4c8)" },
];

function CommunityFeed({ profile, wardrobe }) {
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [voted, setVoted] = useState({});
  const [activeTab, setActiveTab] = useState("today");
  const [showShare, setShowShare] = useState(false);
  const [shareCaption, setShareCaption] = useState("");
  const [shareImg, setShareImg] = useState(null);
  const [shareImgUrl, setShareImgUrl] = useState(null);
  const [posting, setPosting] = useState(false);
  const shareFileRef = useRef(null);

  const vote = (id, type) => {
    if(voted[id]) return;
    setVoted(v=>({...v,[id]:type}));
    setPosts(p=>p.map(post=>post.id===id?{...post,[type]:post[type]+1}:post));
  };

  const handleShareFile = e => {
    const f = e.target.files[0];
    if(!f) return;
    setShareImg(f);
    setShareImgUrl(URL.createObjectURL(f));
  };

  const submitPost = async () => {
    if(!shareCaption.trim()&&!shareImgUrl) return;
    setPosting(true);
    await new Promise(r=>setTimeout(r,900));
    const newPost = {
      id: Date.now(), username: profile.name?`@${profile.name.toLowerCase().replace(/\s/g,".")}`:"@you",
      city: profile.city||"Tunisia", time:"Just now",
      caption: shareCaption, category:"tops", colorName:"",
      loves:0, passes:0, emoji:"✨",
      bg:"linear-gradient(145deg,#f5e6d3,#ecdcc8)",
      imgUrl: shareImgUrl
    };
    setPosts(p=>[newPost,...p]);
    setShowShare(false); setShareCaption(""); setShareImg(null); setShareImgUrl(null); setPosting(false);
  };

  const sorted = activeTab==="top" ? [...posts].sort((a,b)=>b.loves-a.loves) : posts;

  return (
    <div style={{animation:"fadeIn .3s ease"}}>

      {/* header row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:27,fontWeight:400,color:CREAM,marginBottom:3,letterSpacing:.5}}>Daily Feed</h2>
          <p style={{color:MUTE,fontSize:12,fontFamily:"'Outfit',sans-serif",margin:0}}>See & vote on today's outfits</p>
        </div>
        <button onClick={()=>setShowShare(true)} style={{
          background:"linear-gradient(135deg,#c9a96e,#a07840)",border:"none",
          borderRadius:12,padding:"10px 16px",color:"#fff",cursor:"pointer",
          fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:600,letterSpacing:.5,flexShrink:0
        }}>+ Share Fit</button>
      </div>

      {/* tabs */}
      <div style={{display:"flex",gap:6,marginBottom:18}}>
        {[{k:"today",l:"Today's Fits"},{k:"top",l:"Top Voted"}].map(({k,l})=>(
          <button key={k} onClick={()=>setActiveTab(k)} style={{
            padding:"7px 16px",borderRadius:20,border:`1.5px solid ${activeTab===k?GOLD:"rgba(180,150,100,.25)"}`,
            background:activeTab===k?"rgba(201,169,110,.15)":"rgba(255,255,255,.7)",
            color:activeTab===k?CREAM:DIM,fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:activeTab===k?600:400,cursor:"pointer"
          }}>{l}</button>
        ))}
      </div>

      {/* leaderboard strip */}
      {activeTab==="top"&&(
        <div style={{background:"#fff",borderRadius:16,border:`1px solid rgba(201,169,110,.2)`,padding:"12px 14px",marginBottom:18,display:"flex",gap:10,overflowX:"auto"}}>
          {[...posts].sort((a,b)=>b.loves-a.loves).slice(0,3).map((p,i)=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,padding:"6px 10px",borderRadius:12,background:i===0?"rgba(201,169,110,.1)":"transparent"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{p.emoji}</div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:CREAM,fontFamily:"'Outfit',sans-serif"}}>{p.username}</div>
                <div style={{fontSize:9,color:MUTE,fontFamily:"'Outfit',sans-serif"}}>🤍 {p.loves}</div>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:i===0?GOLD:MUTE,fontFamily:"'Outfit',sans-serif"}}>#{i+1}</div>
            </div>
          ))}
        </div>
      )}

      {/* posts */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {sorted.map(post=>(
          <div key={post.id} style={{background:"#fff",borderRadius:18,border:`1px solid rgba(201,169,110,.18)`,overflow:"hidden",boxShadow:"0 2px 16px rgba(180,150,100,.08)"}}>
            {/* image */}
            <div style={{width:"100%",height:200,background:post.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {post.imgUrl
                ?<img src={post.imgUrl} alt="outfit" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                :<span style={{fontSize:72,opacity:.55}}>{post.emoji}</span>
              }
              <div style={{position:"absolute",top:10,left:10,background:"rgba(255,255,255,.9)",borderRadius:20,padding:"3px 10px",fontSize:9,fontWeight:700,color:GOLD,fontFamily:"'Outfit',sans-serif",letterSpacing:.5}}>✦ OOTD</div>
              {activeTab==="top"&&posts.indexOf(post)<3&&(
                <div style={{position:"absolute",top:10,right:10,background:"rgba(201,169,110,.9)",borderRadius:20,padding:"3px 10px",fontSize:9,fontWeight:700,color:"#fff",fontFamily:"'Outfit',sans-serif"}}>
                  #{[...posts].sort((a,b)=>b.loves-a.loves).indexOf(post)+1} Today
                </div>
              )}
            </div>
            {/* body */}
            <div style={{padding:"12px 14px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:CREAM,fontFamily:"'Outfit',sans-serif"}}>{post.username}</div>
                  <div style={{fontSize:10,color:MUTE,fontFamily:"'Outfit',sans-serif"}}>{post.city} · {post.time}</div>
                </div>
                <div style={{fontSize:10,color:MUTE,fontFamily:"'Outfit',sans-serif",background:"rgba(201,169,110,.08)",border:"1px solid rgba(201,169,110,.2)",borderRadius:20,padding:"3px 9px"}}>{post.category}</div>
              </div>
              {post.caption&&<p style={{fontSize:13,color:"#5a4a3a",fontFamily:"'Outfit',sans-serif",lineHeight:1.55,margin:"0 0 12px"}}>{post.caption}</p>}
              {/* vote row */}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>vote(post.id,"loves")} style={{
                  flex:1,padding:"9px 0",borderRadius:12,border:"none",cursor:voted[post.id]?"default":"pointer",
                  background:voted[post.id]==="loves"?"rgba(201,169,110,.2)":"rgba(201,169,110,.08)",
                  transition:"all .2s"
                }}>
                  <span style={{fontSize:14}}>🤍</span>
                  <span style={{fontSize:12,fontWeight:700,color:GOLD,fontFamily:"'Outfit',sans-serif",marginLeft:5}}>{post.loves} Love it</span>
                </button>
                <button onClick={()=>vote(post.id,"passes")} style={{
                  flex:1,padding:"9px 0",borderRadius:12,border:"none",cursor:voted[post.id]?"default":"pointer",
                  background:voted[post.id]==="passes"?"rgba(180,180,180,.18)":"rgba(180,180,180,.08)",
                  transition:"all .2s"
                }}>
                  <span style={{fontSize:14}}>👎</span>
                  <span style={{fontSize:12,color:MUTE,fontFamily:"'Outfit',sans-serif",marginLeft:5}}>{post.passes} Pass</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* share modal */}
      {showShare&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(250,248,245,.97)",backdropFilter:"blur(16px)",overflowY:"auto",animation:"slideUp .22s ease"}}>
          <div style={{maxWidth:520,margin:"0 auto",padding:"24px 16px 80px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:18,fontWeight:600,color:CREAM,fontFamily:"'Playfair Display',serif"}}>Share your fit</div>
              <button onClick={()=>setShowShare(false)} style={{background:"rgba(201,169,110,.1)",border:`1px solid rgba(201,169,110,.3)`,borderRadius:"50%",width:34,height:34,color:GOLD,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>

            <input ref={shareFileRef} type="file" accept="image/*" onChange={handleShareFile} style={{display:"none"}}/>
            <div onClick={()=>shareFileRef.current?.click()} style={{
              width:"100%",height:200,borderRadius:16,border:`1.5px dashed rgba(201,169,110,.4)`,
              background:shareImgUrl?"transparent":"rgba(201,169,110,.05)",
              display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
              marginBottom:14,overflow:"hidden",position:"relative"
            }}>
              {shareImgUrl
                ?<img src={shareImgUrl} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                :<div style={{textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:8}}>📸</div>
                  <div style={{fontSize:13,color:GOLD,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>Upload your outfit photo</div>
                  <div style={{fontSize:11,color:MUTE,fontFamily:"'Outfit',sans-serif",marginTop:4}}>OOTD · full body · any style</div>
                </div>
              }
            </div>

            <textarea
              value={shareCaption}
              onChange={e=>setShareCaption(e.target.value)}
              placeholder="Caption your look... #labesni"
              rows={3}
              style={{width:"100%",padding:"13px 15px",borderRadius:12,border:`1.5px solid rgba(201,169,110,.3)`,
                background:"#fff",color:CREAM,fontFamily:"'Outfit',sans-serif",fontSize:14,
                outline:"none",resize:"none",marginBottom:14,lineHeight:1.6}}
            />

            {/* wardrobe items to tag */}
            {wardrobe.length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,color:GOLD,letterSpacing:2,fontFamily:"'Outfit',sans-serif",marginBottom:8}}>TAG FROM YOUR CLOSET</div>
                <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4}}>
                  {wardrobe.slice(0,8).map(w=>(
                    <div key={w.id} style={{flexShrink:0,width:50,height:64,borderRadius:10,overflow:"hidden",border:`1px solid rgba(201,169,110,.2)`,background:"rgba(201,169,110,.05)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {w.url?<img src={w.url} alt={w.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        :<span style={{fontSize:22}}>{CAT_EMOJI[w.category]||"👔"}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <GoldBtn onClick={submitPost} disabled={posting||(!shareCaption.trim()&&!shareImgUrl)}>
              {posting?"Posting…":"Post My Fit ✦"}
            </GoldBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function Labesni() {
  const [screen,setScreen]                 = useState("onboarding");
  const [onbStep,setOnbStep]               = useState(0);
  const [profile,setProfile]               = useState({ name:"",gender:"",styles:[],occasions:[],budget:"",brands:[],city:"Tunis" });
  const [wardrobe,setWardrobe]             = useState([]);
  const [occasion,setOccasion]             = useState("");
  const [styleVision,setStyleVision]       = useState("");
  const [outfits,setOutfits]               = useState([]);
  const [loadingOutfits,setLoadingOutfits] = useState(false);
  const [activeOutfit,setActiveOutfit]     = useState(null);
  const [expandedItemId,setExpandedItemId] = useState(null);
  const [showSearch,setShowSearch]         = useState(false);
  const [error,setError]                   = useState("");
  const [showCamera,setShowCamera]         = useState(false);
  const [bodyLoading,setBodyLoading]       = useState(false);
  const [cameraStream,setCameraStream]     = useState(null);
  const [activeNav,setActiveNav]           = useState("wardrobe");
  const videoRef=useRef(null),canvasRef=useRef(null),fileRef=useRef(null);

  const toggleArr=(key,val)=>setProfile(p=>({...p,[key]:p[key].includes(val)?p[key].filter(x=>x!==val):[...p[key],val]}));

  /* ── body photo analysis ── */
  const handleBodyPhoto = async file => {
    if(!file?.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setProfile(p=>({...p, bodyPhotoUrl:url, body:null}));
    setBodyLoading(true);
    try {
      const b64  = await toB64(file);
      const body = await analyseBodyPhoto(b64, file.type, profile.gender);
      setProfile(p=>({...p, body}));
    } catch {}
    setBodyLoading(false);
  };

  /* ── add item from suggestion/search (no photo) ── */
  const addVirtualItem = (item) => {
    const id=Date.now()+Math.random();
    const newItem={id,name:item.name,category:item.category||"unknown",color:item.color||"",
      colorHex:item.colorHex||"#888",url:null,analyzing:false,suggestions:null,loadingSugg:false,
      isSuggested:true,brand:item.brand,priceTND:item.priceTND,buyUrl:item.buyUrl};
    setWardrobe(p=>[...p,newItem]);
    doFetchSuggestions(id,newItem);
  };

  /* ── photo ── */
  const handleFile=async file=>{
    if(!file?.type.startsWith("image/")) return;
    const url=URL.createObjectURL(file);
    const id=Date.now()+Math.random();
    const ni={id,name:"Reading item…",category:"unknown",color:"",colorHex:"#888",url,analyzing:true,suggestions:null,loadingSugg:false};
    setWardrobe(p=>[...p,ni]);
    try{
      const b64=await toB64(file);
      const info=await analyseImage(b64,file.type,profile);
      const full={...ni,...info,url,analyzing:false};
      setWardrobe(p=>p.map(i=>i.id===id?full:i));
      doFetchSuggestions(id,full);
    }catch{ setWardrobe(p=>p.map(i=>i.id===id?{...i,name:"Clothing item",analyzing:false}:i)); }
  };

  const doFetchSuggestions=async(id,item)=>{
    setWardrobe(p=>p.map(i=>i.id===id?{...i,loadingSugg:true}:i));
    try{
      const sugg=await getItemSuggestions(item,wardrobe,profile);
      setWardrobe(p=>p.map(i=>i.id===id?{...i,suggestions:sugg,loadingSugg:false}:i));
    }catch{ setWardrobe(p=>p.map(i=>i.id===id?{...i,loadingSugg:false}:i)); }
  };

  const onFiles=e=>{[...e.target.files].forEach(handleFile);e.target.value="";};
  const onDrop=e=>{e.preventDefault();[...e.dataTransfer.files].forEach(handleFile);};
  const removeItem=id=>{setWardrobe(p=>p.filter(i=>i.id!==id));if(expandedItemId===id)setExpandedItemId(null);};

  /* ── camera ── */
  const openCamera=async()=>{
    try{
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      setCameraStream(s);setShowCamera(true);
      setTimeout(()=>{if(videoRef.current)videoRef.current.srcObject=s;},120);
    }catch{setError("Camera unavailable.");}
  };
  const closeCamera=()=>{cameraStream?.getTracks().forEach(t=>t.stop());setCameraStream(null);setShowCamera(false);};
  const capturePhoto=()=>{
    const v=videoRef.current,c=canvasRef.current;if(!v||!c)return;
    c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);
    c.toBlob(b=>{if(b)handleFile(new File([b],"cap.jpg",{type:"image/jpeg"}));},"image/jpeg",.92);
    closeCamera();
  };

  /* ── generate outfits ── */
  const doGenerate=async()=>{
    const ready=wardrobe.filter(i=>!i.analyzing);
    if(ready.length<2){setError("Add at least 2 clothing items first.");return;}
    if(!occasion){setError("Please select an occasion.");return;}
    if(!styleVision){setError("Please select your style vision.");return;}
    setError("");setLoadingOutfits(true);setOutfits([]);
    try{
      const res=await generateOutfits(ready,occasion,styleVision,profile);
      setOutfits(res);setScreen("outfits");setActiveNav("outfits");
    }catch{setError("Couldn't generate. Please try again.");}
    setLoadingOutfits(false);
  };

  const expandedItem=wardrobe.find(i=>i.id===expandedItemId);
  const readyCount=wardrobe.filter(i=>!i.analyzing).length;

  /* ══════════════ ONBOARDING ══════════════ */
  const slides=[
    /* splash */
    <div key="s0" style={{minHeight:"90vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 22px"}}>
      <div style={{position:"relative",marginBottom:20}}>
        <div style={{fontSize:80,lineHeight:1,filter:"drop-shadow(0 8px 28px rgba(184,151,90,.28))"}}>👗</div>
        <div style={{position:"absolute",bottom:-6,right:-8,background:"rgba(184,151,90,.13)",borderRadius:20,padding:"4px 10px",border:`1px solid rgba(184,151,90,.3)`}}>
          <span style={{fontSize:10,color:GOLD,fontFamily:"'Outfit',sans-serif",letterSpacing:1}}>🇹🇳 Tunisia</span>
        </div>
      </div>
      <h1 style={{fontSize:48,fontWeight:400,color:CREAM,fontFamily:"'Playfair Display',serif",letterSpacing:2,lineHeight:1.15,margin:"0 0 10px"}}>Labesni</h1>
      <p style={{fontSize:14,color:GOLD,fontFamily:"'Playfair Display',serif",fontStyle:"italic",margin:"0 0 14px"}}>Tunisia's AI Fashion Stylist</p>
      <p style={{color:DIM,fontSize:14,fontFamily:"'Outfit',sans-serif",fontWeight:300,maxWidth:300,margin:"0 auto 36px",lineHeight:1.9}}>
        Tell us your style — get a full wardrobe plan with direct buy links from Zara, Nike TN, Jumia and more.
      </p>
      <GoldBtn onClick={()=>setOnbStep(1)} style={{maxWidth:260,margin:"0 auto"}}>Get Started</GoldBtn>
      <p style={{marginTop:13,fontSize:11,color:MUTE,fontFamily:"'Outfit',sans-serif",letterSpacing:1}}>FREE · MADE FOR TUNISIA</p>
    </div>,

    /* name gender city */
    <div key="s1">
      <h2 style={{fontSize:26,fontWeight:400,color:CREAM,fontFamily:"'Playfair Display',serif",lineHeight:1.25,marginBottom:6}}>Let's personalise<br/><em>your style</em></h2>
      <p style={{color:DIM,fontSize:13,fontFamily:"'Outfit',sans-serif",lineHeight:1.7,marginBottom:18}}>Every suggestion will be tailored to you.</p>
      <div style={SL}>YOUR NAME</div>
      <input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} placeholder="What should we call you?"
        style={{width:"100%",boxSizing:"border-box",padding:"13px 14px",borderRadius:12,border:`1px solid ${BORDER}`,background:"rgba(255,255,255,.04)",color:CREAM,fontFamily:"'Outfit',sans-serif",fontSize:14,outline:"none"}}/>
      <div style={SL}>I DRESS FOR</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {GENDERS.map(g=><Chip key={g} active={profile.gender===g} onClick={()=>setProfile(p=>({...p,gender:g}))}>{g}</Chip>)}
      </div>
      <div style={SL}>MY CITY</div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {CITIES.map(c=><Chip key={c} small active={profile.city===c} onClick={()=>setProfile(p=>({...p,city:c}))}>{c}</Chip>)}
      </div>
      <div style={{marginTop:26}}><GoldBtn disabled={!profile.gender} onClick={()=>setOnbStep(2)}>Continue →</GoldBtn></div>
    </div>,

    /* style + occasions */
    <div key="s2">
      <h2 style={{fontSize:26,fontWeight:400,color:CREAM,fontFamily:"'Playfair Display',serif",lineHeight:1.25,marginBottom:18}}>Your style<br/><em>identity</em></h2>
      <div style={SL}>MY STYLE (pick all that fit)</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {STYLES.map(s=><Chip key={s} active={profile.styles.includes(s)} onClick={()=>toggleArr("styles",s)}>{s}</Chip>)}
      </div>
      <div style={SL}>OCCASIONS I DRESS FOR</div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {OCCASIONS.map(o=><Chip key={o} small active={profile.occasions.includes(o)} onClick={()=>toggleArr("occasions",o)}>{o}</Chip>)}
      </div>
      <div style={{marginTop:26}}><GoldBtn disabled={!profile.styles.length} onClick={()=>setOnbStep(3)}>Continue →</GoldBtn></div>
    </div>,

    /* budget + brands */
    <div key="s3">
      <h2 style={{fontSize:26,fontWeight:400,color:CREAM,fontFamily:"'Playfair Display',serif",lineHeight:1.25,marginBottom:18}}>Budget &<br/><em>favourite brands</em></h2>
      <div style={SL}>MY BUDGET PER ITEM</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:4}}>
        {BUDGETS.map(b=>(
          <button key={b.val} onClick={()=>setProfile(p=>({...p,budget:b.val}))} style={{
            padding:"12px 10px",borderRadius:12,textAlign:"left",cursor:"pointer",
            border:`1.5px solid ${profile.budget===b.val?GOLD:BORDER}`,
            background:profile.budget===b.val?"rgba(184,151,90,.11)":"rgba(255,255,255,.03)",transition:"all .18s"
          }}>
            <div style={{fontSize:13,color:CREAM,fontFamily:"'Outfit',sans-serif",fontWeight:500}}>{b.label}</div>
            <div style={{fontSize:12,color:GOLD,fontFamily:"'Outfit',sans-serif",marginTop:2}}>{b.sub}</div>
            <div style={{fontSize:10,color:MUTE,fontFamily:"'Outfit',sans-serif",marginTop:1}}>{b.usd}</div>
          </button>
        ))}
      </div>
      <div style={SL}>FAVOURITE STORES IN TUNISIA <span style={{color:MUTE}}>(optional)</span></div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {STORE_NAMES.map(b=><Chip key={b} small active={profile.brands.includes(b)} onClick={()=>toggleArr("brands",b)}>{b}</Chip>)}
      </div>
      <div style={{marginTop:26}}>
        <GoldBtn disabled={!profile.budget} onClick={()=>setScreen("starter")}>See My Wardrobe Plan →</GoldBtn>
        <button onClick={()=>{setScreen("wardrobe");setActiveNav("wardrobe");}} style={{
          width:"100%",background:"none",border:"none",color:MUTE,
          fontFamily:"'Outfit',sans-serif",fontSize:12,cursor:"pointer",marginTop:10,letterSpacing:1
        }}>Skip — add clothes manually</button>
      </div>
    </div>,
  ];

  /* ══════════════ RENDER ══════════════ */
  return (
    <div style={{minHeight:"100vh",background:BG,color:CREAM,fontFamily:"'Playfair Display',serif",position:"relative",overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input::placeholder{color:#b0a090}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(201,169,110,.3);border-radius:4px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{transform:translateY(36px);opacity:0}to{transform:translateY(0);opacity:1}}
      `}</style>

      {/* ambient */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-8%",right:"-12%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,169,110,.08) 0%,transparent 65%)"}}/>
        <div style={{position:"absolute",bottom:"-5%",left:"-8%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,169,110,.06) 0%,transparent 65%)"}}/>
      </div>

      {/* overlays */}
      {showSearch&&<SearchClothesScreen profile={profile} onAddToCloset={addVirtualItem} onClose={()=>setShowSearch(false)}/>}
      {expandedItem&&<ItemPanel item={expandedItem} wardrobe={wardrobe} onClose={()=>setExpandedItemId(null)} onRefresh={item=>doFetchSuggestions(item.id,item)}/>}

      {/* camera */}
      {showCamera&&(
        <div style={{position:"fixed",inset:0,background:"#000",zIndex:500,display:"flex",flexDirection:"column"}}>
          <video ref={videoRef} autoPlay playsInline muted style={{flex:1,objectFit:"cover",width:"100%"}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{width:210,height:278,border:"2px solid rgba(184,151,90,.75)",borderRadius:18,boxShadow:"0 0 0 9999px rgba(0,0,0,.55)"}}/>
            <div style={{position:"absolute",top:"28%",fontSize:11,color:"rgba(184,151,90,.85)",fontFamily:"'Outfit',sans-serif",letterSpacing:2}}>FRAME YOUR ITEM</div>
          </div>
          <div style={{padding:"18px 22px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(0,0,0,.72)"}}>
            <button onClick={closeCamera} style={{background:"rgba(255,255,255,.1)",border:"none",color:"#fff",borderRadius:24,padding:"10px 18px",fontFamily:"'Outfit',sans-serif",fontSize:13,cursor:"pointer"}}>✕ Cancel</button>
            <button onClick={capturePhoto} style={{width:62,height:62,borderRadius:"50%",background:"#fff",border:`4px solid ${GOLD}`,cursor:"pointer"}}/>
            <div style={{width:80}}/>
          </div>
        </div>
      )}

      {/* ══ ONBOARDING ══ */}
      {screen==="onboarding"&&(
        <div style={{minHeight:"100vh",position:"relative",zIndex:1}}>
          <div style={{maxWidth:480,margin:"0 auto",padding:"38px 18px 80px",animation:"fadeIn .4s ease"}}>
            {onbStep>0&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
                <div style={{display:"flex",gap:5}}>
                  {[1,2,3].map(n=>(
                    <div key={n} style={{height:3,width:n===onbStep?28:14,borderRadius:3,
                      background:onbStep>=n?GOLD:"rgba(184,151,90,.15)",transition:"all .3s"}}/>
                  ))}
                </div>
                <button onClick={()=>setOnbStep(s=>s-1)} style={{background:"none",border:"none",color:DIM,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:11,letterSpacing:1}}>← BACK</button>
              </div>
            )}
            {slides[onbStep]}
          </div>
        </div>
      )}

      {/* ══ STARTER ══ */}
      {screen==="starter"&&(
        <div style={{maxWidth:620,margin:"0 auto",padding:"26px 16px 40px",position:"relative",zIndex:1,animation:"fadeIn .4s ease"}}>
          <StarterScreen profile={profile} onDone={()=>{setScreen("wardrobe");setActiveNav("wardrobe");}} onAddToCloset={addVirtualItem}/>
        </div>
      )}

      {/* ══ MAIN APP ══ */}
      {["wardrobe","style","outfits","community"].includes(screen)&&(
        <>
          <header style={{padding:"13px 16px 11px",display:"flex",alignItems:"center",justifyContent:"space-between",
            borderBottom:`1px solid rgba(201,169,110,.2)`,background:"rgba(250,248,245,.95)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{fontSize:17,fontWeight:700,letterSpacing:4,color:CREAM,fontFamily:"'Outfit',sans-serif"}}>LABESNI</div>
                <span style={{fontSize:10,color:GOLD,background:"rgba(201,169,110,.12)",border:`1px solid rgba(201,169,110,.3)`,borderRadius:20,padding:"2px 7px",fontFamily:"'Outfit',sans-serif"}}>🇹🇳 TN</span>
              </div>
              {profile.name&&<div style={{fontSize:9,color:MUTE,letterSpacing:2,fontFamily:"'Outfit',sans-serif",marginTop:1}}>HI, {profile.name.toUpperCase()}</div>}
            </div>
            <nav style={{display:"flex",gap:5}}>
              {[{k:"wardrobe",l:"Closet"+(wardrobe.length>0?" ("+wardrobe.length+")":" ")},{k:"style",l:"Style"},{k:"community",l:"Feed"},...(outfits.length>0?[{k:"outfits",l:"Looks"}]:[])]
                .map(({k,l})=>(
                <button key={k} onClick={()=>{setScreen(k);setActiveNav(k);}} style={{
                  background:activeNav===k?"rgba(201,169,110,.15)":"transparent",
                  color:activeNav===k?CREAM:DIM,
                  border:`1px solid ${activeNav===k?"rgba(201,169,110,.4)":"rgba(180,150,100,.2)"}`,
                  borderRadius:20,padding:"6px 11px",fontFamily:"'Outfit',sans-serif",fontSize:11,cursor:"pointer",transition:"all .18s"
                }}>{l}</button>
              ))}
            </nav>
          </header>

          <main style={{maxWidth:620,margin:"0 auto",padding:"22px 14px 100px",position:"relative",zIndex:1}}>

            {/* ── WARDROBE ── */}
            {screen==="wardrobe"&&(
              <div style={{animation:"fadeIn .3s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <div>
                    <h2 style={{fontSize:27,fontWeight:400,color:CREAM,marginBottom:3,letterSpacing:.5}}>My Closet</h2>
                    <p style={{color:DIM,fontSize:12,fontFamily:"'Outfit',sans-serif",lineHeight:1.6,margin:0}}>Tap any item for pairings & direct buy links</p>
                  </div>
                  <button onClick={()=>setScreen("starter")} style={{
                    background:"rgba(184,151,90,.08)",border:`1px solid rgba(184,151,90,.2)`,
                    borderRadius:10,padding:"7px 11px",color:GOLD,cursor:"pointer",
                    fontFamily:"'Outfit',sans-serif",fontSize:11,whiteSpace:"nowrap",flexShrink:0,marginTop:2
                  }}>✨ Wardrobe plan</button>
                </div>

                {/* 3 add methods */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
                  <div onDrop={onDrop} onDragOver={e=>e.preventDefault()} onClick={()=>fileRef.current?.click()}
                    style={{border:`1.5px dashed rgba(184,151,90,.25)`,borderRadius:14,padding:"16px 8px",
                      textAlign:"center",cursor:"pointer",background:"rgba(184,151,90,.03)"}}>
                    <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} style={{display:"none"}}/>
                    <div style={{fontSize:22,marginBottom:4}}>📤</div>
                    <div style={{fontSize:11,color:GOLD,fontFamily:"'Outfit',sans-serif"}}>Upload</div>
                    <div style={{fontSize:9,color:MUTE,fontFamily:"'Outfit',sans-serif",marginTop:1}}>Photos</div>
                  </div>
                  <button onClick={openCamera} style={{border:`1.5px solid rgba(184,151,90,.18)`,borderRadius:14,
                    padding:"16px 8px",cursor:"pointer",background:"rgba(184,151,90,.03)",
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
                    <div style={{fontSize:22}}>📸</div>
                    <div style={{fontSize:11,color:GOLD,fontFamily:"'Outfit',sans-serif"}}>Camera</div>
                    <div style={{fontSize:9,color:MUTE,fontFamily:"'Outfit',sans-serif"}}>Take photo</div>
                  </button>
                  <button onClick={()=>setShowSearch(true)} style={{border:`1.5px solid rgba(184,151,90,.18)`,borderRadius:14,
                    padding:"16px 8px",cursor:"pointer",background:"rgba(184,151,90,.03)",
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
                    <div style={{fontSize:22}}>🔍</div>
                    <div style={{fontSize:11,color:GOLD,fontFamily:"'Outfit',sans-serif"}}>Search</div>
                    <div style={{fontSize:9,color:MUTE,fontFamily:"'Outfit',sans-serif"}}>From stores</div>
                  </button>
                </div>

                {wardrobe.length===0?(
                  <div style={{textAlign:"center",padding:"36px 0",color:MUTE}}>
                    <div style={{fontSize:48,marginBottom:12}}>🪄</div>
                    <p style={{fontFamily:"'Outfit',sans-serif",fontSize:13,lineHeight:1.8}}>
                      Upload a photo, use the camera,<br/>or search from Tunisian stores
                    </p>
                  </div>
                ):(
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <span style={{fontSize:11,color:MUTE,fontFamily:"'Outfit',sans-serif",letterSpacing:1.5}}>{wardrobe.length} ITEM{wardrobe.length!==1?"S":""}</span>
                      {wardrobe.some(i=>i.suggestions)&&<span style={{fontSize:10,color:"#5a9a5a",fontFamily:"'Outfit',sans-serif"}}>✓ Tap items for suggestions</span>}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
                      {wardrobe.map(item=>(
                        <div key={item.id}
                          onClick={()=>!item.analyzing&&setExpandedItemId(item.id)}
                          style={{background:"#fff",borderRadius:14,
                            border:`1px solid ${expandedItemId===item.id?"rgba(201,169,110,.6)":"rgba(201,169,110,.2)"}`,
                            overflow:"hidden",position:"relative",cursor:item.analyzing?"default":"pointer",
                            transition:"all .2s",animation:"scaleIn .26s ease",
                            boxShadow:"0 2px 12px rgba(180,150,100,.08)"}}
                          onMouseEnter={e=>{if(!item.analyzing)e.currentTarget.style.transform="translateY(-2px)";}}
                          onMouseLeave={e=>e.currentTarget.style.transform="none"}
                        >
                          <div style={{width:"100%",aspectRatio:"3/4",background:"#f5f0e8",overflow:"hidden",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {item.url?<img src={item.url} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                              :<div style={{fontSize:32,opacity:.5}}>{CAT_EMOJI[item.category]||"👔"}</div>}
                            {item.brand&&!item.url&&(
                              <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(250,248,245,.85)",padding:"5px 6px"}}>
                                <div style={{fontSize:9,color:GOLD,fontFamily:"'Outfit',sans-serif",textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{STORES[item.brand]?.logo||"🏪"} {item.brand}</div>
                              </div>
                            )}
                            {item.analyzing&&(
                              <div style={{position:"absolute",inset:0,background:"rgba(250,248,245,.85)",display:"flex",alignItems:"center",justifyContent:"center"}}><Dots text="Reading…"/></div>
                            )}
                            {!item.analyzing&&item.suggestions&&(
                              <div style={{position:"absolute",top:6,left:6,background:"rgba(90,154,90,.85)",borderRadius:20,padding:"2px 6px"}}>
                                <span style={{fontSize:9,color:"#fff",fontFamily:"'Outfit',sans-serif",fontWeight:600}}>✓</span>
                              </div>
                            )}
                          </div>
                          <div style={{padding:"8px 9px"}}>
                            <div style={{fontSize:11,color:CREAM,fontWeight:600,lineHeight:1.3,marginBottom:3,fontFamily:"'Outfit',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              {item.colorHex&&item.colorHex!=="#888"&&<div style={{width:7,height:7,borderRadius:"50%",background:item.colorHex,border:"1px solid rgba(0,0,0,.1)",flexShrink:0}}/>}
                              <span style={{fontSize:10,color:MUTE,fontFamily:"'Outfit',sans-serif",textTransform:"capitalize",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.category}</span>
                            </div>
                          </div>
                          <button onClick={e=>{e.stopPropagation();removeItem(item.id);}} style={{
                            position:"absolute",top:5,right:5,width:20,height:20,borderRadius:"50%",
                            background:"rgba(250,248,245,.9)",border:"1px solid rgba(201,169,110,.3)",color:GOLD,
                            cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"
                          }}>✕</button>
                        </div>
                      ))}
                    </div>
                    {readyCount>=2&&<div style={{marginTop:20}}><GoldBtn onClick={()=>{setScreen("style");setActiveNav("style");}}>Get Styled →</GoldBtn></div>}
                  </>
                )}
              </div>
            )}

            {/* ── STYLE ── */}
            {screen==="style"&&(
              <div style={{animation:"fadeIn .3s ease"}}>
                <h2 style={{fontSize:27,fontWeight:400,color:CREAM,marginBottom:4,letterSpacing:.5}}>Get Styled</h2>
                <p style={{color:DIM,fontSize:13,fontFamily:"'Outfit',sans-serif",marginBottom:18}}>Tell Labesni how you want to show up today</p>
                <div style={SL}>OCCASION</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:4}}>
                  {OCCASIONS.map(o=><Chip key={o} small active={occasion===o} onClick={()=>setOccasion(o)}>{o}</Chip>)}
                </div>
                <div style={SL}>TODAY'S VIBE</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:18}}>
                  {STYLES.map(s=><Chip key={s} active={styleVision===s} onClick={()=>setStyleVision(s)}>{s}</Chip>)}
                </div>
                {error&&<div style={{background:"rgba(192,60,48,.1)",border:"1px solid rgba(192,60,48,.25)",borderRadius:10,padding:"10px 14px",marginBottom:13,color:"#e08878",fontSize:13,fontFamily:"'Outfit',sans-serif"}}>{error}</div>}
                {loadingOutfits?<Dots text="Building your Tunisian looks…"/>:<GoldBtn onClick={doGenerate}>✨ Generate My Outfits</GoldBtn>}
                <div style={{marginTop:16,padding:"12px 14px",background:"rgba(184,151,90,.05)",borderRadius:12,border:`1px solid ${BORDER}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{fontSize:10,color:GOLD,letterSpacing:2,fontFamily:"'Outfit',sans-serif"}}>YOUR PROFILE</div>
                    <button onClick={()=>{setScreen("onboarding");setOnbStep(1);}} style={{background:"none",border:"none",color:DIM,fontFamily:"'Outfit',sans-serif",fontSize:10,cursor:"pointer",letterSpacing:1}}>EDIT ↗</button>
                  </div>
                  <div style={{fontSize:12,color:DIM,fontFamily:"'Outfit',sans-serif",lineHeight:2}}>
                    {[profile.gender,profile.city,profile.styles.slice(0,3).join(" · "),profile.budget].filter(Boolean).join("  ·  ")}
                  </div>
                </div>
              </div>
            )}

            {/* ── OUTFITS ── */}
            {screen==="outfits"&&(
              <div style={{animation:"fadeIn .3s ease"}}>
                <button onClick={()=>{setScreen("style");setActiveNav("style");}} style={{background:"none",border:"none",color:DIM,fontFamily:"'Outfit',sans-serif",fontSize:11,cursor:"pointer",padding:"0 0 12px",letterSpacing:1}}>← BACK</button>
                <h2 style={{fontSize:27,fontWeight:400,color:CREAM,marginBottom:4,letterSpacing:.5}}>Your Looks</h2>
                <p style={{color:DIM,fontSize:13,fontFamily:"'Outfit',sans-serif",marginBottom:18}}>
                  Styled for <span style={{color:GOLD}}>{occasion}</span> · <em>{styleVision}</em> · {profile.city}
                </p>
                <div style={{display:"flex",flexDirection:"column",gap:11}}>
                  {outfits.map((outfit,i)=>{
                    const vc=VIBE_CLR[outfit.vibe]||VIBE_CLR.default;
                    const open=activeOutfit===i;
                    return (
                      <div key={i} onClick={()=>setActiveOutfit(open?null:i)} style={{
                        background:"#fff",borderRadius:16,
                        border:`1.5px solid ${open?"rgba(201,169,110,.5)":"rgba(201,169,110,.18)"}`,
                        overflow:"hidden",cursor:"pointer",transition:"all .2s",
                        boxShadow:open?"0 8px 32px rgba(180,150,100,.15)":"0 2px 12px rgba(180,150,100,.06)"
                      }}>
                        <div style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                              <span style={{background:vc,color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:11,fontFamily:"'Outfit',sans-serif",fontWeight:500}}>{outfit.vibe}</span>
                              <span style={{color:MUTE,fontSize:11,fontFamily:"'Outfit',sans-serif"}}>Look #{i+1}</span>
                            </div>
                            <div style={{fontSize:17,color:CREAM,fontWeight:400,letterSpacing:.3,lineHeight:1.2}}>{outfit.name}</div>
                          </div>
                          <div style={{color:GOLD,fontSize:14,transition:"transform .2s",transform:open?"rotate(180deg)":"none"}}>↓</div>
                        </div>
                        {open&&(
                          <div style={{padding:"0 16px 16px",borderTop:`1px solid rgba(184,151,90,.1)`}}>
                            {/* thumbnails */}
                            <div style={{paddingTop:12,display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}>
                              {outfit.items.map((name,j)=>{
                                const wi=wardrobe.find(w=>w.name===name||name?.toLowerCase().includes(w.name?.toLowerCase()));
                                return (
                                  <div key={j} onClick={e=>{e.stopPropagation();if(wi)setExpandedItemId(wi.id);}}
                                    style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}>
                                    <div style={{width:50,height:64,borderRadius:9,overflow:"hidden",background:"#f5f0e8",border:`1px solid rgba(201,169,110,.2)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                      {wi?.url?<img alt="outfit item" src={wi.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                                        :<span style={{fontSize:18}}>{CAT_EMOJI[wi?.category]||"👔"}</span>}
                                    </div>
                                    <span style={{fontSize:9,color:DIM,fontFamily:"'Outfit',sans-serif",textAlign:"center",maxWidth:50,lineHeight:1.3}}>{name}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {/* tip */}
                            <div style={{background:"rgba(184,151,90,.06)",borderRadius:9,padding:"9px 12px",border:`1px solid rgba(184,151,90,.1)`,marginBottom:10}}>
                              <span style={{fontSize:12,color:"#9a8060",fontFamily:"'Outfit',sans-serif",fontStyle:"italic",lineHeight:1.65}}>💡 {outfit.tip}</span>
                            </div>
                            {/* buy to complete */}
                            {outfit.buyToComplete&&(
                              <div style={{background:"rgba(90,154,90,.05)",borderRadius:11,border:"1px solid rgba(90,154,90,.17)",padding:"12px 13px"}}>
                                <div style={{fontSize:10,color:"#7aba7a",letterSpacing:2,fontFamily:"'Outfit',sans-serif",marginBottom:6}}>🛍 COMPLETE THIS LOOK</div>
                                <div style={{fontSize:14,color:CREAM,fontFamily:"'Outfit',sans-serif",fontWeight:500,marginBottom:4}}>{outfit.buyToComplete.name}</div>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                                  <StoreBadge storeName={outfit.buyToComplete.brand} small/>
                                  <span style={{fontSize:12,color:"#7aba7a",fontFamily:"'Outfit',sans-serif",fontWeight:600}}>{outfit.buyToComplete.priceTND}</span>
                                </div>
                                <div style={{fontSize:12,color:MUTE,fontFamily:"'Outfit',sans-serif",lineHeight:1.65,marginBottom:10}}>{outfit.buyToComplete.why}</div>
                                <BuyBtn url={outfit.buyToComplete.buyUrl} label="Buy Directly →"/>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button onClick={()=>{setScreen("style");setActiveNav("style");setOutfits([]);setActiveOutfit(null);}}
                  style={{marginTop:16,width:"100%",background:"transparent",color:DIM,
                    border:`1px solid rgba(184,151,90,.16)`,borderRadius:12,padding:"12px",
                    fontSize:13,fontFamily:"'Outfit',sans-serif",cursor:"pointer",letterSpacing:1.5}}>
                  ↺ RESTYLE ME
                </button>
              </div>
            )}
            {/* ── COMMUNITY FEED ── */}
            {screen==="community"&&(
              <CommunityFeed profile={profile} wardrobe={wardrobe}/>
            )}

          </main>

          {/* bottom nav */}
          <nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,
            background:"rgba(250,248,245,.97)",backdropFilter:"blur(20px)",
            borderTop:`1px solid rgba(201,169,110,.2)`,display:"flex",justifyContent:"space-around",padding:"10px 0 10px"}}>
            {[{k:"wardrobe",icon:"👗",l:"Closet"},{k:"style",icon:"✨",l:"Style"},
              {k:"community",icon:"🤍",l:"Feed"},
              {k:"search",icon:"🔍",l:"Shop",action:()=>setShowSearch(true)},
              ...(outfits.length>0?[{k:"outfits",icon:"📋",l:"Looks"}]:[])
            ].map(({k,icon,l,action})=>(
              <button key={k} onClick={()=>{ if(action){action();}else{setScreen(k);setActiveNav(k);} }} style={{
                background:"none",border:"none",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 14px",flex:1}}>
                <span style={{fontSize:18}}>{icon}</span>
                <span style={{fontSize:9,fontFamily:"'Outfit',sans-serif",letterSpacing:1,
                  color:activeNav===k?GOLD:MUTE,transition:"color .18s"}}>{l.toUpperCase()}</span>
                {activeNav===k&&<div style={{width:4,height:4,borderRadius:"50%",background:GOLD,marginTop:1}}/>}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
