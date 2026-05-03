import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sendEmail = async (type, to, data) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, data }),
    });
  } catch (err) {
    console.error('Email send failed (non-fatal):', err.message);
  }
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { request_id } = body;

    if (!request_id) {
      return NextResponse.json({ error: 'Missing request_id' }, { status: 400 });
    }

    // ── Fetch enrolment request ──
    const { data: enrolReq, error: reqErr } = await supabase
      .from('enrolment_requests')
      .select('*, course:courses(title)')
      .eq('id', request_id)
      .single();

    if (reqErr || !enrolReq) {
      return NextResponse.json({ error: 'Enrolment request not found' }, { status: 404 });
    }

    // ── Find the linked student profile ──
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('email', enrolReq.email.toLowerCase())
      .maybeSingle();

    if (profile) {
      // ── Suspend all enrolments for this student ──
      await supabase
        .from('enrolments')
        .update({ is_active: false, status: 'suspended' })
        .eq('student_id', profile.id);

      // ── Ban the auth user so they can't log in ──
      await supabase.auth.admin.updateUserById(profile.id, {
        ban_duration: '876600h', // 100 years = effectively permanent
      });

      // ── Send suspended email ──
      await sendEmail('suspended', enrolReq.email, {
        firstName: profile.first_name,
        courseTitle: enrolReq.course?.title || 'your course',
      });
    }

    // ── Reset enrolment request to pending ──
    await supabase
      .from('enrolment_requests')
      .update({
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        generated_student_id: null,
        linked_student_id: null,
      })
      .eq('id', request_id);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Recall error:', err);
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}