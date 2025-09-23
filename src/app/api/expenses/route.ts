import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/lib/database/database';

const db = DatabaseService.getInstance();

export async function GET() {
  try {
    const expenses = await db.getAllExpenses();
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('API: Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const expense = await request.json();
    // Validate required fields
    if (!expense.id || !expense.description || !expense.category || !expense.amount || !expense.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add the expense
    await db.addExpense(expense);
    const expenses = await db.getAllExpenses();
    
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
    // Validate required fields
    if (!expense.id || !expense.description || !expense.category || !expense.amount || !expense.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the expense
    await db.updateExpense(expense);
    const expenses = await db.getAllExpenses();
    
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
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
    const expenses = await db.getAllExpenses();
    
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
