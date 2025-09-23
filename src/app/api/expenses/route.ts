import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/lib/database/database';

const db = DatabaseService.getInstance();

export async function GET() {
  try {
    console.log('API: Fetching all expenses');
    const expenses = await db.getAllExpenses();
    console.log('API: Retrieved expenses:', expenses);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('API: Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const expense = await request.json();
    console.log('API: Received expense data:', expense);
    
    // Validate required fields
    if (!expense.id || !expense.description || !expense.category || !expense.amount || !expense.date) {
      console.log('API: Missing required fields:', { expense });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add the expense
    console.log('API: Adding expense to database');
    await db.addExpense(expense);

    // Get all expenses to return updated list
    console.log('API: Fetching updated expense list');
    const expenses = await db.getAllExpenses();
    console.log('API: Updated expenses:', expenses);
    
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error adding expense:', error);
    return NextResponse.json(
      { error: 'Failed to add expense', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const expense = await request.json();
    await db.updateExpense(expense);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }
    
    await db.deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
