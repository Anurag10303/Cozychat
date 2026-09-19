import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, User } from "lucide-react";

/** Compact avatar picker: click or drop an image; reports the File to the parent. */
export default function AvatarUpload({ onAvatarChange, currentAvatarFile }) {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Keep the preview in sync with the parent's File
  useEffect(() => {
    if (currentAvatarFile instanceof File) {
      const url = URL.createObjectURL(currentAvatarFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [currentAvatarFile]);

  const handleFileProcess = (file) => {
    if (file && file.type.startsWith("image/")) {
      onAvatarChange(file);
    } else {
      onAvatarChange(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileProcess(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border border-dashed p-3.5 transition-colors ${
        isDragging ? "border-accent bg-accent-soft" : "border-line-strong bg-surface-2/60"
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Choose profile photo"
        className="relative h-16 w-16 shrink-0 rounded-full"
      >
        <span className="grid h-full w-full place-items-center overflow-hidden rounded-full border border-line bg-surface text-subtle">
          <AnimatePresence mode="wait" initial={false}>
            {preview ? (
              <motion.img
                key={preview}
                src={preview}
                alt="Avatar preview"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="h-full w-full object-cover"
              />
            ) : (
              <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <User className="h-7 w-7" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="absolute -right-0.5 -bottom-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-bg bg-accent text-accent-fg">
          <Camera className="h-3 w-3" />
        </span>
      </motion.button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg">Profile photo</p>
        <p className="mt-0.5 text-xs text-muted">Optional · JPG or PNG, up to 5 MB</p>
        <div className="mt-2 flex gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-accent-text hover:underline"
          >
            {preview ? "Change" : "Upload"}
          </button>
          {preview && (
            <button type="button" onClick={() => onAvatarChange(null)} className="text-muted hover:text-danger">
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          handleFileProcess(e.target.files?.[0] || null);
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
