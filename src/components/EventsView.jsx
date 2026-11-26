import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CalendarPlus,
  Download,
  Check,
  X,
  Bell,
  Users,
  ChevronRight,
  ChevronLeft,
  Archive,
} from "lucide-react";

export default function EventsView({
  events = [],
  activeGroup,
  currentUser,
  groupMembersList = [],
  canManage,
  showExpired,
  setShowExpired,
  formatHebrewDate,
  getGoogleCalendarUrl,
  downloadIcsFile,
  openCreateItemModal,
  openEditItemModal,
  handleDeleteItem,
  handleRsvp,
  toggleChecklistItem,
  addInlineChecklistItem,
  removeInlineChecklistItem,
  inlineItemInputs,
  setInlineItemInputs,
  sendEventReminder,
}) {
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);

  // חישוב ימי החודש ללוח השנה
  function buildMonthDays(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayWeekday; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({ day, iso });
    }
    return cells;
  }

  function isItemExpired(item) {
    if (!item.expires_at) return false;
    return new Date(item.expires_at) < new Date();
  }

  const visibleEvents = showExpired
    ? events
    : events.filter((ev) => !isItemExpired(ev));

  const eventsCountByDate = visibleEvents.reduce((acc, ev) => {
    if (ev.event_date) {
      acc[ev.event_date] = (acc[ev.event_date] || 0) + 1;
    }
    return acc;
  }, {});

  const todayIso = new Date().toISOString().split("T")[0];
  const monthDays = buildMonthDays(calendarMonth);
  const displayedEvents = selectedDateFilter
    ? visibleEvents.filter((ev) => ev.event_date === selectedDateFilter)
    : visibleEvents;

  return (
    <div className="space-y-4" dir="rtl">
      {/* כותרת ולשונית ארכיון */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => setShowExpired(!showExpired)}
          className={`text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border transition ${
            showExpired
              ? "bg-amber-100 text-amber-800 border-amber-300 font-bold"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          <Archive size={11} />{" "}
          {showExpired ? "מציג ארכיון אירועים" : "ארכיון אירועים"}
        </button>

        <button
          type="button"
          onClick={() => openCreateItemModal(selectedDateFilter)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold shadow-sm transition"
        >
          <Plus size={15} /> אירוע חדש
        </button>
      </div>

      {/* לוח השנה החודשי */}
      <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 space-y-2.5">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() =>
              setCalendarMonth(
                new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth() - 1,
                  1,
                ),
              )
            }
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <ChevronRight size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">
              {calendarMonth.toLocaleDateString("he-IL", {
                month: "long",
                year: "numeric",
              })}
            </span>
            {selectedDateFilter && (
              <button
                type="button"
                onClick={() => setSelectedDateFilter(null)}
                className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold"
              >
                הצג הכל ({visibleEvents.length})
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              setCalendarMonth(
                new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth() + 1,
                  1,
                ),
              )
            }
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400">
          {["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {monthDays.map((cell, idx) => {
            if (!cell) return <div key={`empty-${idx}`} />;
            const count = eventsCountByDate[cell.iso] || 0;
            const isSelected = selectedDateFilter === cell.iso;
            const isToday = todayIso === cell.iso;

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() =>
                  setSelectedDateFilter(isSelected ? null : cell.iso)
                }
                className={`h-10 rounded-xl flex flex-col items-center justify-center text-xs transition relative ${
                  isSelected
                    ? "bg-indigo-600 text-white font-bold shadow-sm"
                    : count > 0
                      ? "bg-indigo-50 text-indigo-900 font-bold hover:bg-indigo-100"
                      : isToday
                        ? "border border-indigo-400 text-indigo-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{cell.day}</span>
                {count === 1 && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      isSelected ? "bg-amber-300" : "bg-indigo-600"
                    }`}
                  />
                )}
                {count > 1 && (
                  <span
                    className={`text-[9px] leading-none px-1.5 py-0.5 rounded-full font-bold mt-0.5 ${
                      isSelected
                        ? "bg-amber-300 text-slate-900"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDateFilter && (
        <div className="flex justify-between items-center bg-indigo-50/80 border border-indigo-200 px-3 py-2 rounded-xl text-xs">
          <span className="font-bold text-indigo-900">
            מציג {displayedEvents.length} אירועים ב-
            {formatHebrewDate(selectedDateFilter)}
          </span>
          <button
            type="button"
            onClick={() => openCreateItemModal(selectedDateFilter)}
            className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1"
          >
            <Plus size={12} /> אירוע נוסף ביום זה
          </button>
        </div>
      )}

      {/* רשימת אירועים */}
      {displayedEvents.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
          <p className="text-xs text-slate-500">
            אין אירועים מתוכננים בתאריך זה.
          </p>
          <button
            type="button"
            onClick={() => openCreateItemModal(selectedDateFilter)}
            className="text-xs text-indigo-600 font-bold hover:underline"
          >
            + הוסף אירוע חדש
          </button>
        </div>
      ) : (
        displayedEvents.map((ev) => {
          const goingList = ev.rsvps?.going || [];
          const maybeList = ev.rsvps?.maybe || [];
          const declinedList = ev.rsvps?.declined || [];
          const isGoing = goingList.includes(currentUser);

          const allMemberNames = groupMembersList
            .map((m) =>
              m.profiles
                ? `${m.profiles.display_name}${m.profiles.role_badge ? ` (${m.profiles.role_badge})` : ""}`
                : "",
            )
            .filter(Boolean);

          const notYetResponded = allMemberNames.filter(
            (name) =>
              !goingList.includes(name) &&
              !maybeList.includes(name) &&
              !declinedList.includes(name),
          );

          return (
            <div
              key={ev.id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-indigo-600 font-bold">
                      {ev.event_date
                        ? formatHebrewDate(ev.event_date, ev.event_time)
                        : ev.date_str}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mt-0.5">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={13} /> {ev.location} • מארגן: {ev.organizer}
                  </p>
                </div>

                {canManage(ev.organizer) && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      onClick={() => openEditItemModal(ev)}
                      className="p-1 hover:text-indigo-600"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem("events", ev.id)}
                      className="p-1 hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {ev.description && (
                <p className="text-sm text-slate-600">{ev.description}</p>
              )}

              {/* כפתורי יצוני ליומן */}
              <div className="flex gap-2">
                <a
                  href={getGoogleCalendarUrl(ev)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 py-1.5 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <CalendarPlus size={13} className="text-indigo-600" /> יומן
                  Google
                </a>
                <button
                  type="button"
                  onClick={() => downloadIcsFile(ev)}
                  className="flex-1 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 py-1.5 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Download size={13} className="text-indigo-600" /> יומן Apple
                  (.ics)
                </button>
              </div>

              {/* אזור אישור הגעה */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-700">
                  ✅ {goingList.length} משתתפים מגיעים
                </span>

                <div className="flex items-center gap-1.5">
                  {canManage(ev.organizer) && goingList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => sendEventReminder(ev)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                      title="שלח תזכורת שקטה למשתתפים"
                    >
                      <Bell size={12} /> שלח תזכורת
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleRsvp(ev, isGoing ? "declined" : "going")
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      isGoing
                        ? "bg-emerald-600 text-white"
                        : "bg-white border border-slate-300 text-slate-700"
                    }`}
                  >
                    <Check size={14} />{" "}
                    {isGoing ? "מגיעים! (בטל)" : "אנחנו מגיעים"}
                  </button>
                </div>
              </div>

              {/* מעקב למארגן: מי מגיע / טרם ענה */}
              {canManage(ev.organizer) && (
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                  <span className="font-bold text-slate-700 block">
                    📊 סיכום הגעה (לעיני מארגן בלבד):
                  </span>
                  {goingList.length > 0 && (
                    <div className="text-emerald-700">
                      <strong>מגיעים:</strong> {goingList.join(", ")}
                    </div>
                  )}
                  {notYetResponded.length > 0 && (
                    <div className="text-slate-500">
                      <strong>טרם השיבו:</strong> {notYetResponded.join(", ")}
                    </div>
                  )}
                </div>
              )}

              {/* רשימת כיבוד וציוד */}
              <div className="space-y-1.5 pt-2 border-t">
                <div className="text-xs font-bold text-slate-700">
                  חלוקת ציוד / כיבוד:
                </div>
                {(ev.checklist || []).map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {canManage(ev.organizer) && (
                        <button
                          type="button"
                          onClick={() => removeInlineChecklistItem(ev, c.id)}
                          className="text-slate-400 hover:text-rose-600"
                          title="הסר פריט"
                        >
                          <X size={13} />
                        </button>
                      )}
                      <span
                        className={
                          c.assignedTo
                            ? "line-through text-slate-400"
                            : "text-slate-800 font-medium"
                        }
                      >
                        {c.item}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(ev, c.id)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold ${
                        c.assignedTo
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {c.assignedTo ? `מביא/ה: ${c.assignedTo}` : "+ עליי!"}
                    </button>
                  </div>
                ))}

                {canManage(ev.organizer) && (
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="הוסף פריט לכיבוד/ציוד..."
                      value={inlineItemInputs[ev.id] || ""}
                      onChange={(e) =>
                        setInlineItemInputs((prev) => ({
                          ...prev,
                          [ev.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInlineChecklistItem(ev);
                        }
                      }}
                      className="flex-1 border border-slate-200 bg-white px-2.5 py-1.5 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => addInlineChecklistItem(ev)}
                      className="bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold"
                    >
                      + הוסף
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
