import { Component, type ReactNode } from 'react'
import { Footer } from './components/Footer.tsx'
import { Header } from './components/Header.tsx'
import { getDiagnosisBySlug } from './data/diagnoses/index.ts'
import { usePathname } from './lib/router.ts'
import { DiagnosisPage } from './pages/DiagnosisPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { AboutPage, AdsPage, ContactPage, DisclaimerPage, PrivacyPage } from './pages/StaticPages.tsx'

const staticRoutes: Record<string, () => ReactNode> = {
  '/': () => <HomePage />,
  '/about': () => <AboutPage />,
  '/privacy': () => <PrivacyPage />,
  '/disclaimer': () => <DisclaimerPage />,
  '/contact': () => <ContactPage />,
  '/ads': () => <AdsPage />,
}

function Routes({ path }: { path: string }) {
  const render = staticRoutes[path]
  if (render) return render()

  const match = path.match(/^\/diagnosis\/([^/]+)$/)
  if (match) {
    const diagnosis = getDiagnosisBySlug(decodeURIComponent(match[1]))
    if (diagnosis) return <DiagnosisPage key={diagnosis.id} diagnosis={diagnosis} />
    return <NotFoundPage message="指定された診断は見つかりませんでした。トップページから診断を選び直してください。" />
  }
  return <NotFoundPage />
}

/** 想定外のエラーが起きても真っ白な画面にしないための保護 */
class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: unknown) {
    console.error('[app] 表示中にエラーが発生しました', error)
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) this.setState({ hasError: false })
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container page">
          <div className="empty-state">
            <h1>表示中にエラーが発生しました</h1>
            <p>お手数ですが、ページを再読み込みするか、トップページからやり直してください。</p>
            <a href="/" className="button button--primary">
              トップページへ
            </a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const path = usePathname()
  return (
    <>
      <a href="#main" className="skip-link">
        本文へスキップ
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <ErrorBoundary resetKey={path}>
          <Routes path={path} />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  )
}
