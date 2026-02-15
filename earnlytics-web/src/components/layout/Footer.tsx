import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "关于我们", href: "/about" },
    { label: "联系我们", href: "/contact" },
    { label: "隐私政策", href: "/privacy" },
    { label: "使用条款", href: "/terms" },
  ];

  return (
    <footer className="bg-background px-20 py-10">
      <div className="flex items-center justify-between">
        {/* Left: Copyright */}
        <p className="text-sm text-text-tertiary">
          © {currentYear} Earnlytics. All rights reserved.
        </p>

        {/* Right: Links */}
        <div className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-tertiary transition-colors hover:text-text-secondary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
