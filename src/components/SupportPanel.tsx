"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Paperclip,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import Badge from "@/components/ui/Badge";

const STATUS_VARIANT = {
  Open: "warning",
  Replied: "cyber",
  Resolved: "success",
} as const;

const STATUS_ICON = {
  Open: Clock,
  Replied: MessageSquare,
  Resolved: CheckCircle,
} as const;

const GAMES = ["Dota 2", "R6 Siege", "Valorant", "CS2", "Apex Legends"];

export default function SupportPanel() {
  const { tickets, addTicket } = useApp();
  const { isRTL, translate: t } = useLang();

  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  // Create form
  const [newSubject, setNewSubject] = useState("");
  const [newGame, setNewGame] = useState(GAMES[0]);
  const [newMessage, setNewMessage] = useState("");

  // Reply
  const [replyText, setReplyText] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.trim() && newMessage.trim()) {
      addTicket(newSubject, newGame, newMessage);
      setNewSubject("");
      setNewMessage("");
      setView("list");
    }
  };

  const handleReply = () => {
    if (replyText.trim() && selectedTicket) {
      setReplyText("");
    }
  };

  const activeTicket = tickets.find((t) => t.id === selectedTicket);

  // Chevron direction: in RTL, right means "next/forward", left means "back"
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;

  const statusLabel = (status: string) => {
    if (status === "Open") return t("support.status.open");
    if (status === "Resolved") return t("support.status.closed");
    return status;
  };

  return (
    <section id="support" className="py-24 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-gold/20 bg-gold/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            {t("nav.support")}
          </span>
          <h2 className="font-display text-3xl font-black text-gold-gradient sm:text-4xl">
            {t("support.warriorSupport")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            {t("support.subtitle")}
          </p>
        </motion.div>

        {/* View Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
            {[
              { id: "list" as const, label: t("support.myTickets") },
              { id: "create" as const, label: t("support.newTicket") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setView(tab.id);
                  setSelectedTicket(null);
                }}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                  view === tab.id
                    ? "bg-gold/20 text-gold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Ticket List */}
          {view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {tickets.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-bold text-white">{t("support.noTickets")}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {t("support.noTicketsDesc")}
                  </p>
                </div>
              ) : (
                tickets.map((ticket) => {
                  const StatusIcon = STATUS_ICON[ticket.status];
                  return (
                    <motion.button
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket.id);
                        setView("detail");
                      }}
                      whileHover={{ scale: 1.01 }}
                      className="glass-card glass-card-hover flex w-full items-center gap-4 rounded-xl p-5 text-left"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10">
                        <StatusIcon size={18} className="text-gold" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500">
                            {ticket.id}
                          </span>
                          <Badge variant={STATUS_VARIANT[ticket.status]} size="sm">
                            {statusLabel(ticket.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-sm font-medium text-white">
                          {ticket.subject}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {ticket.game} &bull; {ticket.date}
                        </p>
                      </div>
                      <ForwardIcon size={18} className="flex-shrink-0 text-gray-600" />
                    </motion.button>
                  );
                })
              )}
            </motion.div>
          )}

          {/* Create Ticket */}
          {view === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <form
                onSubmit={handleCreate}
                className="glass-card rounded-2xl p-6 sm:p-8"
              >
                <h3 className="mb-6 text-lg font-bold text-white">
                  {t("support.newTicket")}
                </h3>

                <div className="space-y-5">
                  {/* Subject */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
                      {t("support.subjectLabel")}
                    </label>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder={t("support.subjectPlaceholder")}
                      className="input-gold"
                      required
                    />
                  </div>

                  {/* Game */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
                      {t("support.gameLabel")}
                    </label>
                    <select
                      value={newGame}
                      onChange={(e) => setNewGame(e.target.value)}
                      className="input-gold"
                    >
                      {GAMES.map((game) => (
                        <option key={game} value={game}>
                          {game}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
                      {t("support.messageLabel")}
                    </label>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t("support.messagePlaceholder")}
                      rows={5}
                      className="input-gold resize-none"
                      required
                    />
                  </div>

                  {/* Attachment placeholder */}
                  <div>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gold"
                    >
                      <Paperclip size={14} />
                      {t("support.attachFile")}
                    </button>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-gold flex w-full items-center justify-center gap-2 py-3"
                  >
                    <Send size={16} />
                    {t("support.submitTicket")}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Ticket Detail */}
          {view === "detail" && activeTicket && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Back button */}
              <button
                onClick={() => {
                  setView("list");
                  setSelectedTicket(null);
                }}
                className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gold"
              >
                {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                {t("support.backToTickets")}
              </button>

              {/* Ticket header */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm text-gray-500">
                    {activeTicket.id}
                  </span>
                  <Badge
                    variant={STATUS_VARIANT[activeTicket.status]}
                    glowing
                  >
                    {statusLabel(activeTicket.status)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {activeTicket.game} &bull; {activeTicket.date}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-white">
                  {activeTicket.subject}
                </h3>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                {activeTicket.messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex ${msg.role === "user" ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        msg.role === "user"
                          ? "bg-gold/10 border border-gold/20"
                          : "glass-card"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            msg.role === "user" ? "text-gold" : "text-cyber"
                          }`}
                        >
                          {msg.role === "user"
                            ? activeTicket.userName
                            : t("support.goldenGuardian")}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-300">
                        {msg.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Reply */}
              {activeTicket.status !== "Resolved" && (
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t("support.replyPlaceholder")}
                      className="input-gold flex-1"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReply}
                      className="btn-gold px-4"
                    >
                      <Send size={16} />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
