"use client";

import { useActionState, useEffect, useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { createProposalAction, checkDuplicatesAction, type FormState } from "@/app/actions";
import { analyzeComplaint } from "@/lib/assistant";
import { CATEGORIES, SECTORS, CATEGORY_META, type Category } from "@/lib/constants";
import { CategoryBadge } from "@/components/ui/primitives";

type Duplicate = { slug: string; title: string; problem: string; score: number };

export function ProposeForm({ d, defaultCategory }: { d: Dict; defaultCategory?: string }) {
  const [state, formAction, pending] = useActionState<FormState & { slug?: string }, FormData>(
    createProposalAction,
    {}
  );
  const [step, setStep] = useState(0);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [suggestion, setSuggestion] = useState<ReturnType<typeof analyzeComplaint>>(null);

  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [category, setCategory] = useState<string>(defaultCategory && CATEGORIES.includes(defaultCategory as never) ? defaultCategory : "non_funziona");
  const [sector, setSector] = useState<string>("altro");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [solution, setSolution] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Italia");
  const [links, setLinks] = useState<string[]>([""]);

  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [checkingDup, setCheckingDup] = useState(false);

  useEffect(() => {
    const text = `${title} ${problem}`.trim();
    const t = setTimeout(
      async () => {
        if (text.length < 15) {
          setDuplicates([]);
          setCheckingDup(false);
          return;
        }
        setCheckingDup(true);
        try {
          setDuplicates(await checkDuplicatesAction(text));
        } finally {
          setCheckingDup(false);
        }
      },
      text.length < 15 ? 0 : 700
    );
    return () => clearTimeout(t);
  }, [title, problem]);

  function runAssistant() {
    if (!assistantInput.trim()) return;
    setAssistantBusy(true);
    setTimeout(() => {
      setSuggestion(analyzeComplaint(assistantInput));
      setAssistantBusy(false);
    }, 900);
  }

  function applySuggestion() {
    if (!suggestion) return;
    setTitle(suggestion.title);
    setProblem(suggestion.problem);
    setCategory(suggestion.category);
    setSector(suggestion.sector);
    setSolution((s) => s || suggestion.solution);
    setStep(1);
  }

  const canNext1 = title.trim().length >= 10 && problem.trim().length >= 20;

  return (
    <form action={formAction} className="mx-auto max-w-[760px]">
      {/* Stepper: circles evenly spaced, progressive connectors, animated caption */}
      <div className="mb-9">
        <ol className="flex items-center px-1">
          {[d.propose.stepBasics, d.propose.stepDetails, d.propose.stepReview].map((label, i) => (
            <Fragment key={label}>
              {i > 0 && (
                <li
                  aria-hidden
                  className="mx-2 h-[2px] flex-1 overflow-hidden rounded-full"
                  style={{ background: "var(--line)" }}
                >
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ background: "var(--ink)" }}
                    initial={false}
                    animate={{ width: step >= i ? "100%" : "0%" }}
                    transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                  />
                </li>
              )}
              <li className="flex shrink-0 items-center justify-center">
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  aria-current={step === i ? "step" : undefined}
                  aria-label={`${d.propose.progress.replace("{n}", String(i + 1))} — ${label}`}
                  title={label}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-all ${
                    i < step ? "cursor-pointer" : ""
                  } ${step === i ? "pop-vote" : ""}`}
                  style={
                    step > i
                      ? { background: "var(--consensus)", borderColor: "var(--consensus)", color: "var(--surface)" }
                      : step === i
                        ? {
                            background: "var(--ink)",
                            borderColor: "var(--ink)",
                            color: "var(--paper)",
                            boxShadow: "0 0 0 4px color-mix(in srgb, var(--ink) 12%, transparent)",
                          }
                        : { borderColor: "var(--line)", color: "var(--faint)", cursor: "default" }
                  }
                >
                  {step > i ? <Check size={15} aria-hidden /> : i + 1}
                </button>
              </li>
            </Fragment>
          ))}
        </ol>

        <div className="relative mt-3 h-6 text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-x-0 top-0 text-[13.5px]"
            >
              <span className="tabular font-semibold text-faint">
                {d.propose.progress.replace("{n}", String(step + 1))}
              </span>
              <span className="mx-2 text-faint" aria-hidden>
                ·
              </span>
              <span className="font-semibold">{[d.propose.stepBasics, d.propose.stepDetails, d.propose.stepReview][step]}</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="problem" value={problem} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="sector" value={sector} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="experience" value={experience} />
      <input type="hidden" name="solution" value={solution} />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="country" value={country} />
      {links.filter(Boolean).map((l) => (
        <input key={l} type="hidden" name="links" value={l} />
      ))}

      {/* STEP 0 — ASSISTANT + ESSENTIALS */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          <div className="card overflow-hidden">
            <div className="border-b px-6 py-4" style={{ borderColor: "var(--surface2)", background: "linear-gradient(120deg, color-mix(in srgb, var(--idea) 8%, var(--surface)), var(--surface))" }}>
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Wand2 size={17} style={{ color: "var(--idea)" }} aria-hidden /> {d.propose.assistantTitle}
              </h2>
              <p className="mt-1 text-[13px] text-muted">{d.propose.assistantHint}</p>
            </div>
            <div className="p-6">
              <textarea
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder={d.propose.assistantPlaceholder}
                rows={3}
                className="input resize-y !rounded-xl"
                aria-label={d.propose.assistantTitle}
              />
              <button type="button" onClick={runAssistant} disabled={assistantBusy || assistantInput.trim().length < 15} className="btn btn-secondary mt-3 !py-2 text-sm">
                {assistantBusy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Sparkles size={14} style={{ color: "var(--idea)" }} aria-hidden />}
                {assistantBusy ? d.propose.assistantWorking : d.propose.assistantRun}
              </button>

              <AnimatePresence>
                {suggestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "color-mix(in srgb, var(--idea) 30%, var(--line))" }}>
                      <p className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--idea)" }}>
                        {d.propose.assistantResultCategory}
                      </p>
                      <CategoryBadge category={suggestion.category} label={d.category[suggestion.category]} />
                      <p className="mb-1 mt-4 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--idea)" }}>
                        {d.propose.assistantResultProblem}
                      </p>
                      <p className="text-[14px] leading-relaxed">{suggestion.problem}</p>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--idea)" }}>
                          {d.propose.assistantResultSolution}
                        </summary>
                        <p className="mt-2 text-[14px] leading-relaxed text-muted">{suggestion.solution}</p>
                      </details>
                      <button type="button" onClick={applySuggestion} className="btn btn-primary mt-4 !py-2 text-sm">
                        <Check size={14} aria-hidden /> {d.propose.assistantApply}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="mt-4 border-t pt-3 text-[12px] leading-relaxed text-faint" style={{ borderColor: "var(--surface2)" }}>
                ⓘ {d.propose.assistantDisclaimer}
              </p>
            </div>
          </div>

          <div className="card p-6">
            <div className="grid gap-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">{d.propose.titleLabel}</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={110} placeholder={d.propose.titlePlaceholder} className="input !rounded-xl !py-3" required />
                <span className="tabular mt-1 block text-right text-[11.5px] text-faint">{title.length}/110</span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">{d.propose.problemLabel}</span>
                <textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} maxLength={400} placeholder={d.propose.problemPlaceholder} className="input resize-y !rounded-xl" required />
              </label>
              <div>
                <span className="mb-2 block text-sm font-semibold">{d.propose.categoryLabel}</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORIES.map((cat: Category) => {
                    const meta = CATEGORY_META[cat];
                    const active = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        aria-pressed={active}
                        className="rounded-xl border p-3 text-left transition-all"
                        style={{
                          borderColor: active ? meta.color : "var(--line)",
                          background: active ? `color-mix(in srgb, ${meta.soft} 60%, var(--surface))` : "transparent",
                          boxShadow: active ? `0 0 0 1px ${meta.color}` : undefined,
                        }}
                      >
                        <span className="block h-2 w-8 rounded-full" style={{ background: meta.color }} aria-hidden />
                        <span className="mt-2 block text-[13px] font-semibold leading-tight">{d.category[cat]}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[12.5px] text-faint">{d.category_desc[category as keyof typeof d.category_desc]}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 1 — DETAILS */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-8">
          <div className="grid gap-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">{d.propose.descriptionLabel} <span className="font-normal text-faint">({d.common.optional})</span></span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder={d.propose.descriptionPlaceholder} className="input resize-y !rounded-xl" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">{d.propose.experienceLabel} <span className="font-normal text-faint">({d.common.optional})</span></span>
              <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={3} placeholder={d.propose.experiencePlaceholder} className="input resize-y !rounded-xl" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">{d.propose.solutionLabel} <span className="font-normal text-faint">({d.common.optional})</span></span>
              <textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={3} placeholder={d.propose.solutionPlaceholder} className="input resize-y !rounded-xl" />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold">{d.propose.sectorLabel}</span>
                <select value={sector} onChange={(e) => setSector(e.target.value)} className="input cursor-pointer !rounded-xl capitalize">
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{d.sector[s]}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">{d.propose.cityLabel}</span>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Milano" className="input !rounded-xl" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">{d.propose.countryLabel}</span>
                <input value={country} onChange={(e) => setCountry(e.target.value)} className="input !rounded-xl" />
              </label>
            </div>
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold">{d.propose.linksLabel} <span className="font-normal text-faint">({d.common.optional})</span></legend>
              {links.map((l, i) => (
                <div key={i} className="mt-2 flex gap-2">
                  <input
                    value={l}
                    onChange={(e) => setLinks((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                    placeholder={d.propose.linkPlaceholder}
                    type="url"
                    className="input !rounded-xl"
                    aria-label={`${d.propose.linksLabel} ${i + 1}`}
                  />
                  {links.length > 1 && (
                    <button type="button" onClick={() => setLinks((arr) => arr.filter((_, j) => j !== i))} className="btn btn-ghost !px-3" aria-label={d.common.cancel}>×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setLinks((arr) => [...arr, ""])} className="mt-2 text-[13px] font-semibold underline underline-offset-4 hover:no-underline">+ {d.propose.linksLabel}</button>
            </fieldset>
          </div>
        </motion.div>
      )}

      {/* STEP 2 — REVIEW */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          <p className="text-sm font-medium" style={{ color: "var(--info)" }}>✓ {d.propose.previewNote}</p>
          <article className="card p-6 md:p-8">
            <CategoryBadge category={category as Category} label={d.category[category as keyof typeof d.category]} />
            <h2 className="font-display mt-4 text-2xl font-semibold leading-tight md:text-[32px]">{title}</h2>
            <p className="mt-3 text-[16px] leading-relaxed">{problem}</p>
            {(city || country) && <p className="mt-3 text-sm text-muted">📍 {[city, country].filter(Boolean).join(", ")}</p>}
            {experience && <p className="mt-4 rounded-xl p-4 text-[14.5px] italic leading-relaxed" style={{ background: "color-mix(in srgb, var(--idea) 6%, var(--surface))" }}>“{experience}”</p>}
            {solution && <p className="mt-4 rounded-xl p-4 text-[14.5px] leading-relaxed" style={{ background: "color-mix(in srgb, var(--consensus) 6%, var(--surface))" }}>{solution}</p>}
          </article>

          {checkingDup && (
            <p className="text-[13px] text-faint">{d.propose.checkingDuplicates}</p>
          )}

          {duplicates.length > 0 && (
            <div className="card p-5" style={{ borderColor: "color-mix(in srgb, var(--gold) 40%, var(--line))", background: "color-mix(in srgb, var(--gold) 5%, var(--surface))" }}>
              <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--gold)" }}>
                <AlertTriangle size={15} aria-hidden /> {d.propose.duplicatesTitle}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {duplicates.map((dup) => (
                  <li key={dup.slug}>
                    <a href={`/proposta/${dup.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-ink">
                      {dup.title}
                    </a>
                    <span className="ml-2 tabular rounded-full px-2 py-0.5 text-[11px]" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
                      {dup.score}% match
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 text-[12.5px] text-muted">{d.propose.duplicatesHint}</p>
            </div>
          )}

          {(() => { const msg = state.error ? ((d.errors as Record<string,string>)[state.error] ?? d.errors.generic) : undefined; return msg ? (
            <p role="alert" className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "var(--cat-non-funziona-soft)", color: "var(--signal)" }}>
              {msg}
            </p>
          ) : null; })()}

          <button type="submit" disabled={pending} className="btn btn-primary btn-lg self-start">
            {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ArrowRight size={16} aria-hidden />}
            {pending ? d.propose.publishing : d.propose.publish}
          </button>
        </motion.div>
      )}

      {/* Nav buttons */}
      {step > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <button type="button" onClick={() => setStep(step - 1)} className="btn btn-secondary">
            <ArrowLeft size={15} aria-hidden /> {["", d.propose.stepBasics, d.propose.stepDetails][step]}
          </button>
          {step === 1 && (
            <button type="button" onClick={() => setStep(2)} className="btn btn-primary" disabled={!canNext1}>
              {d.propose.stepReview} <ArrowRight size={15} aria-hidden />
            </button>
          )}
          {step === 0 && <span className="w-24" />}
        </div>
      )}
      {step === 0 && (
        <div className="mt-8 flex justify-end">
          <button type="button" onClick={() => setStep(1)} disabled={!canNext1} className="btn btn-primary btn-lg">
            {d.propose.stepDetails} <ArrowRight size={16} aria-hidden />
          </button>
        </div>
      )}
    </form>
  );
}
