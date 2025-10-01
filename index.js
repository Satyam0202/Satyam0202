function mode()
{
    const body=document.body;
    const btn=document.getElementById("mode");

    document.body.classList.toggle("light");
    if(document.body.classList.contains("light"))
    {
        localStorage.setItem("theme","light");
        btn.src="moon.png"
    }
    else
    {
        localStorage.setItem("theme","dark");
        btn.src="dark.png"
    }
}
window.onload=function()
{
    const body=document.body;
    const btn=this.document.getElementById("mode")
    if(localStorage.getItem("theme")=="light")
    {
        document.body.classList.add("light");
        btn.src = "moon.png";
    }
    else
    {
        btn.src="dark.png";
    }
}
