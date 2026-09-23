import { site } from '../config/site.ts'
import { Link } from './Link.tsx'

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-logo" aria-label={`${site.name} トップページ`}>
          <span className="site-logo__mark" aria-hidden="true">✓</span>
          <span className="site-logo__text">{site.name}</span>
        </Link>
        <nav aria-label="メイン">
          <Link to="/#categories" className="site-header__link">
            診断一覧
          </Link>
        </nav>
      </div>
      <p className="ad-notice">
        <span className="ad-notice__label">PR</span>
        {site.adNotice}
      </p>
    </header>
  )
}
