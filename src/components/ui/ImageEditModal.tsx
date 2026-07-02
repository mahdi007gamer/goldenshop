"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlignLeft, AlignCenter, AlignRight, ExternalLink } from "lucide-react";

export interface ImageEditState {
  src: string;
  alt: string;
  title: string;
  width: string;
  height: string;
  alignment: "left" | "center" | "right" | "none";
  wrap: "none" | "left" | "right";
  link: string;
}

interface ImageEditModalProps {
  open: boolean;
  initialState: ImageEditState;
  onSave: (state: ImageEditState) => void;
  onCancel: () => void;
  onRemove: () => void;
}

export function ImageEditModal({
  open,
  initialState,
  onSave,
  onCancel,
  onRemove,
}: ImageEditModalProps) {
  const [state, setState] = useState<ImageEditState>(initialState);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  const update = useCallback(
    <K extends keyof ImageEditState>(key: K, value: ImageEditState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-obsidian-light border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Edit Image
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="max-h-48 rounded-lg overflow-hidden border border-white/10">
              <img
                src={state.src}
                alt={state.alt || "Preview"}
                className="max-h-48 max-w-full object-contain"
              />
            </div>
          </div>

          {/* Alt Text */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-medium block">
              Alt Text (SEO & Accessibility)
            </label>
            <input
              type="text"
              value={state.alt}
              onChange={(e) => update("alt", e.target.value)}
              placeholder="Describe this image..."
              className="input-field text-xs"
            />
          </div>

          {/* Title / Caption */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-medium block">
              Title / Caption
            </label>
            <input
              type="text"
              value={state.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Optional title or caption..."
              className="input-field text-xs"
            />
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-medium block">
                Width
              </label>
              <input
                type="text"
                value={state.width}
                onChange={(e) => update("width", e.target.value)}
                placeholder="auto"
                className="input-field text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-medium block">
                Height
              </label>
              <input
                type="text"
                value={state.height}
                onChange={(e) => update("height", e.target.value)}
                placeholder="auto"
                className="input-field text-xs"
              />
            </div>
          </div>

          {/* Alignment */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-medium block">
              Alignment
            </label>
            <div className="flex gap-1">
              {(
                [
                  { value: "none", label: "Default" },
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                  { value: "right", label: "Right" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => update("alignment", value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] rounded-lg border transition-colors ${
                    state.alignment === value
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/5"
                  }`}
                >
                  {value !== "none" && (
                    {
                      left: <AlignLeft size={12} />,
                      center: <AlignCenter size={12} />,
                      right: <AlignRight size={12} />,
                    }[value]
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Wrap / Float */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-medium block">
              Text Wrapping
            </label>
            <div className="flex gap-1">
              {(
                [
                  { value: "none", label: "None" },
                  { value: "left", label: "Wrap Right" },
                  { value: "right", label: "Wrap Left" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => update("wrap", value)}
                  className={`flex-1 px-3 py-2 text-[11px] rounded-lg border transition-colors ${
                    state.wrap === value
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Link */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
              <ExternalLink size={10} /> Link URL
            </label>
            <input
              type="text"
              value={state.link}
              onChange={(e) => update("link", e.target.value)}
              placeholder="https://..."
              className="input-field text-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-obsidian/50">
          <button
            onClick={onRemove}
            className="px-3 py-1.5 text-[11px] rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors"
          >
            Remove Image
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-1.5 text-[11px] rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(state)}
              className="px-4 py-1.5 text-[11px] rounded-lg bg-gold text-obsidian font-bold hover:bg-gold/90 transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
