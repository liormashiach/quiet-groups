import React, { useState } from "react";
import {
  Repeat,
  Plus,
  Edit2,
  Trash2,
  Search,
  Clock,
  CheckCircle2,
  Tag,
} from "lucide-react";

export default function ExchangeView({
  exchangeItems = [],
  currentUser,
  canManage,
  showExpired,
  formatHebrewDate,
  openCreateItemModal,
  openEditItemModal,
  handleDeleteItem,
  toggleExchangeStatus,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | available | taken

  function isItemExpired(item) {
    if (!item?.expires_at) return false;
    return new Date(item.expires_at) < new Date();
  }

  const visibleItems = showExpired
    ? exchangeItems
    : exchangeItems.filter((item) => !isItemExpired(item));

  const filteredItems = visibleItems.filter((item) => {
    const isTaken =
      item.status === "taken" ||
      item.status === "claimed" ||
      Boolean(item.claimed_by);

    if (statusFilter === "available" && isTaken) return false;
    if (statusFilter === "taken" && !isTaken) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (item.title || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.owner_name || "").toLowerCase().includes(q)
      );
    }
    return true;
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
            placeholder="חיפוש בקח-תן / קניות..."
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
          <Plus size={15} /> פריט חדש
        </button>
      </div>

      {/* סינון מהיר: הכל / זמין / נמסר */}
      <div className="flex gap-1.5 text-xs font-bold">
        {[
          { id: "all", label: `הכל (${visibleItems.length})` },
          { id: "available", label: "זמין למסירה / מכירה" },
          { id: "taken", label: "נמסר / טופל" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1 rounded-xl border transition ${
              statusFilter === tab.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* רשימת פריטים */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
          <Repeat size={26} className="mx-auto text-slate-400" />
          <p className="text-xs text-slate-500">
            {searchQuery
              ? "לא נמצאו פריטים התואמים לחיפוש."
              : "אין כרגע פריטים בלוח קח-תן / קניות."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => openCreateItemModal()}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              + פרסם פריט ראשון
            </button>
          )}
        </div>
      ) : (
        filteredItems.map((item) => {
          const isTaken =
            item.status === "taken" ||
            item.status === "claimed" ||
            Boolean(item.claimed_by);

          return (
            <div
              key={item.id}
              className={`bg-white p-4 rounded-2xl shadow-sm border space-y-2.5 transition ${
                isTaken ? "border-slate-200 bg-slate-50/60" : "border-slate-200"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.category && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                      <Tag size={10} /> {item.category}
                    </span>
                  )}
                  {item.condition && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      {item.condition}
                    </span>
                  )}
                  {isTaken && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      ✓ {item.claimed_by ? `נמסר ל-${item.claimed_by}` : "נמסר"}
                    </span>
                  )}
                  {item.expires_at && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={10} /> עד{" "}
                      {formatHebrewDate(item.expires_at.split("T")[0])}
                    </span>
                  )}
                </div>

                {canManage(item.owner_name) && (
                  <div className="flex items-center gap-1 text-slate-400 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditItemModal(item)}
                      className="p-1 hover:text-indigo-600"
                      title="ערוך פריט"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteItem("exchange_items", item.id)
                      }
                      className="p-1 hover:text-rose-600"
                      title="מחק פריט"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3
                  className={`font-bold text-base ${
                    isTaken ? "line-through text-slate-400" : "text-slate-800"
                  }`}
                >
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  פורסם ע״י {item.owner_name}
                </span>

                {toggleExchangeStatus && (
                  <button
                    type="button"
                    onClick={() => toggleExchangeStatus(item)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                      isTaken
                        ? "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    {isTaken ? "החזר לזמין" : "אני רוצה / סמן כנמסר"}
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
