// app.js
// ChatApp class (完整保留原本功能)
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
        if (savedModel) {
            this.currentModel = savedModel;
            document.getElementById('modelSelector').value = savedModel;
        }
        if (this.chats.length === 0) {
            this.createNewChat();
        } else {
            this.loadChat(this.chats[0].id);
        }
        this.renderChatList();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const messagesContainer = document.getElementById('messagesContainer');
        ['dragenter','dragover','dragleave','drop'].forEach(eName => {
            messagesContainer.addEventListener(eName, e => { e.preventDefault(); e.stopPropagation(); });
        });
        messagesContainer.addEventListener('drop', e => this.handleFiles(e.dataTransfer.files));
        document.addEventListener('paste', e => {
            const items = e.clipboardData.items;
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) this.handleFiles([item.getAsFile()]);
            }
        });
    }

    createNewChat() {
        const newChat = {
            id: Date.now().toString(),
            title: `新對話 ${this.chats.length + 1}`,
            model: this.currentModel,
            messages: [],
            createdAt: new Date().toISOString()
        };
        this.chats.unshift(newChat);
        this.saveChats();
        this.loadChat(newChat.id);
        this.renderChatList();
        return newChat;
    }

    newChat() {
        this.createNewChat();
        if(window.innerWidth < 768) this.toggleSidebar();
    }

    loadChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if(!chat) return;
        this.currentChatId = chatId;
        this.currentModel = chat.model || 'openai';
        document.getElementById('modelSelector').value = this.currentModel;
        document.getElementById('currentChatTitle').textContent = chat.title;
        document.getElementById('mobileTitle').textContent = chat.title;
        document.getElementById('currentModelBadge').textContent = this.getModelDisplayName(this.currentModel);
        this.renderMessages();
        this.highlightCurrentChat();
    }

    getModelDisplayName(model) {
        const names = { openai:'GPT-4o', mistral:'Mistral', llama:'Llama 3', claude:'Claude 3', gemini:'Gemini' };
        return names[model] || model;
    }

    renderMessages() {
        const container = document.getElementById('messagesContainer');
        const chat = this.chats.find(c => c.id === this.currentChatId);
        if(!chat || chat.messages.length === 0) {
            container.innerHTML = `<div id="welcomeScreen" class="h-full flex flex-col items-center justify-center text-center p-8">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                    <i data-lucide="sparkles" class="w-8 h-8 text-white"></i>
                </div>
                <h2 class="text-2xl font-bold mb-2">歡迎使用 AI 聊天助手</h2>
                <p class="text-slate-400 max-w-md mb-8">使用 Pollinations AI 強大的模型進行對話。支援多輪對話、檔案上傳、圖片分析等功能。</p>
            </div>`;
            lucide.createIcons();
            return;
        }

        container.innerHTML = '';
        chat.messages.forEach((msg, index) => {
            const isUser = msg.role === 'user';
            const bubble = document.createElement('div');
            bubble.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;

            let attachmentsHtml = '';
            if(msg.attachments && msg.attachments.length > 0) {
                attachmentsHtml = '<div class="flex flex-wrap gap-2 mb-2">';
                msg.attachments.forEach(att => {
                    if(att.type === 'image') {
                        attachmentsHtml += `<div class="relative group">
                            <img src="${att.data}" class="max-w-[200px] max-h-[150px] rounded-lg border border-slate-600 object-cover cursor-pointer hover:opacity-90 transition-opacity" onclick="window.open('${att.data}')">
                            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <span class="text-xs text-white">${att.name}</span>
                            </div>
                        </div>`;
                    } else {
                        const ext = att.name.split('.').pop().toUpperCase();
                        attachmentsHtml += `<div class="bg-slate-800 border border-slate-700 rounded-lg p-2 flex items-center gap-2 max-w-[200px]">
                            <div class="w-8 h-8 bg-blue-900/50 rounded flex items-center justify-center text-xs font-bold text-blue-400">${ext}</div>
                            <span class="text-xs text-slate-300 truncate flex-1">${att.name}</span>
                        </div>`;
                    }
                });
                attachmentsHtml += '</div>';
            }

            const content = this.formatMessage(msg.content);
            bubble.innerHTML = `<div class="message-bubble ${isUser ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'} rounded-2xl px-4 py-3 shadow-sm">
                ${attachmentsHtml}<div class="prose prose-invert max-w-none text-sm">${content}</div>
                <div class="text-xs mt-1 opacity-50 ${isUser ? 'text-right' : 'text-left'}">${new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>`;
            container.appendChild(bubble);
        });
        this.addCopyButtons();
        container.scrollTop = container.scrollHeight;
    }

    formatMessage(content){
        marked.setOptions({
            breaks:true,
            gfm:true,
            highlight:function(code,lang){
                return lang && hljs.getLanguage(lang) ? hljs.highlight(code,{language:lang}).value : hljs.highlightAuto(code).value;
            }
        });
        return marked.parse(content);
    }

    addCopyButtons(){
        document.querySelectorAll('pre').forEach(pre => {
            if(!pre.querySelector('.copy-code-btn')){
                const btn = document.createElement('button');
                btn.className='copy-code-btn p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-xs transition-colors';
                btn.innerHTML='<i data-lucide="copy" class="w-3 h-3"></i>';
                btn.onclick = () => {
                    const code = pre.querySelector('code')?.textContent || pre.textContent;
                    navigator.clipboard.writeText(code);
                    btn.innerHTML='<i data-lucide="check" class="w-3 h-3"></i>';
                    lucide.createIcons();
                    setTimeout(()=>{btn.innerHTML='<i data-lucide="copy" class="w-3 h-3"></i>'; lucide.createIcons();},2000);
                };
                pre.appendChild(btn);
            }
        });
        lucide.createIcons();
    }

    async sendMessage() {
        if(this.isGenerating) return;
        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        if(!content && this.selectedFiles.length === 0) return;

        const chat = this.chats.find(c => c.id === this.currentChatId);
        if(!chat) return;

        const userMessage = {
            role: 'user',
            content: content,
            attachments: [...this.selectedFiles],
            timestamp: new Date().toISOString()
        };

        let finalContent = content;
        const textFiles = this.selectedFiles.filter(f => f.type === 'text');
        if(textFiles.length > 0){
            finalContent += '\n\n[檔案內容]:\n';
            textFiles.forEach(f => { finalContent += `\n--- ${f.name} ---\n${f.data}\n`; });
        }
        userMessage.finalContent = finalContent;

        chat.messages.push(userMessage);
        input.value=''; input.style.height='auto'; this.selectedFiles=[]; this.renderFilePreviews();

        if(chat.messages.length===1){
            chat.title = content.slice(0,30)+(content.length>30?'...':'')||'新對話';
            document.getElementById('currentChatTitle').textContent=chat.title;
            document.getElementById('mobileTitle').textContent=chat.title;
            this.renderChatList();
        }

        this.renderMessages(); this.saveChats();
        this.setTyping(true); this.isGenerating=true; this.updateSendButton();

        try {
            const apiMessages = chat.messages.slice(-20).map(msg => ({role: msg.role, content: msg.finalContent||msg.content}));
            const response = await fetch('https://text.pollinations.ai/',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({messages: apiMessages, model:this.currentModel, seed:Math.floor(Math.random()*1000), jsonMode:false})
            });
            if(!response.ok) throw new Error('API 請求失敗');
            const aiContent = await response.text();
            chat.messages.push({role:'assistant', content: aiContent, timestamp:new Date().toISOString()});
        } catch(error){
            console.error(error);
            chat.messages.push({role:'assistant', content:'抱歉，發生錯誤：'+error.message, timestamp:new Date().toISOString()});
        } finally {
            this.setTyping(false);
            this.isGenerating=false;
            this.updateSendButton();
            this.renderMessages();
            this.saveChats();
        }
    }

    setTyping(show){document.getElementById('typingIndicator').classList.toggle('hidden',!show);}
    updateSendButton(){
        const btn=document.getElementById('sendButton');
        if(this.isGenerating){
            btn.disabled=true;
            btn.innerHTML='<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>';
        } else {
            btn.disabled=false;
            btn.innerHTML='<i data-lucide="send" class="w-5 h-5"></i>';
            lucide.createIcons();
        }
    }

    handleFileSelect(e){this.handleFiles(e.target.files); e.target.value='';}
    handleFiles(files){
        Array.from(files).forEach(file=>{
            const reader = new FileReader();
            if(file.type.startsWith('image/')){
                reader.onload=e=>{
                    this.selectedFiles.push({type:'image', data:e.target.result, name:file.name, size:file.size});
                    this.renderFilePreviews();
                };
                reader.readAsDataURL(file);
            } else {
                reader.onload=e=>{
                    this.selectedFiles.push({type:'text', data:e.target.result, name:file.name, size:file.size});
                    this.renderFilePreviews();
                };
                reader.readAsText(file);
            }
        });
    }

    renderFilePreviews(){
        const container=document.getElementById('filePreviewArea');
        if(this.selectedFiles.length===0){ container.classList.add('hidden'); container.innerHTML=''; return; }
        container.classList.remove('hidden'); container.innerHTML='';
        this.selectedFiles.forEach((file,index)=>{
            const div=document.createElement('div');
            div.className='file-preview relative group bg-slate-800 rounded-lg border border-slate-700 overflow-hidden';
            if(file.type==='image'){
                div.innerHTML=`<div class="relative w-20 h-20">
                    <img src="${file.data}" class="w-full h-full object-cover">
                    <button onclick="chatApp.removeFile(${index})" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <i data-lucide="x" class="w-3 h-3"></i>
                    </button>
                </div>
                <div class="px-2 py-1 text-xs text-slate-400 truncate max-w-[80px]">${file.name}</div>`;
            } else {
                const ext=file.name.split('.').pop().toUpperCase();
                div.innerHTML=`<div class="flex items-center gap-2 p-2 pr-8">
                    <div class="w-8 h-8 bg-blue-900/50 rounded flex items-center justify-center text-xs font-bold text-blue-400">${ext}</div>
                    <span class="text-xs text-slate-300 truncate max-w-[100px]">${file.name}</span>
                    <button onclick="chatApp.removeFile(${index})" class="absolute top-1 right-1 w-5 h-5 hover:bg-red-500/20 rounded flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
                        <i data-lucide="x" class="w-3 h-3"></i>
                    </button>
                </div>`;
            }
            container.appendChild(div);
        });
        lucide.createIcons();
    }

    removeFile(index){this.selectedFiles.splice(index,1); this.renderFilePreviews();}
    changeModel(model){this.currentModel=model; localStorage.setItem('pollinations_model',model); const chat=this.chats.find(c=>c.id===this.currentChatId); if(chat){chat.model=model; this.saveChats();} document.getElementById('currentModelBadge').textContent=this.getModelDisplayName(model);}
    renderChatList(){const list=document.getElementById('chatList'); list.innerHTML=''; this.chats.forEach(chat=>{const item=document.createElement('div'); const isActive=chat.id===this.currentChatId; item.className=`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isActive?'bg-blue-600/20 border border-blue-600/30':'hover:bg-slate-800 border border-transparent'}`; item.onclick=()=>this.loadChat(chat.id); item.innerHTML=`<div class="flex-1 min-w-0"><div class="flex items-center gap-2"><i data-lucide="message-square" class="w-4 h-4 ${isActive?'text-blue-400':'text-slate-400'} flex-shrink-0"></i><span class="text-sm font-medium truncate ${isActive?'text-blue-100':'text-slate-300'}">${chat.title}</span></div><div class="text-xs text-slate-500 mt-1 ml-6">${new Date(chat.createdAt).toLocaleDateString()} · ${chat.messages.length} 則訊息</div></div><button onclick="event.stopPropagation(); chatApp.deleteChat('${chat.id}')" class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`; list.appendChild(item);}); lucide.createIcons();}
    highlightCurrentChat(){this.renderChatList();}
    editTitle(){const chat=this.chats.find(c=>c.id===this.currentChatId); if(!chat)return; const newTitle=prompt('重新命名對話：',chat.title); if(newTitle && newTitle.trim()){chat.title=newTitle.trim(); document.getElementById('currentChatTitle').textContent=chat.title; document.getElementById('mobileTitle').textContent=chat.title; this.saveChats(); this.renderChatList();}}
    deleteChat(chatId){if(!confirm('確定要刪除這個對話嗎？'))return; this.chats=this.chats.filter(c=>c.id!==chatId); if(this.chats.length===0){this.createNewChat();} else if(this.currentChatId===chatId){this.loadChat(this.chats[0].id);} this.saveChats(); this.renderChatList();}
    deleteCurrentChat(){this.deleteChat(this.currentChatId);}
    clearAllChats(){if(!confirm('確定要清除所有對話嗎？此操作無法復原。'))return; this.chats=[]; this.createNewChat(); this.saveChats();}
    saveChats(){localStorage.setItem('pollinations_chats', JSON.stringify(this.chats));}
    handleKeyDown(e){if(e.key==='Enter' && !e.shiftKey){e.preventDefault(); this.sendMessage();}}
    autoResize(t){t.style.height='auto'; t.style.height=t.scrollHeight+'px';}
    toggleSidebar(){const s=document.getElementById('sidebar'), o=document.getElementById('sidebarOverlay'); if(s.classList.contains('-translate-x-full')){ s.classList.remove('-translate-x-full'); o.classList.remove('hidden'); }else{s.classList.add('-translate-x-full'); o.classList.add('hidden');}}
}

// 初始化
document.addEventListener('DOMContentLoaded',()=>{window.chatApp=new ChatApp();});
window.addEventListener('resize',()=>{if(window.innerWidth>=768)document.getElementById('sidebarOverlay').classList.add('hidden');});
