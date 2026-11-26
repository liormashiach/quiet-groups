import React, { useState } from "react";
import {
  Wallet,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  Bell,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CollectionsView({
  collections = [],
  activeGroup,
  currentUser,
  userRoleBadge = "",
  groupMembersList = [],
  canManage,
  formatHebrewDate,
  onEditCollection,
  onDeleteCollection,
  onToggleUnitPaid,
  onSendUnitReminder,
}) {
  const [selectedUnitByCol, setSelectedUnitByCol] = useState({});
  const [remindedColIds, setRemindedColIds] = useState({});

  const unitLabelNoun =
    activeGroup?.type === "building"
      ? "דירה"
      : activeGroup?.type === "kindergarten"
        ? "ילד/ה"
        : "יחידה";

  // הפקת רשימת יחידות התשלום הייחודיות מתוך שיוכי החברים בקבוצה (role_badge)
  function getGroupUnits() {
    const unitsMap = new Map();

    groupMembersList.forEach((m) => {
      const displayName = m.profiles?.display_name || "חבר קבוצה";
      const badge = (m.profiles?.role_badge || "").trim();
      const unitKey = badge || displayName;
      const memberFullLabel = `${displayName}${badge ? ` (${badge})` : ""}`;

      if (!unitsMap.has(unitKey)) {
        unitsMap.set(unitKey, {
          unitName: unitKey,
          members: [],
        });
      }
      unitsMap.get(unitKey).members.push(memberFullLabel);
    });

    if (unitsMap.size === 0 && currentUser) {
      const fallbackUnit = userRoleBadge.trim() || currentUser;
      unitsMap.set(fallbackUnit, {
        unitName: fallbackUnit,
        members: [currentUser],
      });
    }

    return Array.from(unitsMap.values());
  }

  const allUnits = getGroupUnits();
  const myDefaultUnit =
    userRoleBadge.trim() ||
    allUnits.find((u) => u.members.includes(currentUser))?.unitName ||
    allUnits[0]?.unitName ||
    currentUser;

  // בדיקה האם יחידה שילמה (תומך גם בפורמט החדש "דירה 8|ליאור" וגם בפורמט הישן)
  function findPaidRecordForUnit(paidList, unitName) {
    return (paidList || []).find((entry) => {
      if (entry === unitName) return true;
      if (entry.startsWith(`${unitName}|`)) return true;
      if (entry.includes(`(${unitName})`)) return true;
      return false;
    });
  }

  function extractPayerName(entry) {
    if (!entry) return "";
    if (entry.includes("|")) {
      return entry.split("|")[1];
    }
    return entry;
  }

  if (collections.length === 0) {
    return (
      <div
        className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2"
        dir="rtl"
      >
        <Wallet size={28} className="mx-auto text-slate-400" />
        <p className="text-xs text-slate-500">
          אין כרגע בקשות גבייה פעילות בקבוצה.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {collections.map((col) => {
        const paidList = col.paid_users || [];
        const amountPerUnit = Number(col.amount) || 0;

        // חישוב סטטוס לכל יחידה (דירה / ילד)
        const unitsWithStatus = allUnits.map((u) => {
          const paidEntry = findPaidRecordForUnit(paidList, u.unitName);
          return {
            ...u,
            isPaid: Boolean(paidEntry),
            paidBy: extractPayerName(paidEntry),
          };
        });

        const paidUnits = unitsWithStatus.filter((u) => u.isPaid);
        const unpaidUnits = unitsWithStatus.filter((u) => !u.isPaid);

        const totalUnitsCount = Math.max(allUnits.length, 1);
        const progressPct = Math.min(
          100,
          Math.round((paidUnits.length / totalUnitsCount) * 100),
        );
        const totalCollected = paidUnits.length * amountPerUnit;
        const totalExpected = totalUnitsCount * amountPerUnit;

        const chosenUnit = selectedUnitByCol[col.id] || myDefaultUnit;
        const chosenUnitRecord = findPaidRecordForUnit(paidList, chosenUnit);
        const isChosenUnitPaid = Boolean(chosenUnitRecord);
        const chosenUnitPayer = extractPayerName(chosenUnitRecord);
        const justReminded = Boolean(remindedColIds[col.id]);

        return (
          <div
            key={col.id}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3.5"
          >
            {/* כותרת וסכום */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-lg">
                    {amountPerUnit} ₪ ל{unitLabelNoun}
                  </span>
                  {col.due_date && (
                    <span className="text-[11px] text-slate-500">
                      יעד: {formatHebrewDate(col.due_date)}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-base mt-1">
                  {col.title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  נפתח ע״י {col.creator}
                </p>
              </div>

              {canManage(col.creator) && (
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => onEditCollection(col)}
                    className="p-1 hover:text-indigo-600"
                    title="ערוך גבייה"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCollection("collections", col.id)}
                    className="p-1 hover:text-rose-600"
                    title="מחק גבייה"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* מד התקדמות כספי */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>
                  שולמו {paidUnits.length} מתוך {totalUnitsCount}{" "}
                  {unitLabelNoun === "דירה" ? "דירות" : "יחידות"} ({progressPct}
                  %)
                </span>
                <span className="text-emerald-700">
                  {totalCollected.toLocaleString()} /{" "}
                  {totalExpected.toLocaleString()} ₪
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* בחירת יחידה (למקרה של מספר ילדים/דירות) + כפתור תשלום */}
            <div className="space-y-2">
              {allUnits.length > 1 && (
                <div className="flex items-center justify-between gap-2 text-xs bg-indigo-50/50 px-3 py-2 rounded-xl border border-indigo-100">
                  <span className="font-bold text-slate-600">
                    תשלום עבור {unitLabelNoun}:
                  </span>
                  <select
                    value={chosenUnit}
                    onChange={(e) =>
                      setSelectedUnitByCol((prev) => ({
                        ...prev,
                        [col.id]: e.target.value,
                      }))
                    }
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-indigo-800 text-xs focus:outline-none"
                  >
                    {allUnits.map((u) => (
                      <option key={u.unitName} value={u.unitName}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isChosenUnitPaid && (
                <div className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-600 shrink-0"
                  />
                  <span>
                    התשלום עבור <strong>{chosenUnit}</strong> הוסדר
                    {chosenUnitPayer && chosenUnitPayer !== chosenUnit
                      ? ` (סומן ע״י ${chosenUnitPayer})`
                      : ""}
                    .
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-0.5">
                {col.payment_link && (
                  <a
                    href={col.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <ExternalLink size={14} /> לתשלום ב-Bit / PayBox
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onToggleUnitPaid(col, chosenUnit)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                    isChosenUnitPaid
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-300"
                  }`}
                >
                  <Check size={14} />
                  {isChosenUnitPaid
                    ? `שולם (${chosenUnit}) • בטל`
                    : `העברתי תשלום (${chosenUnit})`}
                </button>
              </div>
            </div>

            {/* פאנל ניהול ומעקב למנהל / פותח הגבייה */}
            {canManage(col.creator) && (
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Users size={13} className="text-indigo-600" /> מעקב לפי{" "}
                    {unitLabelNoun}:
                  </span>

                  {unpaidUnits.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onSendUnitReminder(col, unpaidUnits);
                        setRemindedColIds((prev) => ({
                          ...prev,
                          [col.id]: true,
                        }));
                        setTimeout(() => {
                          setRemindedColIds((prev) => ({
                            ...prev,
                            [col.id]: false,
                          }));
                        }, 3000);
                      }}
                      className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <Bell size={11} />
                      {justReminded
                        ? "תזכורת נשלחה!"
                        : `תזכורת ל-${unpaidUnits.length} שטרם שילמו`}
                    </button>
                  )}
                </div>

                {/* פירוט שילמו מול טרם שילמו */}
                <div className="grid grid-cols-1 gap-2 text-[11px]">
                  {paidUnits.length > 0 && (
                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 space-y-1">
                      <span className="font-bold text-emerald-800 block">
                        ✓ שילמו ({paidUnits.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {paidUnits.map((u) => (
                          <span
                            key={u.unitName}
                            className="bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium"
                          >
                            {u.unitName}
                            {u.paidBy && u.paidBy !== u.unitName
                              ? ` (${u.paidBy.split(" ")[0]})`
                              : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {unpaidUnits.length > 0 ? (
                    <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 space-y-1">
                      <span className="font-bold text-rose-800 flex items-center gap-1">
                        <AlertCircle size={12} /> טרם שילמו (
                        {unpaidUnits.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {unpaidUnits.map((u) => (
                          <span
                            key={u.unitName}
                            className="bg-white text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-medium"
                          >
                            {u.unitName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold">
                      🎉 כל {unitLabelNoun === "דירה" ? "הדירות" : "המשתתפים"}{" "}
                      שילמו!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
