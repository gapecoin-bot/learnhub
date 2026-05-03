import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';

// ─── SUPABASE ADMIN CLIENT (uses service role to bypass RLS) ──────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);// ─── POST /api/certificates/generate ─────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();
    const { student_id, course_id, grade, issued_by } = body;

    // ── Validate required fields ──
    if (!student_id || !course_id || !grade || !issued_by) {
      return NextResponse.json(
        { error: 'Missing required fields: student_id, course_id, grade, issued_by' },
        { status: 400 }
      );
    }

    // ── Fetch student profile ──
    const { data: student, error: studentErr } = await supabase
      .from('profiles')
      .select('first_name, last_name, student_id, email')
      .eq('id', student_id)
      .single();
    if (studentErr || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // ── Fetch course ──
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('title, awarding_body, level')
      .eq('id', course_id)
      .single();
    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // ── Fetch certificate template for this course ──
    const { data: template, error: templateErr } = await supabase
      .from('certificate_templates')
      .select('template_url, template_filename')
      .eq('course_id', course_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (templateErr || !template) {
      return NextResponse.json(
        { error: 'No certificate template found for this course. Please upload a template first.' },
        { status: 404 }
      );
    }

    // ── Download the template PDF from storage ──
    const templateResponse = await fetch(template.template_url);
    if (!templateResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download certificate template from storage' },
        { status: 500 }
      );
    }
    const templateBytes = await templateResponse.arrayBuffer();

    // ── Build replacements map ──
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const replacements = {
      '{{student_name}}': `${student.first_name} ${student.last_name}`,
      '{{first_name}}': student.first_name || '',
      '{{last_name}}': student.last_name || '',
      '{{student_id}}': student.student_id || '',
      '{{course_title}}': course.title || '',
      '{{awarding_body}}': course.awarding_body || '',
      '{{level}}': course.level || '',
      '{{grade}}': grade || '',
      '{{date}}': formattedDate,
      '{{year}}': now.getFullYear().toString(),
    };

    // ── Load PDF document ──
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();

    // ── Replace placeholder text in each page content stream ──
    for (const page of pages) {
      try {
        const dict = page.node;
        const contentsRef = dict.get('Contents');
        if (!contentsRef) continue;

        const contentsObj = pdfDoc.context.lookup(contentsRef);
        if (!contentsObj) continue;

        // Handle both single stream and array of streams
        const isArray = contentsObj.constructor.name === 'PDFArray';
        const streamObjects = isArray
          ? Array.from(
              { length: contentsObj.size() },
              (_, i) => pdfDoc.context.lookup(contentsObj.get(i))
            )
          : [contentsObj];

        for (const streamObj of streamObjects) {
          if (!streamObj || typeof streamObj.getContents !== 'function') continue;
          try {
            let contentStr = new TextDecoder().decode(streamObj.getContents());
            for (const [placeholder, value] of Object.entries(replacements)) {
              contentStr = contentStr.split(placeholder).join(value);
            }
            streamObj.setContents(new TextEncoder().encode(contentStr));
          } catch (streamErr) {
            // Individual stream error — continue to next
            console.warn('Stream processing error:', streamErr.message);
          }
        }
      } catch (pageErr) {
        // Individual page error — continue to next
        console.warn('Page processing error:', pageErr.message);
      }
    }

    // ── Save the modified PDF to bytes ──
    const pdfBytes = await pdfDoc.save();

    // ── Upload generated certificate to Supabase storage ──
    const fileName = `cert_${student_id}_${course_id}_${Date.now()}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from('certificates')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });
    if (uploadErr) {
      return NextResponse.json(
        { error: `Certificate upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // ── Get public URL of generated certificate ──
    const { data: urlData } = supabase.storage
      .from('certificates')
      .getPublicUrl(fileName);

    // ── Save certificate record to database ──
    const { data: certRecord, error: certErr } = await supabase
      .from('certificates')
      .insert({
        student_id,
        course_id,
        grade,
        issued_by,
        certificate_url: urlData.publicUrl,
        issued_at: now.toISOString(),
      })
      .select()
      .single();
    if (certErr) {
      return NextResponse.json(
        { error: `Failed to save certificate record: ${certErr.message}` },
        { status: 500 }
      );
    }

    // ── Return success with certificate URL ──
    return NextResponse.json({
      success: true,
      certificate_url: urlData.publicUrl,
      certificate_id: certRecord.id,
    });

  } catch (err) {
    console.error('Certificate generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Unexpected error during certificate generation' },
      { status: 500 }
    );
  }
}