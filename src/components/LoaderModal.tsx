import BooksAnimation from "@/lib/lottie/Books.json";

export function LoaderModal({ label = "Loading" }: { label?: string }) {
  const animationName =
    typeof BooksAnimation === "object" && BooksAnimation && "nm" in BooksAnimation
      ? String(BooksAnimation.nm)
      : "Books";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/90 px-6">
      <div
        className="flex w-full max-w-xs flex-col items-center gap-4 rounded-lg border border-line bg-white px-8 py-7 text-center shadow-lg"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="loader-book" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="mt-1 text-xs text-ink/50">{animationName}</p>
        </div>
      </div>
    </div>
  );
}
