import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Loader2, Mail, ShieldCheck, Check, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FileUpload } from './FileUpload';

type AdminUser = {
  user_id: string;
  role: string;
  active: boolean;
  created_at: string;
  email: string;
  display_name: string;
  avatar_url: string;
};

export function AdminManager({ userId, isOwner, onLog }: {
  userId: string;
  isOwner: boolean;
  onLog: (action: string, targetId: string, desc: string) => void;
}) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Profile state
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Credentials state
  const [newCredentialEmail, setNewCredentialEmail] = useState('');
  const [newCredentialPassword, setNewCredentialPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    const { data: adminRows } = await supabase.from('admin_users').select('*').order('created_at');
    if (!adminRows) { setLoading(false); return; }

    const enriched: AdminUser[] = [];
    for (const a of adminRows) {
      const { data: profile } = await supabase.from('admin_profiles').select('display_name, avatar_url').eq('user_id', a.user_id).maybeSingle();
      let email = '';
      try {
        const { data: rpcData } = await supabase.rpc('get_admin_email', { p_user_id: a.user_id });
        email = (rpcData as string) || '';
      } catch { email = ''; }
      enriched.push({
        user_id: a.user_id,
        role: a.role,
        active: a.active,
        created_at: a.created_at,
        email,
        display_name: profile?.display_name || '',
        avatar_url: profile?.avatar_url || '',
      });
    }
    setAdmins(enriched);
    const me = enriched.find((a) => a.user_id === userId);
    if (me) {
      setProfileName(me.display_name);
      setProfileAvatar(me.avatar_url);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { void loadAdmins(); }, [loadAdmins]);

  const addAdmin = async () => {
  setBusy(true);
  setError('');
  setNotice('');

  try {
    const email = newEmail.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      throw new Error('أدخل بريدًا إلكترونيًا صحيحًا.');
    }

    if (newPassword.length < 6) {
      throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
    }

    const { data, error } = await supabase.functions.invoke(
      'create-admin',
      {
        body: {
          email,
          password: newPassword,
        },
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.success) {
      throw new Error(
        data?.error || 'تعذر إنشاء المدير.'
      );
    }

    onLog(
      'create',
      'admin',
      `إضافة مدير جديد: ${email}`
    );

    setNotice('تم إضافة المدير بنجاح.');
    setNewEmail('');
    setNewPassword('');

    await loadAdmins();

  } catch (e) {
    setError(
      e instanceof Error
        ? e.message
        : 'حدث خطأ أثناء تنفيذ العملية.'
    );
  } finally {
    setBusy(false);

    setTimeout(() => {
      setNotice('');
    }, 4000);
  }
};

  const saveProfile = async () => {
    setSavingProfile(true);
    await supabase.from('admin_profiles').upsert({
      user_id: userId,
      display_name: profileName,
      avatar_url: profileAvatar,
      updated_at: new Date().toISOString(),
    });
    onLog('update', 'profile', 'تحديث الملف الشخصي');
    setSavingProfile(false);
    setNotice('تم حفظ الملف الشخصي.');
    void loadAdmins();
    setTimeout(() => setNotice(''), 3000);
  };

const changeEmail = async () => {
  const email =
    newCredentialEmail.trim().toLowerCase();

  if (!email) {
    setError(
      'أدخل البريد الإلكتروني الجديد.'
    );
    return;
  }

  if (!email.includes('@')) {
    setError(
      'أدخل بريدًا إلكترونيًا صحيحًا.'
    );
    return;
  }

  setSavingCreds(true);
  setError('');
  setNotice('');

  try {
    const {
      data,
      error,
    } = await supabase.functions.invoke(
      'update-owner-credentials',
      {
        body: {
          email,
        },
      }
    );

    if (error) {
      throw new Error(
        error.message
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.error ||
          'تعذر تغيير البريد الإلكتروني.'
      );
    }

    setNotice(
      'تم تغيير البريد الإلكتروني فعليًا في حساب الدخول.'
    );

    setNewCredentialEmail('');

    onLog(
      'update',
      'profile',
      `تغيير البريد الإلكتروني إلى ${email}`
    );

    await loadAdmins();

  } catch (e) {
    setError(
      e instanceof Error
        ? e.message
        : 'حدث خطأ أثناء تغيير البريد الإلكتروني.'
    );
  } finally {
    setSavingCreds(false);

    setTimeout(
      () => setNotice(''),
      4000
    );
  }
};
  const changePassword = async () => {
  if (!currentPassword) {
    setError(
      'أدخل كلمة المرور الحالية.'
    );
    return;
  }

  if (!newCredentialPassword) {
    setError(
      'أدخل كلمة المرور الجديدة.'
    );
    return;
  }

  if (
    newCredentialPassword.length < 6
  ) {
    setError(
      'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.'
    );
    return;
  }

  if (
    currentPassword ===
    newCredentialPassword
  ) {
    setError(
      'كلمة المرور الجديدة يجب أن تختلف عن الحالية.'
    );
    return;
  }

  setSavingCreds(true);
  setError('');
  setNotice('');

  try {
    /*
     * أولاً نتحقق فعليًا من كلمة المرور الحالية.
     */
    const {
      data: authData,
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !authData.user?.email
    ) {
      throw new Error(
        'تعذر التحقق من الحساب الحالي.'
      );
    }

    const email =
      authData.user.email;

    const {
      error: verifyError,
    } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password:
            currentPassword,
        }
      );

    if (verifyError) {
      throw new Error(
        'كلمة المرور الحالية غير صحيحة.'
      );
    }

    /*
     * الآن نغير كلمة المرور الحقيقية
     * في auth.users.
     */
    const {
      data,
      error,
    } =
      await supabase.functions.invoke(
        'update-owner-credentials',
        {
          body: {
            password:
              newCredentialPassword,
          },
        }
      );

    if (error) {
      throw new Error(
        error.message
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.error ||
          'تعذر تغيير كلمة المرور.'
      );
    }

    setNotice(
      'تم تغيير كلمة المرور فعليًا في حساب الدخول.'
    );

    setNewCredentialPassword('');
    setCurrentPassword('');

    onLog(
      'update',
      'profile',
      'تغيير كلمة المرور'
    );

  } catch (e) {
    setError(
      e instanceof Error
        ? e.message
        : 'حدث خطأ أثناء تغيير كلمة المرور.'
    );
  } finally {
    setSavingCreds(false);

    setTimeout(
      () => setNotice(''),
      4000
    );
  }
};
  const deactivateAdmin = async (id: string) => {
    if (id === userId) return;
    setError(''); setNotice('');
    try {
      const { error: rpcError } = await supabase.rpc('remove_admin', { p_user_id: id });
      if (rpcError) throw rpcError;
      onLog('delete', id, 'تعطيل مدير');
      setNotice('تم حذف/تعطيل المدير بنجاح.');
      await loadAdmins();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر حذف المدير.');
    }
    setTimeout(() => { setNotice(''); setError(''); }, 3500);
  };

  const inputCls = 'w-full rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 dark:border-ink-700 dark:bg-ink-950 dark:text-white';

  return (
    <div className="space-y-6">
      {notice && <div className="flex items-center gap-2 rounded-xl border border-mint-500/20 bg-mint-500/10 px-4 py-3 text-sm font-semibold text-mint-700 dark:text-mint-300"><Check className="h-4 w-4" />{notice}</div>}
      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">{error}</div>}

      {/* Profile */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <h3 className="mb-4 text-lg font-extrabold">ملفي الشخصي</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">الاسم</span>
            <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className={inputCls} placeholder="اسمك" />
          </label>
          <FileUpload label="الصورة الشخصية" value={profileAvatar} onChange={setProfileAvatar} accept="image/*" folder="avatars" />
        </div>
        <button onClick={() => void saveProfile()} disabled={savingProfile} className="mt-4 flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-ink-950 disabled:opacity-60">
          {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {savingProfile ? 'جارٍ الحفظ...' : 'حفظ الملف الشخصي'}
        </button>
      </div>

      {/* Credentials */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <h3 className="mb-4 text-lg font-extrabold">بيانات تسجيل الدخول</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">بريد إلكتروني جديد</span>
            <input value={newCredentialEmail} onChange={(e) => setNewCredentialEmail(e.target.value)} type="email" dir="ltr" className={inputCls} placeholder="new@example.com" />
          </label>
          <div />
          <button onClick={() => void changeEmail()} disabled={savingCreds || !newCredentialEmail} className="rounded-xl bg-ink-100 px-5 py-2.5 text-sm font-bold text-ink-700 disabled:opacity-60 dark:bg-ink-800 dark:text-ink-200">تغيير البريد</button>
          <div />
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">كلمة المرور الحالية</span>
            <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" dir="ltr" className={inputCls} placeholder="للتأكد من هويتك" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">كلمة مرور جديدة</span>
            <input value={newCredentialPassword} onChange={(e) => setNewCredentialPassword(e.target.value)} type="password" dir="ltr" minLength={6} className={inputCls} placeholder="6 أحرف على الأقل" />
          </label>
          <button onClick={() => void changePassword()} disabled={savingCreds || !currentPassword || !newCredentialPassword} className="rounded-xl bg-ink-100 px-5 py-2.5 text-sm font-bold text-ink-700 disabled:opacity-60 dark:bg-ink-800 dark:text-ink-200">تغيير كلمة المرور</button>
        </div>
      </div>

      {/* Add admin (owner only) */}
      {isOwner && (
        <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold"><UserPlus className="h-5 w-5 text-accent-500" />إضافة مدير جديد</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">البريد الإلكتروني</span>
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" dir="ltr" className={inputCls} placeholder="admin@example.com" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">كلمة المرور الافتراضية</span>
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" dir="ltr" minLength={6} className={inputCls} placeholder="6 أحرف على الأقل" />
            </label>
          </div>
          <button onClick={() => void addAdmin()} disabled={busy || !newEmail || !newPassword} className="mt-4 flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-ink-950 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {busy ? 'جارٍ الإضافة...' : 'إضافة المدير'}
          </button>
        </div>
      )}

      {/* Admins list */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <h3 className="mb-4 text-lg font-extrabold">قائمة المدراء</h3>
        {loading ? (
          <div className="py-6 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-400" /></div>
        ) : (
          <div className="space-y-3">
            {admins.map((a) => (
              <div key={a.user_id} className="flex items-center gap-4 rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-500/10">
                  {a.avatar_url ? <img src={a.avatar_url} alt="" className="h-full w-full object-cover" /> : <ShieldCheck className="h-5 w-5 text-accent-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate">{a.display_name || a.email || 'مدير'}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.role === 'owner' ? 'bg-accent-500/15 text-accent-600 dark:text-accent-300' : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400'}`}>{a.role === 'owner' ? 'مالك' : 'مدير'}</span>
                    {!a.active && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">غير مفعّل</span>}
                  </div>
                  {a.email && <div className="mt-0.5 flex items-center gap-1 text-xs text-ink-500 dark:text-ink-400"><Mail className="h-3 w-3" />{a.email}</div>}
                </div>
                {a.user_id !== userId && isOwner && a.active && a.role === 'admin' && (
                  <button onClick={() => void deactivateAdmin(a.user_id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
