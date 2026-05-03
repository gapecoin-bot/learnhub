import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { student_id } = await req.json();

    if (!student_id) {
      return NextResponse.json({ error: 'Missing student_id' }, { status: 400 });
    }

    // ── Null out linked_student_id in enrolment_requests first ──
    await supabase
      .from('enrolment_requests')
      .update({ linked_student_id: null })
      .eq('linked_student_id', student_id);

    // ── Delete enrolments ──
    await supabase.from('enrolments').delete().eq('student_id', student_id);

    // ── Delete submissions ──
    await supabase.from('submissions').delete().eq('student_id', student_id);

    // ── Delete certificates ──
    await supabase.from('certificates').delete().eq('student_id', student_id);

    // ── Delete login logs ──
    await supabase.from('login_logs').delete().eq('user_id', student_id);

    // ── Delete profile ──
    const { error: profileErr } = await supabase
      .from('profiles')
      .delete()
      .eq('id', student_id);

    if (profileErr) {
      console.error('Profile delete error:', profileErr.message);
      return NextResponse.json({ error: `Failed to delete profile: ${profileErr.message}` }, { status: 500 });
    }

    // ── Delete auth user ──
    const { error: authErr } = await supabase.auth.admin.deleteUser(student_id);
    if (authErr) {
      console.error('Auth delete error (non-fatal):', authErr.message);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Delete student error:', err);
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}