import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ profiles }, { status: 200 });
  } catch (error: any) {
    console.error('Prisma GET profiles error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch profiles from database.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      email,
      full_name,
      avatar_url,
      phone,
      bio,
      current_focus,
      superpowers,
      looking_for,
      industries,
      ucl_department,
      graduation_year,
      linkedin_url,
      github_url,
      website_url,
      pitch_deck_url,
      custom_fields,
      custom_tags,
    } = body;

    if (!id || !phone) {
      return NextResponse.json(
        { error: 'id and phone are required fields.' },
        { status: 400 }
      );
    }

    const data = {
      email: email || undefined,
      full_name: full_name || 'UCL Cohort Member',
      avatar_url: avatar_url || null,
      phone,
      bio: bio || '',
      current_focus: current_focus || 'Building a Startup',
      superpowers: Array.isArray(superpowers) ? superpowers : [],
      looking_for: Array.isArray(looking_for) ? looking_for : [],
      industries: Array.isArray(industries) ? industries : [],
      ucl_department: ucl_department || 'Computer Science',
      graduation_year: graduation_year || '2025',
      linkedin_url: linkedin_url || null,
      github_url: github_url || null,
      website_url: website_url || null,
      pitch_deck_url: pitch_deck_url || null,
      custom_fields: custom_fields || {},
      custom_tags: Array.isArray(custom_tags) ? custom_tags : [],
    };

    const savedProfile = await prisma.profile.upsert({
      where: { id },
      update: data,
      create: {
        id,
        ...data,
      },
    });

    return NextResponse.json({ profile: savedProfile }, { status: 200 });
  } catch (error: any) {
    console.error('Prisma POST profile error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save profile in database.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required to delete profile.' }, { status: 400 });
    }

    await prisma.profile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Prisma DELETE profile error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete profile from database.' },
      { status: 500 }
    );
  }
}
