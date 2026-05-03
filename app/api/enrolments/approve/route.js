import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const generateSchoolId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'LH-';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const generateUsername = (schoolId) => `${schoolId}@learnifyacademylwm.co.uk`;

const generatePassword = () => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const getRandom = (str) => str.charAt(Math.floor(Math.random() * str.length));
  let pass = [
    getRandom(lower), getRandom(lower),
    getRandom(upper), getRandom(upper), getRandom(upper),
    getRandom(digits), getRandom(digits), getRandom(digits),
  ];
  for (let i = pass.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pass[i], pass[j]] = [pass[j], pass[i]];
  }
  return pass.join('');
};

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

// ─── POST /api/enrolments/approve ────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();
    const { request_id, approved_by } = body;

    if (!request_id || !approved_by) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Fetch enrolment request ──
    const { data: enrolReq, error: reqErr } = await supabase
      .from('enrolment_requests')
      .select('*')
      .eq('id', request_id)
      .single();
    if (reqErr || !enrolReq) {
      return NextResponse.json({ error: 'Enrolment request not found' }, { status: 404 });
    }

    // ── Fetch course ──
    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', enrolReq.course_id)
      .single();

    // ── Split name ──
    const nameParts = enrolReq.full_name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    let authUserId = null;
    let isExistingUser = false;
    let finalSchoolId = null;
    let finalUsername = null;
    let finalPassword = null;

    // ── Check if profile already exists by personal email ──
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role, student_id, username')
      .eq('email', enrolReq.email.toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      // ── Re-approval — unban and reactivate ──
      isExistingUser = true;
      authUserId = existingProfile.id;
      finalSchoolId = existingProfile.student_id;
      finalUsername = existingProfile.username;

      // ── Unban the auth user ──
      await supabase.auth.admin.updateUserById(authUserId, {
        ban_duration: 'none',
      });

      // ── Fix username if missing ──
      if (!finalUsername && finalSchoolId) {
        finalUsername = generateUsername(finalSchoolId);
        await supabase.from('profiles')
          .update({ username: finalUsername })
          .eq('id', authUserId);
      }

      // ── Reactivate enrolment ──
      const { data: existingEnrol } = await supabase
        .from('enrolments')
        .select('id')
        .eq('student_id', authUserId)
        .eq('course_id', enrolReq.course_id)
        .maybeSingle();

      if (existingEnrol) {
        await supabase.from('enrolments').update({
          is_active: true,
          status: 'active',
          verified_by: approved_by,
          verified_at: new Date().toISOString(),
        }).eq('id', existingEnrol.id);
      } else {
        await supabase.from('enrolments').insert({
          student_id: authUserId,
          course_id: enrolReq.course_id,
          is_active: true,
          status: 'active',
          progress: 0,
          enrolled_at: new Date().toISOString(),
          verified_by: approved_by,
          verified_at: new Date().toISOString(),
        });
      }

    } else {
      // ── New student — generate credentials ──
      finalSchoolId = generateSchoolId();
      finalUsername = generateUsername(finalSchoolId);
      finalPassword = generatePassword();

      // ── Step 1: Create auth user with USERNAME as login email ──
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: finalUsername,
        password: finalPassword,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName, role: 'student' },
      });
      if (authErr) {
        return NextResponse.json({ error: `Failed to create auth user: ${authErr.message}` }, { status: 500 });
      }
      authUserId = authData.user.id;

      // ── Step 2: Create profile ──
      const { error: profileErr } = await supabase.from('profiles').insert({
        id: authUserId,
        first_name: firstName,
        last_name: lastName,
        email: enrolReq.email.toLowerCase(),
        username: finalUsername,
        phone: enrolReq.phone || null,
        dob: enrolReq.dob || null,
        address: enrolReq.address || null,
        role: 'student',
        student_id: finalSchoolId,
      });

      if (profileErr) {
        if (profileErr.code === '23505') {
          await supabase.from('profiles').update({
            first_name: firstName,
            last_name: lastName,
            email: enrolReq.email.toLowerCase(),
            username: finalUsername,
            phone: enrolReq.phone || null,
            dob: enrolReq.dob || null,
            address: enrolReq.address || null,
            role: 'student',
            student_id: finalSchoolId,
          }).eq('id', authUserId);
        } else {
          await supabase.auth.admin.deleteUser(authUserId);
          return NextResponse.json({ error: `Failed to create profile: ${profileErr.message}` }, { status: 500 });
        }
      }

      // ── Step 3: Create enrolment ──
      await supabase.from('enrolments').insert({
        student_id: authUserId,
        course_id: enrolReq.course_id,
        is_active: true,
        status: 'active',
        progress: 0,
        enrolled_at: new Date().toISOString(),
        verified_by: approved_by,
        verified_at: new Date().toISOString(),
      });
    }

    // ── Update enrolment request ──
    await supabase.from('enrolment_requests').update({
      status: 'approved',
      reviewed_by: approved_by,
      reviewed_at: new Date().toISOString(),
      generated_student_id: finalSchoolId,
      linked_student_id: authUserId,
    }).eq('id', request_id);

    // ── Send welcome email (non-fatal) ──
    if (!isExistingUser) {
      await sendEmail('welcome', 'gapecoin@gmail.com', {
        firstName,
        lastName,
        personalEmail: enrolReq.email,
        schoolId: finalSchoolId,
        username: finalUsername,
        password: finalPassword,
        courseTitle: course?.title || 'your course',
      });
    }

    // ── Return all original values plus student_id for payment recording ──
    return NextResponse.json({
      success: true,
      student_id: authUserId,
      school_id: finalSchoolId,
      username: finalUsername,
      password: isExistingUser ? null : finalPassword,
      personal_email: enrolReq.email,
      first_name: firstName,
      last_name: lastName,
      is_existing_user: isExistingUser,
    });

  } catch (err) {
    console.error('Approval error:', err);
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}