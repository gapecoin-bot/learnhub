import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

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

export async function POST(req) {
  try {
    const { student_id, reset_by } = await req.json();
    if (!student_id || !reset_by) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Fetch student profile ──
    const { data: student, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, username, student_id')
      .eq('id', student_id)
      .eq('role', 'student')
      .single();
    if (fetchErr || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // ── Generate new password ──
    const newPassword = generatePassword();

    // ── Update auth user password ──
    const { error: updateErr } = await supabase.auth.admin.updateUserById(student_id, {
      password: newPassword,
    });
    if (updateErr) {
      return NextResponse.json({ error: `Failed to reset password: ${updateErr.message}` }, { status: 500 });
    }

    // ── Send email to student ──
    try {
      await resend.emails.send({
        from: 'Learners Association <no-reply@learnersassociation.co.uk>',
        to: student.email,
        subject: 'Your password has been reset',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #202124;">Password Reset</h2>
            <p>Dear ${student.first_name} ${student.last_name},</p>
            <p>Your password has been reset by our support team. Here are your updated login details:</p>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Username:</strong> ${student.username}</p>
              <p style="margin: 0;"><strong>New Password:</strong> <span style="font-family: monospace; background: #fff; padding: 2px 6px; border-radius: 4px;">${newPassword}</span></p>
            </div>
            <p>Please log in and change your password as soon as possible.</p>
            <p>If you did not request this reset, please contact our support team immediately.</p>
            <p>Kind regards,<br/>Learners Association Support Team</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Password reset email failed (non-fatal):', emailErr.message);
    }

    return NextResponse.json({
      success: true,
      new_password: newPassword,
      email: student.email,
      student_name: `${student.first_name} ${student.last_name}`,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}