"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function TicketsPage() {
  const [showNewForm, setShowNewForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [game, setGame] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-fa)" }}>
              پشتیبانی
            </h1>
            <p className="text-gray-400" style={{ fontFamily: "var(--font-fa)" }}>
              تیکت‌های پشتیبانی خود را مدیریت کنید
            </p>
          </div>
          <Button onClick={() => setShowNewForm(!showNewForm)} icon={<Plus className="w-4 h-4" />}>
            تیکت جدید
          </Button>
        </div>
      </motion.div>

      {/* New Ticket Form */}
      {showNewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl bg-obsidian-light border border-obsidian-lighter p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "var(--font-fa)" }}>
            ایجاد تیکت جدید
          </h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input
              label="موضوع"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="توضیح مختصر مشکل شما"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">بازی</label>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-lighter text-white focus:outline-none focus:border-cyber/50"
              >
                <option value="">انتخاب بازی</option>
                <option value="Dota 2">Dota 2</option>
                <option value="R6 Siege">R6 Siege</option>
                <option value="Valorant">Valorant</option>
                <option value="CS2">CS2</option>
                <option value="Apex Legends">Apex Legends</option>
                <option value="Other">سایر</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">پیام</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="مشکل خود را به تفصیل توضیح دهید..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-lighter text-white placeholder-gray-500 focus:outline-none focus:border-cyber/50 resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">ثبت تیکت</Button>
              <Button type="button" variant="ghost" onClick={() => setShowNewForm(false)}>
                لغو
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Input
          placeholder="جستجوی تیکت..."
          icon={<Search className="w-4 h-4" />}
        />
      </motion.div>

      {/* Tickets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-obsidian-light border border-obsidian-lighter p-8"
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare size={48} className="text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg mb-2" style={{ fontFamily: "var(--font-fa)" }}>
            تیکتی ندارید
          </p>
          <p className="text-gray-600 text-sm" style={{ fontFamily: "var(--font-fa)" }}>
            برای دریافت پشتیبانی، تیکت جدید ایجاد کنید
          </p>
        </div>
      </motion.div>
    </div>
  );
}
