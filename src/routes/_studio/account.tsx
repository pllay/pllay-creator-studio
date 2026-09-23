import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStudio } from "@/lib/studio-store";
import { linkOutline } from "@/lib/utils";

export const Route = createFileRoute("/_studio/account")({
  component: Account,
});

function Account() {
  const channel = useStudio((s) => s.channel);
  const { user, isPending } = useCurrentUserState();

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Account</p>
        <h1 className="font-display text-3xl font-semibold">kinggunn</h1>
        <p className="mt-1 text-sm text-muted">Owner of this studio. Channel {channel || "studio"}.</p>
      </div>
      <Card className="space-y-3">
        {isPending ? (
          <p className="text-sm text-muted">Checking session…</p>
        ) : user ? (
          <>
            <UserButton />
            <p className="text-xs text-muted">Signed in. Studio units on this browser are not a payout.</p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">
              {authEnabled ? "Sign in with Google or X. The studio on this browser stays here." : "Sign-in is off."}
            </p>
            {authEnabled ? (
              <div className="flex flex-col gap-2">
                {GROK_PROVIDERS.map((provider) => (
                  <Button
                    key={provider.providerId}
                    variant="outline"
                    onClick={() => signIn(provider.providerId, { callbackURL: "/account" })}
                  >
                    Continue with {provider.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </Card>
      <div className="flex flex-wrap gap-2">
        <Link to="/statement" className={linkOutline}>
          Statement
        </Link>
        <Link to="/settings" className={linkOutline}>
          Settings
        </Link>
      </div>
    </div>
  );
}
