/**
 * Office OS - AI Quiz Generator Tool
 */
import { generateQuiz } from '../../../services/ai';
import { docxToText, readFileAsText } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let documentText = '';


export function renderQuizGenerator(): string {
  documentText = '';
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'AI Quiz Generator',
    description: 'Create quizzes from any text or document using AI',
    toolContent: `
      <div class="input-section">
        <div class="tabs"><button class="tab active" data-tab="paste">Paste Text</button><button class="tab" data-tab="upload">Upload File</button></div>
        <div id="paste-panel" class="tab-panel active"><textarea id="text-input" class="input text-area" placeholder="Paste your study material here..."></textarea></div>
        <div id="upload-panel" class="tab-panel">${renderFileUpload({ id: 'doc-upload', accept: '.txt,.docx', multiple: false, title: 'Upload study material' })}</div>
        <div class="quiz-options"><label>Number of Questions<select id="num-questions" class="input"><option value="5">5 Questions</option><option value="10" selected>10 Questions</option><option value="15">15 Questions</option><option value="20">20 Questions</option></select></label></div>
      </div>
      <div id="quiz-area" class="quiz-area hidden"></div>
      ${renderActionButtons([{ id: 'generate-btn', label: 'Generate Quiz', icon: '❓', primary: true }])}
      <style>.tabs{display:flex;gap:var(--space-sm);margin-bottom:var(--space-lg);}.tab{padding:var(--space-sm) var(--space-lg);background:var(--glass-bg);border:none;border-radius:var(--radius-md);cursor:pointer;}.tab.active{background:var(--color-accent-gradient);color:white;}.tab-panel{display:none;}.tab-panel.active{display:block;}.text-area{width:100%;min-height:150px;}.quiz-options{margin:var(--space-lg) 0;}.quiz-area{margin:var(--space-xl) 0;}.question-card{background:var(--glass-bg);border-radius:var(--radius-md);padding:var(--space-lg);margin-bottom:var(--space-lg);}.question-num{font-size:var(--font-size-sm);color:var(--color-text-tertiary);}.question-text{font-size:var(--font-size-lg);font-weight:500;margin:var(--space-sm) 0 var(--space-lg);white-space:pre-wrap;}.option{display:block;padding:var(--space-md);margin:var(--space-sm) 0;background:var(--color-bg-tertiary);border-radius:var(--radius-md);cursor:pointer;transition:all var(--transition-fast);}.option:hover{background:var(--color-bg-hover);}.option.correct{background:rgba(34,197,94,0.2);border:2px solid var(--color-success);}.option.incorrect{background:rgba(239,68,68,0.2);border:2px solid var(--color-error);}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>AI Quiz Generator</h2>
      <p>Automatically create quizzes from any text or document. Perfect for studying, teaching, or testing knowledge retention.</p>
      <h3>How It Works</h3>
      <ol>
        <li>Paste text or upload a document</li>
        <li>Choose the number of questions</li>
        <li>AI generates multiple-choice questions</li>
        <li>Take the quiz to test your knowledge</li>
      </ol>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Students:</strong> Self-test on study material</li>
        <li><strong>Teachers:</strong> Quickly create assessments</li>
        <li><strong>Trainers:</strong> Generate training quizzes</li>
        <li><strong>Content Creators:</strong> Engage audiences</li>
      </ul>
      <h3>AI-Generated Questions</h3>
      <p>Our AI analyzes your content to create relevant, meaningful questions that test understanding rather than just memorization.</p>
    `,
  });
}

function init(): void {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${(tab as HTMLElement).dataset.tab}-panel`)?.classList.add('active');
    });
  });

  initFileUpload('doc-upload', async (files) => {
    const file = files[0];
    if (file.name.endsWith('.txt')) documentText = await readFileAsText(file);
    else if (file.name.endsWith('.docx')) documentText = await docxToText(file);
    showToast('Document loaded!', 'success');
  });

  document.getElementById('generate-btn')?.addEventListener('click', handleGenerate);
}

async function handleGenerate(): Promise<void> {
  const text = (document.getElementById('text-input') as HTMLTextAreaElement).value || documentText;
  if (!text.trim()) {
    showToast('Please enter or upload text', 'warning');
    return;
  }

  showLoading('Generating quiz...');
  try {
    const numQuestions = parseInt((document.getElementById('num-questions') as HTMLSelectElement).value);
    const response = await generateQuiz(text, { questionCount: numQuestions });
    // Parse quiz from response - AI returns formatted text
    parseAndRenderQuiz(response.result);
    showToast('Quiz generated!', 'success');
  } catch (e) {
    showToast('Failed to generate quiz', 'error');
  } finally {
    hideLoading();
  }
}

function parseAndRenderQuiz(quizText: string): void {
  // Display the generated quiz text directly
  const area = document.getElementById('quiz-area')!;
  area.innerHTML = `<div class="quiz-content">${quizText.replace(/\n/g, '<br>')}</div>`;
  area.classList.remove('hidden');
}
