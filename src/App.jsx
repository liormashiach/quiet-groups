import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  Megaphone,
  Repeat,
  Calendar,
  Sparkles,
  Check,
  Plus,
  ThumbsUp,
  MapPin,
  Users,
  Trash2,
  Edit2,
  FolderPlus,
  Bell,
  Clock,
  Archive,
  LogOut,
  ShieldCheck,
  Lock,
  KeyRound,
  Copy,
  UserPlus,
  BarChart2,
  Phone,
  UserCog,
  MailCheck,
  ChevronRight,
  ChevronLeft,
  CalendarPlus,
  Download,
  X,
  Share2,
  UserCheck,
  Wallet,
  ExternalLink,
  Settings2,
  ShoppingCart,
  Utensils,
  RotateCcw,
} from "lucide-react";

import TasksView from "./components/TasksView";
import ArchiveView from "./components/ArchiveView";
import CollectionsView from "./components/CollectionsView";
import EventsView from "./components/EventsView";
import AnnouncementsView from "./components/AnnouncementsView";
import PollsView from "./components/PollsView";
import ExchangeView from "./components/ExchangeView";
import RecommendationsView from "./components/RecommendationsView";
import ContactsView from "./components/ContactsView";

export default function App() {
  // --- Auth & Profile State ---
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleBadge, setRoleBadge] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  // Password Recovery Modal
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");

  // Edit Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfileName, setEditProfileName] = useState("");
  const [editProfileBadge, setEditProfileBadge] = useState("");

  // --- App & Membership State ---
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("announcements");
  const [loading, setLoading] = useState(true);
  const [showExpired, setShowExpired] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Group Members Modal & List State
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [groupMembersList, setGroupMembersList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Calendar Month Grid State
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);

  // Join Group Modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");

  // Data states
  const [announcements, setAnnouncements] = useState([]);
  const [exchangeItems, setExchangeItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [polls, setPolls] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Catalog / Autocomplete State
  const [filteredCatalogSuggestions, setFilteredCatalogSuggestions] = useState(
    [],
  );

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Item Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formEventTime, setFormEventTime] = useState("10:00");
  const [formDesc, setFormDesc] = useState("");
  const [formExtra, setFormExtra] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [pollOptionsText, setPollOptionsText] = useState("");
  const [formChecklist, setFormChecklist] = useState([]);
  const [newChecklistInput, setNewChecklistInput] = useState("");
  const [inlineItemInputs, setInlineItemInputs] = useState({});

  // Group Modal State
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("building");
  const [groupSubtitle, setGroupSubtitle] = useState("");
  const [groupEnabledTabs, setGroupEnabledTabs] = useState([
    "announcements",
    "exchange",
    "events",
    "polls",
    "collections",
    "recommendations",
    "contacts",
  ]);

  const currentUser = profile
    ? `${profile.display_name}${profile.role_badge ? ` (${profile.role_badge})` : ""}`
    : "";
  const isGroupAdmin = activeGroup?.myRole === "admin";

  const ALL_TABS_CONFIG = [
    { id: "announcements", label: "הודעות", icon: Megaphone },
    { id: "exchange", label: "החלפות / קניות", icon: Repeat },
    { id: "events", label: "יומן", icon: Calendar },
    { id: "polls", label: "סקרים / בקשות", icon: BarChart2 },
    { id: "collections", label: "גבייה", icon: Wallet },
    { id: "recommendations", label: "המלצות", icon: Sparkles },
    { id: "contacts", label: "טלפונים", icon: Phone },
    { id: "tasks", label: "משימות", icon: Check },
  ];

  function getGroupLabels(type) {
    if (type === "family") {
      return {
        announcementsTitle: "📌 הודעות הבית",
        announcementsNav: "הודעות",
        announcementsRolePlaceholder: "מי מפרסם (למשל: אבא / אמא)",
        exchangeTitle: "🛒 רשימת קניות לבית",
        exchangeNav: "קניות",
        exchangeItemPlaceholder: "מה חסר בבית? (למשל: חלב 3%, לחם, ביצים)",
        exchangeCatPlaceholder: "מחלקה (סופר / פארם / ירקות)",
        exchangeDescPlaceholder: "כמות או הערה (למשל: 2 קרטונים)",
        exchangeActionBtn: "קניתי ✅",
        exchangeUndoBtn: "החזר לרשימה",
        exchangeStatusBadge: "נקנה ע״י",
        exchangeEmoji: "🛒",
        eventsTitle: "📅 יומן משפחתי",
        pollsTitle: "🍽️ בקשות והצבעות",
        pollsNav: "בקשות",
        pollsQuestionPlaceholder: "מה הבקשה? (למשל: מה אוכלים מחר בצהריים?)",
        collectionsTitle: "💳 תקציב משותף",
        recommendationsTitle: "⭐ המלצות משפחתיות",
        contactsTitle: "📞 טלפונים חשובים",
        contactsRolePlaceholder: "קשר (למשל: סבתא / רופא ילדים)",
      };
    }
    if (type === "kindergarten") {
      return {
        announcementsTitle: "📢 עדכוני הגן והצוות",
        announcementsNav: "עדכונים",
        announcementsRolePlaceholder: "תפקיד (למשל: גננת / ועד הורים)",
        exchangeTitle: "🔄 קח-תן הורים",
        exchangeNav: "החלפות",
        exchangeItemPlaceholder: "שם הפריט למסירה / השאלה",
        exchangeCatPlaceholder: "קטגוריה (ספרים / בגדים / צעצועים)",
        exchangeDescPlaceholder: "מצב הפריט...",
        exchangeActionBtn: "שמור לי!",
        exchangeUndoBtn: "בטל שמירה",
        exchangeStatusBadge: "שמור עבור",
        exchangeEmoji: "🧸",
        eventsTitle: "📅 יומן ופעילויות גן",
        pollsTitle: "📊 הצבעות הורים",
        pollsNav: "סקרים",
        pollsQuestionPlaceholder: "שאלת הסקר (למשל: איזו מתנה לקנות לגננת?)",
        collectionsTitle: "💳 גביית הורים ומתנות",
        recommendationsTitle: "⭐ המלצות הורים",
        contactsTitle: "📞 צוות הגן והורים",
        contactsRolePlaceholder: "תפקיד (למשל: גננת / סייעת)",
      };
    }
    if (type === "general") {
      return {
        announcementsTitle: "📢 הודעות צוות / מנהל",
        announcementsNav: "הודעות",
        announcementsRolePlaceholder: "תפקיד (למשל: מנהל/ת / מוביל צוות)",
        exchangeTitle: "🔄 שיתוף והשאלות",
        exchangeNav: "שיתוף",
        exchangeItemPlaceholder: "שם הפריט",
        exchangeCatPlaceholder: "קטגוריה",
        exchangeDescPlaceholder: "פרטים נוספים...",
        exchangeActionBtn: "שמור לי!",
        exchangeUndoBtn: "בטל שמירה",
        exchangeStatusBadge: "שמור עבור",
        exchangeEmoji: "📦",
        eventsTitle: "📅 יומן ומפגשים",
        pollsTitle: "📊 סקרים והחלטות",
        pollsNav: "סקרים",
        pollsQuestionPlaceholder: "שאלת הסקר",
        collectionsTitle: "💳 איסוף כספים",
        recommendationsTitle: "⭐ המלצות וקישורים",
        contactsTitle: "📞 אנשי קשר",
        contactsRolePlaceholder: "תפקיד / מחלקה",
      };
    }
    return {
      announcementsTitle: "📢 הודעות ועד הבית",
      announcementsNav: "ועד הבית",
      announcementsRolePlaceholder: "תפקיד (למשל: ועד הבית / חברת ניהול)",
      exchangeTitle: "🔄 לוח קח-תן שכנים",
      exchangeNav: "החלפות",
      exchangeItemPlaceholder: "שם הפריט",
      exchangeCatPlaceholder: "קטגוריה",
      exchangeDescPlaceholder: "מצב הפריט...",
      exchangeActionBtn: "שמור לי!",
      exchangeUndoBtn: "בטל שמירה",
      exchangeStatusBadge: "שמור עבור",
      exchangeEmoji: "🎁",
      eventsTitle: "📅 יומן ואירועי בניין",
      pollsTitle: "📊 סקרים והחלטות דיירים",
      pollsNav: "סקרים",
      pollsQuestionPlaceholder: "שאלת הסקר",
      collectionsTitle: "💳 גביית ועד ותשלומים",
      recommendationsTitle: "⭐ המלצות השכנים",
      contactsTitle: "📞 טלפונים חיוניים",
      contactsRolePlaceholder: "תפקיד (למשל: אינסטלטור / חשמלאי / ועד)",
    };
  }

  const labels = getGroupLabels(activeGroup?.type);

  function canManage(ownerName) {
    if (!currentUser) return false;
    return (
      isGroupAdmin ||
      ownerName === currentUser ||
      ownerName === profile?.display_name
    );
  }

  // ספירת פריטים / משימות משויכות אישית עבור לשוניות הניווט
  function getTabBadgeCount(tabId) {
    if (tabId === "tasks") {
      if (!profile && !currentUser) return 0;

      return tasks.filter((task) => {
        const status = (task.status || "").toLowerCase();
        const isDone = status === "done" || status === "completed";
        if (isDone) return false; // אם בוצע - לא לספור

        const assignee = task.assigned_to || task.assignee || "";
        return (
          assignee === currentUser ||
          (profile?.display_name && assignee === profile.display_name) ||
          (session?.user?.id && task.assigned_user_id === session.user.id)
        );
      }).length;
    }

    return 0;
  }

  // חיפוש חי מול טבלת המוצרים והמחירים האמיתיים ב-Supabase
  async function searchRealProducts(queryText) {
    const clean = queryText.trim();
    if (clean.length < 2) {
      setFilteredCatalogSuggestions([]);
      return;
    }
    const { data } = await supabase
      .from("product_prices")
      .select("barcode, product_name, chain_name, price")
      .ilike("product_name", `%${clean}%`)
      .order("price", { ascending: true })
      .limit(30);

    if (!data) return;
    const grouped = {};
    data.forEach((row) => {
      if (!grouped[row.product_name]) {
        grouped[row.product_name] = {
          name: row.product_name,
          cheapestPrice: row.price,
          cheapestChain: row.chain_name,
          allOffers: [],
        };
      }
      grouped[row.product_name].allOffers.push({
        chain: row.chain_name,
        price: row.price,
      });
    });
    setFilteredCatalogSuggestions(Object.values(grouped).slice(0, 6));
  }

  // 1. Session & Auth Listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlJoinCode = params.get("join");
    if (urlJoinCode) {
      setJoinCodeInput(urlJoinCode.toUpperCase());
      setShowJoinModal(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchUserProfile(session.user);
      else setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowResetPasswordModal(true);
      }
      setSession(session);
      if (session?.user) fetchUserProfile(session.user);
      else {
        setProfile(null);
        setGroups([]);
        setActiveGroup(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) {
      setProfile(data);
    } else {
      const fallbackName = user.email.split("@")[0];
      const { data: newProf } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          display_name: fallbackName,
          role_badge: "חבר קבוצה",
        })
        .select()
        .single();
      setProfile(newProf);
    }
    setAuthLoading(false);
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setAuthLoading(true);

    if (authMode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) setAuthError(error.message);
      else
        setAuthMessage(
          "נשלח אליך מייל עם קישור לאיפוס סיסמה! בדוק את תיבת הדואר.",
        );
      setAuthLoading(false);
      return;
    }

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        return;
      }
      if (data?.user) {
        const { data: newProf } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            display_name: displayName.trim() || email.split("@")[0],
            role_badge: roleBadge.trim() || "חבר קבוצה",
          })
          .select()
          .single();
        setProfile(newProf);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setAuthError("אימייל או סיסמה שגויים");
    }
    setAuthLoading(false);
  }

  async function handleUpdateNewPassword(e) {
    e.preventDefault();
    if (newPasswordInput.length < 6) return;
    const { error } = await supabase.auth.updateUser({
      password: newPasswordInput,
    });
    if (error) {
      alert("שגיאה בעדכון הסיסמה: " + error.message);
    } else {
      alert("הסיסמה עודכנה בהצלחה!");
      setNewPasswordInput("");
      setShowResetPasswordModal(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function openProfileModal() {
    if (!profile) return;
    setEditProfileName(profile.display_name || "");
    setEditProfileBadge(profile.role_badge || "");
    setShowProfileModal(true);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!profile || !editProfileName.trim()) return;
    const { data } = await supabase
      .from("profiles")
      .update({
        display_name: editProfileName.trim(),
        role_badge: editProfileBadge.trim(),
      })
      .eq("id", profile.id)
      .select()
      .single();

    if (data) setProfile(data);
    setShowProfileModal(false);
  }

  // Load Groups
  useEffect(() => {
    if (session?.user) loadMyGroups(session.user.id);
  }, [session?.user?.id]);

  async function loadMyGroups(userId) {
    setLoading(true);
    const { data } = await supabase
      .from("group_members")
      .select("role, groups(*)")
      .eq("user_id", userId)
      .order("joined_at", { ascending: true });

    if (data && data.length > 0) {
      const formatted = data
        .filter((row) => row.groups)
        .map((row) => {
          const group = row.groups;
          let tabs = group.enabled_tabs;
          if (typeof tabs === "string") {
            try {
              tabs = JSON.parse(tabs);
            } catch (e) {
              tabs = null;
            }
          }
          return {
            ...group,
            enabled_tabs: Array.isArray(tabs)
              ? tabs
              : ALL_TABS_CONFIG.map((t) => t.id),
            myRole: row.role,
          };
        });
      setGroups(formatted);
      setActiveGroup(
        (prev) => formatted.find((g) => g.id === prev?.id) || formatted[0],
      );
    } else {
      setGroups([]);
      setActiveGroup(null);
    }
    setLoading(false);
  }

  // --- Group Members List & Role Management ---
  async function loadGroupMembers(groupId) {
    setLoadingMembers(true);
    const { data, error } = await supabase
      .from("group_members")
      .select(
        "id, user_id, role, joined_at, profiles(display_name, role_badge)",
      )
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });

    if (!error && data) {
      setGroupMembersList(data);
    } else {
      const { data: rawMembers } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId);
      setGroupMembersList(rawMembers || []);
    }
    setLoadingMembers(false);
  }

  async function openGroupMembersModal() {
    if (!activeGroup) return;
    setShowMembersModal(true);
    await loadGroupMembers(activeGroup.id);
  }

  async function toggleMemberRole(memberRow) {
    const nextRole = memberRow.role === "admin" ? "member" : "admin";
    setGroupMembersList((prev) =>
      prev.map((m) => (m.id === memberRow.id ? { ...m, role: nextRole } : m)),
    );
    await supabase
      .from("group_members")
      .update({ role: nextRole })
      .eq("id", memberRow.id);
  }

  async function removeMemberFromGroup(memberRow) {
    const memberName = memberRow.profiles?.display_name || "המשתמש";
    if (!window.confirm(`להסיר את ${memberName} מהקבוצה?`)) return;

    setGroupMembersList((prev) => prev.filter((m) => m.id !== memberRow.id));
    await supabase.from("group_members").delete().eq("id", memberRow.id);
  }

  // --- Join & Share ---
  async function handleJoinByCode(e) {
    e.preventDefault();
    setJoinError("");
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode || !session?.user) return;

    const { data: targetGroup, error: findErr } = await supabase
      .from("groups")
      .select("*")
      .eq("invite_code", cleanCode)
      .single();

    if (findErr || !targetGroup) {
      setJoinError("קוד קבוצה לא נמצא. בדוק שהקלדת נכון.");
      return;
    }

    if (groups.some((g) => g.id === targetGroup.id)) {
      setActiveGroup(groups.find((g) => g.id === targetGroup.id));
      setShowJoinModal(false);
      setJoinCodeInput("");
      return;
    }

    const { error: joinErr } = await supabase.from("group_members").insert({
      group_id: targetGroup.id,
      user_id: session.user.id,
      role: "member",
    });

    if (joinErr) {
      setJoinError("אירעה שגיאה בהצטרפות לקבוצה.");
      return;
    }

    await supabase
      .from("groups")
      .update({ members_count: (targetGroup.members_count || 1) + 1 })
      .eq("id", targetGroup.id);

    const newGroupObj = { ...targetGroup, myRole: "member" };
    setGroups((prev) => [...prev, newGroupObj]);
    setActiveGroup(newGroupObj);
    setShowJoinModal(false);
    setJoinCodeInput("");
    if (window.location.search.includes("join=")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }

  function copyInviteCode() {
    if (!activeGroup?.invite_code) return;
    navigator.clipboard.writeText(activeGroup.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function shareInviteWhatsApp() {
    if (!activeGroup?.invite_code) return;
    const inviteUrl = `${window.location.origin}/?join=${activeGroup.invite_code}`;
    const text = `היי! מוזמנים להצטרף לקבוצה השקטה שלנו "${activeGroup.name}" (בלי חפירות ובלי חשיפת טלפון).\nקוד הצטרפות: ${activeGroup.invite_code}\nאו בלחיצה ישירה: ${inviteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function toggleExchangeStatus(item) {
    const isCurrentlyTaken =
      item.status === "taken" ||
      item.status === "claimed" ||
      Boolean(item.claimed_by);

    const updatedFields = isCurrentlyTaken
      ? { status: "available", claimed_by: null }
      : { status: "taken", claimed_by: currentUser };

    setExchangeItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, ...updatedFields } : i)),
    );

    await supabase
      .from("exchange_items")
      .update(updatedFields)
      .eq("id", item.id);
  }

  useEffect(() => {
    if (activeGroup && currentUser) {
      fetchGroupData(activeGroup.id);
      loadGroupMembers(activeGroup.id);
      fetchNotifications();
      setSelectedDateFilter(null);

      const enabledTabs =
        activeGroup.enabled_tabs || ALL_TABS_CONFIG.map((t) => t.id);
      if (!enabledTabs.includes(activeTab)) {
        setActiveTab(enabledTabs[0] || "announcements");
      }
    }
  }, [activeGroup?.id, currentUser]);

  // סנכרון משימות בזמן אמת כדי שמונה המשימות האישיות יתעדכן מיידית
  useEffect(() => {
    if (!activeGroup?.id) return;

    const tasksChannel = supabase
      .channel(`realtime-tasks-${activeGroup.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `group_id=eq.${activeGroup.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) =>
              prev.some((t) => t.id === payload.new.id)
                ? prev
                : [payload.new, ...prev],
            );
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t)),
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, [activeGroup?.id]);

  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel("realtime-notifs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if (payload.new.recipient_user === currentUser) {
            setNotifications((prev) => [payload.new, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  async function fetchGroupData(groupId) {
    setLoading(true);
    const [
      annRes,
      exRes,
      evRes,
      recRes,
      pollRes,
      contactRes,
      colRes,
      tasksRes,
    ] = await Promise.all([
      supabase
        .from("announcements")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false }),
      supabase
        .from("exchange_items")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("*")
        .eq("group_id", groupId)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true }),
      supabase
        .from("recommendations")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false }),
      supabase
        .from("polls")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false }),
      supabase
        .from("contacts")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true }),
      supabase
        .from("collections")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false }),
    ]);

    setAnnouncements(annRes.data || []);
    setExchangeItems(exRes.data || []);
    setEvents(evRes.data || []);
    setRecommendations(recRes.data || []);
    setPolls(pollRes.data || []);
    setContacts(contactRes.data || []);
    setCollections(colRes.data || []);
    setTasks(tasksRes.data || []);
    setLoading(false);
  }

  async function fetchNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_user", currentUser)
      .order("created_at", { ascending: false })
      .limit(15);
    setNotifications(data || []);
  }

  async function sendTargetedNotification(recipient, message) {
    if (!recipient || recipient === currentUser || !activeGroup) return;
    await supabase.from("notifications").insert({
      group_id: activeGroup.id,
      recipient_user: recipient,
      actor_user: currentUser,
      message,
    });
  }

  async function markAllNotifsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_user", currentUser)
      .eq("is_read", false);
  }

  // --- Collections Handlers ---
  async function toggleCollectionPaid(col, unitName) {
    const paidList = col.paid_users || [];
    const existingEntry = paidList.find(
      (entry) =>
        entry === unitName ||
        entry.startsWith(`${unitName}|`) ||
        entry.includes(`(${unitName})`),
    );

    const updatedList = existingEntry
      ? paidList.filter((entry) => entry !== existingEntry)
      : [...paidList, `${unitName}|${currentUser}`];

    setCollections((prev) =>
      prev.map((c) =>
        c.id === col.id ? { ...c, paid_users: updatedList } : c,
      ),
    );
    await supabase
      .from("collections")
      .update({ paid_users: updatedList })
      .eq("id", col.id);

    if (!existingEntry) {
      await sendTargetedNotification(
        col.creator,
        `💳 ${currentUser} סימן/ה תשלום (${col.amount} ₪) עבור ${unitName} ב"${col.title}"`,
      );
    }
  }

  async function sendCollectionReminder(col, unpaidUnits) {
    if (!unpaidUnits || unpaidUnits.length === 0) {
      alert("כולם כבר שילמו! 🎉");
      return;
    }

    let sentCount = 0;
    for (const unit of unpaidUnits) {
      for (const memberLabel of unit.members) {
        if (memberLabel && memberLabel !== currentUser) {
          await sendTargetedNotification(
            memberLabel,
            `💳 תזכורת שקטה: טרם סומן תשלום (${col.amount} ₪) עבור ${unit.unitName} ב"${col.title}"`,
          );
          sentCount++;
        }
      }
    }
    alert(
      `נשלחה תזכורת שקטה ל-${sentCount} חברים המשויכים ליחידות שטרם שילמו.`,
    );
  }

  // --- Calendar & Export Helpers ---
  function formatHebrewDate(dateStr, timeStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    const formatted = d.toLocaleDateString("he-IL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return timeStr ? `${formatted}, ${timeStr}` : formatted;
  }

  function getGoogleCalendarUrl(ev) {
    const baseDate = ev.event_date || new Date().toISOString().split("T")[0];
    const cleanDate = baseDate.replace(/-/g, "");
    const [hh, mm] = (ev.event_time || "10:00").split(":");
    const startStr = `${cleanDate}T${hh.padStart(2, "0")}${mm.padStart(2, "0")}00`;
    const endHour = String((parseInt(hh, 10) + 2) % 24).padStart(2, "0");
    const endStr = `${cleanDate}T${endHour}${mm.padStart(2, "0")}00`;

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: ev.title,
      dates: `${startStr}/${endStr}`,
      details: ev.description || "",
      location: ev.location || "",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function downloadIcsFile(ev) {
    const baseDate = ev.event_date || new Date().toISOString().split("T")[0];
    const cleanDate = baseDate.replace(/-/g, "");
    const [hh, mm] = (ev.event_time || "10:00").split(":");
    const startStr = `${cleanDate}T${hh.padStart(2, "0")}${mm.padStart(2, "0")}00`;
    const endHour = String((parseInt(hh, 10) + 2) % 24).padStart(2, "0");
    const endStr = `${cleanDate}T${endHour}${mm.padStart(2, "0")}00`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//QuietGroups//Community Calendar//HE",
      "BEGIN:VEVENT",
      `UID:${ev.id}@quietgroups.app`,
      `DTSTAMP:${startStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${(ev.description || "").replace(/\n/g, "\\n")}`,
      `LOCATION:${ev.location || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ev.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

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

  // --- TTL & 30-Day Extension Helpers ---
  function isItemExpired(item) {
    if (!item.expires_at) return false;
    return new Date(item.expires_at) < new Date();
  }

  function filterByExpiration(list) {
    if (showExpired) return list;
    return list.filter((item) => !isItemExpired(item));
  }

  function formatTimeRemaining(expiresAt) {
    if (!expiresAt) return null;
    const diffMs = new Date(expiresAt) - new Date();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { text: "פג תוקף (בארכיון)", expired: true, canExtend: true };
    }
    if (diffDays === 0) {
      return {
        text: "פג תוקף היום!",
        expired: false,
        urgent: true,
        canExtend: true,
      };
    }
    if (diffDays <= 3) {
      return {
        text: diffDays === 1 ? "פג תוקף מחר" : `פג תוקף בעוד ${diffDays} ימים`,
        expired: false,
        urgent: true,
        canExtend: true,
      };
    }
    return {
      text: `תוקף: עוד ${diffDays} ימים`,
      expired: false,
      urgent: false,
      canExtend: false,
    };
  }

  async function handleExtendItemExpiry(table, item) {
    const baseDate =
      item.expires_at && new Date(item.expires_at) > new Date()
        ? new Date(item.expires_at)
        : new Date();
    baseDate.setDate(baseDate.getDate() + 30);
    const newExpiresIso = baseDate.toISOString();

    if (table === "exchange_items") {
      setExchangeItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, expires_at: newExpiresIso } : i,
        ),
      );
    } else if (table === "recommendations") {
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === item.id ? { ...r, expires_at: newExpiresIso } : r,
        ),
      );
    } else if (table === "announcements") {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === item.id ? { ...a, expires_at: newExpiresIso } : a,
        ),
      );
    } else if (table === "polls") {
      setPolls((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, expires_at: newExpiresIso } : p,
        ),
      );
    }

    await supabase
      .from(table)
      .update({ expires_at: newExpiresIso })
      .eq("id", item.id);
  }

  function getFutureDateString(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  function setQuickExpiryDays(days) {
    if (!days) {
      setFormExpiresAt("");
      return;
    }
    setFormExpiresAt(getFutureDateString(days));
  }

  // --- Groups ---
  function generateInviteCode() {
    return "QG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  function handleGroupTypeChange(newType) {
    setGroupType(newType);
    if (!editingGroup) {
      setGroupEnabledTabs(ALL_TABS_CONFIG.map((t) => t.id));
    }
  }

  function openNewGroupModal() {
    setEditingGroup(null);
    setGroupName("");
    setGroupType("building");
    setGroupSubtitle("");
    setGroupEnabledTabs(ALL_TABS_CONFIG.map((t) => t.id));
    setShowGroupModal(true);
  }

  function openEditGroupModal() {
    if (!activeGroup) return;
    setEditingGroup(activeGroup);
    setGroupName(activeGroup.name);
    setGroupType(activeGroup.type || "building");
    setGroupSubtitle(activeGroup.subtitle || "");
    setGroupEnabledTabs(
      activeGroup.enabled_tabs || ALL_TABS_CONFIG.map((t) => t.id),
    );
    setShowGroupModal(true);
  }

  async function handleSaveGroup(e) {
    e.preventDefault();
    if (!groupName.trim() || !session?.user) return;

    const tabsToSave = Array.isArray(groupEnabledTabs)
      ? groupEnabledTabs
      : ALL_TABS_CONFIG.map((t) => t.id);

    if (editingGroup) {
      const { data, error } = await supabase
        .from("groups")
        .update({
          name: groupName,
          type: groupType,
          subtitle: groupSubtitle,
          enabled_tabs: tabsToSave,
        })
        .eq("id", editingGroup.id)
        .select();

      if (error) {
        alert("שגיאה בעדכון הקבוצה: " + error.message);
        return;
      }

      if (!data || data.length === 0) {
        alert(
          "אזהרה: הפעולה הצליחה אך לא נמצאה שורה לעדכון ב-DB. בדוק את ה-ID של הקבוצה.",
        );
        return;
      }

      const updatedGroupFromDb = {
        ...data[0],
        myRole: editingGroup.myRole || "admin",
      };

      setGroups((prev) =>
        prev.map((g) =>
          g.id === updatedGroupFromDb.id ? updatedGroupFromDb : g,
        ),
      );
      setActiveGroup(updatedGroupFromDb);
    } else {
      const newCode = generateInviteCode();
      const { data: createdGroup, error: createErr } = await supabase
        .from("groups")
        .insert({
          name: groupName,
          type: groupType,
          subtitle: groupSubtitle || "קבוצה שקטה חדשה",
          members_count: 1,
          invite_code: newCode,
          enabled_tabs: tabsToSave,
        })
        .select()
        .single();

      if (createErr) {
        alert("שגיאה ביצירת קבוצה: " + createErr.message);
        return;
      }

      if (createdGroup) {
        await supabase.from("group_members").insert({
          group_id: createdGroup.id,
          user_id: session.user.id,
          role: "admin",
        });
        const groupWithRole = {
          ...createdGroup,
          enabled_tabs: tabsToSave,
          myRole: "admin",
        };
        setGroups((prev) => [...prev, groupWithRole]);
        setActiveGroup(groupWithRole);
      }
    }
    setShowGroupModal(false);
  }

  async function handleDeleteGroup() {
    if (
      !activeGroup ||
      !window.confirm(`למחוק את הקבוצה "${activeGroup.name}"?`)
    )
      return;
    const deletedId = activeGroup.id;
    await supabase.from("groups").delete().eq("id", deletedId);
    const remaining = groups.filter((g) => g.id !== deletedId);
    setGroups(remaining);
    setActiveGroup(remaining[0] || null);
  }

  // --- Items & Checklist Management ---
  function openCreateItemModal(overrideDate = null) {
    setEditingItem(null);
    setFormTitle("");
    setFormDesc("");
    setFormExtra("");
    setFormEventTime("10:00");
    setPollOptionsText(
      activeGroup?.type === "family"
        ? "שניצל ופירה\nפסטה בולונז\nהזמנה מבחוץ"
        : "אפשרות ראשונה\nאפשרות שנייה",
    );
    setNewChecklistInput("");

    if (activeTab === "events") {
      const defaultDate =
        overrideDate || selectedDateFilter || getFutureDateString(7);
      setFormCategory(defaultDate);
      setFormExpiresAt(defaultDate);
      setFormChecklist([
        { id: Date.now(), item: "כיבוד / ציוד ראשוני", assignedTo: null },
      ]);
    } else if (activeTab === "announcements" || activeTab === "polls") {
      setFormCategory("");
      setQuickExpiryDays(7);
      setFormChecklist([]);
    } else if (activeTab === "exchange" || activeTab === "recommendations") {
      setFormCategory("");
      setQuickExpiryDays(30);
      setFormChecklist([]);
    } else if (activeTab === "collections") {
      setFormCategory("50");
      setFormExpiresAt("");
      setFormChecklist([]);
    } else {
      setFormCategory("");
      setFormExpiresAt("");
      setFormChecklist([]);
    }
    setShowItemModal(true);
  }

  function openEditItemModal(item) {
    setEditingItem(item);
    setFormTitle(item.title || item.question || item.name || "");
    setFormExpiresAt(item.expires_at ? item.expires_at.split("T")[0] : "");
    setNewChecklistInput("");

    if (activeTab === "announcements") {
      setFormCategory(item.role || "");
      setFormDesc(item.content || "");
    } else if (activeTab === "exchange") {
      setFormCategory(item.category || "");
      setFormDesc(item.condition || "");
    } else if (activeTab === "events") {
      setFormCategory(item.event_date || "");
      setFormEventTime(item.event_time || "10:00");
      setFormDesc(item.description || "");
      setFormExtra(item.location || "");
      setFormChecklist(item.checklist || []);
    } else if (activeTab === "recommendations") {
      setFormCategory(item.category || "");
      setFormDesc(item.description || "");
      setFormExtra(item.location_or_phone || "");
    } else if (activeTab === "contacts") {
      setFormCategory(item.role || "");
      setFormExtra(item.phone || "");
      setFormDesc(item.notes || "");
    } else if (activeTab === "collections") {
      setFormCategory(String(item.amount || "50"));
      setFormExtra(item.payment_link || "");
      setFormExpiresAt(item.due_date || "");
    }
    setShowItemModal(true);
  }

  async function handleSaveItem(e) {
    e.preventDefault();
    if (!formTitle.trim() || !activeGroup) return;
    const expiresIso = formExpiresAt
      ? new Date(formExpiresAt + "T23:59:59").toISOString()
      : null;

    if (activeTab === "announcements") {
      const payload = {
        title: formTitle,
        role: formCategory || "מנהל הקבוצה",
        content: formDesc,
        expires_at: expiresIso,
      };
      if (editingItem) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingItem.id ? { ...a, ...payload } : a)),
        );
        await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editingItem.id);
      } else {
        const { data } = await supabase
          .from("announcements")
          .insert({
            ...payload,
            group_id: activeGroup.id,
            author: currentUser,
            pinned: true,
          })
          .select()
          .single();
        if (data) setAnnouncements((prev) => [data, ...prev]);
      }
    } else if (activeTab === "exchange") {
      const defaultCat = activeGroup.type === "family" ? "סופר" : "כללי";
      const defaultDesc =
        activeGroup.type === "family" ? formDesc || "יחידה 1" : "מצב מצוין";
      const payload = {
        title: formTitle,
        category: formCategory || defaultCat,
        condition: defaultDesc,
        expires_at: expiresIso,
      };
      if (editingItem) {
        setExchangeItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, ...payload } : i)),
        );
        await supabase
          .from("exchange_items")
          .update(payload)
          .eq("id", editingItem.id);
      } else {
        const { data } = await supabase
          .from("exchange_items")
          .insert({
            ...payload,
            group_id: activeGroup.id,
            owner_name: currentUser,
            status: "AVAILABLE",
            emoji: labels.exchangeEmoji,
          })
          .select()
          .single();
        if (data) setExchangeItems((prev) => [data, ...prev]);
      }
    } else if (activeTab === "events") {
      const chosenDate = formCategory || new Date().toISOString().split("T")[0];
      const readableDate = formatHebrewDate(chosenDate, formEventTime);
      const payload = {
        title: formTitle,
        event_date: chosenDate,
        event_time: formEventTime,
        date_str: readableDate,
        description: formDesc,
        location: formExtra || "ייקבע בהמשך",
        checklist: formChecklist,
        expires_at: expiresIso,
      };
      if (editingItem) {
        setEvents((prev) =>
          prev
            .map((ev) =>
              ev.id === editingItem.id ? { ...ev, ...payload } : ev,
            )
            .sort((a, b) =>
              `${a.event_date}${a.event_time}`.localeCompare(
                `${b.event_date}${b.event_time}`,
              ),
            ),
        );
        await supabase.from("events").update(payload).eq("id", editingItem.id);
      } else {
        const { data } = await supabase
          .from("events")
          .insert({
            ...payload,
            group_id: activeGroup.id,
            organizer: currentUser,
            rsvps: { going: [currentUser], maybe: [], declined: [] },
          })
          .select()
          .single();
        if (data) {
          setEvents((prev) =>
            [...prev, data].sort((a, b) =>
              `${a.event_date}${a.event_time}`.localeCompare(
                `${b.event_date}${b.event_time}`,
              ),
            ),
          );
        }
      }
    } else if (activeTab === "recommendations") {
      const payload = {
        title: formTitle,
        category: formCategory || "מומלץ",
        description: formDesc,
        location_or_phone: formExtra,
        expires_at: expiresIso,
      };
      if (editingItem) {
        setRecommendations((prev) =>
          prev.map((r) => (r.id === editingItem.id ? { ...r, ...payload } : r)),
        );
        await supabase
          .from("recommendations")
          .update(payload)
          .eq("id", editingItem.id);
      } else {
        const { data } = await supabase
          .from("recommendations")
          .insert({
            ...payload,
            group_id: activeGroup.id,
            author: currentUser,
            upvotes: [currentUser],
            emoji: "⭐",
          })
          .select()
          .single();
        if (data) setRecommendations((prev) => [data, ...prev]);
      }
    } else if (activeTab === "polls") {
      const parsedOptions = pollOptionsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text, idx) => ({ id: idx + 1, text, votes: [] }));

      const { data } = await supabase
        .from("polls")
        .insert({
          group_id: activeGroup.id,
          creator: currentUser,
          question: formTitle,
          options: parsedOptions,
          expires_at: expiresIso,
        })
        .select()
        .single();
      if (data) setPolls((prev) => [data, ...prev]);
    } else if (activeTab === "collections") {
      const cleanLink = formExtra.trim()
        ? formExtra.trim().startsWith("http")
          ? formExtra.trim()
          : `https://${formExtra.trim()}`
        : null;
      const payload = {
        title: formTitle,
        amount: parseFloat(formCategory) || 0,
        payment_link: cleanLink,
        due_date: formExpiresAt || null,
      };
      if (editingItem) {
        setCollections((prev) =>
          prev.map((c) => (c.id === editingItem.id ? { ...c, ...payload } : c)),
        );
        await supabase
          .from("collections")
          .update(payload)
          .eq("id", editingItem.id);
      } else {
        const { data } = await supabase
          .from("collections")
          .insert({
            ...payload,
            group_id: activeGroup.id,
            creator: currentUser,
            paid_users: [],
          })
          .select()
          .single();
        if (data) setCollections((prev) => [data, ...prev]);
      }
    } else if (activeTab === "contacts") {
      const payload = {
        name: formTitle,
        role: formCategory || "איש קשר",
        phone: formExtra,
        notes: formDesc,
      };
      if (editingItem) {
        setContacts((prev) =>
          prev.map((c) => (c.id === editingItem.id ? { ...c, ...payload } : c)),
        );
        await supabase
          .from("contacts")
          .update(payload)
          .eq("id", editingItem.id);
      } else {
        const { data } = await supabase
          .from("contacts")
          .insert({ ...payload, group_id: activeGroup.id })
          .select()
          .single();
        if (data) setContacts((prev) => [...prev, data]);
      }
    }

    setShowItemModal(false);
  }

  async function handleDeleteItem(table, id) {
    if (!window.confirm("למחוק את הפריט הזה?")) return;
    if (table === "announcements")
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    if (table === "exchange_items")
      setExchangeItems((prev) => prev.filter((i) => i.id !== id));
    if (table === "events")
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    if (table === "recommendations")
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    if (table === "polls") setPolls((prev) => prev.filter((p) => p.id !== id));
    if (table === "collections")
      setCollections((prev) => prev.filter((c) => c.id !== id));
    if (table === "contacts")
      setContacts((prev) => prev.filter((c) => c.id !== id));
    await supabase.from(table).delete().eq("id", id);
  }

  // --- Inline Checklist Add/Remove ---
  async function addInlineChecklistItem(event) {
    const text = (inlineItemInputs[event.id] || "").trim();
    if (!text) return;
    const newItem = { id: Date.now(), item: text, assignedTo: null };
    const updatedList = [...(event.checklist || []), newItem];

    setInlineItemInputs((prev) => ({ ...prev, [event.id]: "" }));
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id ? { ...ev, checklist: updatedList } : ev,
      ),
    );
    await supabase
      .from("events")
      .update({ checklist: updatedList })
      .eq("id", event.id);
  }

  async function removeInlineChecklistItem(event, itemId) {
    const updatedList = (event.checklist || []).filter((c) => c.id !== itemId);
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id ? { ...ev, checklist: updatedList } : ev,
      ),
    );
    await supabase
      .from("events")
      .update({ checklist: updatedList })
      .eq("id", event.id);
  }

  // --- Interactions ---
  async function handleVotePoll(poll, optionId) {
    const options = poll.options || [];
    const usesNestedVotes = options.some(
      (opt) => typeof opt === "object" && opt !== null && "votes" in opt,
    );

    if (usesNestedVotes) {
      const updatedOptions = options.map((opt, idx) => {
        const currentId = opt.id !== undefined ? opt.id : idx;
        const currentVotes = Array.isArray(opt.votes) ? opt.votes : [];
        const alreadyVotedThis = currentVotes.includes(currentUser);

        if (currentId === optionId) {
          return {
            ...opt,
            votes: alreadyVotedThis
              ? currentVotes.filter((u) => u !== currentUser)
              : [...currentVotes, currentUser],
          };
        }
        return {
          ...opt,
          votes: currentVotes.filter((u) => u !== currentUser),
        };
      });

      setPolls((prev) =>
        prev.map((p) =>
          p.id === poll.id ? { ...p, options: updatedOptions } : p,
        ),
      );
      await supabase
        .from("polls")
        .update({ options: updatedOptions })
        .eq("id", poll.id);
    } else {
      const votesMap = { ...(poll.votes || {}) };
      const targetVotes = Array.isArray(votesMap[optionId])
        ? votesMap[optionId]
        : [];
      const alreadyVotedThis = targetVotes.includes(currentUser);

      Object.keys(votesMap).forEach((key) => {
        if (Array.isArray(votesMap[key])) {
          votesMap[key] = votesMap[key].filter((u) => u !== currentUser);
        }
      });

      if (!alreadyVotedThis) {
        votesMap[optionId] = [...(votesMap[optionId] || []), currentUser];
      }

      setPolls((prev) =>
        prev.map((p) => (p.id === poll.id ? { ...p, votes: votesMap } : p)),
      );
      await supabase
        .from("polls")
        .update({ votes: votesMap })
        .eq("id", poll.id);
    }
  }

  async function toggleReserveItem(item) {
    const isReservedByMe =
      item.status === "RESERVED" && item.reserved_by === currentUser;
    const newStatus = isReservedByMe ? "AVAILABLE" : "RESERVED";
    const newReservedBy = isReservedByMe ? null : currentUser;

    setExchangeItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, status: newStatus, reserved_by: newReservedBy }
          : i,
      ),
    );
    await supabase
      .from("exchange_items")
      .update({ status: newStatus, reserved_by: newReservedBy })
      .eq("id", item.id);

    if (newStatus === "RESERVED") {
      const actionMsg =
        activeGroup?.type === "family"
          ? `${currentUser} קנה/ה את "${item.title}" ברשימת הקניות`
          : `${currentUser} ביקש/ה לשמור את "${item.title}"`;
      await sendTargetedNotification(item.owner_name, actionMsg);
    }
  }

  async function handleRsvp(event, statusKey) {
    const currentRsvps = event.rsvps || { going: [], maybe: [], declined: [] };
    const updatedRsvps = {
      going: (currentRsvps.going || []).filter((u) => u !== currentUser),
      maybe: (currentRsvps.maybe || []).filter((u) => u !== currentUser),
      declined: (currentRsvps.declined || []).filter((u) => u !== currentUser),
    };
    updatedRsvps[statusKey].push(currentUser);

    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id ? { ...ev, rsvps: updatedRsvps } : ev,
      ),
    );
    await supabase
      .from("events")
      .update({ rsvps: updatedRsvps })
      .eq("id", event.id);

    if (statusKey === "going") {
      await sendTargetedNotification(
        event.organizer,
        `${currentUser} אישר/ה הגעה ל"${event.title}"`,
      );
    }
  }

  async function toggleChecklistItem(event, itemId) {
    let takenItemName = "";
    const updatedList = (event.checklist || []).map((c) => {
      if (c.id === itemId) {
        const isTaking = c.assignedTo !== currentUser;
        if (isTaking) takenItemName = c.item;
        return { ...c, assignedTo: isTaking ? currentUser : null };
      }
      return c;
    });

    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id ? { ...ev, checklist: updatedList } : ev,
      ),
    );
    await supabase
      .from("events")
      .update({ checklist: updatedList })
      .eq("id", event.id);

    if (takenItemName) {
      await sendTargetedNotification(
        event.organizer,
        `${currentUser} התנדב/ה להביא "${takenItemName}" ל${event.title}`,
      );
    }
  }

  async function toggleUpvote(rec) {
    const currentUpvotes = rec.upvotes || [];
    const hasUpvoted = currentUpvotes.includes(currentUser);
    const updatedUpvotes = hasUpvoted
      ? currentUpvotes.filter((u) => u !== currentUser)
      : [...currentUpvotes, currentUser];

    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === rec.id ? { ...r, upvotes: updatedUpvotes } : r,
      ),
    );
    await supabase
      .from("recommendations")
      .update({ upvotes: updatedUpvotes })
      .eq("id", rec.id);

    if (!hasUpvoted) {
      await sendTargetedNotification(
        rec.author,
        `${currentUser} פרגן/ה להמלצה שלך: "${rec.title}"`,
      );
    }
  }

  async function sendEventReminder(ev) {
    const goingList = ev.rsvps?.going || [];
    if (goingList.length === 0) {
      alert("אין עדיין משתתפים שאישרו הגעה לאירוע זה.");
      return;
    }

    let sentCount = 0;
    for (const participant of goingList) {
      if (participant !== currentUser) {
        await sendTargetedNotification(
          participant,
          `🔔 תזכורת לקראת האירוע "${ev.title}" שמתקיים ב-${ev.date_str || ev.event_date}`,
        );
        sentCount++;
      }
    }
    alert(`נשלחה תזכורת שקטה ל-${sentCount} משתתפים שאישרו הגעה.`);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500">
        טוען מערכת...
      </div>
    );
  }

  if (!session) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans"
      >
        <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-xl border border-slate-200 space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Lock size={22} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 pt-2">
              קבוצות שקטות 🔕
            </h1>
            <p className="text-xs text-slate-500">
              {authMode === "forgot"
                ? "הזן את כתובת המייל שלך ונשלח לך קישור לאיפוס סיסמה"
                : "קהילה חכמה ללא חפירות וללא חשיפת מספר טלפון"}
            </p>
          </div>

          {authError && (
            <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200">
              {authError}
            </div>
          )}
          {authMessage && (
            <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl border border-emerald-200 flex items-start gap-2">
              <MailCheck size={16} className="shrink-0 mt-0.5" />
              <span>{authMessage}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {authMode === "signup" && (
              <>
                <input
                  type="text"
                  required
                  placeholder="השם שלך (למשל: ליאור)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="שיוך בקבוצה (למשל: דירה 8 / אבא / משפחת משיח)"
                  value={roleBadge}
                  onChange={(e) => setRoleBadge(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
              </>
            )}
            <input
              type="email"
              required
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2.5 rounded-xl text-sm"
            />
            {authMode !== "forgot" && (
              <input
                type="password"
                required
                minLength={6}
                placeholder="סיסמה (לפחות 6 תווים)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-sm"
              />
            )}

            {authMode === "login" && (
              <div className="text-left">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("forgot");
                    setAuthError("");
                    setAuthMessage("");
                  }}
                  className="text-[11px] text-slate-500 hover:text-indigo-600"
                >
                  שכחתי סיסמה?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
            >
              {authMode === "signup" && "צור חשבון והיכנס"}
              {authMode === "login" && "התחבר"}
              {authMode === "forgot" && "שלח קישור לאיפוס סיסמה"}
            </button>
          </form>

          <div className="text-center pt-2 border-t space-y-1">
            {authMode === "login" ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                  setAuthMessage("");
                }}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                משתמש חדש? לחץ כאן להרשמה מהירה
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setAuthMessage("");
                }}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                חזרה למסך התחברות
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const visibleEvents = filterByExpiration(events);
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

  const totalMembersCount =
    groupMembersList.length > 0
      ? groupMembersList.length
      : activeGroup?.members_count || 1;

  const activeGroupEnabledTabs = (() => {
    let tabs = activeGroup?.enabled_tabs;
    if (typeof tabs === "string") {
      try {
        tabs = JSON.parse(tabs);
      } catch (e) {
        tabs = null;
      }
    }
    return Array.isArray(tabs) && tabs.length > 0
      ? tabs
      : ALL_TABS_CONFIG.map((t) => t.id);
  })();

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-100 flex justify-center font-sans"
    >
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-xl flex flex-col justify-between border-x border-slate-200 relative">
        <div>
          {/* Header */}
          <header className="bg-indigo-600 text-white p-4 shadow-md sticky top-0 z-20">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={openProfileModal}
                  className="bg-indigo-700/80 hover:bg-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-indigo-400/30 transition"
                  title="לחץ לעריכת השם והשיוך שלך"
                >
                  <UserCog size={13} /> {currentUser}
                </button>
                {activeGroup && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isGroupAdmin
                        ? "bg-amber-400 text-slate-900 font-bold"
                        : "bg-indigo-700/50 text-indigo-200"
                    }`}
                  >
                    <ShieldCheck size={10} /> {isGroupAdmin ? "מנהל" : "חבר"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(!showNotifDropdown);
                      if (!showNotifDropdown && unreadCount > 0)
                        markAllNotifsRead();
                    }}
                    className="p-1.5 hover:bg-indigo-500 rounded-lg transition relative"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute left-0 mt-2 w-72 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-3 z-50">
                      <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <span className="font-bold text-xs text-slate-700">
                          🔔 התראות עבורך
                        </span>
                        <button
                          onClick={() => setShowNotifDropdown(false)}
                          className="text-xs text-slate-400"
                        >
                          סגור
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">
                          אין התראות חדשות. שקט תעשייתי! 🧘‍♂️
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className="text-xs p-2 rounded-xl bg-indigo-50/60 border border-indigo-100"
                            >
                              <p className="font-medium text-slate-800">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.created_at).toLocaleTimeString(
                                  "he-IL",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setJoinError("");
                    setShowJoinModal(true);
                  }}
                  className="text-xs bg-emerald-500/90 hover:bg-emerald-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 font-bold transition"
                >
                  <UserPlus size={13} /> הצטרף
                </button>

                <button
                  onClick={openNewGroupModal}
                  className="text-xs bg-white/15 hover:bg-white/25 px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition"
                >
                  <FolderPlus size={13} /> חדש
                </button>

                <button
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-indigo-500 rounded-lg text-indigo-200 hover:text-white"
                  title="התנתק"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>

            {/* Groups Selector */}
            {groups.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g)}
                    className={`min-w-35 flex-1 py-2 px-3 rounded-xl text-right transition border ${
                      activeGroup?.id === g.id
                        ? "bg-white text-indigo-900 font-bold border-white shadow-sm"
                        : "bg-indigo-700/50 text-indigo-100 border-indigo-500/40 hover:bg-indigo-700"
                    }`}
                  >
                    <div className="text-sm truncate">{g.name}</div>
                    <div className="text-[11px] opacity-75 truncate">
                      {g.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Invite Code, Members List & Admin Bar */}
            {activeGroup && (
              <div className="mt-2.5 pt-2 border-t border-indigo-500/40 flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={copyInviteCode}
                    className="flex items-center gap-1 bg-indigo-700/70 hover:bg-indigo-700 px-2 py-1 rounded-lg transition"
                    title="העתק קוד הזמנה"
                  >
                    <KeyRound size={11} className="text-amber-300" />
                    <span className="font-mono font-bold">
                      {activeGroup.invite_code}
                    </span>
                    <Copy size={10} className="opacity-75" />
                    {copiedCode && (
                      <span className="text-emerald-300 font-bold text-[10px]">
                        הועתק!
                      </span>
                    )}
                  </button>

                  <button
                    onClick={shareInviteWhatsApp}
                    className="flex items-center gap-1 bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-100 px-2 py-1 rounded-lg transition"
                    title="שתף קישור הזמנה בוואטסאפ"
                  >
                    <Share2 size={11} /> שתף
                  </button>

                  <button
                    onClick={openGroupMembersModal}
                    className="flex items-center gap-1 bg-indigo-700/70 hover:bg-indigo-700 px-2 py-1 rounded-lg transition"
                    title="צפה בחברי הקבוצה"
                  >
                    <Users size={11} className="text-indigo-200" /> חברים (
                    {totalMembersCount})
                  </button>
                </div>

                {isGroupAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={openEditGroupModal}
                      className="p-1 hover:bg-indigo-500 rounded-lg"
                      title="ערוך הגדרות קבוצה ולשוניות"
                    >
                      <Settings2 size={13} />
                    </button>
                    <button
                      onClick={handleDeleteGroup}
                      className="p-1 hover:bg-rose-500/80 rounded-lg"
                      title="מחק קבוצה"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </header>

          {!activeGroup ? (
            <div className="p-8 text-center space-y-4 mt-10">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
                <Users size={30} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                עדיין אינך חבר באף קבוצה
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                הצטרף לקבוצה קיימת באמצעות קוד הזמנה שקיבלת, או פתח קבוצה שקטה
                חדשה משלך.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus size={15} /> הצטרף עם קוד
                </button>
                <button
                  onClick={openNewGroupModal}
                  className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <FolderPlus size={15} /> פתח קבוצה חדשה
                </button>
              </div>
            </div>
          ) : (
            <main className="p-4 space-y-3 pb-24">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-800 text-base">
                    {activeTab === "announcements" && labels.announcementsTitle}
                    {activeTab === "exchange" && labels.exchangeTitle}
                    {activeTab === "events" && labels.eventsTitle}
                    {activeTab === "recommendations" &&
                      labels.recommendationsTitle}
                    {activeTab === "polls" && labels.pollsTitle}
                    {activeTab === "collections" && labels.collectionsTitle}
                    {activeTab === "contacts" && labels.contactsTitle}
                  </h2>
                  {[
                    "announcements",
                    "exchange",
                    "events",
                    "polls",
                    "recommendations",
                  ].includes(activeTab) && (
                    <button
                      onClick={() => setShowExpired(!showExpired)}
                      className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 border transition ${
                        showExpired
                          ? "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      <Archive size={11} />{" "}
                      {showExpired ? "מציג ארכיון" : "ארכיון"}
                    </button>
                  )}
                </div>

                {/*                 {((activeTab !== "announcements" &&
                  activeTab !== "contacts" &&
                  activeTab !== "collections" &&
                  activeTab !== "tasks") ||
                  isGroupAdmin) &&
                  activeTab !== "tasks" && (
                    <button
                      onClick={() => openCreateItemModal()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold shadow-sm transition"
                    >
                      <Plus size={15} /> הוסף חדש
                    </button>
                  )} */}
              </div>

              {/* 1. Announcements */}
              {activeTab === "announcements" && (
                <AnnouncementsView
                  announcements={announcements}
                  canManage={canManage}
                  isGroupAdmin={isGroupAdmin}
                  showExpired={showExpired}
                  formatHebrewDate={formatHebrewDate}
                  openCreateItemModal={openCreateItemModal}
                  openEditItemModal={openEditItemModal}
                  handleDeleteItem={handleDeleteItem}
                  // togglePinAnnouncement={togglePinAnnouncement}
                />
              )}

              {/* 2. Exchange / Shopping */}
              {activeTab === "exchange" && (
                <ExchangeView
                  exchangeItems={exchangeItems}
                  currentUser={currentUser}
                  canManage={canManage}
                  showExpired={showExpired}
                  formatHebrewDate={formatHebrewDate}
                  openCreateItemModal={openCreateItemModal}
                  openEditItemModal={openEditItemModal}
                  handleDeleteItem={handleDeleteItem}
                  toggleExchangeStatus={toggleExchangeStatus}
                />
              )}

              {/* 3. Events & Calendar */}
              {activeTab === "events" && (
                <EventsView
                  events={events}
                  activeGroup={activeGroup}
                  currentUser={currentUser}
                  groupMembersList={groupMembersList}
                  canManage={canManage}
                  showExpired={showExpired}
                  setShowExpired={setShowExpired}
                  formatHebrewDate={formatHebrewDate}
                  getGoogleCalendarUrl={getGoogleCalendarUrl}
                  downloadIcsFile={downloadIcsFile}
                  openCreateItemModal={openCreateItemModal}
                  openEditItemModal={openEditItemModal}
                  handleDeleteItem={handleDeleteItem}
                  handleRsvp={handleRsvp}
                  toggleChecklistItem={toggleChecklistItem}
                  addInlineChecklistItem={addInlineChecklistItem}
                  removeInlineChecklistItem={removeInlineChecklistItem}
                  inlineItemInputs={inlineItemInputs}
                  setInlineItemInputs={setInlineItemInputs}
                  sendEventReminder={sendEventReminder}
                />
              )}

              {/* 4. Polls */}
              {activeTab === "polls" && (
                <PollsView
                  polls={polls}
                  currentUser={currentUser}
                  canManage={canManage}
                  showExpired={showExpired}
                  setShowExpired={setShowExpired}
                  formatHebrewDate={formatHebrewDate}
                  openCreateItemModal={openCreateItemModal}
                  openEditItemModal={openEditItemModal}
                  handleDeleteItem={handleDeleteItem}
                  handleVotePoll={handleVotePoll}
                />
              )}

              {/* 5. Collections */}
              {activeTab === "collections" && (
                <CollectionsView
                  collections={collections}
                  activeGroup={activeGroup}
                  currentUser={currentUser}
                  userRoleBadge={profile?.role_badge || ""}
                  groupMembersList={groupMembersList}
                  canManage={canManage}
                  formatHebrewDate={formatHebrewDate}
                  onEditCollection={openEditItemModal}
                  onDeleteCollection={handleDeleteItem}
                  onToggleUnitPaid={toggleCollectionPaid}
                  onSendUnitReminder={sendCollectionReminder}
                />
              )}

              {/* 6. Recommendations */}
              {activeTab === "recommendations" && (
                <RecommendationsView
                  recommendations={recommendations}
                  currentUser={currentUser}
                  canManage={canManage}
                  showExpired={showExpired}
                  formatHebrewDate={formatHebrewDate}
                  openCreateItemModal={openCreateItemModal}
                  openEditItemModal={openEditItemModal}
                  handleDeleteItem={handleDeleteItem}
                />
              )}

              {/* 7. Contacts */}
              {activeTab === "contacts" && (
                <ContactsView
                  contacts={contacts}
                  currentUser={currentUser}
                  canManage={canManage}
                  openCreateItemModal={openCreateItemModal}
                  openEditItemModal={openEditItemModal}
                  handleDeleteItem={handleDeleteItem}
                />
              )}
              {/* 8. Tasks */}
              {activeTab === "tasks" && (
                <TasksView
                  activeGroup={activeGroup}
                  currentUser={currentUser}
                  displayName={profile?.display_name}
                  groupMembersList={groupMembersList}
                />
              )}
            </main>
          )}
        </div>

        {/* Group Members List Modal */}
        {showMembersModal && activeGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-sm p-5 rounded-2xl space-y-3 shadow-xl">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Users size={18} className="text-indigo-600" /> חברי הקבוצה (
                  {groupMembersList.length})
                </h3>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                🔒 פרטיות נשמרת: מספרי הטלפון וכתובות המייל של החברים מוסתרים.
              </p>

              {loadingMembers ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  טוען רשימת חברים...
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {groupMembersList.map((m) => {
                    const mName = m.profiles?.display_name || "חבר קבוצה";
                    const mBadge = m.profiles?.role_badge || "";
                    const isSelf = m.user_id === session?.user?.id;

                    return (
                      <div
                        key={m.id}
                        className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <span>{mName}</span>
                            {isSelf && (
                              <span className="text-[10px] text-indigo-600">
                                (את/ה)
                              </span>
                            )}
                          </div>
                          {mBadge && (
                            <div className="text-[11px] text-slate-500">
                              {mBadge}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              m.role === "admin"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {m.role === "admin" ? "מנהל" : "חבר"}
                          </span>

                          {isGroupAdmin && !isSelf && (
                            <>
                              <button
                                onClick={() => toggleMemberRole(m)}
                                className="p-1 text-slate-400 hover:text-indigo-600"
                                title={
                                  m.role === "admin"
                                    ? "הורד לחבר רגיל"
                                    : "מנה למנהל קבוצה"
                                }
                              >
                                <UserCheck size={14} />
                              </button>
                              <button
                                onClick={() => removeMemberFromGroup(m)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                                title="הסר מהקבוצה"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowMembersModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold"
              >
                סגור
              </button>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handleSaveProfile}
              className="bg-white w-full max-w-sm p-5 rounded-2xl space-y-3 shadow-xl"
            >
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <UserCog size={20} className="text-indigo-600" /> עריכת פרופיל
                אישי
              </h3>
              <div>
                <label className="text-xs font-bold text-slate-600">
                  שם תצוגה
                </label>
                <input
                  type="text"
                  required
                  value={editProfileName}
                  onChange={(e) => setEditProfileName(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">
                  שיוך / תפקיד (למשל: דירה 8 או אבא)
                </label>
                <input
                  type="text"
                  value={editProfileBadge}
                  onChange={(e) => setEditProfileBadge(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold"
                >
                  שמור שינויים
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Reset Modal */}
        {showResetPasswordModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handleUpdateNewPassword}
              className="bg-white w-full max-w-sm p-5 rounded-2xl space-y-3 shadow-xl"
            >
              <h3 className="font-bold text-slate-800 text-lg">
                🔐 הגדרת סיסמה חדשה
              </h3>
              <p className="text-xs text-slate-500">
                הזן סיסמה חדשה לחשבון שלך (לפחות 6 תווים):
              </p>
              <input
                type="password"
                required
                minLength={6}
                placeholder="סיסמה חדשה"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-sm"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold"
              >
                עדכן סיסמה והיכנס
              </button>
            </form>
          </div>
        )}

        {/* Join Group Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handleJoinByCode}
              className="bg-white w-full max-w-sm p-5 rounded-2xl space-y-3 shadow-xl"
            >
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <KeyRound size={20} className="text-emerald-600" /> הצטרפות
                לקבוצה קיימת
              </h3>
              {joinError && (
                <div className="bg-rose-50 text-rose-700 text-xs p-2.5 rounded-xl border border-rose-200">
                  {joinError}
                </div>
              )}
              <input
                type="text"
                required
                placeholder="QG-XXXXXX"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full border p-3 rounded-xl text-center font-mono text-base tracking-widest uppercase"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold"
                >
                  הצטרף
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create/Edit Item Modal (with Real-time Autocomplete from DB) */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handleSaveItem}
              className="bg-white w-full max-w-sm p-5 rounded-2xl space-y-3 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-bold text-slate-800 text-lg">
                {editingItem
                  ? "עריכת פריט"
                  : activeTab === "polls"
                    ? activeGroup?.type === "family"
                      ? "בקשה / הצבעה חדשה בבית"
                      : "יצירת סקר חדש"
                    : activeTab === "events"
                      ? "אירוע חדש ביומן"
                      : activeTab === "collections"
                        ? "בקשת גבייה חדשה"
                        : "הוספת פריט חדש"}
              </h3>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={
                    activeTab === "polls"
                      ? labels.pollsQuestionPlaceholder
                      : activeTab === "exchange"
                        ? labels.exchangeItemPlaceholder
                        : activeTab === "collections"
                          ? "מטרת הגבייה (למשל: מתנת סוף שנה לגננת)"
                          : activeTab === "contacts"
                            ? "שם איש הקשר"
                            : activeTab === "events"
                              ? "שם האירוע / הטיול"
                              : "כותרת"
                  }
                  value={formTitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormTitle(val);
                    if (activeTab === "exchange") {
                      searchRealProducts(val);
                    }
                  }}
                  className="w-full border p-2.5 rounded-xl text-sm"
                  autoComplete="off"
                />

                {activeTab === "exchange" &&
                  filteredCatalogSuggestions.length > 0 && (
                    <div className="absolute top-full inset-x-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 z-30 max-h-48 overflow-y-auto">
                      {filteredCatalogSuggestions.map((prod, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormTitle(prod.name);
                            const summary = prod.allOffers
                              .slice(0, 3)
                              .map((o) => `${o.chain}: ${o.price.toFixed(2)} ₪`)
                              .join(" | ");
                            setFormDesc(summary);
                            setFilteredCatalogSuggestions([]);
                          }}
                          className="w-full text-right px-3 py-2 text-xs hover:bg-indigo-50 flex justify-between items-center border-b border-slate-100 last:border-none gap-2"
                        >
                          <span className="font-bold text-slate-800 truncate">
                            {prod.name}
                          </span>
                          <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md shrink-0">
                            החל מ-{prod.cheapestPrice.toFixed(2)} ₪ (
                            {prod.cheapestChain})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {activeTab === "collections" ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      סכום לגבייה ממשתתף (בש״ח)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="50"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full border p-2.5 rounded-xl text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      קישור לקבוצת Bit או PayBox (אופציונלי)
                    </label>
                    <input
                      type="text"
                      placeholder="https://payboxapp.page.link/..."
                      value={formExtra}
                      onChange={(e) => setFormExtra(e.target.value)}
                      className="w-full border p-2.5 rounded-xl text-sm mt-1 text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      תאריך יעד לתשלום (אופציונלי)
                    </label>
                    <input
                      type="date"
                      value={formExpiresAt}
                      onChange={(e) => setFormExpiresAt(e.target.value)}
                      className="w-full border p-2 rounded-xl text-xs mt-1"
                    />
                  </div>
                </>
              ) : activeTab === "polls" ? (
                <div>
                  <label className="text-xs font-bold text-slate-600">
                    אפשרויות לבחירה (כל אפשרות בשורה נפרדת):
                  </label>
                  <textarea
                    required
                    value={pollOptionsText}
                    onChange={(e) => setPollOptionsText(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-sm mt-1"
                    rows={4}
                  />
                </div>
              ) : activeTab === "events" ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">
                        תאריך האירוע
                      </label>
                      <input
                        type="date"
                        required
                        value={formCategory}
                        onChange={(e) => {
                          setFormCategory(e.target.value);
                          if (!editingItem) setFormExpiresAt(e.target.value);
                        }}
                        className="w-full border p-2 rounded-xl text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">
                        שעת התחלה
                      </label>
                      <input
                        type="time"
                        required
                        value={formEventTime}
                        onChange={(e) => setFormEventTime(e.target.value)}
                        className="w-full border p-2 rounded-xl text-xs mt-1"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="מיקום המפגש"
                    value={formExtra}
                    onChange={(e) => setFormExtra(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                  <textarea
                    placeholder="פרטים נוספים על הטיול / האירוע..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-sm"
                    rows={2}
                  />

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700">
                      רשימת ציוד וכיבוד לאירוע:
                    </label>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {formChecklist.map((chk) => (
                        <div
                          key={chk.id}
                          className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border"
                        >
                          <span>{chk.item}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormChecklist(
                                formChecklist.filter((c) => c.id !== chk.id),
                              )
                            }
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="הוסף פריט לרשימה..."
                        value={newChecklistInput}
                        onChange={(e) => setNewChecklistInput(e.target.value)}
                        className="flex-1 border bg-white px-2 py-1.5 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newChecklistInput.trim()) return;
                          setFormChecklist([
                            ...formChecklist,
                            {
                              id: Date.now(),
                              item: newChecklistInput.trim(),
                              assignedTo: null,
                            },
                          ]);
                          setNewChecklistInput("");
                        }}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                      >
                        + הוסף
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder={
                      activeTab === "announcements"
                        ? labels.announcementsRolePlaceholder
                        : activeTab === "exchange"
                          ? labels.exchangeCatPlaceholder
                          : activeTab === "contacts"
                            ? labels.contactsRolePlaceholder
                            : "קטגוריה"
                    }
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                  {(activeTab === "recommendations" ||
                    activeTab === "contacts") && (
                    <input
                      type="text"
                      required={activeTab === "contacts"}
                      placeholder={
                        activeTab === "contacts"
                          ? "מספר טלפון (למשל: 050-1234567)"
                          : "טלפון או מיקום"
                      }
                      value={formExtra}
                      onChange={(e) => setFormExtra(e.target.value)}
                      className="w-full border p-2.5 rounded-xl text-sm"
                    />
                  )}
                  <textarea
                    placeholder={
                      activeTab === "exchange"
                        ? labels.exchangeDescPlaceholder
                        : "תיאור / הערות..."
                    }
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-sm"
                    rows={2}
                  />
                </>
              )}

              {[
                "announcements",
                "exchange",
                "events",
                "polls",
                "recommendations",
              ].includes(activeTab) && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock size={13} className="text-indigo-600" /> טיימר תפוגה
                    (הסתרה אוטומטית מהלוח)
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setQuickExpiryDays(3)}
                      className="text-[11px] bg-white border px-2 py-1 rounded-lg"
                    >
                      3 ימים
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickExpiryDays(7)}
                      className="text-[11px] bg-white border px-2 py-1 rounded-lg"
                    >
                      שבוע
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickExpiryDays(30)}
                      className="text-[11px] bg-white border px-2 py-1 rounded-lg font-semibold text-indigo-700"
                    >
                      חודש (30 יום)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickExpiryDays(null)}
                      className="text-[11px] bg-white border px-2 py-1 rounded-lg text-slate-500"
                    >
                      ללא
                    </button>
                  </div>
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="w-full border bg-white p-1.5 rounded-lg text-xs"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold"
                >
                  שמור
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Group Modal */}
        {/* Group Modal (Reorder & Toggle Tabs) */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handleSaveGroup}
              className="bg-white w-full max-w-sm p-5 rounded-2xl space-y-3 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 text-lg">
                  {editingGroup
                    ? "עריכת קבוצה והתאמת לשוניות"
                    : "פתיחת קבוצה חדשה"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">
                  שם הקבוצה
                </label>
                <input
                  type="text"
                  required
                  placeholder="למשל: משפחת משיח"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">
                  סוג קבוצה
                </label>
                <select
                  value={groupType}
                  onChange={(e) => handleGroupTypeChange(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm bg-white mt-1"
                >
                  <option value="building">🏢 בניין מגורים</option>
                  <option value="kindergarten">🧸 גן / בית ספר</option>
                  <option value="family">🏠 משפחה (קניות, בקשות, יומן)</option>
                  <option value="general">👥 קהילה / צוות עבודה</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">
                  תיאור קצר
                </label>
                <input
                  type="text"
                  placeholder="למשל: הבית שלנו"
                  value={groupSubtitle}
                  onChange={(e) => setGroupSubtitle(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm mt-1"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                {/* הוספת לשוניות כבויות - מופיע למעלה כדי שתמיד יהיה גלוי */}
                {ALL_TABS_CONFIG.filter((t) => !groupEnabledTabs.includes(t.id))
                  .length > 0 && (
                  <div className="pb-2.5 border-b border-slate-200">
                    <span className="text-[11px] font-bold text-indigo-700 block mb-1.5">
                      + הוסף לשוניות כבויות לקבוצה:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_TABS_CONFIG.filter(
                        (t) => !groupEnabledTabs.includes(t.id),
                      ).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            setGroupEnabledTabs([...groupEnabledTabs, t.id])
                          }
                          className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition"
                        >
                          <Plus size={12} /> {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <label className="text-xs font-bold text-slate-700 block">
                  סדר הלשוניות הפעילות ({groupEnabledTabs.length}):
                </label>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {groupEnabledTabs.map((tabId, index) => {
                    const t = ALL_TABS_CONFIG.find((item) => item.id === tabId);
                    if (!t) return null;
                    const TabIcon = t.icon;
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200 shadow-sm"
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          <TabIcon size={14} className="text-indigo-600" />{" "}
                          {t.label}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const newTabs = [...groupEnabledTabs];
                              const temp = newTabs[index];
                              newTabs[index] = newTabs[index - 1];
                              newTabs[index - 1] = temp;
                              setGroupEnabledTabs(newTabs);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-30 transition font-bold"
                            title="הזז קדימה"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={index === groupEnabledTabs.length - 1}
                            onClick={() => {
                              const newTabs = [...groupEnabledTabs];
                              const temp = newTabs[index];
                              newTabs[index] = newTabs[index + 1];
                              newTabs[index + 1] = temp;
                              setGroupEnabledTabs(newTabs);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-30 transition font-bold"
                            title="הזז אחורה"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (groupEnabledTabs.length === 1) {
                                alert(
                                  "חייבת להישאר לפחות לשונית אחת פעילה בקבוצה.",
                                );
                                return;
                              }
                              setGroupEnabledTabs(
                                groupEnabledTabs.filter((id) => id !== t.id),
                              );
                            }}
                            className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition"
                            title="הסתר לשונית"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold"
                >
                  שמור שינויים
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bottom Navigation */}
        {activeGroup && (
          <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 flex justify-around py-2 px-0.5 z-20">
            {ALL_TABS_CONFIG.filter((tab) =>
              activeGroupEnabledTabs.includes(tab.id),
            ).map((tab) => {
              const Icon =
                tab.id === "exchange" && activeGroup.type === "family"
                  ? ShoppingCart
                  : tab.id === "polls" && activeGroup.type === "family"
                    ? Utensils
                    : tab.icon;

              const badgeCount = getTabBadgeCount(tab.id);
              const active = activeTab === tab.id;
              const dynamicLabel =
                tab.id === "announcements"
                  ? labels.announcementsNav
                  : tab.id === "exchange"
                    ? labels.exchangeNav
                    : tab.id === "events"
                      ? "יומן"
                      : tab.id === "polls"
                        ? labels.pollsNav
                        : tab.id === "collections"
                          ? "גבייה"
                          : tab.id === "recommendations"
                            ? "המלצות"
                            : tab.id === "tasks"
                              ? "משימות"
                              : "טלפונים";

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center py-1 px-1 rounded-xl transition relative ${
                    active
                      ? "text-indigo-600 font-bold"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <div className="relative">
                    <Icon size={17} />
                    {badgeCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-sm">
                        {badgeCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] mt-1">{dynamicLabel}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
