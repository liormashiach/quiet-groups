import React, { useState } from "react";
import {
  Phone,
  Plus,
  Edit2,
  Trash2,
  Search,
  User,
  Shield,
  Wrench,
} from "lucide-react";

export default function ContactsView({
  contacts = [],
  currentUser,
  canManage,
  openCreateItemModal,
  openEditItemModal,
  handleDeleteItem,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = searchQuery.trim()
    ? contacts.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          (c.name || "").toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q) ||
          (c.role || "").toLowerCase().includes(q) ||
          (c.notes || "").toLowerCase().includes(q)
        );
      })
    : contacts;

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
            placeholder="חיפוש באנשי קשר וטלפונים..."
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
          <Plus size={15} /> איש קשר חדש
        </button>
      </div>

      {/* רשימת אנשי קשר */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
          <Phone size={26} className="mx-auto text-slate-400" />
          <p className="text-xs text-slate-500">
            {searchQuery
              ? "לא נמצאו אנשי קשר התואמים לחיפוש."
              : "אין כרגע אנשי קשר או טלפונים שמורים בקבוצה."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => openCreateItemModal()}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              + הוסף איש קשר ראשון
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 space-y-2 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {contact.name}
                  </h3>
                  {contact.role && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold inline-block mt-0.5">
                      {contact.role}
                    </span>
                  )}
                </div>

                {canManage(contact.creator) && (
                  <div className="flex items-center gap-1 text-slate-400 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditItemModal(contact)}
                      className="p-1 hover:text-indigo-600"
                      title="ערוך איש קשר"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem("contacts", contact.id)}
                      className="p-1 hover:text-rose-600"
                      title="מחק איש קשר"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {contact.notes && (
                <p className="text-xs text-slate-600">{contact.notes}</p>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${contact.phone}`}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition w-full justify-center shadow-xs"
                >
                  <Phone size={13} className="text-emerald-600" />{" "}
                  {contact.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
