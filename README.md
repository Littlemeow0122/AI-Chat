# AI-Chat
Pollinations AI 聊天助手
========================

網站連結:  
**Vercel** : https://ai-chat-pollinations.vercel.app  
**Google Site** : https://sites.google.com/view/littlemeow0122-github-ai-chat/pollinations-ai-聊天助手  
**OneCompiler** : https://ai-chat.oneapp.dev  
**Hugging Face** : https://huggingface.co/spaces/meow-mi/Ai-chat  

專案簡介
--------
Pollinations AI 聊天助手是一個基於網頁的人工智慧對話平台，旨在提供使用者方便、直覺的聊天體驗。透過整合多種先進 AI 模型，使用者可以進行多輪對話、上傳檔案或圖片，並即時獲得智能回覆。

這個專案專注於：
- 簡單易用的 UI/UX 設計
- 支援多模型選擇，包括 GPT、Mistral、Llama、Claude、Gemini
- 直覺的檔案上傳與預覽功能
- Markdown 支援與程式碼高亮
- 完全在瀏覽器運行，無需安裝桌面應用程式

功能特色
--------
1. 多模型支援
   模型名稱   | 說明
   --------- | --------------------------------------------
   GPT-4o    | OpenAI 最新模型，適合多輪對話與複雜問題
   Mistral Large | 開源大型模型，快速生成回覆
   Llama 3   | Meta 提供的 LLM，適合知識問答
   Claude 3  | Anthropic 產品，偏向安全與倫理回答
   Gemini Pro | Google Gemini 系列，支援廣泛應用場景

2. 即時訊息與 Markdown 支援
- 訊息支援文字、圖片、程式碼片段
- Markdown 格式自動渲染，程式碼高亮顯示
- 內建複製程式碼按鈕，方便程式分享

3. 檔案上傳與預覽
- 支援多種檔案類型（圖片、文字檔、程式碼檔）
- 自動生成檔案預覽縮圖
- 支援拖放或點擊上傳
- 上傳的文字檔可以直接作為聊天內容參考

4. 使用者體驗設計
- 完整響應式設計，手機與桌面皆適用
- 聊天氣泡自動調整寬度
- 自動滾動至最新訊息
- 模擬打字動畫，顯示 AI 正在思考
- 可隨時清除單一或所有對話

5. 記錄與儲存
- 對話紀錄會自動存入 LocalStorage
- 重新整理網頁後可繼續聊天
- 可自訂對話標題，方便管理多個聊天紀錄

技術架構
--------
- 前端框架：純 HTML + CSS + JavaScript
- UI 套件：TailwindCSS
- 程式碼高亮：Highlight.js
- Markdown 解析：Marked.js
- AI 通訊：Pollinations API

使用方式
----------
1. 開啟網頁
2. 選擇或建立新對話
3. 在輸入欄輸入文字訊息
4. 可上傳檔案或圖片，按下「送出」
5. AI 回覆訊息將即時顯示於聊天區

> 無需註冊帳號即可使用。部分功能需支援瀏覽器 LocalStorage。

注意事項
--------
- AI 回覆可能不完全正確，請自行判斷重要資訊
- 建議在現代瀏覽器使用，以確保完整功能
- 檔案上傳大小受限於瀏覽器與網頁端配置

聯絡方式
--------
- Gmail: nicchen0122@gmail.com 

未來規劃
--------
- 支援更多檔案類型及即時檢視
- 增加對話匯出功能
- 導入使用者帳號管理及同步功能
- 支援多語言 UI
