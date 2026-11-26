import React from "react";
import {
  BarChart2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
} from "lucide-react";

export default function PollsView({
  polls = [],
  currentUser,
  canManage,
  showExpired,
  setShowExpired,
  formatHebrewDate,
  openCreateItemModal,
  openEditItemModal,
  handleDeleteItem,
  handleVotePoll,
}) {
  function isItemExpired(item) {
    if (!item?.expires_at) return false;
    return new Date(item.expires_at) < new Date();
  }

  const visiblePolls = showExpired
    ? polls
    : polls.filter((p) => !isItemExpired(p));

  return (
    <div className="space-y-4" dir="rtl">
      {/* כותרת ולשונית ארכיון לסקרים */}
      <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setShowExpired(!showExpired)}
          className={`text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 border transition font-bold ${
            showExpired
              ? "bg-amber-100 text-amber-800 border-amber-300 shadow-sm"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Archive size={14} />{" "}
          {showExpired ? "הצג סקרים פעילים" : "ארכיון סקרים"}
        </button>

        <button
          type="button"
          onClick={() => openCreateItemModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold shadow-sm transition"
        >
          <Plus size={15} /> סקר חדש
        </button>
      </div>

      {/* רשימת סקרים */}
      {visiblePolls.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
          <BarChart2 size={28} className="mx-auto text-slate-400" />
          <p className="text-xs text-slate-500">
            {showExpired
              ? "אין סקרים בארכיון."
              : "אין כרגע סקרים פעילים בקבוצה."}
          </p>
          {!showExpired && (
            <button
              type="button"
              onClick={() => openCreateItemModal()}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              + פתח סקר חדש
            </button>
          )}
        </div>
      ) : (
        visiblePolls.map((poll) => {
          const options = poll.options || [];
          const usesNestedVotes = options.some(
            (opt) => typeof opt === "object" && opt !== null && "votes" in opt,
          );
          const votesMap = poll.votes || {};

          // נרמול כל האפשרויות למבנה אחיד
          const normalizedOptions = options.map((optionItem, idx) => {
            const isObj = typeof optionItem === "object" && optionItem !== null;
            const optId =
              isObj && optionItem.id !== undefined ? optionItem.id : idx;
            const optText = isObj
              ? optionItem.text || optionItem.title || String(optionItem)
              : optionItem;

            let votersList = [];
            if (usesNestedVotes) {
              votersList = Array.isArray(optionItem.votes)
                ? optionItem.votes
                : [];
            } else {
              votersList = Array.isArray(votesMap[optId])
                ? votesMap[optId]
                : Array.isArray(votesMap[idx])
                  ? votesMap[idx]
                  : [];
            }

            return {
              raw: optionItem,
              optId,
              optIdx: idx,
              optText,
              votersList,
            };
          });

          const totalVotesCount = normalizedOptions.reduce(
            (sum, o) => sum + o.votersList.length,
            0,
          );

          return (
            <div
              key={poll.id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                      סקר קבוצתי
                    </span>
                    {poll.expires_at && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock size={10} /> עד{" "}
                        {formatHebrewDate(poll.expires_at.split("T")[0])}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base mt-1">
                    {poll.question}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    נוצר ע״י {poll.creator} • {totalVotesCount} הצבעות
                  </p>
                </div>

                {canManage(poll.creator) && (
                  <div className="flex items-center gap-1 text-slate-400 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditItemModal(poll)}
                      className="p-1 hover:text-indigo-600"
                      title="ערוך סקר"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem("polls", poll.id)}
                      className="p-1 hover:text-rose-600"
                      title="מחק סקר"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* רשימת אפשרויות והצבעה לחיצה */}
              <div className="space-y-2 pt-1">
                {normalizedOptions.map((opt) => {
                  const votesCount = opt.votersList.length;
                  const percentage =
                    totalVotesCount > 0
                      ? Math.round((votesCount / totalVotesCount) * 100)
                      : 0;
                  const isUserVotedHere = opt.votersList.includes(currentUser);

                  return (
                    <button
                      key={opt.optId}
                      type="button"
                      onClick={() => {
                        if (typeof handleVotePoll === "function") {
                          handleVotePoll(poll, opt.optId);
                        }
                      }}
                      className={`w-full text-right p-3 rounded-xl border transition relative overflow-hidden group cursor-pointer ${
                        isUserVotedHere
                          ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                          : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
                      }`}
                    >
                      {/* פס התקדמות ברקע */}
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-indigo-100/70 transition-all duration-300 pointer-events-none"
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative z-10 flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isUserVotedHere
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isUserVotedHere && <CheckCircle2 size={12} />}
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isUserVotedHere
                                ? "text-indigo-900"
                                : "text-slate-800"
                            }`}
                          >
                            {opt.optText}
                          </span>
                        </div>

                        <div className="text-left shrink-0">
                          <span className="text-xs font-bold text-slate-700">
                            {votesCount} ({percentage}%)
                          </span>
                        </div>
                      </div>

                      {opt.votersList.length > 0 && (
                        <div className="relative z-10 text-[10px] text-slate-500 mt-1 pr-6">
                          מצביעים: {opt.votersList.join(", ")}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
