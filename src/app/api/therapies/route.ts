import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/lib/database/database';

const db = DatabaseService.getInstance();

export async function GET() {
  try {
    const therapies = await db.getAllTherapies();
    return NextResponse.json(therapies);
  } catch (error) {
    console.error('Error fetching therapies:', error);
    return NextResponse.json({ error: 'Failed to fetch therapies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const therapy = await request.json();
    await db.addTherapy(therapy);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding therapy:', error);
    return NextResponse.json({ error: 'Failed to add therapy' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const therapy = await request.json();
    await db.updateTherapy(therapy);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating therapy:', error);
    return NextResponse.json({ error: 'Failed to update therapy' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Therapy ID is required' }, { status: 400 });
    }
    
    await db.deleteTherapy(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting therapy:', error);
    return NextResponse.json({ error: 'Failed to delete therapy' }, { status: 500 });
  }
}
