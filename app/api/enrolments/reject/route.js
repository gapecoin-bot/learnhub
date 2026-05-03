import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { request_id, reviewed_by, notes } = await req.json();

    if (!request_id || !reviewed_by) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Fetch the enrolment request
    const { data: enrolment, error: fetchError } = await supabase
      .from('enrolment_requests')
      .select('*, course:courses(title)')
      .eq('id', request_id)
      .single();

    if (fetchError || !enrolment) {
      return Response.json({ error: 'Enrolment request not found.' }, { status: 404 });
    }

    // Update status to rejected
    const { error: updateError } = await supabase
      .from('enrolment_requests')
      .update({
        status: 'rejected',
        reviewed_by,
        notes: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', request_id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    // Send rejection email if we have an email address
    if (enrolment.email) {
      try {
        await resend.emails.send({
          from: 'Learners Association <no-reply@learnersassociation.co.uk>',
          to: enrolment.email,
          subject: 'Update on your enrolment application',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #202124;">Enrolment Application Update</h2>
              <p>Dear ${enrolment.full_name},</p>
              <p>Thank you for your interest in <strong>${enrolment.course?.title}</strong>.</p>
              <p>After reviewing your application, we are unable to approve your enrolment at this time.</p>
              ${notes ? `
              <div style="background: #f8f9fa; border-left: 4px solid #ea4335; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                <p style="margin: 0; color: #202124;"><strong>Reason:</strong> ${notes}</p>
              </div>` : ''}
              <p>If you have any questions or would like to discuss this further, please contact us via WhatsApp or email.</p>
              <p>Kind regards,<br/>Learners Association Team</p>
            </div>
          `,
        });
      } catch (emailErr) {
        // Email failure should not block the rejection
        console.error('Rejection email failed:', emailErr.message);
      }
    }

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}