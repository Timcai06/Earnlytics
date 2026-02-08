import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "关于我们", href: "/about" },
    { label: "隐私政策", href: "/privacy" },
    { label: "联系我们", href: "/contact" },
  ];

  return (
    <footer className="bg-slate-900 py-10 px-20">
      <div className="flex items-center justify-between">
        {/* Left: Copyright */}
        <p className="text-sm text-gray-500">
          © {currentYear} Earnlytics. All rights reserved.
        </p>

        {/* Right: Links */}
        <div className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-500 transition-colors hover:text-gray-400"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
