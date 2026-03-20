class ChatApp {
    constructor() {
        this.chats = JSON.parse(localStorage.getItem('pollinations_chats')) || [];
        this.currentChatId = null;
        this.currentModel = 'openai';
        this.selectedFiles = [];
        this.isGenerating = false;
        this.init();
    }
    init() {
        const savedModel = localStorage.getItem('pollinations_model');
        if (savedModel) this.currentModel = savedModel;
        if (this.chats.length===0) this.createNewChat();
        else this.loadChat(this.chats[0].id);
        this.renderChatList();
        this.setupEvents();
    }
    setupEvents() {
        document.addEventListener('paste', e=>{
            const items = e.clipboardData.items;
            for (let item of items) if (item.type.indexOf('image')!==-1) this.handleFiles([item.getAsFile()]);
        });
        window.addEventListener('resize',()=>{if(window.innerWidth>=768) document.getElementById('sidebarOverlay').classList.add('hidden');});
    }
    createNewChat() {
        const chat = {id:Date.now().toString(), title:`新對話 ${this.chats.length+1}`, model:this.currentModel, messages:[], createdAt:new Date().toISOString()};
        this.chats.unshift(chat); this.saveChats(); this.loadChat(chat.id); this.renderChatList(); return chat;
    }
    newChat(){this.createNewChat(); if(window.innerWidth<768) this.toggleSidebar();}
    loadChat(chatId){
        const chat=this.chats.find(c=>c.id===chatId); if(!chat) return;
        this.currentChatId=chatId; this.currentModel=chat.model||'openai';
        document.getElementById('modelSelector').value=this.currentModel;
        document.getElementById('currentChatTitle').textContent=chat.title;
        document.getElementById('mobileTitle').textContent=chat.title;
        document.getElementById('currentModelBadge').textContent=this.currentModel;
        this.renderMessages(); this.highlightCurrentChat();
    }
    renderMessages(){
        const container=document.getElementById('messagesContainer'); const chat=this.chats.find(c=>c.id===this.currentChatId);
        container.innerHTML='';
        if(!chat) return;
        chat.messages.forEach(msg=>{
            const bubble=document.createElement('div');
            bubble.className='message-bubble '+msg.role;
            bubble.innerHTML=msg.content;
            container.appendChild(bubble);
        });
        container.scrollTop=container.scrollHeight;
    }
    sendMessage(){console.log('sendMessage');} // 這裡可貼入完整 sendMessage 實作
    handleKeyDown(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); this.sendMessage();}}
    autoResize(t){t.style.height='auto'; t.style.height=t.scrollHeight+'px';}
    handleFileSelect(e){this.handleFiles(e.target.files); e.target.value='';}
    handleFiles(files){console.log('handleFiles',files);}
    renderChatList(){console.log('renderChatList');}
    highlightCurrentChat(){console.log('highlightCurrentChat');}
    newChat(){console.log('newChat');}
    editTitle(){console.log('editTitle');}
    deleteCurrentChat(){console.log('deleteCurrentChat');}
    clearAllChats(){console.log('clearAllChats');}
    changeModel(model){console.log('changeModel',model);}
    toggleSidebar(){const s=document.getElementById('sidebar'),o=document.getElementById('sidebarOverlay'); s.classList.toggle('-translate-x-full'); o.classList.toggle('hidden');}
    saveChats(){localStorage.setItem('pollinations_chats',JSON.stringify(this.chats));}
}
