import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Search,
  Clock,
  Star,
  MapPin,
} from "lucide-react";

export default function RecommendationsView({
  recommendations = [],
  currentUser,
  canManage,
  showExpired,
  formatHebrewDate,
  openCreateItemModal,
  openEditItemModal,
  handleDeleteItem,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  function isItemExpired(item) {
    if (!item?.expires_at) return false;
    return new Date(item.expires_at) < new Date();
  }

  const visibleItems = showExpired
    ? recommendations
    : recommendations.filter((item) => !isItemExpired(item));

  const filteredItems = searchQuery.trim()
    ? visibleItems.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          (item.title || "").toLowerCase().includes(q) ||
          (item.description || "").toLowerCase().includes(q) ||
          (item.category || "").toLowerCase().includes(q) ||
          (item.location || "").toLowerCase().includes(q) ||
          (item.author || "").toLowerCase().includes(q)
        );
      })
    : visibleItems;

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
            placeholder="חיפוש בהמלצות..."
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
          <Plus size={15} /> המלצה חדשה
        </button>
      </div>

      {/* רשימת המלצות */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
          <Sparkles size={26} className="mx-auto text-slate-400" />
          <p className="text-xs text-slate-500">
            {searchQuery
              ? "לא נמצאו המלצות התואמות לחיפוש."
              : "אין כרגע המלצות פעילות בקבוצה."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => openCreateItemModal()}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              + הוסף המלצה ראשונה
            </button>
          )}
        </div>
      ) : (
        filteredItems.map((rec) => (
          <div
            key={rec.id}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2.5 transition"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {rec.category && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                    <Star size={10} /> {rec.category}
                  </span>
                )}
                {rec.location && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                    <MapPin size={10} /> {rec.location}
                  </span>
                )}
                {rec.expires_at && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={10} /> עד{" "}
                    {formatHebrewDate(rec.expires_at.split("T")[0])}
                  </span>
                )}
              </div>

              {canManage(rec.author) && (
                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditItemModal(rec)}
                    className="p-1 hover:text-indigo-600"
                    title="ערוך המלצה"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem("recommendations", rec.id)}
                    className="p-1 hover:text-rose-600"
                    title="מחק המלצה"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {rec.title}
              </h3>
              {rec.description && (
                <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-line leading-relaxed">
                  {rec.description}
                </p>
              )}
            </div>

            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between items-center">
              <span>הומלץ ע״י {rec.author}</span>
              {rec.created_at && (
                <span>
                  {new Date(rec.created_at).toLocaleDateString("he-IL")}
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
