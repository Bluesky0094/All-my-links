(function(){
  const drawer=document.querySelector(".drawer");
  const toggle=document.querySelector(".contact-toggle");
  const close=document.querySelector("[data-close]");
  const toast=document.querySelector(".toast");
  let lastFocus;
  function setDrawer(open){
    drawer.hidden=!open;
    document.body.classList.toggle("drawer-open",open);
    toggle.setAttribute("aria-expanded",String(open));
    if(open){lastFocus=document.activeElement;close.focus();}else{lastFocus?.focus();}
  }
  toggle.addEventListener("click",()=>setDrawer(true));
  close.addEventListener("click",()=>setDrawer(false));
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!drawer.hidden){setDrawer(false);return;}
    if(event.key!=="Tab"||drawer.hidden)return;
    const focusable=[...drawer.querySelectorAll("a[href],button:not([disabled])")];
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  document.querySelector("[data-copy-email]").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText("stefanocaccamo1@outlook.com");toast.hidden=false;setTimeout(()=>toast.hidden=true,1800);}
    catch{location.href="mailto:stefanocaccamo1@outlook.com";}
  });
  const clock=()=>{document.querySelector("[data-time]").textContent=new Intl.DateTimeFormat("it-IT",{timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit"}).format(new Date());};
  clock();setInterval(clock,30000);document.querySelector("[data-year]").textContent=new Date().getFullYear();
})();
