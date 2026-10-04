import React,{useEffect,useState} from 'react';
// Browsers decide when installation is available; iOS uses the Share menu.
export default function InstallApp(){
 const [prompt,setPrompt]=useState(null),[help,setHelp]=useState(false),[installed,setInstalled]=useState(false);
 useEffect(()=>{setInstalled(window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true);const ready=e=>{e.preventDefault();setPrompt(e);};const done=()=>{setInstalled(true);setPrompt(null);};window.addEventListener('beforeinstallprompt',ready);window.addEventListener('appinstalled',done);return()=>{window.removeEventListener('beforeinstallprompt',ready);window.removeEventListener('appinstalled',done);};},[]);
 if(installed)return null;
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);
 async function install(){if(prompt){await prompt.prompt();const result=await prompt.userChoice;if(result.outcome==='accepted')setPrompt(null);}else setHelp(true);}
 return <aside className="install-app"><button onClick={install} aria-label="Install Fourth Crown app">Install app</button>{help&&<div className="install-help" role="dialog" aria-label="Install Fourth Crown"><button onClick={()=>setHelp(false)} aria-label="Close installation instructions">×</button><h3>FOURTH CROWN on your device</h3><p>{ios?'Open this site in Safari. Tap Share, then Add to Home Screen, and confirm Add.':'In Chrome or Edge, open the browser menu and choose Install app or Add to Home screen. If the option is missing, use the website normally and try again after deployment on HTTPS.'}</p><p>Your installed app opens like an app. Placing orders and checking payments requires an internet connection.</p></div>}</aside>;
}
