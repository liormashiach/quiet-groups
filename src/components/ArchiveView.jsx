import React, { useState } from "react";
import {
  Archive,
  RotateCcw,
  Trash2,
  Megaphone,
  Repeat,
  Calendar,
  BarChart2,
  Sparkles,
  Clock,
  X,
} from "lucide-react";

export default function ArchiveView({
  announcements = [],
  exchangeItems = [],
  events = [],
  polls = [],
  recommendations = [],
  canManage,
  onExtendExpiry,
  onDeleteItem,
  onClose,
}) {
  const [categoryFilter, setCategoryFilter] = useState("all");

  function isExpired(item) {
    if (!item?.expires_at) return false;
    return new Date(item.expires_at) < new Date();
  }

  // איסוף כל הפריטים שפג תוקפם מכל הלשוניות לרשימה מאוחדת
  const archivedItems = [
    ...announcements.filter(isExpired).map((item) => ({
      ...item,
      _type: "announcements",
      _table: "announcements",
      _typeLabel: "הודעה",
      _owner: item.author,
      _displayTitle: item.title,
      _displaySub: item.content,
      _icon: Megaphone,
    })),
    ...exchangeItems.filter(isExpired).map((item) => ({
      ...item,
      _type: "exchange",
      _table: "exchange_items",
      _typeLabel: "קח-תן / קניות",
      _owner: item.owner_name,
      _displayTitle: item.title,
      _displaySub: `${item.category || ""}${item.condition ? ` • ${item.condition}` : ""}`,
      _icon: Repeat,
    })),
    ...events.filter(isExpired).map((item) => ({
      ...item,
      _type: "events",
      _table: "events",
      _typeLabel: "אירוע ביומן",
      _owner: item.organizer,
      _displayTitle: item.title,
      _displaySub: item.date_str || item.event_date || "",
      _icon: Calendar,
    })),
    ...polls.filter(isExpired).map((item) => ({
      ...item,
      _type: "polls",
      _table: "polls",
      _typeLabel: "סקר / בקשה",
      _owner: item.creator,
      _displayTitle: item.question,
      _displaySub: `${(item.options || []).length} אפשרויות`,
      _icon: BarChart2,
    })),
    ...recommendations.filter(isExpired).map((item) => ({
      ...item,
      _type: "recommendations",
      _table: "recommendations",
      _typeLabel: "המלצה",
      _owner: item.author,
      _displayTitle: item.title,
      _displaySub: item.description,
      _icon: Sparkles,
    })),
  ].sort((a, b) => new Date(b.expires_at) - new Date(a.expires_at));

  const displayedItems =
    categoryFilter === "all"
      ? archivedItems
      : archivedItems.filter((item) => item._type === categoryFilter);

  return (
    <div className="space-y-4" dir="rtl">
      {/* כותרת עליונה */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 text-amber-800 p-2 rounded-xl">
            <Archive size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              ארכיון הקבוצה ({archivedItems.length})
            </h3>
            <p className="text-[11px] text-slate-600">
              פריטים שפג תוקפם והוסרו אוטומטית מהלוחות הפעילים
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition"
          >
            <X size={14} /> חזרה ללוח
          </button>
        )}
      </div>

      {/* סרגל סינון לפי סוג */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: "all", label: `הכל (${archivedItems.length})` },
          { id: "announcements", label: "הודעות" },
          { id: "exchange", label: "קח-תן / קניות" },
          { id: "events", label: "אירועים" },
          { id: "polls", label: "סקרים" },
          { id: "recommendations", label: "המלצות" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap border transition ${
              categoryFilter === tab.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* רשימת פריטי ארכיון */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 space-y-1">
          <p className="text-sm text-slate-500 font-medium">
            הארכיון ריק בקטגוריה זו ✨
          </p>
          <p className="text-xs text-slate-400">
            פריטים שיעבור תאריך התפוגה שלהם יופיעו כאן אוטומטית.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedItems.map((item) => {
            const Icon = item._icon;
            const expiredDateStr = new Date(item.expires_at).toLocaleDateString(
              "he-IL",
            );
            const allowedToManage = canManage ? canManage(item._owner) : true;

            return (
              <div
                key={`${item._table}-${item.id}`}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="bg-slate-100 text-slate-600 p-2 rounded-xl mt-0.5">
                      <Icon size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                          {item._typeLabel}
                        </span>
                        <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                          <Clock size={10} /> פג ב-{expiredDateStr}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">
                        {item._displayTitle}
                      </h4>
                      {item._displaySub && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {item._displaySub}
                        </p>
                      )}
                      {item._owner && (
                        <span className="text-[10px] text-slate-400 block mt-1">
                          פורסם ע״י {item._owner}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {allowedToManage && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {item._type !== "events" && (
                      <button
                        type="button"
                        onClick={() => onExtendExpiry(item._table, item)}
                        className="flex-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition"
                      >
                        <RotateCcw size={13} /> החזר ללוח (+30 יום)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item._table, item.id)}
                      className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Trash2 size={13} /> מחק לצמיתות
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
