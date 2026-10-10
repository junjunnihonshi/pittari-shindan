import { hasContact, site } from '../config/site.ts'
import { Link } from './Link.tsx'

const links = [
  { to: '/column/', label: '選び方コラム' },
  { to: '/column/replacement/', label: '商品の寿命・使用期限・買い替え時期' },
  { to: '/about/', label: '運営者情報' },
  { to: '/privacy/', label: 'プライバシーポリシー' },
  { to: '/disclaimer/', label: '免責事項' },
  // お問い合わせ先が未設定の間は案内しない
  ...(hasContact ? [{ to: '/contact/', label: 'お問い合わせ' }] : []),
  { to: '/ads/', label: '広告掲載について' },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="site-footer__notice">{site.adNotice}</p>
        <p className="site-footer__notice">{site.amazonAssociateNotice}</p>
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
