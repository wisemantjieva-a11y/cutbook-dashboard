import { useState } from "react";

const API = "http://localhost:4000/api";

// ── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_SHOP = {
  id: "4",
  name: "Classic Cutz",
  area: "Hakahana",
  address: "8 Sam Nujoma Dr",
  phone: "+264814567890",
};

const MOCK_BOOKINGS = [
  { id:1, time:"08:30", name:"Ndapewa K.",  service:"Fade only",   price:60,  barber:"David",  status:"completed", phone:"+264811111111" },
  { id:2, time:"09:00", name:"John S.",     service:"Kids cut",    price:50,  barber:"Moses",  status:"completed", phone:"+264812222222" },
  { id:3, time:"11:00", name:"Wise T.",     service:"Haircut",     price:70,  barber:"David",  status:"confirmed", phone:"+264813333333" },
  { id:4, time:"13:00", name:"Andreas M.", service:"Full groom",  price:120, barber:"David",  status:"confirmed", phone:"+264814444444" },
  { id:5, time:"15:30", name:"Thomas N.",  service:"Haircut",     price:70,  barber:"Moses",  status:"confirmed", phone:"+264815555555" },
];

const MOCK_SERVICES = [
  { id:"s1", name:"Haircut",   price_nad:70,  duration_min:30 },
  { id:"s2", name:"Kids cut",  price_nad:50,  duration_min:25 },
  { id:"s3", name:"Fade only", price_nad:60,  duration_min:20 },
  { id:"s4", name:"Full groom",price_nad:120, duration_min:55 },
];

const GREEN = "#1D9E75";
const DARK  = "#0F6E56";

function statusStyle(s) {
  return {
    confirmed: { bg:"#E1F5EE", color:DARK },
    completed: { bg:"#EAF3DE", color:"#3B6D11" },
    cancelled: { bg:"#FCEBEB", color:"#A32D2D" },
    no_show:   { bg:"#F1EFE8", color:"#5F5E5A" },
  }[s] || { bg:"#E1F5EE", color:DARK };
}

function statusLabel(s) {
  return { confirmed:"Confirmed", completed:"Completed", cancelled:"Cancelled", no_show:"No show" }[s] || s;
}

// ── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen(props) {
  var onLogin = props.onLogin;
  var email = useState("")[0];
  var setEmail = useState("")[1];
  var pass = useState("")[0];
  var setPass = useState("")[1];
  var err = useState("")[0];
  var setErr = useState("")[1];
  var loading = useState(false)[0];
  var setLoading = useState(false)[1];

  // re-declare properly
  var es = useState("");
  var ps = useState("");
  var errs = useState("");
  var ls = useState(false);

  function handleLogin() {
    if (!es[0] || !ps[0]) { errs[1]("Please enter your email and password"); return; }
    ls[1](true);
    fetch(API+"/auth/login", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email:es[0], password:ps[0]})
    })
    .then(function(r){return r.json()})
    .then(function(d){
      if(d.token) { onLogin(d.token, d.owner); }
      else { errs[1](d.error||"Invalid email or password"); }
    })
    .catch(function(){
      // Demo mode — log in with any credentials
      onLogin("demo-token", {name:"Kevin", shop_id:"4"});
    })
    .finally(function(){ls[1](false)});
  }

  return (
    <div style={{fontFamily:"system-ui",minHeight:"100vh",background:"#f5f5f3",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"1.5rem"}}>
      <div style={{width:44,height:44,borderRadius:"50%",background:GREEN,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1rem",fontSize:22}}>✂</div>
      <div style={{fontSize:22,fontWeight:500,marginBottom:4}}>CutBook</div>
      <div style={{fontSize:14,color:"#888",marginBottom:"2rem"}}>Barbershop owner login</div>

      <div style={{background:"white",border:"0.5px solid #e5e5e0",borderRadius:14,padding:"1.5rem",width:"100%",maxWidth:360}}>
        <label style={{fontSize:13,fontWeight:500,color:"#888"}}>Email address</label>
        <input value={es[0]} onChange={function(e){es[1](e.target.value)}} placeholder="you@example.com" type="email"
          style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"0.5px solid #ccc",fontSize:14,boxSizing:"border-box",marginTop:4,marginBottom:12}}/>

        <label style={{fontSize:13,fontWeight:500,color:"#888"}}>Password</label>
        <input value={ps[0]} onChange={function(e){ps[1](e.target.value)}} placeholder="Your password" type="password"
          style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"0.5px solid #ccc",fontSize:14,boxSizing:"border-box",marginTop:4,marginBottom:ls[0]?16:errs[0]?8:16}}/>

        {errs[0] && <div style={{fontSize:13,color:"#A32D2D",marginBottom:12}}>{errs[0]}</div>}

        <button onClick={handleLogin} disabled={ls[0]}
          style={{width:"100%",padding:12,background:GREEN,color:"white",border:"none",borderRadius:10,fontSize:15,fontWeight:500,cursor:"pointer",opacity:ls[0]?0.7:1}}>
          {ls[0] ? "Signing in..." : "Sign in →"}
        </button>

        <div style={{textAlign:"center",fontSize:12,color:"#888",marginTop:12}}>
          Demo mode: enter any email and password
        </div>
      </div>
    </div>
  );
}

