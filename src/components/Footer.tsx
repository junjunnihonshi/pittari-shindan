import { site } from '../config/site.ts'
import { Link } from './Link.tsx'

const links = [
  { to: '/about', label: '運営者情報' },
  { to: '/privacy', label: 'プライバシーポリシー' },
  { to: '/disclaimer', label: '免責事項' },
  { to: '/contact', label: 'お問い合わせ' },
  { to: '/ads', label: '広告掲載について' },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="site-footer__notice">{site.adNotice}</p>
        <nav aria-label="フッター">
          <ul className="site-footer__links">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="site-footer__copy">© {new Date().getFullYear()} {site.name}</p>
      </div>
    </footer>
  )
}
