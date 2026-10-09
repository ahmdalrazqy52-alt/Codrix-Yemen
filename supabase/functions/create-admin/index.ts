import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return json(
        { error: "إعدادات Supabase الخاصة بالخادم غير مكتملة" },
        500
      );
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return json({ error: "غير مصرح" }, 401);
    }

    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user: caller },
      error: callerError,
    } = await adminClient.auth.getUser(token);

    if (callerError || !caller) {
      return json({ error: "جلسة الدخول غير صالحة" }, 401);
    }

    const { data: callerAdmin, error: roleError } =
      await adminClient
        .from("admin_users")
        .select("role, active")
        .eq("user_id", caller.id)
        .maybeSingle();

    if (
      roleError ||
      !callerAdmin ||
      !callerAdmin.active ||
      callerAdmin.role !== "owner"
    ) {
      return json(
        { error: "ليس لديك صلاحية لإضافة مدير" },
        403
      );
    }

    const body = await req.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!email || !email.includes("@")) {
      return json({ error: "البريد الإلكتروني غير صحيح" }, 400);
    }

    if (password.length < 6) {
      return json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        400
      );
    }

    // إنشاء مستخدم Auth بالطريقة الرسمية
    const {
      data: created,
      error: createError,
    } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return json(
        { error: createError.message },
        400
      );
    }

    if (!created.user) {
      return json(
        { error: "تعذر إنشاء حساب المدير" },
        500
      );
    }

    const newUserId = created.user.id;

    // إضافة المدير
    const { error: adminInsertError } =
      await adminClient
        .from("admin_users")
        .insert({
          user_id: newUserId,
          role: "admin",
          active: true,
        });

    if (adminInsertError) {
      await adminClient.auth.admin.deleteUser(newUserId);

      return json(
        { error: adminInsertError.message },
        400
      );
    }

    // إنشاء الملف الشخصي
    const { error: profileError } =
      await adminClient
        .from("admin_profiles")
        .upsert({
          user_id: newUserId,
          display_name: email.split("@")[0],
          updated_at: new Date().toISOString(),
        });

    if (profileError) {
      // لا نحذف المدير هنا لأن إنشاء الحساب والصلاحية نجحا.
      console.error(profileError);
    }

    return json({
      success: true,
      user_id: newUserId,
      message: "تم إنشاء المدير بنجاح",
    });

  } catch (error) {
    console.error(error);

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ غير متوقع",
      },
      500
    );
  }
});