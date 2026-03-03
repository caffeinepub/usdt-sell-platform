export function Footer() {
  const year = new Date().getFullYear();

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
        <p>© {year}. All rights reserved.</p>
      </div>
    </footer>
  );
}
