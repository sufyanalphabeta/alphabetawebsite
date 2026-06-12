import { createRootRoute, Outlet } from "@tanstack/react-router";
import { SiteHeader } from "~/components/SiteHeader";
import { SiteFooter } from "~/components/SiteFooter";

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RootError,
});

function RootError({ error }: { error: Error }) {
  return (
    <main dir="rtl" className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold text-primary-800">حدث خطأ غير متوقع</h1>
      <p dir="ltr" className="mt-2 text-sm text-slate-400">{error.message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 rounded-lg bg-accent-500 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-accent-600"
      >
        إعادة تحميل الصفحة
      </button>
    </main>
  );
}

function RootLayout() {
  return (
    <div dir="rtl" lang="ar" className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
