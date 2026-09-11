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
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 let missing=0;
 for(const day of days){
  if(!day.label || day.label==="R")continue;
  const cell=document.querySelector('[data-workday-date="'+day.raw+'"]')?.closest("td.CalendarDay");
  if(!cell){missing++;continue}
  document.querySelector("#CloseCalendarDayDetail")?.click();
  cell.click();
  const expected=new Date(day.date+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
  let detail=null;
  for(let tries=0;tries<40;tries++){
   await sleep(250);
   const header=document.querySelector("#WorkTab");
   const content=document.querySelector("#CalendarDayTabContent");
   if(header?.getAttribute("data-date")===day.raw && content?.textContent?.includes(expected)){
    detail=content;break;
   }
  }
  if(!detail){missing++;continue}
  const text=detail.innerText;
  day.details=text.replace(/Réceptionner/g,"").trim();
  day.start=text.match(/Début\s*:\s*(\d{1,2}:\d{2})/)?.[1];
  day.end=text.match(/Fin\s*:\s*(\d{1,2}:\d{2})/)?.[1];
 }
 document.querySelector("#CloseCalendarDayDetail")?.click();
 window.webkit.messageHandlers.planning.postMessage({days:days.map(({raw,...day})=>day),warning:missing?missing+" journée(s) sans détail : réessayer l’import.":""});
})().catch(error=>window.webkit.messageHandlers.planning.postMessage({error:error.message}));
