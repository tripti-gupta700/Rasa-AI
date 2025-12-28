import {
  ChatRequest,
  TranslateRequest,
  TranslateResponse,
  VisionResponse,
  DailyTipData,
  Message,
  Recipe,
  User
} from "../types";
import { API_BASE_URL } from "../constants";

/* ======================================================
   AUTH (USER / CONSULTANT)
====================================================== */
export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function signup(payload: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function consultantSignup(payload: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/consultant/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Consultant signup failed");
  return res.json();
}

/* ======================================================
   USER / CONSULTANT PROFILE
====================================================== */
export async function updateUserProfile(
  userId: string,
  profile: any
): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile)
  });

  if (!res.ok) throw new Error("Failed to update user profile");
  return res.json();
}

export async function updateConsultantProfile(
  userId: string,
  profile: any
): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/consultants/${userId}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile)
  });

  if (!res.ok) throw new Error("Failed to update consultant profile");
  return res.json();
}

/* ======================================================
   CONSULTANT DASHBOARD
====================================================== */
export async function getPatientsForConsultant(
  consultantId: string
): Promise<User[]> {
  const res = await fetch(
    `${API_BASE_URL}/consultants/${consultantId}/patients`
  );

  if (!res.ok) return [];
  return res.json();
}

export async function getConsultationHistory(
  consultantId: string
): Promise<any[]> {
  const res = await fetch(
    `${API_BASE_URL}/consultants/${consultantId}/consultations`
  );

  if (!res.ok) return [];
  return res.json();
}

export async function getBillingHistory(
  consultantId: string
): Promise<any[]> {
  const res = await fetch(
    `${API_BASE_URL}/consultants/${consultantId}/billing`
  );

  if (!res.ok) return [];
  return res.json();
}

/* ======================================================
   CHAT (Streaming – HuggingFace LLM)
====================================================== */
export async function generateAiStream(
  message: string,
  user: User,
  onChunk: (chunk: string) => void
) {
  const res = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, userId: user.id })
  });

  if (!res.body) throw new Error("No stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

/* ---------- CLEAR CHAT HISTORY ---------- */
export async function clearChatHistory(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/chat/history/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to clear chat history: ${msg}`);
  }
}

/* ======================================================
   TRANSLATION
====================================================== */
export async function translateText(
  text: string,
  target: "hi" | "en"
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target } satisfies TranslateRequest)
  });

  if (!res.ok) throw new Error("Translation failed");

  const data: TranslateResponse = await res.json();
  return data.translated;
}

/* ======================================================
   DAILY TIP
====================================================== */
export async function generateDailyTip(
  lang: string
): Promise<DailyTipData> {
  const res = await fetch(`${API_BASE_URL}/daily-tip?lang=${lang}`);
  if (!res.ok) throw new Error("Failed to fetch daily tip");
  return res.json();
}

/* ======================================================
   SEASONAL WISDOM
====================================================== */
export async function generateSeasonalWisdom(
  season: string,
  lang: string
): Promise<string> {
  const res = await fetch(
    `${API_BASE_URL}/seasonal-wisdom?season=${season}&lang=${lang}`
  );

  if (!res.ok) throw new Error("Failed to fetch seasonal wisdom");

  const data = await res.json();
  return data.wisdom;
}

/* ======================================================
   VISION
====================================================== */
export async function analyzeSymptomImage(
  base64: string,
  mime: string,
  prompt: string,
  lang: string
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/vision/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, mime, prompt, lang })
  });

  if (!res.ok) throw new Error("Vision analysis failed");

  const data: VisionResponse = await res.json();
  return data.caption;
}

/* ======================================================
   CHAT HISTORY STORAGE
====================================================== */
export async function getChatHistory(
  userId: string
): Promise<Message[]> {
  const res = await fetch(`${API_BASE_URL}/chat/history/${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function saveMessage(
  userId: string,
  message: Message
) {
  await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, message })
  });
}

export async function saveCompleteAIMessage(
  userId: string,
  messageId: number,
  text: string,
  lang: string
) {
  await fetch(`${API_BASE_URL}/chat/message/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, messageId, text, lang })
  });
}

export async function saveRecipeMessage(
  userId: string,
  messageId: number,
  recipes: Recipe[]
) {
  await fetch(`${API_BASE_URL}/chat/message/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, messageId, recipes })
  });
}
