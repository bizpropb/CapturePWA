import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/tags
 * Returns all tags for the default user
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      where: {
        userId: 1 // Default user for now
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Tags fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tags
 * Create a new tag
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Check if tag already exists for this user
    const existing = await prisma.tag.findFirst({
      where: {
        name: name.trim(),
        userId: 1 // Default user
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Tag already exists' },
        { status: 400 }
      );
    }

    // Generate random color if not provided
    const tagColor = color || `#${Math.floor(Math.random()*16777215).toString(16)}`;

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: tagColor,
        userId: 1 // Default user
      }
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Tag creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
