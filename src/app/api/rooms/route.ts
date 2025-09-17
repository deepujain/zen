import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/lib/database/database';

const db = DatabaseService.getInstance();

export async function GET() {
  try {
    const rooms = await db.getAllRooms();
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const room = await request.json();
    await db.addRoom(room);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding room:', error);
    return NextResponse.json({ error: 'Failed to add room' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const room = await request.json();
    await db.updateRoom(room);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }
    
    await db.deleteRoom(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
