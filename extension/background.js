chrome.runtime.onMessage.addListener((m,s,send)=>{if(m.type==='prepare' && s.tab?.id){chrome.tabs.sendMessage(s.tab.id,{type:'prepare',caption:m.caption}).catch(()=>{});}});
