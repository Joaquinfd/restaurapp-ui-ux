"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AuthControlsProps {
  /** Desktop sidebar collapsed to its icon rail — show a single compact action. */
  collapsed?: boolean;
  className?: string;
}

/** Sign-in / sign-up when signed out, the Clerk user menu when signed in. */
export function AuthControls({ collapsed = false, className }: AuthControlsProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Show when="signed-out">
        {collapsed ? (
          <SignInButton>
            <Button
              size="icon"
              variant="outline"
              aria-label="Iniciar sesión"
              title="Iniciar sesión"
            >
              <span aria-hidden>👤</span>
            </Button>
          </SignInButton>
        ) : (
          <>
            <SignInButton>
              <Button className="w-full">Iniciar sesión</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline" className="w-full">
                Crear cuenta
              </Button>
            </SignUpButton>
          </>
        )}
      </Show>
      <Show when="signed-in">
        <div className={cn("flex min-h-11 items-center", collapsed ? "justify-center" : "px-1")}>
          <UserButton showName={!collapsed} />
        </div>
      </Show>
    </div>
  );
}
