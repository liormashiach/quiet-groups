import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  X,
  Plus,
  Calendar,
  CheckCircle2,
  Bell,
  AlertCircle,
} from "lucide-react";

export default function TasksView({
  activeGroup,
  currentUser,
  displayName,
  groupMembersList = [],
}) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [remindedTaskIds, setRemindedTaskIds] = useState({});

  // פילטרים: 'all' | 'mine' | 'pending' | 'completed'
  const [filterMode, setFilterMode] = useState("all");

  useEffect(() => {
    if (activeGroup?.id) {
      fetchGroupData();
    }
  }, [activeGroup?.id]);

  function isAssignedToMe(assignee) {
    if (!assignee) return false;
    return (
      (currentUser && assignee === currentUser) ||
      (displayName && assignee === displayName)
    );
  }

  // מציאת המזהה המדויק של הנמען כפי שנשמר בטבלת notifications
  function resolveRecipientLabel(assigneeName) {
    const match = groupMembersList.find(
      (m) => m.profiles?.display_name === assigneeName,
    );
    if (match?.profiles) {
      return `${match.profiles.display_name}${
        match.profiles.role_badge ? ` (${match.profiles.role_badge})` : ""
      }`;
    }
    return assigneeName;
  }

  async function sendTaskNotification(assigneeName, message) {
    const recipient = resolveRecipientLabel(assigneeName);
    if (!recipient || recipient === currentUser || !activeGroup?.id) return;

    await supabase.from("notifications").insert({
      group_id: activeGroup.id,
      recipient_user: recipient,
      actor_user: currentUser,
      message,
    });
  }

  async function fetchGroupData() {
    setLoading(true);

    const { data: membersData } = await supabase
      .from("group_members")
      .select("profiles(display_name)")
      .eq("group_id", activeGroup.id);

    if (membersData) {
      const names = membersData
        .map((m) => m.profiles?.display_name)
        .filter(Boolean);
      setMembers(names);
      if (names.length > 0 && !assignedTo) {
        const defaultUser = names.find((n) => isAssignedToMe(n)) || names[0];
        setAssignedTo(defaultUser);
      }
    }

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("group_id", activeGroup.id)
      .order("created_at", { ascending: false });

    if (tasksData) setTasks(tasksData);
    setLoading(false);
  }

  async function handleAddTask(e) {
    e.preventDefault();
    if (!title.trim() || !assignedTo || !activeGroup?.id) return;

    const cleanTitle = title.trim();
    const { error } = await supabase.from("tasks").insert([
      {
        group_id: activeGroup.id,
        title: cleanTitle,
        description: isImportant ? "URGENT" : null,
        assigned_to: assignedTo,
        due_date: dueDate || null,
        status: "pending",
        reward_amount: 0,
      },
    ]);

    if (!error) {
      // שליחת התראה פנימית שקטה למי שהמשימה שויכה אליו
      const prefix = isImportant ? "🚨 משימה חשובה חדשה" : "📋 משימה חדשה";
      const duePart = dueDate ? ` (עד ${dueDate})` : "";
      await sendTaskNotification(
        assignedTo,
        `${prefix} מ-${currentUser}: "${cleanTitle}"${duePart}`,
      );

      setTitle("");
      setDueDate("");
      setIsImportant(false);
      fetchGroupData();
    } else {
      alert("שגיאה בהוספת משימה: " + error.message);
    }
  }

  async function handleSendManualReminder(task) {
    const isTaskUrgent = task.description === "URGENT";
    const prefix = isTaskUrgent
      ? "🚨 תזכורת למשימה חשובה"
      : "🔔 תזכורת שקטה למשימה";
    const duePart = task.due_date ? ` (יעד: ${task.due_date})` : "";

    await sendTaskNotification(
      task.assigned_to,
      `${prefix}: "${task.title}"${duePart}`,
    );

    setRemindedTaskIds((prev) => ({ ...prev, [task.id]: true }));
    setTimeout(() => {
      setRemindedTaskIds((prev) => ({ ...prev, [task.id]: false }));
    }, 3000);
  }

  async function toggleTaskImportance(task) {
    const nextDesc = task.description === "URGENT" ? null : "URGENT";
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, description: nextDesc } : t)),
    );
    await supabase
      .from("tasks")
      .update({ description: nextDesc })
      .eq("id", task.id);
  }

  async function handleCompleteTask(taskId, currentStatus) {
    const isDone = currentStatus === "completed" || currentStatus === "done";
    const nextStatus = isDone ? "pending" : "completed";
    const { error } = await supabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", taskId);

    if (!error) {
      fetchGroupData();
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm("למחוק את המשימה הזו?")) return;
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchGroupData();
  }

  // חישוב דחיפות לפי תאריך יעד
  function getTaskUrgency(dueDateStr, status) {
    if (!dueDateStr || status === "completed" || status === "done") return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr + "T00:00:00");
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `באיחור של ${Math.abs(diffDays)} ימים!`, urgent: true };
    }
    if (diffDays === 0) {
      return { text: "לביצוע היום!", urgent: true };
    }
    if (diffDays <= 2) {
      return { text: `תאריך יעד: עוד ${diffDays} ימים`, warning: true };
    }
    return { text: `תאריך יעד: ${dueDateStr}`, normal: true };
  }

  // סינון המשימות לפי המצב הנבחר
  const filteredTasks = tasks.filter((task) => {
    const status = (task.status || "").toLowerCase();
    const isCompleted = status === "completed" || status === "done";
    const isMine = isAssignedToMe(task.assigned_to);

    if (filterMode === "mine") return isMine && !isCompleted;
    if (filterMode === "pending") return !isCompleted;
    if (filterMode === "completed") return isCompleted;
    return true;
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        טוען משימות...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-5" dir="rtl">
      {/* טופס הוספת משימה */}
      <form
        onSubmit={handleAddTask}
        className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 space-y-4"
      >
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Plus size={18} className="text-indigo-600" /> הוספת משימה לבני הבית
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">
              מה צריך לעשות?
            </label>
            <input
              type="text"
              placeholder="למשל: לזרוק זבל, לנקות חול..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                שיוך לבן משפחה
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {members.map((kid) => (
                  <option key={kid} value={kid}>
                    {kid} {isAssignedToMe(kid) ? "(את/ה)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                תאריך יעד
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* סימון משימה חשובה */}
          <label
            className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
              isImportant
                ? "bg-rose-50 border-rose-300 text-rose-800"
                : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100/70"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertCircle
                size={16}
                className={isImportant ? "text-rose-600" : "text-slate-400"}
              />
              <span>סמן כמשימה חשובה (שולח התראה מודגשת לפעמון)</span>
            </div>
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="w-4 h-4 accent-rose-600 rounded"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-sm transition shadow-sm mt-2 flex items-center justify-center gap-1.5"
          >
            <Plus size={16} /> הוסף משימה לרשימה
          </button>
        </div>
      </form>

      {/* סרגל סינון מהיר */}
      <div className="flex items-center justify-between gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
        <button
          onClick={() => setFilterMode("all")}
          className={`flex-1 py-2 rounded-xl transition ${
            filterMode === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          הכל ({tasks.length})
        </button>
        <button
          onClick={() => setFilterMode("mine")}
          className={`flex-1 py-2 rounded-xl transition ${
            filterMode === "mine"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          המשימות שלי
        </button>
        <button
          onClick={() => setFilterMode("pending")}
          className={`flex-1 py-2 rounded-xl transition ${
            filterMode === "pending"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          פתוחות
        </button>
        <button
          onClick={() => setFilterMode("completed")}
          className={`flex-1 py-2 rounded-xl transition ${
            filterMode === "completed"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          הושלמו
        </button>
      </div>

      {/* רשימת משימות */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-sm px-1">
          {filterMode === "mine" && "המשימות שלי"}
          {filterMode === "pending" && "משימות פתוחות"}
          {filterMode === "completed" && "משימות שהושלמו"}
          {filterMode === "all" && "כל המשימות בקבוצה"}
        </h3>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm space-y-1">
            <p>אין משימות להצגה תחת סינון זה.</p>
            <span className="text-xs text-indigo-600 font-medium">
              הכל מתקתק! 🧘‍♂️
            </span>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const status = (task.status || "").toLowerCase();
            const isCompleted = status === "completed" || status === "done";
            const isTaskUrgent = task.description === "URGENT";
            const urgency = getTaskUrgency(task.due_date, status);
            const justReminded = Boolean(remindedTaskIds[task.id]);

            return (
              <div
                key={task.id}
                className={`bg-white rounded-3xl p-4 border shadow-sm flex items-center justify-between gap-3 transition hover:shadow-md ${
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50/20 opacity-75"
                    : isTaskUrgent || urgency?.urgent
                      ? "border-rose-300 bg-rose-50/20"
                      : "border-slate-200/80"
                }`}
              >
                <div className="space-y-1 pr-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isTaskUrgent && !isCompleted && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold flex items-center gap-1">
                        <AlertCircle size={11} /> חשוב
                      </span>
                    )}
                    <span
                      className={`font-bold text-base ${
                        isCompleted
                          ? "line-through text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                      {task.assigned_to}
                    </span>
                  </div>

                  {task.due_date && (
                    <div
                      className={`text-xs flex items-center gap-1 font-medium ${
                        urgency?.urgent
                          ? "text-rose-600 font-bold"
                          : urgency?.warning
                            ? "text-amber-600"
                            : "text-slate-400"
                      }`}
                    >
                      <Calendar size={12} />{" "}
                      {urgency ? urgency.text : task.due_date}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isCompleted && (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleTaskImportance(task)}
                        className={`p-2 rounded-xl transition ${
                          isTaskUrgent
                            ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
                            : "text-slate-300 hover:text-rose-500 hover:bg-slate-50"
                        }`}
                        title={
                          isTaskUrgent ? "בטל סימון חשוב" : "סמן כמשימה חשובה"
                        }
                      >
                        <AlertCircle size={16} />
                      </button>

                      {!isAssignedToMe(task.assigned_to) && (
                        <button
                          type="button"
                          onClick={() => handleSendManualReminder(task)}
                          className={`p-2 rounded-xl transition text-xs font-bold flex items-center gap-1 ${
                            justReminded
                              ? "bg-amber-100 text-amber-800"
                              : "text-amber-600 bg-amber-50 hover:bg-amber-100"
                          }`}
                          title="שלח תזכורת שקטה לפעמון"
                        >
                          <Bell size={15} />
                          {justReminded && (
                            <span className="text-[10px]">נשלח!</span>
                          )}
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => handleCompleteTask(task.id, task.status)}
                    className={`text-xs font-bold px-3.5 py-2.5 rounded-2xl transition shadow-sm flex items-center gap-1 ${
                      isCompleted
                        ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    {isCompleted ? "בוטל (החזר)" : "בוצע"}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-300 hover:text-rose-500 p-2 transition rounded-xl hover:bg-rose-50"
                    title="מחק משימה"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