// ── TODAY'S BOOKINGS ──────────────────────────────────────────────────────────
function BookingsScreen(props) {
  var shop = props.shop;
  var onLogout = props.onLogout;
  var onSettings = props.onSettings;
  var bookingsState = useState(MOCK_BOOKINGS);
  var bookings = bookingsState[0];
  var setBookings = bookingsState[1];
  var tab = useState("today")[0];
  var setTab = useState("today")[1];
  var ts = useState("today");
  var tabState = ts;

  function changeStatus(id, status) {
    setBookings(bookings.map(function(b){ return b.id===id ? Object.assign({},b,{status:status}) : b; }));
  }

  var active = bookings.filter(function(b){ return b.status!=="cancelled"; });
  var revenue = active.filter(function(b){ return b.status!=="no_show"; }).reduce(function(a,b){ return a+b.price; }, 0);
  var next = bookings.find(function(b){ return b.status==="confirmed"; });
  var shown = tabState[0]==="upcoming"
    ? bookings.filter(function(b){ return b.status==="confirmed"; })
    : bookings;

  var today = new Date().toLocaleDateString("en-NA",{weekday:"long",day:"numeric",month:"long"});

  return (
    <div style={{fontFamily:"system-ui",minHeight:"100vh",background:"#f5f5f3",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:DARK,padding:"1rem 1.25rem",color:"white"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <div>
            <div style={{fontSize:16,fontWeight:500}}>{shop.name}</div>
            <div style={{fontSize:12,opacity:0.75}}>{today}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onSettings}
              style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"none",cursor:"pointer",color:"white",fontSize:16}}>⚙</button>
            <button onClick={onLogout}
              style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"none",cursor:"pointer",color:"white",fontSize:14}}>↩</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[
            ["Bookings", active.length],
            ["Revenue", "N$"+revenue],
            ["Next", next?next.time:"—"]
          ].map(function(item){
            return (
              <div key={item[0]} style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"0.75rem",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:500}}>{item[1]}</div>
                <div style={{fontSize:11,opacity:0.75}}>{item[0]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:"white",borderBottom:"0.5px solid #e5e5e0"}}>
        {["today","upcoming","all"].map(function(t){
          return (
            <button key={t} onClick={function(){tabState[1](t)}}
              style={{flex:1,padding:"10px 8px",border:"none",background:"none",fontSize:13,cursor:"pointer",
                color:tabState[0]===t?GREEN:"#888",
                borderBottom:tabState[0]===t?"2px solid "+GREEN:"2px solid transparent",
                fontWeight:tabState[0]===t?500:400,
                textTransform:"capitalize"}}>
              {t==="today"?"Today":t==="upcoming"?"Upcoming":"All"}
            </button>
          );
        })}
      </div>

      {/* Booking cards */}
      <div style={{padding:"1rem"}}>
        {shown.length === 0 && (
          <p style={{textAlign:"center",color:"#888",padding:"2rem",fontSize:14}}>No bookings to show.</p>
        )}
        {shown.map(function(b){
          var ss = statusStyle(b.status);
          return (
            <div key={b.id} style={{background:"white",border:"0.5px solid #e5e5e0",borderRadius:12,padding:"1rem",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:15,fontWeight:500}}>{b.name}</div>
                  <div style={{fontSize:13,color:"#888"}}>{b.service} · {b.barber}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:15,fontWeight:500}}>{b.time}</div>
                  <div style={{fontSize:13,color:GREEN,fontWeight:500}}>N${b.price}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
                <span style={{fontSize:11,padding:"3px 8px",borderRadius:99,fontWeight:500,background:ss.bg,color:ss.color}}>
                  {statusLabel(b.status)}
                </span>
                {b.status==="confirmed" && (
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={function(){changeStatus(b.id,"completed")}}
                      style={{padding:"5px 10px",borderRadius:6,border:"none",background:GREEN,color:"white",fontSize:12,cursor:"pointer"}}>Done</button>
                    <button onClick={function(){changeStatus(b.id,"no_show")}}
                      style={{padding:"5px 10px",borderRadius:6,border:"0.5px solid #ccc",background:"none",fontSize:12,cursor:"pointer"}}>No show</button>
                    <button onClick={function(){changeStatus(b.id,"cancelled")}}
                      style={{padding:"5px 10px",borderRadius:6,border:"0.5px solid #F09595",background:"none",color:"#A32D2D",fontSize:12,cursor:"pointer"}}>Cancel</button>
                  </div>
                )}
                {b.status!=="confirmed" && (
                  <span style={{fontSize:12,color:"#888"}}>📞 {b.phone}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"0.5px solid #e5e5e0",display:"flex",padding:"0.5rem 0"}}>
        <button style={{flex:1,background:"none",border:"none",cursor:"pointer",fontSize:12,color:GREEN,fontWeight:500,padding:"6px 0"}}>
          📋 Bookings
        </button>
        <button onClick={onSettings} style={{flex:1,background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#888",padding:"6px 0"}}>
          ⚙ Settings
        </button>
      </div>
    </div>
  );
}

// ── SETTINGS SCREEN ───────────────────────────────────────────────────────────
function SettingsScreen(props) {
  var shop = props.shop;
  var onBack = props.onBack;
  var services = useState(MOCK_SERVICES)[0];
  var setServices = useState(MOCK_SERVICES)[1];
  var svcsState = useState(MOCK_SERVICES);
  var saved = useState(false);
  var savedState = saved;

  var DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var hoursState = useState(DAYS.map(function(d,i){
    return {day:d, open:"08:00", close:"18:00", closed:i===0};
  }));

  function saveSettings() {
    savedState[1](true);
    setTimeout(function(){savedState[1](false)}, 2000);
  }

  function toggleDay(i) {
    var h = hoursState[0].slice();
    h[i] = Object.assign({},h[i],{closed:!h[i].closed});
    hoursState[1](h);
  }

  function updateHour(i, field, val) {
    var h = hoursState[0].slice();
    h[i] = Object.assign({},h[i]);
    h[i][field] = val;
    hoursState[1](h);
  }

  function updateSvc(i, field, val) {
    var s = svcsState[0].slice();
    s[i] = Object.assign({},s[i]);
    s[i][field] = val;
    svcsState[1](s);
  }

  function addSvc() {
    svcsState[1](svcsState[0].concat([{id:"new-"+Date.now(),name:"",price_nad:"",duration_min:30}]));
  }

  function removeSvc(i) {
    svcsState[1](svcsState[0].filter(function(_,idx){return idx!==i}));
  }

  return (
    <div style={{fontFamily:"system-ui",minHeight:"100vh",background:"#f5f5f3",paddingBottom:40}}>
      <div style={{background:DARK,padding:"1rem 1.25rem",color:"white",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"white",cursor:"pointer",fontSize:16}}>←</button>
        <div>
          <div style={{fontSize:16,fontWeight:500}}>Settings</div>
          <div style={{fontSize:12,opacity:0.75}}>{shop.name}</div>
        </div>
      </div>

      {/* Services */}
      <div style={{padding:"1.25rem 1rem 0"}}>
        <div style={{fontSize:15,fontWeight:500,marginBottom:"0.75rem"}}>Services & prices</div>
        {svcsState[0].map(function(s,i){
          return (
            <div key={s.id} style={{background:"white",border:"0.5px solid #e5e5e0",borderRadius:10,padding:"0.875rem",marginBottom:8,display:"flex",gap:8,alignItems:"center"}}>
              <input value={s.name} onChange={function(e){updateSvc(i,"name",e.target.value)}} placeholder="Service name"
                style={{flex:2,padding:"7px 10px",borderRadius:6,border:"0.5px solid #ccc",fontSize:13,minWidth:0}}/>
              <div style={{position:"relative",flexShrink:0}}>
                <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#888"}}>N$</span>
                <input value={s.price_nad} onChange={function(e){updateSvc(i,"price_nad",e.target.value)}} placeholder="0" type="number"
                  style={{width:60,padding:"7px 8px 7px 22px",borderRadius:6,border:"0.5px solid #ccc",fontSize:13}}/>
              </div>
              <select value={s.duration_min} onChange={function(e){updateSvc(i,"duration_min",e.target.value)}}
                style={{width:75,padding:"7px 4px",borderRadius:6,border:"0.5px solid #ccc",fontSize:12}}>
                {[15,20,25,30,45,60,90].map(function(d){return <option key={d} value={d}>{d}min</option>})}
              </select>
              <button onClick={function(){removeSvc(i)}} style={{background:"none",border:"none",cursor:"pointer",color:"#A32D2D",fontSize:16,padding:"0 4px"}}>×</button>
            </div>
          );
        })}
        <button onClick={addSvc}
          style={{padding:"8px 16px",borderRadius:8,border:"0.5px solid #ccc",background:"none",fontSize:13,cursor:"pointer",marginBottom:"1.25rem"}}>
          + Add service
        </button>
      </div>

      {/* Hours */}
      <div style={{padding:"0 1rem 0"}}>
        <div style={{fontSize:15,fontWeight:500,marginBottom:"0.75rem"}}>Opening hours</div>
        {hoursState[0].map(function(d,i){
          return (
            <div key={d.day} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"0.5px solid #f0f0ee"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,width:60}}>
                <input type="checkbox" checked={!d.closed} onChange={function(){toggleDay(i)}}
                  style={{accentColor:GREEN,width:15,height:15}}/>
                <span style={{fontSize:13,fontWeight:500,color:d.closed?"#aaa":"#333"}}>{d.day}</span>
              </div>
              {d.closed ? (
                <span style={{fontSize:13,color:"#aaa"}}>Closed</span>
              ) : (
                <div style={{display:"flex",alignItems:"center",gap:6,flex:1}}>
                  <input type="time" value={d.open} onChange={function(e){updateHour(i,"open",e.target.value)}}
                    style={{padding:"5px 8px",borderRadius:6,border:"0.5px solid #ccc",fontSize:13}}/>
                  <span style={{fontSize:12,color:"#888"}}>to</span>
                  <input type="time" value={d.close} onChange={function(e){updateHour(i,"close",e.target.value)}}
                    style={{padding:"5px 8px",borderRadius:6,border:"0.5px solid #ccc",fontSize:13}}/>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save */}
      <div style={{padding:"1.25rem 1rem"}}>
        <button onClick={saveSettings}
          style={{width:"100%",padding:12,background:savedState[0]?"#3B6D11":GREEN,color:"white",border:"none",borderRadius:10,fontSize:15,fontWeight:500,cursor:"pointer",transition:"background 0.2s"}}>
          {savedState[0] ? "✓ Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────
export default function OwnerApp() {
  var screenState = useState("login");
  var tokenState = useState(null);
  var ownerState = useState(null);

  var shop = MOCK_SHOP;

  if(screenState[0]==="login") {
    return (
      <LoginScreen onLogin={function(token, owner){
        tokenState[1](token);
        ownerState[1](owner);
        screenState[1]("bookings");
      }}/>
    );
  }

  if(screenState[0]==="bookings") {
    return (
      <BookingsScreen
        shop={shop}
        token={tokenState[0]}
        onLogout={function(){screenState[1]("login")}}
        onSettings={function(){screenState[1]("settings")}}
      />
    );
  }

  if(screenState[0]==="settings") {
    return (
      <SettingsScreen
        shop={shop}
        onBack={function(){screenState[1]("bookings")}}
      />
    );
  }

  return null;
}
