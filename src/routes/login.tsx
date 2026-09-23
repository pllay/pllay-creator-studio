import { createFileRoute } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg p-6 text-fg">
      <div className="w-full max-w-sm space-y-5">
        <BrandLogo />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Account</p>
          <h1 className="font-display text-3xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Google or X. Studio units stay unpaid.</p>
        </div>
        {authEnabled ? (
          <div className="flex flex-col gap-2">
            {GROK_PROVIDERS.map((provider) => (
              <Button key={provider.providerId} variant="outline" onClick={() => signIn(provider.providerId, { callbackURL: "/" })}>
                Continue with {provider.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Sign-in is off.</p>
        )}
      </div>
    </main>
  );
}
