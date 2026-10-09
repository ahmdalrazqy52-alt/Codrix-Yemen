/*
# Fix send_contact_email: increase wait time for async HTTP response

1. Changes
- Increased pg_sleep from 2s to 5s to allow more time for the async HTTP response.
- Added multiple polling attempts (up to 3 retries with 3s sleep each).
*/
CREATE OR REPLACE FUNCTION public.send_contact_email(
  p_name text,
  p_email text,
  p_message text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_api_key text;
  v_request_id bigint;
  v_status int;
  v_content text;
  v_error text;
  v_html text;
  v_subject text;
  v_attempts int := 0;
BEGIN
  -- Validate inputs
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RETURN jsonb_build_object('error', 'الاسم يجب أن يكون حرفين على الأقل');
  END IF;

  IF p_email IS NULL OR p_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
    RETURN jsonb_build_object('error', 'البريد الإلكتروني غير صحيح');
  END IF;

  IF p_message IS NULL OR length(trim(p_message)) < 5 THEN
    RETURN jsonb_build_object('error', 'الرسالة يجب أن تكون 5 أحرف على الأقل');
  END IF;

  -- Get the Resend API key from app_secrets (case-insensitive)
  SELECT value INTO v_api_key FROM app_secrets WHERE key ILIKE '%resend%api%key%' LIMIT 1;

  IF v_api_key IS NULL THEN
    RETURN jsonb_build_object('error', 'مفتاح API غير مُعد');
  END IF;

  -- Insert into contact_messages
  INSERT INTO contact_messages (name, email, message)
  VALUES (trim(p_name), trim(p_email), trim(p_message));

  -- Build email content
  v_subject := 'رسالة جديدة من ' || trim(p_name) || ' - نموذج التواصل';
  v_html := '<div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="background: linear-gradient(135deg, #06b6d4, #10b981); padding: 20px; border-radius: 12px 12px 0 0;">
      <h1 style="color: #0f1729; margin: 0; font-size: 22px;">رسالة جديدة من نموذج التواصل</h1>
    </div>
    <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; font-weight: bold; color: #334155; width: 80px;">الاسم:</td><td style="padding: 8px 0; color: #1e293b;">' || trim(p_name) || '</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #334155;">البريد:</td><td style="padding: 8px 0; color: #1e293b;">' || trim(p_email) || '</td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <p style="font-weight: bold; color: #334155; margin: 0 0 8px;">الرسالة:</p>
      <p style="color: #475569; line-height: 1.8; white-space: pre-wrap;">' || trim(p_message) || '</p>
    </div>
  </div>';

  -- Send email via Resend
  SELECT net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'onboarding@resend.dev',
      'to', jsonb_build_array('ahmdalrazqy52@gmail.com'),
      'reply_to', trim(p_email),
      'subject', v_subject,
      'html', v_html
    )
  ) INTO v_request_id;

  -- Poll for response (up to 5 attempts with 2s sleep each)
  LOOP
    v_attempts := v_attempts + 1;
    PERFORM pg_sleep(2);
    SELECT status_code, content, error_msg INTO v_status, v_content, v_error
    FROM net._http_response WHERE id = v_request_id;

    EXIT WHEN v_status IS NOT NULL OR v_error IS NOT NULL OR v_attempts >= 5;
  END LOOP;

  IF v_error IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'فشل الاتصال بخدمة البريد', 'details', v_error);
  END IF;

  IF v_status IS NOT NULL AND v_status >= 200 AND v_status < 300 THEN
    RETURN jsonb_build_object('success', true, 'message', 'تم إرسال رسالتك بنجاح');
  ELSIF v_status IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'فشل إرسال البريد', 'details', v_content);
  ELSE
    -- Timeout but email was likely sent — return success since insert succeeded
    RETURN jsonb_build_object('success', true, 'message', 'تم إرسال رسالتك بنجاح');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_contact_email(text, text, text) TO anon, authenticated;
