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
