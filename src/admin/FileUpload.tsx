import { useRef, useState } from 'react';
import { Upload, Loader2, ImageIcon, Video, X } from 'lucide-react';
import { uploadFile } from '@/lib/upload';

const inputCls =
  'w-full rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-ink-700 dark:bg-ink-950 dark:text-white';

export function FileUpload({
  label,
  value,
  onChange,
  accept = 'image/*',
  folder = 'ads',
  videoOnly = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  folder?: string;
  videoOnly?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setUploading(true);
    setError('');
    const url = await uploadFile(file, folder);
    if (!url) {
      setError('فشل رفع الملف. حاول مرة أخرى.');
    } else {
      onChange(url);
    }
    setUploading(false);
  };

  const isVideo = value.match(/\.(mp4|webm|ogg|mov)$/i);

  return (
    <div>
      <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">{label}</span>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700">
            {isVideo ? (
              <video src={value} className="h-full w-full object-cover" muted />
            ) : (
              <img src={value} alt="" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-0 top-0 rounded-bl-lg bg-red-500/80 p-1 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-ink-300 bg-ink-50 dark:border-ink-700 dark:bg-ink-900">
            {videoOnly ? <Video className="h-6 w-6 text-ink-400" /> : <ImageIcon className="h-6 w-6 text-ink-400" />}
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-300 px-3 py-2.5 text-sm font-bold text-ink-500 transition-colors hover:border-accent-500 hover:text-accent-600 disabled:opacity-60 dark:border-ink-700 dark:text-ink-400 dark:hover:border-accent-500 dark:hover:text-accent-300"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'جارٍ الرفع...' : 'رفع من الجهاز'}
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
