import { useToasts } from '../hooks/useToasts';

export default function Toasts() {
  const toasts = useToasts((s) => s.toasts);
  const remove = useToasts((s) => s.remove);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[360px] max-w-[calc(100vw-32px)] flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => remove(t.id)}
          className={[
            'rounded-xl border px-4 py-3 text-left text-sm shadow-xl backdrop-blur-md',
            'bg-[#0b0b18]/90',
            t.kind === 'success'
              ? 'border-green-500/30 text-green-100'
              : t.kind === 'error'
                ? 'border-red-500/30 text-red-100'
                : 'border-white/10 text-white',
          ].join(' ')}
          aria-label="Notification"
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}

