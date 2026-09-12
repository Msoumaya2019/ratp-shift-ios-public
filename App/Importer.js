(async function(){
 if(location.origin!=="https://selfservice.ratp.net" || location.pathname!=="/Assignments")throw new Error("Ouvrir la page Affectations.");
 const entries=Array.from(document.querySelectorAll("[data-workday-date]"));
 if(!entries.length)throw new Error("Le calendrier n’est pas encore chargé.");
 const days=entries.map(el=>{
 const raw=el.getAttribute("data-workday-date");
 const label=el.querySelector(".AssignmentsView .CalendarViewContent")?.textContent?.trim()||"";
 const absence=el.querySelector(".AbsencesVacationsView .CalendarViewContent")?.textContent?.trim()||"";
 return {raw,date:raw.slice(0,4)+"-"+raw.slice(4,6)+"-"+raw.slice(6,8),label,absence};
 });
 const workdays=days.filter(day=>day.label && day.label!=="R");
 let cursor=0;
 let missing=0;
 let sessionExpired=false;
 const loadNext=async()=>{
  while(cursor<workdays.length){
   const day=workdays[cursor++];
   try{
    const response=await fetch("/Assignments/Work/Home?date="+encodeURIComponent(day.raw),{
     credentials:"same-origin",
     headers:{"X-Requested-With":"XMLHttpRequest"}
    });
    if(!response.ok)throw new Error("HTTP "+response.status);
    if(new URL(response.url).host!=="selfservice.ratp.net")throw new Error("Session expirée");
    const html=await response.text();
    if(/SAMLRequest|Synapse\s*-\s*Connexion/i.test(html))throw new Error("Session expirée");
    const parsed=new DOMParser().parseFromString(html,"text/html");
    const detail=parsed.querySelector("#WorkdaysAccordions")||parsed.body;
    const text=detail.innerText||detail.textContent||"";
    if(!text.trim())throw new Error("Détail vide");
    day.details=text.replace(/Réceptionner/g,"").trim();
    day.start=text.match(/Début\s*:\s*(\d{1,2}:\d{2})/)?.[1];
    day.end=text.match(/Fin\s*:\s*(\d{1,2}:\d{2})/)?.[1];
   }catch(error){
    if(/Session expirée|Failed to fetch/i.test(error?.message||""))sessionExpired=true;
    missing++;
   }
  }
 };
 await Promise.all(Array.from({length:Math.min(4,workdays.length)},loadNext));
 if(sessionExpired)throw new Error("La session Selfservice a expiré. Reconnecte-toi puis relance l’import.");
 window.webkit.messageHandlers.planning.postMessage({days:days.map(({raw,...day})=>day),warning:missing?missing+" journée(s) sans détail : réessayer l’import.":""});
})().catch(error=>window.webkit.messageHandlers.planning.postMessage({error:error.message}));
