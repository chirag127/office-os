/**
 * Office OS - Chat with Document Tool
 */
import { chatWithDocument } from '../../../services/ai';
import { docxToText, readFileAsText } from '../../../services/file';
import { renderToolPage, renderFileUpload, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let documentText = '';
let chatHistory: { role: 'user' | 'assistant'; content: string }[] = [];

export function renderChatDoc(): string {
  documentText = '';
  chatHistory = [];
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Chat with PDF',
    description: 'Ask questions about your documents using AI',
    toolContent: `
      <div id="upload-section">${renderFileUpload({ id: 'doc-upload', accept: '.txt,.pdf,.docx', multiple: false, title: 'Upload your document', hint: 'TXT, DOCX supported' })}</div>
      <div id="chat-section" class="chat-section hidden">
        <div class="doc-info">📄 <span id="doc-name">Document</span> loaded</div>
        <div id="chat-messages" class="chat-messages"></div>
        <div class="chat-input-area">
          <input type="text" id="chat-input" class="input" placeholder="Ask a question about your document...">
          <button id="send-btn" class="btn btn-primary">Send</button>
        </div>
      </div>
      <style>.chat-section{margin:var(--space-lg) 0;}.doc-info{padding:var(--space-md);background:rgba(34,197,94,0.1);border-radius:var(--radius-md);margin-bottom:var(--space-lg);}.chat-messages{height:300px;overflow-y:auto;padding:var(--space-md);background:var(--glass-bg);border-radius:var(--radius-md);margin-bottom:var(--space-md);display:flex;flex-direction:column;gap:var(--space-md);}.message{padding:var(--space-md);border-radius:var(--radius-md);max-width:80%;}.message.user{background:var(--color-accent-gradient);color:white;align-self:flex-end;}.message.assistant{background:var(--color-bg-tertiary);align-self:flex-start;}.chat-input-area{display:flex;gap:var(--space-md);}.chat-input-area input{flex:1;}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Chat with Your Documents Using AI</h2>
      <p>Upload a document and ask questions about it. Our AI reads and understands your content, providing accurate answers based on the document.</p>
      <h3>How It Works</h3>
      <ol>
        <li>Upload your PDF, DOCX, or TXT file</li>
        <li>Wait for the AI to process the document</li>
        <li>Ask any question about the content</li>
        <li>Get accurate answers instantly</li>
      </ol>
      <h3>Example Questions</h3>
      <ul>
        <li>"What are the main points of this document?"</li>
        <li>"Explain the section about [topic]"</li>
        <li>"What does the document say about [specific item]?"</li>
        <li>"Summarize the conclusions"</li>
      </ul>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Research:</strong> Quickly find information in papers</li>
        <li><strong>Legal:</strong> Query contracts and agreements</li>
        <li><strong>Business:</strong> Extract insights from reports</li>
        <li><strong>Study:</strong> Interactive learning from textbooks</li>
      </ul>
      <h3>Privacy</h3>
      <p>Your document is processed by Puter AI to answer your questions. The conversation is not stored after your session ends.</p>
    `,
  });
}

function init(): void {
  initFileUpload('doc-upload', async (files) => {
    const file = files[0];
    showLoading('Processing document...');
    try {
      if (file.name.endsWith('.txt')) {
        documentText = await readFileAsText(file);
      } else if (file.name.endsWith('.docx')) {
        documentText = await docxToText(file);
      }
      document.getElementById('doc-name')!.textContent = file.name;
      document.getElementById('upload-section')?.classList.add('hidden');
      document.getElementById('chat-section')?.classList.remove('hidden');
      showToast('Document ready! Ask your questions.', 'success');
    } catch (e) {
      showToast('Failed to process document', 'error');
    } finally {
      hideLoading();
    }
  });

  document.getElementById('send-btn')?.addEventListener('click', sendMessage);
  document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

async function sendMessage(): Promise<void> {
  const input = document.getElementById('chat-input') as HTMLInputElement;
  const question = input.value.trim();
  if (!question || !documentText) return;

  input.value = '';
  addMessage('user', question);
  chatHistory.push({ role: 'user', content: question });

  (document.getElementById('send-btn') as HTMLButtonElement).disabled = true;

  try {
    const response = await chatWithDocument(documentText, question, chatHistory.slice(0, -1));
    addMessage('assistant', response.result);
    chatHistory.push({ role: 'assistant', content: response.result });
  } catch (e) {
    addMessage('assistant', 'Sorry, I had trouble answering that. Please try again.');
  } finally {
    (document.getElementById('send-btn') as HTMLButtonElement).disabled = false;
  }
}

function addMessage(role: string, content: string): void {
  const messages = document.getElementById('chat-messages')!;
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = content;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
