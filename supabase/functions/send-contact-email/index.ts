const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_RECIPIENT_EMAIL = "ahmdalrazqy52@gmail.com";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isContactPayload(data: unknown): data is ContactPayload {
  if (typeof data !== "object" || data === null) return false;
  const value = data as Record<string, unknown>;
  return (
    typeof value.name === "string" && value.name.trim().length >= 2 &&
    typeof value.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email) &&
    typeof value.message === "string" && value.message.trim().length >= 5
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method === "GET") {
    return json({ status: "ok" }, 200);
  }

  if (req.method !== "POST") {
    return json({ error: "الطريقة غير مدعومة" }, 405);
  }

  try {
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return json({ error: "صيغة الطلب غير صحيحة" }, 400);
    }

    if (!isContactPayload(payload)) {
      return json({ error: "البيانات غير مكتملة أو غير صحيحة" }, 422);
    }

    const name = payload.name.trim();
    const email = payload.email.trim();
    const message = payload.message.trim();
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "خدمة التواصل غير متاحة حالياً" }, 503);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: settingsRow } = await supabase.from("site_content").select("content").eq("section", "settings").maybeSingle();
    const configuredRecipient = settingsRow?.content && typeof settingsRow.content === "object" && "contactRecipientEmail" in settingsRow.content ? String((settingsRow.content as Record<string, unknown>).contactRecipientEmail || "") : "";
    const recipientEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredRecipient) ? configuredRecipient : DEFAULT_RECIPIENT_EMAIL;
    const { data: secret, error: secretError } = await supabase
      .from("app_secrets")
      .select("value")
      .eq("key", "RESEND_API_KEY")
      .maybeSingle();

    if (secretError || !secret?.value) {
      console.error("Resend secret lookup failed:", secretError);
      return json({ error: "خدمة البريد غير مُعدة حالياً" }, 503);
    }

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({ name, email, message });

    if (insertError) {
      console.error("Contact message insert failed:", insertError);
      return json({ error: "تعذر حفظ الرسالة حالياً" }, 500);
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [recipientEmail],
        reply_to: email,
        subject: `رسالة جديدة من ${name} - نموذج التواصل`,
        html: `
          <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: linear-gradient(135deg, #06b6d4, #10b981); padding: 20px; border-radius: 12px 12px 0 0;">
              <h1 style="color: #0f1729; margin: 0; font-size: 22px;">رسالة جديدة من نموذج التواصل</h1>
            </div>
            <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p><strong>الاسم:</strong> ${escapeHtml(name)}</p>
              <p><strong>البريد:</strong> ${escapeHtml(email)}</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
              <p><strong>الرسالة:</strong></p>
              <p style="color: #475569; line-height: 1.8; white-space: pre-wrap;">${escapeHtml(message)}</p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const details = await emailResponse.text();
      console.error("Resend API error:", emailResponse.status, details);
      return json({ error: "تم حفظ الرسالة لكن تعذر إرسال البريد حالياً" }, 502);
    }

    return json({ success: true, message: "تم إرسال رسالتك بنجاح" }, 200);
  } catch (error) {
    console.error("Unexpected contact error:", error);
    return json({ error: "حدث خطأ غير متوقع" }, 500);
  }
});
