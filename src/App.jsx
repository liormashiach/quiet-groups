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
        .map((row) => ({ ...row.groups, myRole: row.role }));
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
    const [annRes, exRes, evRes, recRes, pollRes, contactRes, colRes] =
      await Promise.all([
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
      ]);

    setAnnouncements(annRes.data || []);
    setExchangeItems(exRes.data || []);
    setEvents(evRes.data || []);
    setRecommendations(recRes.data || []);
    setPolls(pollRes.data || []);
    setContacts(contactRes.data || []);
    setCollections(colRes.data || []);
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
  async function toggleCollectionPaid(col) {
    const paidList = col.paid_users || [];
    const hasPaid = paidList.includes(currentUser);
    const updatedList = hasPaid
      ? paidList.filter((u) => u !== currentUser)
      : [...paidList, currentUser];

    setCollections((prev) =>
      prev.map((c) =>
        c.id === col.id ? { ...c, paid_users: updatedList } : c,
      ),
    );
    await supabase
      .from("collections")
      .update({ paid_users: updatedList })
      .eq("id", col.id);

    if (!hasPaid) {
      await sendTargetedNotification(
        col.creator,
        `💳 ${currentUser} סימן/ה שהעביר/ה תשלום (${col.amount} ₪) עבור "${col.title}"`,
      );
    }
  }

  async function sendCollectionReminder(col) {
    const paidList = col.paid_users || [];
    const unpaidMembers = groupMembersList.filter((m) => {
      const label = m.profiles
        ? `${m.profiles.display_name}${m.profiles.role_badge ? ` (${m.profiles.role_badge})` : ""}`
        : "";
      return label && label !== currentUser && !paidList.includes(label);
    });

    if (unpaidMembers.length === 0) {
      alert("כל חברי הקבוצה כבר סימנו ששילמו! 🎉");
      return;
    }

    for (const m of unpaidMembers) {
      const recipientLabel = `${m.profiles.display_name}${m.profiles.role_badge ? ` (${m.profiles.role_badge})` : ""}`;
      await sendTargetedNotification(
        recipientLabel,
        `💳 תזכורת שקטה: טרם סומן תשלום (${col.amount} ₪) עבור "${col.title}"`,
      );
    }
    alert(`נשלחה תזכורת שקטה ל-${unpaidMembers.length} חברים שטרם שילמו.`);
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
      if (newType === "family") {
        setGroupEnabledTabs([
          "announcements",
          "exchange",
          "events",
          "polls",
          "recommendations",
        ]);
      } else {
        setGroupEnabledTabs(ALL_TABS_CONFIG.map((t) => t.id));
      }
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

    if (editingGroup) {
      const { data } = await supabase
        .from("groups")
        .update({
          name: groupName,
          type: groupType,
          subtitle: groupSubtitle,
          enabled_tabs: groupEnabledTabs,
        })
        .eq("id", editingGroup.id)
        .select()
        .single();
      if (data) {
        const updated = { ...data, myRole: editingGroup.myRole };
        setGroups((prev) => prev.map((g) => (g.id === data.id ? updated : g)));
        setActiveGroup(updated);
      }
    } else {
      const newCode = generateInviteCode();
      const { data: createdGroup } = await supabase
        .from("groups")
        .insert({
          name: groupName,
          type: groupType,
          subtitle: groupSubtitle || "קבוצה שקטה חדשה",
          members_count: 1,
          invite_code: newCode,
          enabled_tabs: groupEnabledTabs,
        })
        .select()
        .single();

      if (createdGroup) {
        await supabase.from("group_members").insert({
          group_id: createdGroup.id,
          user_id: session.user.id,
          role: "admin",
        });
        const groupWithRole = { ...createdGroup, myRole: "admin" };
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
    const updatedOptions = (poll.options || []).map((opt) => {
      const filteredVotes = (opt.votes || []).filter((u) => u !== currentUser);
      if (opt.id === optionId) {
        const alreadyVotedThis = (opt.votes || []).includes(currentUser);
        return {
          ...opt,
          votes: alreadyVotedThis
            ? filteredVotes
            : [...filteredVotes, currentUser],
        };
      }
      return { ...opt, votes: filteredVotes };
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

  const totalMembersCount = Math.max(
    groupMembersList.length,
    activeGroup?.members_count || 1,
  );
  const activeGroupEnabledTabs =
    activeGroup?.enabled_tabs || ALL_TABS_CONFIG.map((t) => t.id);

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

                {((activeTab !== "announcements" &&
                  activeTab !== "contacts" &&
                  activeTab !== "collections") ||
                  isGroupAdmin) && (
                  <button
                    onClick={() => openCreateItemModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold shadow-sm transition"
                  >
                    <Plus size={15} /> הוסף חדש
                  </button>
                )}
              </div>

              {/* 1. Announcements */}
              {activeTab === "announcements" && (
                <div className="space-y-3">
                  {filterByExpiration(announcements).map((a) => {
                    const ttl = formatTimeRemaining(a.expires_at);
                    return (
                      <div
                        key={a.id}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-indigo-600 font-semibold">
                              {a.author} • {a.role}
                            </span>
                            {ttl && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${
                                  ttl.urgent || ttl.expired
                                    ? "bg-rose-50 text-rose-700 font-bold"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                <Clock size={10} /> {ttl.text}
                              </span>
                            )}
                          </div>
                          {canManage(a.author) && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <button
                                onClick={() => openEditItemModal(a)}
                                className="p-1 hover:text-indigo-600"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteItem("announcements", a.id)
                                }
                                className="p-1 hover:text-rose-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-800 text-base mb-1">
                          {a.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {a.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. Exchange / Shopping List */}
              {activeTab === "exchange" && (
                <div className="space-y-3">
                  {filterByExpiration(exchangeItems).map((item) => {
                    const isReserved = item.status === "RESERVED";
                    const isMine = item.reserved_by === currentUser;
                    const ttl = formatTimeRemaining(item.expires_at);

                    return (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center gap-2"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl bg-slate-100 p-2.5 rounded-2xl">
                            {item.emoji || labels.exchangeEmoji}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                {item.category}
                              </span>
                              {ttl && (
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    ttl.urgent || ttl.expired
                                      ? "bg-rose-50 text-rose-700 font-bold"
                                      : "bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  <Clock size={10} /> {ttl.text}
                                </span>
                              )}
                              {canManage(item.owner_name) && (
                                <>
                                  <button
                                    onClick={() => openEditItemModal(item)}
                                    className="text-slate-400 hover:text-indigo-600"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteItem(
                                        "exchange_items",
                                        item.id,
                                      )
                                    }
                                    className="text-slate-400 hover:text-rose-600"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                            <h3
                              className={`font-bold mt-1 ${isReserved && activeGroup?.type === "family" ? "line-through text-slate-400" : "text-slate-800"}`}
                            >
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              נוסף ע״י {item.owner_name} • {item.condition}
                            </p>

                            {ttl?.canExtend && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleExtendItemExpiry("exchange_items", item)
                                }
                                className="mt-1.5 text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1 transition"
                              >
                                <RotateCcw size={11} /> הארך בחודש (+30 יום)
                              </button>
                            )}

                            {isReserved && (
                              <span className="block mt-1.5 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium w-fit">
                                {labels.exchangeStatusBadge} {item.reserved_by}
                              </span>
                            )}
                          </div>
                        </div>

                        {(!isReserved || isMine) && (
                          <button
                            onClick={() => toggleReserveItem(item)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                              isMine
                                ? "bg-slate-200 text-slate-700"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                          >
                            {isMine
                              ? labels.exchangeUndoBtn
                              : labels.exchangeActionBtn}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. Events & Calendar */}
              {activeTab === "events" && (
                <div className="space-y-4">
                  <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <button
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
                            onClick={() => setSelectedDateFilter(null)}
                            className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold"
                          >
                            הצג הכל ({visibleEvents.length})
                          </button>
                        )}
                      </div>
                      <button
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
                            onClick={() =>
                              setSelectedDateFilter(
                                isSelected ? null : cell.iso,
                              )
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
                        onClick={() => openCreateItemModal(selectedDateFilter)}
                        className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1"
                      >
                        <Plus size={12} /> אירוע נוסף ביום זה
                      </button>
                    </div>
                  )}

                  {displayedEvents.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
                      <p className="text-xs text-slate-500">
                        אין אירועים מתוכננים בתאריך זה.
                      </p>
                      <button
                        onClick={() => openCreateItemModal(selectedDateFilter)}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        + הוסף אירוע לתאריך {selectedDateFilter}
                      </button>
                    </div>
                  ) : (
                    displayedEvents.map((ev) => {
                      const goingList = ev.rsvps?.going || [];
                      const isGoing = goingList.includes(currentUser);
                      const ttl = formatTimeRemaining(ev.expires_at);
                      const displayDate = ev.event_date
                        ? formatHebrewDate(ev.event_date, ev.event_time)
                        : ev.date_str;

                      return (
                        <div
                          key={ev.id}
                          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-indigo-600 font-bold">
                                  {displayDate}
                                </span>
                                {ttl && (
                                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                    <Clock size={10} /> {ttl.text}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-lg text-slate-800 mt-0.5">
                                {ev.title}
                              </h3>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={13} /> {ev.location} • מארגן:{" "}
                                {ev.organizer}
                              </p>
                            </div>
                            {canManage(ev.organizer) && (
                              <div className="flex items-center gap-1 text-slate-400">
                                <button
                                  onClick={() => openEditItemModal(ev)}
                                  className="p-1 hover:text-indigo-600"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteItem("events", ev.id)
                                  }
                                  className="p-1 hover:text-rose-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-slate-600">
                            {ev.description}
                          </p>

                          <div className="flex gap-2">
                            <a
                              href={getGoogleCalendarUrl(ev)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 py-1.5 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                            >
                              <CalendarPlus
                                size={13}
                                className="text-indigo-600"
                              />{" "}
                              יומן Google
                            </a>
                            <button
                              type="button"
                              onClick={() => downloadIcsFile(ev)}
                              className="flex-1 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 py-1.5 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                            >
                              <Download size={13} className="text-indigo-600" />{" "}
                              יומן Apple (.ics)
                            </button>
                          </div>

                          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border">
                            <span className="text-xs font-medium text-slate-700">
                              ✅ {goingList.length} משתתפים מגיעים
                            </span>
                            <button
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
                                      onClick={() =>
                                        removeInlineChecklistItem(ev, c.id)
                                      }
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
                                  onClick={() => toggleChecklistItem(ev, c.id)}
                                  className={`px-2 py-1 rounded text-[11px] font-semibold ${
                                    c.assignedTo
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-indigo-50 text-indigo-700"
                                  }`}
                                >
                                  {c.assignedTo
                                    ? `מביא/ה: ${c.assignedTo}`
                                    : "+ עליי!"}
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
              )}

              {/* 4. Polls / Family Requests */}
              {activeTab === "polls" && (
                <div className="space-y-3">
                  {filterByExpiration(polls).map((poll) => {
                    const totalVotes = (poll.options || []).reduce(
                      (sum, o) => sum + (o.votes?.length || 0),
                      0,
                    );
                    const ttl = formatTimeRemaining(poll.expires_at);

                    return (
                      <div
                        key={poll.id}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-indigo-600 font-semibold">
                                נפתח ע״י {poll.creator}
                              </span>
                              {ttl && (
                                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock size={10} /> {ttl.text}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-slate-800 text-base mt-1">
                              {poll.question}
                            </h3>
                          </div>
                          {canManage(poll.creator) && (
                            <button
                              onClick={() => handleDeleteItem("polls", poll.id)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {(poll.options || []).map((opt) => {
                            const votesCount = opt.votes?.length || 0;
                            const pct =
                              totalVotes > 0
                                ? Math.round((votesCount / totalVotes) * 100)
                                : 0;
                            const isSelected = (opt.votes || []).includes(
                              currentUser,
                            );

                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleVotePoll(poll, opt.id)}
                                className={`w-full text-right p-2.5 rounded-xl border transition relative overflow-hidden ${
                                  isSelected
                                    ? "border-indigo-600 bg-indigo-50/40 font-bold"
                                    : "border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                <div
                                  className="absolute inset-y-0 right-0 bg-indigo-100/60 transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                                <div className="relative flex justify-between items-center text-xs">
                                  <span className="flex items-center gap-1.5 text-slate-800">
                                    {isSelected && (
                                      <Check
                                        size={14}
                                        className="text-indigo-600"
                                      />
                                    )}{" "}
                                    {opt.text}
                                  </span>
                                  <span className="text-slate-500 font-semibold">
                                    {pct}% ({votesCount})
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          סה״כ {totalVotes} בחירות • לחיצה מצביעה מיד ללא הודעות
                          מיותרות
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 5. Collections */}
              {activeTab === "collections" && (
                <div className="space-y-3">
                  {collections.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
                      <Wallet size={28} className="mx-auto text-slate-400" />
                      <p className="text-xs text-slate-500">
                        אין כרגע בקשות גבייה פעילות בקבוצה.
                      </p>
                    </div>
                  ) : (
                    collections.map((col) => {
                      const paidList = col.paid_users || [];
                      const isPaidByMe = paidList.includes(currentUser);
                      const progressPct = Math.min(
                        100,
                        Math.round((paidList.length / totalMembersCount) * 100),
                      );
                      const totalCollected =
                        paidList.length * (Number(col.amount) || 0);

                      return (
                        <div
                          key={col.id}
                          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-lg">
                                  {col.amount} ₪ למשתתף
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
                                  onClick={() => openEditItemModal(col)}
                                  className="p-1 hover:text-indigo-600"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteItem("collections", col.id)
                                  }
                                  className="p-1 hover:text-rose-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                              <span>
                                שילמו {paidList.length} מתוך {totalMembersCount}{" "}
                                חברים
                              </span>
                              <span className="text-emerald-700">
                                נאספו {totalCollected} ₪
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            {col.payment_link && (
                              <a
                                href={col.payment_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                              >
                                <ExternalLink size={14} /> לתשלום ב-Bit / PayBox
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => toggleCollectionPaid(col)}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                                isPaidByMe
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-300"
                              }`}
                            >
                              <Check size={14} />{" "}
                              {isPaidByMe ? "שולם! (בטל)" : "העברתי תשלום"}
                            </button>
                          </div>

                          {canManage(col.creator) && (
                            <div className="pt-2.5 border-t border-slate-100 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-600">
                                  מעקב מנהל (מוסתר משאר הקבוצה):
                                </span>
                                <button
                                  type="button"
                                  onClick={() => sendCollectionReminder(col)}
                                  className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                                >
                                  <Bell size={11} /> שלח תזכורת שקטה
                                </button>
                              </div>
                              {paidList.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {paidList.map((u) => (
                                    <span
                                      key={u}
                                      className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium"
                                    >
                                      ✓ {u}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 6. Recommendations */}
              {activeTab === "recommendations" && (
                <div className="space-y-3">
                  {filterByExpiration(recommendations).map((rec) => {
                    const upvotes = rec.upvotes || [];
                    const hasLiked = upvotes.includes(currentUser);
                    const ttl = formatTimeRemaining(rec.expires_at);

                    return (
                      <div
                        key={rec.id}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {rec.emoji || "⭐"}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                                  {rec.category}
                                </span>
                                {ttl && (
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                      ttl.urgent || ttl.expired
                                        ? "bg-rose-50 text-rose-700 font-bold"
                                        : "bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    <Clock size={10} /> {ttl.text}
                                  </span>
                                )}
                                {canManage(rec.author) && (
                                  <>
                                    <button
                                      onClick={() => openEditItemModal(rec)}
                                      className="text-slate-400 hover:text-indigo-600"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteItem(
                                          "recommendations",
                                          rec.id,
                                        )
                                      }
                                      className="text-slate-400 hover:text-rose-600"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                              <h3 className="font-bold text-slate-800 mt-0.5">
                                {rec.title}
                              </h3>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleUpvote(rec)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                              hasLiked
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            <ThumbsUp size={13} /> {upvotes.length}
                          </button>
                        </div>
                        <p className="text-sm text-slate-600">
                          {rec.description}
                        </p>

                        {ttl?.canExtend && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleExtendItemExpiry("recommendations", rec)
                              }
                              className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1 transition"
                            >
                              <RotateCcw size={11} /> הארך תוקף בחודש (+30 יום)
                            </button>
                          </div>
                        )}

                        <div className="text-xs text-slate-400 pt-1 border-t flex justify-between">
                          <span>הומלץ ע״י {rec.author}</span>
                          {rec.location_or_phone && (
                            <span className="text-indigo-600 font-medium">
                              {rec.location_or_phone}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 7. Contacts */}
              {activeTab === "contacts" && (
                <div className="space-y-2.5">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-sm">
                            {c.name}
                          </h3>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {c.role}
                          </span>
                        </div>
                        {c.notes && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {c.notes}
                          </p>
                        )}
                        <p className="text-xs font-mono text-indigo-600 mt-1">
                          {c.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isGroupAdmin && (
                          <>
                            <button
                              onClick={() => openEditItemModal(c)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("contacts", c.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        <a
                          href={`tel:${c.phone}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-sm transition"
                          title="חיוג מהיר"
                        >
                          <Phone size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
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
        {showGroupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handleSaveGroup}
              className="bg-white w-full max-w-sm p-5 rounded-2xl space-y-3 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-bold text-slate-800 text-lg">
                {editingGroup
                  ? "עריכת קבוצה והתאמת לשוניות"
                  : "פתיחת קבוצה חדשה"}
              </h3>

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

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  לשוניות פעילות בקבוצה זו:
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {ALL_TABS_CONFIG.map((t) => {
                    const isChecked = groupEnabledTabs.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1 hover:bg-white rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGroupEnabledTabs([...groupEnabledTabs, t.id]);
                            } else {
                              if (groupEnabledTabs.length === 1) {
                                alert(
                                  "חייבת להישאר לפחות לשונית אחת פעילה בקבוצה.",
                                );
                                return;
                              }
                              setGroupEnabledTabs(
                                groupEnabledTabs.filter((id) => id !== t.id),
                              );
                            }
                          }}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                        />
                        <span>{t.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold"
                >
                  שמור
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm"
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
                            : "טלפונים";

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center py-1 px-1 rounded-xl transition ${
                    active
                      ? "text-indigo-600 font-bold"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon size={17} />
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
