import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
