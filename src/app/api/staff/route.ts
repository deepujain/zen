import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/lib/database/database';

const db = DatabaseService.getInstance();

export async function GET() {
  try {
    const staff = await db.getAllStaff();
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await request.json();
    await db.addStaff(staff);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding staff:', error);
    return NextResponse.json({ error: 'Failed to add staff' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const staff = await request.json();
    await db.updateStaff(staff);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }
    
    await db.deleteStaff(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}
