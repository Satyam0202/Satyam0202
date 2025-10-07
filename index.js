function mode() 
{
    const body = document.body;
    const btn = document.getElementById("mode");
    body.classList.toggle("light");
    if(body.classList.contains("light")) 
    {
      localStorage.setItem("theme", "light");
      btn.src = "moon.png";
    } 
    else 
    {
      localStorage.setItem("theme", "dark");
      btn.src = "dark.png";
    }
}
function openpop() 
{
    document.getElementById("pop-form").style.display = "flex";
}
window.onload = function () 
{
    const btn = document.getElementById("mode");
    if (localStorage.getItem("theme") === "light") 
    {
      document.body.classList.add("light");
      btn.src = "moon.png";
    } 
    else 
    {
      btn.src = "dark.png";
    }
};
// Popup
setTimeout(() => 
{
    document.getElementById("pop-form").style.display = "flex";
}, 10000);

function closepop() 
{
    document.getElementById("pop-form").style.display = "none";
}

// Sidebar Menu
function toggleMenu() 
{
    const sideMenu = document.getElementById("sideMenu");
    if(sideMenu.style.width === "250px") 
    {
      sideMenu.style.width = "0";
    } 
    else 
    {
      sideMenu.style.width = "250px";
    }
}
// TEAM SEMICIRCLE BUTTON
function toggleTeam() 
{
    const container = document.getElementById("teamContainer");
    container.classList.toggle("active");
}


