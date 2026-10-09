import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "إعدادات Supabase الخاصة بالخادم غير متوفرة."
      );
    }

    /*
     * Client باستخدام Service Role
     */
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * الحصول على المستخدم الحالي
     */
    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "غير مصرح.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const token =
      authHeader.replace(
        /^Bearer\s+/i,
        ""
      );

    /*
     * التحقق من التوكن
     */
    const {
      data: {
        user: currentUser,
      },
      error: userError,
    } =
      await adminClient.auth.getUser(
        token
      );

    if (
      userError ||
      !currentUser
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "انتهت جلسة تسجيل الدخول أو أن الجلسة غير صالحة.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /*
     * التأكد أن المستخدم هو المالك
     */
    const { data: owner } =
      await adminClient
        .from("admin_users")
        .select(
          "user_id, role, active"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .eq("role", "owner")
        .eq("active", true)
        .maybeSingle();

    if (!owner) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "هذه العملية متاحة للمالك فقط.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const body =
      await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email && !password) {
      throw new Error(
        "لم يتم إرسال أي بيانات لتغييرها."
      );
    }

    /*
     * التحقق من البريد
     */
    if (email) {
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        throw new Error(
          "البريد الإلكتروني غير صحيح."
        );
      }

      /*
       * التأكد أن البريد ليس مستخدماً
       * من حساب Auth آخر
       */
      const {
        data: existingUsers,
      } =
        await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

      const duplicate =
        existingUsers?.users?.find(
          (user) =>
            user.id !==
              currentUser.id &&
            user.email?.toLowerCase() ===
              email
        );

      if (duplicate) {
        throw new Error(
          "هذا البريد الإلكتروني مستخدم بالفعل."
        );
      }
    }

    /*
     * التحقق من كلمة المرور الجديدة
     */
    if (
      password &&
      password.length < 6
    ) {
      throw new Error(
        "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
      );
    }

    /*
     * تحديث الحساب الحقيقي داخل auth.users
     */
    const updateData: {
      email?: string;
      password?: string;
      email_confirm?: boolean;
    } = {};

    if (email) {
      updateData.email = email;

      /*
       * تأكيد البريد مباشرة.
       * إذا كنت تريد إرسال رسالة تأكيد
       * بدلاً من ذلك، يمكن إزالة هذا السطر.
       */
      updateData.email_confirm = true;
    }

    if (password) {
      updateData.password =
        password;
    }

    const {
      data: updatedUser,
      error: updateError,
    } =
      await adminClient.auth.admin.updateUserById(
        currentUser.id,
        updateData
      );

    if (updateError) {
      throw new Error(
        updateError.message
      );
    }

    /*
     * إذا تغير البريد، نسجل آخر بريد
     * في profile إن كان هناك عمود email.
     *
     * لا نفشل العملية إذا لم يوجد العمود.
     */
    if (email) {
      try {
        await adminClient
          .from("admin_profiles")
          .update({
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "user_id",
            currentUser.id
          );
      } catch {
        // Auth هو المصدر الأساسي للبريد.
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id:
          updatedUser.user?.id ||
          currentUser.id,
        email:
          updatedUser.user?.email ||
          email ||
          currentUser.email,
        changed_email: Boolean(email),
        changed_password:
          Boolean(password),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحديث بيانات الدخول.",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});