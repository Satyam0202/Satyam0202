// ========== THEME TOGGLE ==========
function mode() 
{
    const body=document.body;
    const btn=document.getElementById("mode");
    const heroImg=document.getElementById("hero-img");
    const isDark=body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark":"light");
    hero_image.src=isDark?"dark_illusion.png":"illustration.png";
    search.src=isDark?"dark_search.png":"search.png";
    
    // const menu_bar=document.getElementById("menu_bar");
    // menu_bar.src=isDark ? "menu_dark.png":"menu_dark.png";

    const form_icon=document.getElementById("form_icon");
    form_icon.src=isDark?"dark_form.png":"form_icon.png";
}
// Apply saved theme
window.addEventListener("DOMContentLoaded",()=>
    {
        const body=document.body;
        const btn=document.getElementById("mode");
        const heroImg=document.getElementById("hero-img");
        const saved=localStorage.getItem("theme");

        if(saved==="dark") 
        {
            body.classList.add("dark");
        } 
        else 
        {
            body.classList.remove("dark");
            heroImg.src="illustration-light.png";
        }
    });
// ========== POPUP ==========
function openpop() 
{
    const p=document.getElementById("pop-form");
    if(p)
        { 
            p.style.display="flex"; 
            clearTimeout(window._popupTimer); 
        }
    }
    function closepop() 
    {
        const p=document.getElementById("pop-form");
        if(p) p.style.display="none";
    }

// Show popup once per session
window.addEventListener("load",()=> 
    {
        if(!sessionStorage.getItem("popupShown")) 
            {
                window._popupTimer=setTimeout(()=>
                {
                    const p=document.getElementById("pop-form");
                    if(p && p.style.display!=="flex")
                        p.style.display="flex";
                },10000);
                sessionStorage.setItem("popupShown","true");
            }
    });

// ========== SIDE MENU ==========
function toggleMenu() 
{
    const menu=document.getElementById("sideMenu");
    if(!menu) 
        return;
    menu.classList.toggle("open");
    
}


// ========== TEAM BUTTON ==========
function toggleTeam() 
{
    const container=document.getElementById("teamContainer");
    if(container)
        container.classList.toggle("active");
}
// ========== ESC CLOSE ==========
document.addEventListener("keydown",(e)=>
{
    if(e.key === "Escape") 
    {
        closepop();
        const menu=document.getElementById("sideMenu");
        if(menu && menu.classList.contains("open")) 
            menu.classList.remove("open");
    }
});

// ============================weather====================================

/* ---------------- WEATHER FEATURE (WeatherAPI.com) ---------------- */

async function fetchWeather(city ="Chandigarh") 
{
    const apiKey="a378e6dd5ce147d6b26175122252510"; // API key
    const url=`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
    try 
    {
        const res=await fetch(url);
        const data=await res.json();
        const temp=Math.round(data.current.temp_c);
        const condition=data.current.condition.text;
        const name=data.location.name;
    
        // update UI
        document.getElementById("city-name").textContent=name;
        document.getElementById("temperature").textContent=`${temp}°C, ${condition}`;

    } 
    catch(err) 
    {
        console.error("Weather fetch failed:", err);
        document.getElementById("temperature").textContent = "Unavailable";
    }
}

/* Auto detect user's location by coordinates */
function getUserLocation() 
{
    if(navigator.geolocation) 
    {
        navigator.geolocation.getCurrentPosition
        (
            (pos)=> 
            {
                const{latitude,longitude}=pos.coords;
                fetchWeather(`${latitude},${longitude}`);
            },
            ()=> fetchWeather("Chandigarh") // fallback
        );
    } 
    else 
    {
        fetchWeather("Chandigarh");
    }
}
window.addEventListener("load", getUserLocation);

// ========== LIVE TIME, DATE, AND DAY ==========
function updateDateTime() 
{
    const now=new Date();
    const time=now.toLocaleTimeString([], 
        { 
            hour:'2-digit',minute:'2-digit' 
        });
  document.getElementById("current-time").textContent=time;
  const date=now.toLocaleDateString('en-IN', 
    {
        day:'2-digit',
        month:'short',
        year:'numeric'
    });
    document.getElementById("current-date").textContent=date;
    const day=now.toLocaleDateString('en-IN', { weekday: 'long' });
    document.getElementById("current-day").textContent=day;
}
// Call once + update every second
updateDateTime();
setInterval(updateDateTime, 1000);


//  typo
const input=document.getElementById("search_input");
const texts=
[
  "Search for hotels...",
  "Search for restaurants...",
  "Search for hospitals...",
  "Search for routes...",
  "Search for markets..."
];
let textIndex=0;
let charIndex=0;
let typing=true;

function typeEffect() 
{
    let currentText=texts[textIndex];
    if(typing) 
    {
        input.placeholder=currentText.substring(0,charIndex++);
        if(charIndex>currentText.length) 
        {
            typing=false;
            setTimeout(typeEffect, 1000); // pause before deleting
            return;
        }
    } 
    else 
    {
        input.placeholder=currentText.substring(0, charIndex--);
        if(charIndex<0) 
        {
            typing=true;
            textIndex=(textIndex + 1) % texts.length;
        }
    }
    setTimeout(typeEffect,typing?100:50); // typing speed
}
typeEffect();


// ================== HOTEL DISTANCE (Real Driving Distance using OpenRouteService) ==================

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJmZTJiM2RjZWY1ZTRjYzlhMWE0YjRkZTI0NDQzOWQ0IiwiaCI6Im11cm11cjY0In0=";

// Chandigarh hotel coordinates (latitude, longitude)
const hotels = {
  taj: { lat: 30.7398, lon: 76.7826 },        // Taj Chandigarh
  lalit: { lat: 30.7065, lon: 76.8087 },      // The Lalit Chandigarh
  mountview: { lat: 30.7490, lon: 76.7872 }   // Hotel Mountview
};

// Get distance from OpenRouteService API
async function getRealDistanceORS(userLat, userLon, hotelLat, hotelLon) {
  // ORS expects (lon, lat) order
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${userLon},${userLat}&end=${hotelLon},${hotelLat}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.features && data.features.length > 0) {
      const summary = data.features[0].properties.summary;
      const distanceKm = (summary.distance / 1000).toFixed(2);
      const durationMin = Math.round(summary.duration / 60);
      return { distanceKm, durationMin };
    } else {
      console.warn("No valid route data:", data);
      return null;
    }
  } catch (err) {
    console.error("Error fetching ORS data:", err);
    return null;
  }
}

// Update all hotel distances
function updateHotelDistances() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;

    const hotelsData = [
      { id: "distance-taj", coords: hotels.taj },
      { id: "distance-lalit", coords: hotels.lalit },
      { id: "distance-mountview", coords: hotels.mountview }
    ];

    for (const h of hotelsData) {
      const result = await getRealDistanceORS(latitude, longitude, h.coords.lat, h.coords.lon);
      const el = document.getElementById(h.id);

      if (result && el) {
        el.textContent = `📍 Distance: ${result.distanceKm} km · ⏱️ ${result.durationMin} min`;
      } else if (el) {
        el.textContent = "📍 Distance: Unavailable";
      }
    }
  },
  (err) => {
    console.warn("Location access denied:", err);
    alert("Please allow location access to calculate distances.");
  });
}

window.addEventListener("load", updateHotelDistances);
