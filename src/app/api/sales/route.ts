import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/lib/database/database';

const db = DatabaseService.getInstance();

export async function GET() {
  try {
    const sales = await db.getAllSales();
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sale = await request.json();
    await db.addSale(sale);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding sale:', error);
    return NextResponse.json({ error: 'Failed to add sale' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sale = await request.json();
    await db.updateSale(sale);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }
    
    await db.deleteSale(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
  }
}
