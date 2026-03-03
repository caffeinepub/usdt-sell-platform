import { Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const utm = encodeURIComponent(window.location.hostname);

  return (
    <footer className="border-t border-border mt-auto py-6 px-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-bold text-foreground">
            USDT<span className="text-primary">Sell</span>
          </span>
          <span>—</span>
          <span>Fast, secure USDT to fiat payouts</span>
        </div>
        <p className="flex items-center gap-1.5">
          © {year}. Built with{" "}
          <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${utm}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
