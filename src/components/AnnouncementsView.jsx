import React, { useState } from "react";
import {
  Plus,
  Pin,
  Edit2,
  Trash2,
  Megaphone,
  Search,
  Clock,
} from "lucide-react";

export default function AnnouncementsView({
  announcements = [],
  canManage,
  isGroupAdmin,
  showExpired,
  formatHebrewDate,
  openCreateItemModal,
  openEditItemModal,
  handleDeleteItem,
  togglePinAnnouncement,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  function isItemExpired(item) {
    if (!item?.expires_at) return false;
    return new Date(item.expires_at) < new Date();
  }

  const visibleAnnouncements = showExpired
    ? announcements
    : announcements.filter((a) => !isItemExpired(a));

  const filteredAnnouncements = searchQuery.trim()
    ? visibleAnnouncements.filter((a) => {
        const q = searchQuery.toLowerCase();
        return (
          (a.title || "").toLowerCase().includes(q) ||
          (a.content || "").toLowerCase().includes(q) ||
          (a.author || "").toLowerCase().includes(q)
        );
      })
    : visibleAnnouncements;

  // הודעות נעוצות בראש הרשימה
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  return (
    <div className="space-y-3" dir="rtl">
      {/* שורת חיפוש וכפתור הוספה ייעודי */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="חיפוש בהודעות..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pr-8 pl-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400"
          />
        </div>

        <button
          type="button"
          onClick={() => openCreateItemModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold shadow-sm transition shrink-0"
        >
          <Plus size={15} /> הודעה חדשה
        </button>
      </div>

      {/* רשימת הודעות */}
      {sortedAnnouncements.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
          <Megaphone size={26} className="mx-auto text-slate-400" />
          <p className="text-xs text-slate-500">
            {searchQuery
              ? "לא נמצאו הודעות התואמות לחיפוש."
              : "אין כרגע הודעות פעילות בקבוצה."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => openCreateItemModal()}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              + פרסם הודעה ראשונה
            </button>
          )}
        </div>
      ) : (
        sortedAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white p-4 rounded-2xl shadow-sm border space-y-2 transition ${
              ann.is_pinned
                ? "border-amber-300 bg-amber-50/20"
                : "border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {ann.is_pinned && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Pin size={10} /> נעוץ
                  </span>
                )}
                {ann.expires_at && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={10} /> בתוקף עד{" "}
                    {formatHebrewDate(ann.expires_at.split("T")[0])}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-slate-400 shrink-0">
                {isGroupAdmin && togglePinAnnouncement && (
                  <button
                    type="button"
                    onClick={() => togglePinAnnouncement(ann)}
                    className={`p-1 transition ${
                      ann.is_pinned ? "text-amber-600" : "hover:text-amber-600"
                    }`}
                    title={ann.is_pinned ? "בטל נעיצה" : "נעץ הודעה"}
                  >
                    <Pin size={14} />
                  </button>
                )}

                {canManage(ann.author) && (
                  <>
                    <button
                      type="button"
                      onClick={() => openEditItemModal(ann)}
                      className="p-1 hover:text-indigo-600"
                      title="ערוך הודעה"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem("announcements", ann.id)}
                      className="p-1 hover:text-rose-600"
                      title="מחק הודעה"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <h3 className="font-bold text-slate-800 text-base">{ann.title}</h3>
            {ann.content && (
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {ann.content}
              </p>
            )}

            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between items-center">
              <span>פורסם ע״י {ann.author}</span>
              {ann.created_at && (
                <span>
                  {new Date(ann.created_at).toLocaleDateString("he-IL")}
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
