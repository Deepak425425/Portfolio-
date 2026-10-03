import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;
    const contactFrom = process.env.CONTACT_FROM;

    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Email service configuration error (missing API key).' },
        { status: 500 }
      );
    }

    if (!contactEmail) {
      console.error('Missing CONTACT_EMAIL environment variable');
      return NextResponse.json(
        { error: 'Email service configuration error (missing recipient).' },
        { status: 500 }
      );
    }

    if (!contactFrom) {
      console.error('Missing CONTACT_FROM environment variable');
      return NextResponse.json(
        { error: 'Email service configuration error (missing sender).' },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { name, email, brand, phone, type, budget, details } = body;

    // Server-side validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!brand || typeof brand !== 'string') {
      return NextResponse.json({ error: 'Brand/Company is required' }, { status: 400 });
    }
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Project Type is required' }, { status: 400 });
    }
    if (!budget || typeof budget !== 'string') {
      return NextResponse.json({ error: 'Budget Range is required' }, { status: 400 });
    }
    if (!details || typeof details !== 'string') {
      return NextResponse.json({ error: 'Project Details are required' }, { status: 400 });
    }

    // Construct the email HTML
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h2 style="border-bottom: 1px solid #eee; padding-bottom: 12px;">New Project Inquiry</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 140px;">Name</td>
            <td style="padding: 8px 0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Brand / Company</td>
            <td style="padding: 8px 0;">${brand}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Phone</td>
            <td style="padding: 8px 0;">${phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Project Type</td>
            <td style="padding: 8px 0;">${type}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Budget Range</td>
            <td style="padding: 8px 0;">${budget}</td>
          </tr>
        </table>
        
        <h3 style="margin-top: 30px;">Project Details:</h3>
        <div style="background: #f9f9f9; padding: 16px; border-radius: 4px; white-space: pre-wrap;">
          ${details}
        </div>
      </div>
    `;

    // Send the email via Resend
    const { data, error } = await resend.emails.send({
      from: `GROTON AI <${contactFrom}>`,
      to: [contactEmail],
      replyTo: email,
      subject: `New Project Inquiry — ${brand}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json(
        { error: 'Unable to send your message right now. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Internal Server Error:', err);
    return NextResponse.json(
      { error: 'Unable to send your message right now. Please try again.' },
      { status: 500 }
    );
  }
}
