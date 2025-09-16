import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/lib/database/database';

const db = DatabaseService.getInstance();

export async function GET() {
  try {
    const attendance = await db.getAllAttendance();
    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const attendance = await request.json();
    await db.addAttendance(attendance);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding attendance:', error);
    return NextResponse.json({ error: 'Failed to add attendance' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const attendance = await request.json();
    await db.updateAttendance(attendance);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 });
    }
    
    await db.deleteAttendance(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    return NextResponse.json({ error: 'Failed to delete attendance' }, { status: 500 });
  }
}
