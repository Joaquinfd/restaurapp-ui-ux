export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900 dark:text-white">Mi Perfil</h1>

      <div className="max-w-2xl">
        {/* Avatar + basic info */}
        <div className="mb-8 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 text-3xl dark:bg-neutral-800">
            👤
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Usuario Demo</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">usuario@ejemplo.com</p>
          </div>
        </div>

        {/* Account sections */}
        <div className="space-y-6">
          <section className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Información personal</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">Nombre</label>
                <input
                  type="text"
                  defaultValue="Usuario Demo"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">Email</label>
                <input
                  type="email"
                  defaultValue="usuario@ejemplo.com"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Preferencias</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <input type="checkbox" defaultChecked className="rounded" />
                Recibir notificaciones de nuevos restaurantes
              </label>
              <label className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <input type="checkbox" className="rounded" />
                Recibir recomendaciones semanales por email
              </label>
            </div>
          </section>

          <button
            type="button"
            className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
