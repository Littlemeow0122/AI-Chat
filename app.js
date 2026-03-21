// ChatApp class
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
}
else {
this.loadChat(this.chats[0].id);
}

this.renderChatList();
this.setupEventListeners();
}

setupEventListeners() {

const messagesContainer = document.getElementById('messagesContainer');

['dragenter','dragover','dragleave','drop'].forEach(eName => {
messagesContainer.addEventListener(eName, e => {
e.preventDefault();
e.stopPropagation();
});
});

messagesContainer.addEventListener('drop', e => {
this.handleFiles(e.dataTransfer.files);
});

document.addEventListener('paste', e => {

const items = e.clipboardData.items;

for (let item of items) {
if (item.type.indexOf('image') !== -1) {
this.handleFiles([item.getAsFile()]);
}
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

if (window.innerWidth < 768) {
this.toggleSidebar();
}

}

loadChat(chatId) {

const chat = this.chats.find(c => c.id === chatId);

if (!chat) return;

this.currentChatId = chatId;
this.currentModel = chat.model || 'openai';

document.getElementById('modelSelector').value = this.currentModel;

document.getElementById('currentChatTitle').textContent = chat.title;
document.getElementById('mobileTitle').textContent = chat.title;

document.getElementById('currentModelBadge').textContent =
this.getModelDisplayName(this.currentModel);

this.renderMessages();
this.highlightCurrentChat();
}

getModelDisplayName(model) {

const names = {
openai: 'GPT-4o',
mistral: 'Mistral',
llama: 'Llama 3',
claude: 'Claude 3',
gemini: 'Gemini'
};

return names[model] || model;
}

renderMessages() {

const container = document.getElementById('messagesContainer');

const chat = this.chats.find(c => c.id === this.currentChatId);

if (!chat || chat.messages.length === 0) {

container.innerHTML = `
<div class="h-full flex flex-col items-center justify-center text-center p-8">
<h2 class="text-2xl font-bold mb-2">歡迎使用 AI 聊天助手</h2>
<p class="text-slate-400">使用 Pollinations AI 進行對話</p>
</div>
`;

return;
}

container.innerHTML = '';

chat.messages.forEach(msg => {

const isUser = msg.role === 'user';

const bubble = document.createElement('div');

bubble.className =
`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;

const content = this.formatMessage(msg.content);

bubble.innerHTML = `
<div class="message-bubble
${isUser ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}
rounded-2xl px-4 py-3">

<div class="prose prose-invert max-w-none text-sm">
${content}
</div>

</div>
`;

container.appendChild(bubble);

});

container.scrollTop = container.scrollHeight;

}

formatMessage(content) {

marked.setOptions({
breaks: true,
gfm: true,
highlight: function(code, lang) {

if (lang && hljs.getLanguage(lang)) {
return hljs.highlight(code, {language: lang}).value;
}

return hljs.highlightAuto(code).value;

}
});

return marked.parse(content);
}

async sendMessage() {

if (this.isGenerating) return;

const input = document.getElementById('messageInput');

const content = input.value.trim();

if (!content && this.selectedFiles.length === 0) return;

const chat = this.chats.find(c => c.id === this.currentChatId);

const userMessage = {
role: 'user',
content: content,
timestamp: new Date().toISOString()
};

chat.messages.push(userMessage);

input.value = '';

this.renderMessages();
this.saveChats();

this.setTyping(true);

this.isGenerating = true;
this.updateSendButton();

try {

const apiMessages = chat.messages.slice(-20).map(msg => ({
role: msg.role,
content: msg.content
}));

const response = await fetch(
'https://text.pollinations.ai/',
{
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
messages: apiMessages,
model: this.currentModel
})
}
);

const aiContent = await response.text();

chat.messages.push({
role: 'assistant',
content: aiContent,
timestamp: new Date().toISOString()
});

}

catch (error) {

chat.messages.push({
role: 'assistant',
content: '發生錯誤: ' + error.message,
timestamp: new Date().toISOString()
});

}

finally {

this.setTyping(false);

this.isGenerating = false;

this.updateSendButton();

this.renderMessages();

this.saveChats();

}

}

setTyping(show) {

document
.getElementById('typingIndicator')
.classList.toggle('hidden', !show);

}

updateSendButton() {

const btn = document.getElementById('sendButton');

if (this.isGenerating) {

btn.disabled = true;

btn.innerHTML =
'<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>';

}

else {

btn.disabled = false;

btn.innerHTML =
'<i data-lucide="send" class="w-5 h-5"></i>';

lucide.createIcons();

}

}

changeModel(model) {

this.currentModel = model;

localStorage.setItem('pollinations_model', model);

const chat = this.chats.find(c => c.id === this.currentChatId);

if (chat) {
chat.model = model;
this.saveChats();
}

}

renderChatList() {

const list = document.getElementById('chatList');

list.innerHTML = '';

this.chats.forEach(chat => {

const item = document.createElement('div');

item.className =
'flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-800';

item.onclick = () => this.loadChat(chat.id);

item.innerHTML =
`<span class="text-sm truncate">${chat.title}</span>`;

list.appendChild(item);

});

}

highlightCurrentChat() {

this.renderChatList();

}

saveChats() {

localStorage.setItem(
'pollinations_chats',
JSON.stringify(this.chats)
);

}

handleKeyDown(e) {

if (e.key === 'Enter' && !e.shiftKey) {

e.preventDefault();

this.sendMessage();

}

}

autoResize(t) {

t.style.height = 'auto';
t.style.height = t.scrollHeight + 'px';

}

toggleSidebar() {

const s = document.getElementById('sidebar');
const o = document.getElementById('sidebarOverlay');

if (s.classList.contains('-translate-x-full')) {

s.classList.remove('-translate-x-full');
o.classList.remove('hidden');

}
else {

s.classList.add('-translate-x-full');
o.classList.add('hidden');

}

}

}

document.addEventListener("DOMContentLoaded", () => {

window.chatApp = new ChatApp();

});
