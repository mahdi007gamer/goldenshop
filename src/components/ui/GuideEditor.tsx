"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, ArrowUpDown, FileText, LayoutList, Save, Eye } from "lucide-react";
import { TipTapEditor } from "./TipTapEditor";
import { Button } from "./Button";

interface GuideStep {
  step: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  imageUrl: string;
  videoUrl: string;
}

interface GuideContent {
  steps: GuideStep[];
}

interface GuideEditorProps {
  value: string;
  onChange: (value: string) => void;
  dir?: "rtl" | "ltr";
}

export function GuideEditor({ value, onChange, dir = "rtl" }: GuideEditorProps) {
  const [steps, setSteps] = useState<GuideStep[]>(() => {
    try {
      const parsed = JSON.parse(value);
      return parsed.steps || [];
    } catch {
      return [];
    }
  });
  const [activeLang, setActiveLang] = useState<"fa" | "en">("fa");
  const [previewMode, setPreviewMode] = useState(false);

  const updateSteps = useCallback((newSteps: GuideStep[]) => {
    setSteps(newSteps);
    const json = JSON.stringify({ steps: newSteps });
    onChange(json);
  }, [onChange]);

  const addStep = () => {
    const newStep: GuideStep = {
      step: steps.length + 1,
      title: "",
      titleEn: "",
      description: "",
      descriptionEn: "",
      imageUrl: "",
      videoUrl: "",
    };
    updateSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step: i + 1 }));
    updateSteps(newSteps);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const newSteps = [...steps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    updateSteps(newSteps.map((s, i) => ({ ...s, step: i + 1 })));
  };

  const updateStep = (index: number, field: keyof GuideStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    updateSteps(newSteps);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (fromIndex !== targetIndex) {
      moveStep(fromIndex, targetIndex);
    }
  };

  const isFa = activeLang === "fa";

  return (
    <div className="space-y-4" dir={dir}>
      {/* Language Toggle + Preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveLang("fa")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isFa ? "bg-gold/10 text-gold border border-gold/20" : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutList size={12} />
            فارسی
          </button>
          <button
            onClick={() => setActiveLang("en")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !isFa ? "bg-cyber/10 text-cyber border border-cyber/20" : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutList size={12} />
            English
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
              className="w-4 h-4 accent-gold"
            />
            پیش‌نمایش
          </label>
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <div className="rounded-xl border border-white/10 bg-obsidian-light/50 p-4">
          {steps.length === 0 ? (
            <p className="text-gray-500 text-center py-4" style={{ fontFamily: "var(--font-fa)" }}>
              هیچ مرحله‌ای اضافه نشده است
            </p>
          ) : (
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={index} className="border border-white/5 rounded-lg p-4 bg-obsidian/30">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
                        {isFa ? step.title : step.titleEn || step.title}
                      </h4>
                      <div
                        className="mt-2 text-sm text-gray-300 prose prose-sm max-w-none"
                        style={{ fontFamily: "var(--font-fa)" }}
                        dangerouslySetInnerHTML={{ __html: isFa ? step.description : step.descriptionEn || step.description }}
                      />
                      {(isFa ? step.imageUrl : step.imageUrl) && (
                        <img
                          src={step.imageUrl}
                          alt=""
                          className="mt-2 max-w-xs rounded-lg border border-white/10"
                        />
                      )}
                      {(isFa ? step.videoUrl : step.videoUrl) && (
                        <div className="mt-2 text-xs text-cyber">ویدیو: {step.videoUrl}</div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <>
          {steps.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-white/10 p-8 text-center">
              <FileText size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500 mb-4" style={{ fontFamily: "var(--font-fa)" }}>
                هنوز مرحله‌ای برای راهنما وجود ندارد
              </p>
              <Button onClick={addStep} icon={<Plus size={14} />}>
                اولین مرحله را اضافه کنید
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-obsidian-light/50 overflow-hidden"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* Step Header */}
                  <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 bg-obsidian/30">
                    <GripVertical size={16} className="text-gray-600 cursor-grab hover:text-gold" title="کشیدن برای جابجایی" />
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium text-white" style={{ fontFamily: "var(--font-fa)" }}>
                      مرحله {index + 1}
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={() => index > 0 && moveStep(index, index - 1)}
                      disabled={index === 0}
                      className="p-1.5 rounded hover:bg-white/5 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="بالا بردن"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      onClick={() => index < steps.length - 1 && moveStep(index, index + 1)}
                      disabled={index === steps.length - 1}
                      className="p-1.5 rounded hover:bg-white/5 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="پایین بردن"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      onClick={() => removeStep(index)}
                      className="p-1.5 rounded hover:bg-danger/10 text-gray-500 hover:text-danger transition-colors"
                      title="حذف مرحله"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Step Content */}
                  <div className="p-4 space-y-3">
                    {/* Title FA */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        {isFa ? "عنوان مرحله (فارسی) *" : "Step Title (FA) *"}
                      </label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(index, "title", e.target.value)}
                        className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                        placeholder={isFa ? "عنوان مرحله به فارسی..." : "Step title in Persian..."}
                        dir={isFa ? "rtl" : "ltr"}
                      />
                    </div>

                    {/* Title EN */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        {isFa ? "عنوان مرحله (انگلیسی)" : "Step Title (English)"}
                      </label>
                      <input
                        type="text"
                        value={step.titleEn}
                        onChange={(e) => updateStep(index, "titleEn", e.target.value)}
                        className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-cyber/30 focus:outline-none"
                        placeholder={isFa ? "عنوان مرحله به انگلیسی..." : "Step title in English..."}
                        dir="ltr"
                      />
                    </div>

                    {/* Description FA - TipTapEditor */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        {isFa ? "توضیحات (فارسی)" : "Description (FA)"}
                      </label>
                      <TipTapEditor
                        value={step.description}
                        onChange={(v) => updateStep(index, "description", v)}
                        minHeight={150}
                        dir="rtl"
                        placeholder={isFa ? "توضیحات کامل مرحله..." : "Step description in Persian..."}
                      />
                    </div>

                    {/* Description EN - TipTapEditor */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        {isFa ? "توضیحات (انگلیسی)" : "Description (English)"}
                      </label>
                      <TipTapEditor
                        value={step.descriptionEn}
                        onChange={(v) => updateStep(index, "descriptionEn", v)}
                        minHeight={150}
                        dir="ltr"
                        placeholder={isFa ? "توضیحات کامل مرحله به انگلیسی..." : "Step description in English..."}
                      />
                    </div>

                    {/* Image URL */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400 font-medium">URL تصویر</label>
                        <input
                          type="text"
                          value={step.imageUrl}
                          onChange={(e) => updateStep(index, "imageUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                          placeholder="https://example.com/image.jpg"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400 font-medium">URL ویدیو</label>
                        <input
                          type="text"
                          value={step.videoUrl}
                          onChange={(e) => updateStep(index, "videoUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-cyber/30 focus:outline-none"
                          placeholder="https://youtube.com/... or .mp4"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Step Button */}
          <Button
            variant="outline"
            onClick={addStep}
            icon={<Plus size={14} />}
            className="w-full"
          >
            مرحله جدید اضافه کنید
          </Button>
        </>
      )}
    </div>
  );
}