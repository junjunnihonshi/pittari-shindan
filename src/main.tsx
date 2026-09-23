import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { diagnoses } from './data/diagnoses/index.ts'
import { validateDiagnoses } from './data/validate.ts'
import './index.css'

if (import.meta.env.DEV) {
  const problems = validateDiagnoses(diagnoses)
  if (problems.length > 0) console.warn('[診断データの確認]\n' + problems.join('\n'))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
