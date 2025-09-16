
import type { Staff, Room, Therapy, Sale, Expense, Attendance } from './types';
import { subDays, format, eachDayOfInterval, startOfDay, addHours } from 'date-fns';

const today = new Date();

export const staff: Staff[] = [
  { id: '1', fullName: 'Kajal Mandal', role: 'Manager', experienceYears: 10, phoneNumber: '+91 9964445556', gender: 'Female' },
  { id: '2', fullName: 'Rita', role: 'Therapist', experienceYears: 5, phoneNumber: '+91 9964445556', gender: 'Female' },
  { id: '3', fullName: 'Payal', role: 'Therapist', experienceYears: 3, phoneNumber: '+91 9964445556', gender: 'Female' },
  { id: '4', fullName: 'Tanya', role: 'Therapist', experienceYears: 4, phoneNumber: '+91 9964445556', gender: 'Female' },
  { id: '5', fullName: 'Priya', role: 'Therapist', experienceYears: 2, phoneNumber: '+91 9964445556', gender: 'Female' },
  { id: '6', fullName: 'Liza', role: 'Therapist', experienceYears: 6, phoneNumber: '+91 9964445556', gender: 'Female' },
  { id: '7', fullName: 'Mahir', role: 'Receptionist', experienceYears: 3, phoneNumber: '+91 9964445556', gender: 'Male' },
  { id: '8', fullName: 'Honey', role: 'Therapist', experienceYears: 3, phoneNumber: '', gender: 'Female' }, // Added Honey
  { id: '9', fullName: 'Maria', role: 'Therapist', experienceYears: 4, phoneNumber: '', gender: 'Female' }, // Added Maria
];

export const rooms: Room[] = [
  { id: '1', name: 'Classic' },
  { id: '2', name: 'Serenity' },
  { id: '3', name: 'Tranquil' },
  { id: '4', name: 'Semi-VIP' },
  { id: '5', name: 'Royal' },
  { id: '6', name: 'Couple' },
  { id: '7', name: 'VVIP' },
  { id: '8', name: 'Thai' },
  { id: '9', name: 'Family' }, // Added Family
];

export const therapies: Therapy[] = [
  { id: '1', name: 'Deep Tissue', duration: 60, price: 2500 },
  { id: '2', name: 'Swedish', duration: 60, price: 2200 },
  { id: '3', name: 'Aromatherapy', duration: 90, price: 3000 },
  { id: '4', name: 'Hot Stone', duration: 75, price: 2800 },
  { id: '5', name: 'Semi VIP', duration: 60, price: 5000 },
  { id: '6', name: 'Deep', duration: 60, price: 10000 },
  { id: '7', name: 'Vietnamese', duration: 60, price: 3500 },
  { id: '8', name: 'Thai Oil', duration: 70, price: 2500 },
  { id: '9', name: 'VVIP', duration: 60, price: 20000 },
  { id: '10', name: 'Happy', duration: 60, price: 10000 }, // Added Happy
  { id: '11', name: 'Balance', duration: 60, price: 2500 }, // Added Balance
];

export const sales: Sale[] = [
    {
        id: 'sale-1',
        customerName: 'Raju',
        customerPhone: '+91 90361 11512',
        amount: 5000,
        paymentMethod: 'UPI',
        therapyType: 'Semi VIP',
        therapistId: '3', // Payal
        roomId: '4', // Semi-VIP
        date: '2025-09-07',
        startTime: new Date('2025-09-07T12:30:00').toISOString(),
        endTime: new Date('2025-09-07T13:30:00').toISOString(),
    },
    {
        id: 'sale-2',
        customerName: 'Mallikarjuna',
        customerPhone: '+91 90060 64622',
        amount: 2700,
        paymentMethod: 'UPI',
        therapyType: 'Aromatherapy',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-07',
        startTime: new Date('2025-09-07T13:45:00').toISOString(),
        endTime: new Date('2025-09-07T14:15:00').toISOString(),
    },
    {
        id: 'sale-3',
        customerName: 'Asif',
        customerPhone: '+91 96146 80027',
        amount: 3000,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '3', // Payal
        roomId: '1', // Classic
        date: '2025-09-07',
        startTime: new Date('2025-09-07T14:55:00').toISOString(),
        endTime: new Date('2025-09-07T15:55:00').toISOString(),
    },
    {
        id: 'sale-4',
        customerName: 'Vinod',
        customerPhone: '+91 92843 86108',
        amount: 10000,
        paymentMethod: 'Card',
        therapyType: 'Deep',
        therapistId: '2', // Rita
        roomId: '5', // Royal
        date: '2025-09-07',
        startTime: new Date('2025-09-07T20:15:00').toISOString(),
        endTime: new Date('2025-09-07T21:15:00').toISOString(),
    },
    {
        id: 'sale-new-1',
        customerName: 'Abhishek',
        customerPhone: '+91 9310660639',
        amount: 0,
        paymentMethod: 'Member',
        therapyType: 'Deep Tissue',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-09',
        startTime: new Date('2025-09-09T12:00:00').toISOString(),
        endTime: new Date('2025-09-09T13:00:00').toISOString(),
    },
    {
        id: 'sale-new-2',
        customerName: 'Mukilesh',
        customerPhone: '',
        amount: 2500,
        paymentMethod: 'Card',
        therapyType: 'Swedish',
        therapistId: '6', // Liza
        roomId: '1', // Classic
        date: '2025-09-09',
        startTime: new Date('2025-09-09T12:15:00').toISOString(),
        endTime: new Date('2025-09-09T13:15:00').toISOString(),
    },
    {
        id: 'sale-new-3',
        customerName: 'Anup',
        customerPhone: '',
        amount: 3000,
        paymentMethod: 'Card',
        therapyType: 'Aromatherapy',
        therapistId: '5', // Priya
        roomId: '1', // Classic
        date: '2025-09-09',
        startTime: new Date('2025-09-09T21:27:00').toISOString(),
        endTime: new Date('2025-09-09T22:25:00').toISOString(),
    },
    {
        id: 'sale-new-4',
        customerName: 'Sasi Kumar',
        customerPhone: '+91 9944182315',
        amount: 20000,
        paymentMethod: 'Card',
        therapyType: 'VVIP',
        therapistId: '4', // Tanya
        roomId: '7', // VVIP
        date: '2025-09-09',
        startTime: new Date('2025-09-09T17:15:00').toISOString(),
        endTime: new Date('2025-09-09T18:17:00').toISOString(),
    },
    {
        id: 'sale-new-5',
        customerName: 'Shoaib',
        customerPhone: '+91 6366134167',
        amount: 2000,
        paymentMethod: 'Cash',
        therapyType: 'Aromatherapy',
        therapistId: '3', // Payal
        roomId: '1', // Classic
        date: '2025-09-09',
        startTime: new Date('2025-09-09T21:30:00').toISOString(),
        endTime: new Date('2025-09-09T22:00:00').toISOString(),
    },
    {
        id: 'sale-new-6',
        customerName: 'Amanth',
        customerPhone: '+91 8892207580',
        amount: 0,
        paymentMethod: 'Member',
        therapyType: 'Swedish',
        therapistId: '2', // Rita
        roomId: '5', // Royal
        date: '2025-09-09',
        startTime: new Date('2025-09-09T21:10:00').toISOString(),
        endTime: new Date('2025-09-09T22:10:00').toISOString(),
    },
    {
        id: 'sale-5',
        customerName: 'Ravi',
        customerPhone: '+91 93801 96166',
        amount: 3000,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '5', // Priya
        roomId: '1', // Classic
        date: '2025-09-10',
        startTime: new Date('2025-09-10T12:55:00').toISOString(),
        endTime: new Date('2025-09-10T13:55:00').toISOString(),
    },
    {
        id: 'sale-6',
        customerName: 'Simran',
        customerPhone: '+91 91489 20015',
        amount: 3200,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '3', // Payal
        roomId: '6', // Couple
        date: '2025-09-10',
        startTime: new Date('2025-09-10T13:10:00').toISOString(),
        endTime: new Date('2025-09-10T14:10:00').toISOString(),
    },
    {
        id: 'sale-7',
        customerName: 'NoName',
        customerPhone: '',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-10',
        startTime: new Date('2025-09-10T13:50:00').toISOString(),
        endTime: new Date('2025-09-10T14:50:00').toISOString(),
    },
    {
        id: 'sale-8',
        customerName: 'Tarang',
        customerPhone: '+91 91275 23010',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '6', // Liza
        roomId: '1', // Classic
        date: '2025-09-10',
        startTime: new Date('2025-09-10T14:00:00').toISOString(),
        endTime: new Date('2025-09-10T15:00:00').toISOString(),
    },
    {
        id: 'sale-9',
        customerName: 'Harish',
        customerPhone: '',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '3', // Payal
        roomId: '6', // Couple
        date: '2025-09-10',
        startTime: new Date('2025-09-10T15:55:00').toISOString(),
        endTime: new Date('2025-09-10T16:55:00').toISOString(),
    },
    {
        id: 'sale-10',
        customerName: 'Sundeep',
        customerPhone: '+91 90032 46428',
        amount: 2500,
        paymentMethod: 'Cash',
        therapyType: 'Swedish',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-10',
        startTime: new Date('2025-09-10T16:30:00').toISOString(),
        endTime: new Date('2025-09-10T17:30:00').toISOString(),
    },
    {
        id: 'sale-11',
        customerName: 'Rajesh',
        customerPhone: '+91 89510 04039',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Aromatherapy',
        therapistId: '5', // Priya
        roomId: '1', // Classic
        date: '2025-09-10',
        startTime: new Date('2025-09-10T17:26:00').toISOString(),
        endTime: new Date('2025-09-10T18:20:00').toISOString(),
    },
    {
        id: 'sale-12',
        customerName: 'Venkat',
        customerPhone: '',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Aromatherapy',
        therapistId: '3', // Payal
        roomId: '6', // Couple
        date: '2025-09-10',
        startTime: new Date('2025-09-10T17:26:00').toISOString(),
        endTime: new Date('2025-09-10T18:20:00').toISOString(),
    },
    {
        id: 'sale-13',
        customerName: 'Twill',
        customerPhone: '',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Aromatherapy',
        therapistId: '6', // Liza
        roomId: '1', // Classic
        date: '2025-09-10',
        startTime: new Date('2025-09-10T17:25:00').toISOString(),
        endTime: new Date('2025-09-10T18:45:00').toISOString(),
    },
    {
        id: 'sale-14',
        customerName: 'Asif',
        customerPhone: '+91 93807 50589',
        amount: 2500,
        paymentMethod: 'Cash',
        therapyType: 'Aromatherapy',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-10',
        startTime: new Date('2025-09-10T21:10:00').toISOString(),
        endTime: new Date('2025-09-10T22:00:00').toISOString(),
    },
    {
        id: 'sale-15',
        customerName: 'Akhil',
        customerPhone: '+91 88856 17803',
        amount: 5000,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '5', // Priya
        roomId: '7', // VVIP
        date: '2025-09-11',
        startTime: new Date('2025-09-11T13:30:00').toISOString(),
        endTime: new Date('2025-09-11T16:00:00').toISOString(),
    },
    {
        id: 'sale-16',
        customerName: 'Raju',
        customerPhone: '+91 95353 41452',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Aromatherapy',
        therapistId: '5', // Priya
        roomId: '1', // Classic
        date: '2025-09-11',
        startTime: new Date('2025-09-11T14:35:00').toISOString(),
        endTime: new Date('2025-09-11T15:35:00').toISOString(),
    },
    {
        id: 'sale-17',
        customerName: 'Pratap',
        customerPhone: '+91 96676 75104',
        amount: 7500,
        paymentMethod: 'Card',
        therapyType: 'Vietnamese',
        therapistId: '2', // Rita
        roomId: '7', // VVIP
        date: '2025-09-11',
        startTime: new Date('2025-09-11T17:30:00').toISOString(),
        endTime: new Date('2025-09-11T18:30:00').toISOString(),
    },
    {
        id: 'sale-18',
        customerName: 'Ramesh',
        customerPhone: '',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '3', // Payal
        roomId: '1', // Classic
        date: '2025-09-11',
        startTime: new Date('2025-09-11T17:40:00').toISOString(),
        endTime: new Date('2025-09-11T18:40:00').toISOString(),
    },
    {
        id: 'sale-19',
        customerName: 'Mahesh',
        customerPhone: '+91 94453 93714',
        amount: 3000,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '4', // Tanya
        roomId: '5', // Royal
        date: '2025-09-12',
        startTime: new Date('2025-09-12T12:30:00').toISOString(),
        endTime: new Date('2025-09-12T13:10:00').toISOString(),
    },
    {
        id: 'sale-20',
        customerName: 'Manoj',
        customerPhone: '+91 96811 12630',
        amount: 0,
        paymentMethod: 'Member',
        therapyType: 'Aromatherapy',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-12',
        startTime: new Date('2025-09-12T18:00:00').toISOString(),
        endTime: new Date('2025-09-12T19:00:00').toISOString(),
    },
    {
        id: 'sale-21',
        customerName: 'Qwaiz',
        customerPhone: '+91 90872 64015',
        amount: 2500,
        paymentMethod: 'Cash',
        therapyType: 'Thai Oil',
        therapistId: '2', // Rita
        roomId: '8', // Thai
        date: '2025-09-12',
        startTime: new Date('2025-09-12T19:00:00').toISOString(),
        endTime: new Date('2025-09-12T20:10:00').toISOString(),
    },
    {
        id: 'sale-22',
        customerName: 'Kishore',
        customerPhone: '+91 82906 29977',
        amount: 2000,
        paymentMethod: 'UPI',
        therapyType: 'Aromatherapy',
        therapistId: '3', // Payal
        roomId: '1', // Classic
        date: '2025-09-12',
        startTime: new Date('2025-09-12T21:30:00').toISOString(),
        endTime: new Date('2025-09-12T22:15:00').toISOString(),
    },
    
    // September 6, 2025 Sales Data
    {
        id: 'sale-sep06-1',
        customerName: 'Amruth',
        customerPhone: '8892207520',
        amount: 10000,
        paymentMethod: 'UPI',
        therapyType: 'Deep tissue',
        therapistId: '3', // Payal
        roomId: '1', // Classic
        date: '2025-09-06',
        startTime: new Date('2025-09-06T11:11:00').toISOString(),
        endTime: new Date('2025-09-06T12:01:00').toISOString(),
    },
    {
        id: 'sale-sep06-2',
        customerName: 'Abhishek',
        customerPhone: '9310660639',
        amount: 10000,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '6', // Liza
        roomId: '8', // Thai
        date: '2025-09-06',
        startTime: new Date('2025-09-06T11:25:00').toISOString(),
        endTime: new Date('2025-09-06T12:05:00').toISOString(),
    },
    {
        id: 'sale-sep06-3',
        customerName: 'Rayan',
        customerPhone: '9880061245',
        amount: 8500,
        paymentMethod: 'UPI',
        therapyType: 'Aroma',
        therapistId: '3', // Payal
        roomId: '1', // Classic
        date: '2025-09-06',
        startTime: new Date('2025-09-06T09:30:00').toISOString(),
        endTime: new Date('2025-09-06T10:30:00').toISOString(),
    },
    {
        id: 'sale-sep06-4',
        customerName: 'Parvez',
        customerPhone: '9611867860',
        amount: 10000,
        paymentMethod: 'UPI',
        therapyType: 'Deep tissue',
        therapistId: '6', // Liza
        roomId: '8', // Thai
        date: '2025-09-06',
        startTime: new Date('2025-09-06T08:30:00').toISOString(),
        endTime: new Date('2025-09-06T09:30:00').toISOString(),
    },
    {
        id: 'sale-sep06-5',
        customerName: 'Siddharth',
        customerPhone: '7411796961',
        amount: 3000,
        paymentMethod: 'UPI',
        therapyType: 'Aroma',
        therapistId: '3', // Payal
        roomId: '1', // Classic
        date: '2025-09-06',
        startTime: new Date('2025-09-06T17:30:00').toISOString(),
        endTime: new Date('2025-09-06T18:50:00').toISOString(),
    },
    {
        id: 'sale-sep06-6',
        customerName: 'Vaishit',
        customerPhone: '9015862886',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '6', // Liza
        roomId: '8', // Thai
        date: '2025-09-06',
        startTime: new Date('2025-09-06T17:45:00').toISOString(),
        endTime: new Date('2025-09-06T18:45:00').toISOString(),
    },
    {
        id: 'sale-sep06-7',
        customerName: 'Ajay',
        customerPhone: '7406991252',
        amount: 3000,
        paymentMethod: 'UPI',
        therapyType: 'Aroma',
        therapistId: '3', // Payal
        roomId: '1', // Classic
        date: '2025-09-06',
        startTime: new Date('2025-09-06T19:10:00').toISOString(),
        endTime: new Date('2025-09-06T20:10:00').toISOString(),
    },
    
    // September 8, 2025 Sales Data
    {
        id: 'sale-sep08-1',
        customerName: 'Ravi',
        customerPhone: '9742026288',
        amount: 3000,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '6', // Liza
        roomId: '8', // Thai
        date: '2025-09-08',
        startTime: new Date('2025-09-08T15:30:00').toISOString(),
        endTime: new Date('2025-09-08T19:30:00').toISOString(),
    },
    {
        id: 'sale-sep08-2',
        customerName: 'Manjunath',
        customerPhone: '9945008518',
        amount: 2800,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '3', // Payal
        roomId: '8', // Thai
        date: '2025-09-08',
        startTime: new Date('2025-09-08T17:00:00').toISOString(),
        endTime: new Date('2025-09-08T18:00:00').toISOString(),
    },
    {
        id: 'sale-sep08-3',
        customerName: 'Raju',
        customerPhone: '9900988503',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Aroma',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-08',
        startTime: new Date('2025-09-08T18:00:00').toISOString(),
        endTime: new Date('2025-09-08T19:40:00').toISOString(),
    },
    {
        id: 'sale-sep08-4',
        customerName: 'Imran',
        customerPhone: '7895201279',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '4', // Tanya
        roomId: '1', // Classic
        date: '2025-09-08',
        startTime: new Date('2025-09-08T20:00:00').toISOString(),
        endTime: new Date('2025-09-08T21:00:00').toISOString(),
    },
    {
        id: 'sale-sep08-5',
        customerName: 'Lucky',
        customerPhone: '8892251501',
        amount: 4000,
        paymentMethod: 'UPI',
        therapyType: 'Signature',
        therapistId: '2', // Rita (primary from Rita/Payal)
        roomId: '6', // Couple (primary from Couple/Thai)
        date: '2025-09-08',
        startTime: new Date('2025-09-08T20:15:00').toISOString(),
        endTime: new Date('2025-09-08T21:15:00').toISOString(),
    },
    
    // September 13, 2025 Sales Data
    {
        id: 'sale-sep13-1',
        customerName: 'Atul',
        customerPhone: '-',
        amount: 3000,
        paymentMethod: 'Cash',
        therapyType: 'Swedish',
        therapistId: '2', // Rita
        roomId: '6', // Couple
        date: '2025-09-13',
        startTime: new Date('2025-09-13T12:10:00').toISOString(),
        endTime: new Date('2025-09-13T12:55:00').toISOString(),
    },
    {
        id: 'sale-sep13-2',
        customerName: 'Adarsh',
        customerPhone: '9849202855',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Aroma',
        therapistId: '6', // Liza
        roomId: '1', // Classic
        date: '2025-09-13',
        startTime: new Date('2025-09-13T13:20:00').toISOString(),
        endTime: new Date('2025-09-13T13:40:00').toISOString(),
    },
    {
        id: 'sale-sep13-3',
        customerName: 'Rahul',
        customerPhone: '9445232994',
        amount: 3500,
        paymentMethod: 'UPI',
        therapyType: 'Thai',
        therapistId: '5', // Priya
        roomId: '8', // Thai
        date: '2025-09-13',
        startTime: new Date('2025-09-13T13:50:00').toISOString(),
        endTime: new Date('2025-09-13T14:40:00').toISOString(),
    },
    {
        id: 'sale-sep13-4',
        customerName: 'Arun',
        customerPhone: '9727675102',
        amount: 3000,
        paymentMethod: 'UPI',
        therapyType: 'Aroma',
        therapistId: '4', // Tanya
        roomId: '1', // Classic
        date: '2025-09-13',
        startTime: new Date('2025-09-13T09:45:00').toISOString(),
        endTime: new Date('2025-09-13T10:35:00').toISOString(),
    },
    {
        id: 'sale-sep13-5',
        customerName: 'Sajikumar',
        customerPhone: '9944181315',
        amount: 0,
        paymentMethod: 'Member',
        therapyType: 'Deep tissue',
        therapistId: '5', // Priya
        roomId: '8', // Thai (assuming Jhai = Thai)
        date: '2025-09-13',
        startTime: new Date('2025-09-13T15:20:00').toISOString(),
        endTime: new Date('2025-09-13T15:44:00').toISOString(),
    },
    {
        id: 'sale-sep13-6',
        customerName: 'Abishek',
        customerPhone: '9310666189',
        amount: 0,
        paymentMethod: 'Member',
        therapyType: 'Swedish',
        therapistId: '3', // Payal
        roomId: '1', // Classic
        date: '2025-09-13',
        startTime: new Date('2025-09-13T17:35:00').toISOString(),
        endTime: new Date('2025-09-13T18:30:00').toISOString(),
    },
    {
        id: 'sale-sep13-7',
        customerName: 'Thirumaran',
        customerPhone: '9843744696',
        amount: 3500,
        paymentMethod: 'Card',
        therapyType: 'Swedish',
        therapistId: '3', // Payal
        roomId: '1', // Classic
        date: '2025-09-13',
        startTime: new Date('2025-09-13T19:40:00').toISOString(),
        endTime: new Date('2025-09-13T20:40:00').toISOString(),
    },
    {
        id: 'sale-sep13-8',
        customerName: 'Rahul',
        customerPhone: '-',
        amount: 3000,
        paymentMethod: 'UPI',
        therapyType: 'Turkish',
        therapistId: '4', // Tanya
        roomId: '6', // Couple
        date: '2025-09-13',
        startTime: new Date('2025-09-13T21:00:00').toISOString(),
        endTime: new Date('2025-09-13T22:00:00').toISOString(),
    },
    // September 14, 2025 Sales Data
    {
        id: 'sale-sep14-1',
        customerName: 'Bharsav Bn',
        customerPhone: '7019586151',
        amount: 2800,
        paymentMethod: 'Card',
        therapyType: 'Swedish',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-14',
        startTime: new Date('2025-09-14T12:40:00').toISOString(),
        endTime: new Date('2025-09-14T13:40:00').toISOString(),
    },
    {
        id: 'sale-sep14-2',
        customerName: 'Rahul',
        customerPhone: '7038404917',
        amount: 2500,
        paymentMethod: 'Cash',
        therapyType: 'Swedish',
        therapistId: '4', // Tanya
        roomId: '1', // Classic (Clavil seems to be a typo)
        date: '2025-09-14',
        startTime: new Date('2025-09-14T14:55:00').toISOString(),
        endTime: new Date('2025-09-14T15:55:00').toISOString(),
    },
    {
        id: 'sale-sep14-3',
        customerName: 'Pravez',
        customerPhone: '',
        amount: 0,
        paymentMethod: 'Member',
        therapyType: 'Aroma',
        therapistId: '3', // Payal
        roomId: '8', // Thai
        date: '2025-09-14',
        startTime: new Date('2025-09-14T17:50:00').toISOString(),
        endTime: new Date('2025-09-14T18:50:00').toISOString(),
    },
    {
        id: 'sale-sep14-4',
        customerName: 'Abhinav lle',
        customerPhone: '9743770324',
        amount: 3000,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '5', // Priya
        roomId: '1', // Classic
        date: '2025-09-14',
        startTime: new Date('2025-09-14T18:10:00').toISOString(),
        endTime: new Date('2025-09-14T19:10:00').toISOString(),
    },
    {
        id: 'sale-sep14-5',
        customerName: 'Manoj',
        customerPhone: '7845568261',
        amount: 2500,
        paymentMethod: 'Card',
        therapyType: 'Swedish',
        therapistId: '6', // Liza
        roomId: '1', // Classic
        date: '2025-09-14',
        startTime: new Date('2025-09-14T18:40:00').toISOString(),
        endTime: new Date('2025-09-14T19:40:00').toISOString(),
    },
    {
        id: 'sale-sep19-1',
        customerName: 'Sashikumar',
        customerPhone: '+91 9941428315',
        amount: 0,
        paymentMethod: 'Member',
        therapyType: 'Swedish',
        therapistId: '2', // Rita
        roomId: '8', // Thai
        date: '2025-09-16',
        startTime: new Date('2025-09-16T11:40:00').toISOString(),
        endTime: new Date('2025-09-16T12:40:00').toISOString(),
    },
    {
        id: 'sale-sep19-2',
        customerName: 'Salap',
        customerPhone: '+91 94105494951',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Aromatherapy',
        therapistId: '4', // Tanya
        roomId: '6', // Couple
        date: '2025-09-16',
        startTime: new Date('2025-09-19T11:41:00').toISOString(),
        endTime: new Date('2025-09-19T12:25:00').toISOString(),
    },
    {
        id: 'sale-sep19-3',
        customerName: 'Shrikantth',
        customerPhone: '+91 7259789641',
        amount: 4200,
        paymentMethod: 'Cash',
        therapyType: 'Deep Tissue',
        therapistId: '8', // Honey
        roomId: '9', // Family
        date: '2025-09-16',
        startTime: new Date('2025-09-19T12:09:00').toISOString(),
        endTime: new Date('2025-09-19T13:00:00').toISOString(),
    },
    {
        id: 'sale-sep19-4',
        customerName: 'Abhishek',
        customerPhone: '+91 9310666705',
        amount: 0,
        paymentMethod: 'Member',
        therapyType: 'Swedish',
        therapistId: '6', // Liza
        roomId: '1', // Classic
        date: '2025-09-16',
        startTime: new Date('2025-09-19T14:30:00').toISOString(),
        endTime: new Date('2025-09-19T15:30:00').toISOString(),
    },
    {
        id: 'sale-sep19-5',
        customerName: 'Ashok',
        customerPhone: '+91 9071929243',
        amount: 10000,
        paymentMethod: 'Card',
        therapyType: 'Happy',
        therapistId: '3', // Payal
        roomId: '6', // Couple
        date: '2025-09-16',
        startTime: new Date('2025-09-19T14:40:00').toISOString(),
        endTime: new Date('2025-09-19T15:40:00').toISOString(),
    },
    {
        id: 'sale-sep19-6',
        customerName: 'Ani',
        customerPhone: '',
        amount: 3000,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-16',
        startTime: new Date('2025-09-19T17:15:00').toISOString(),
        endTime: new Date('2025-09-19T18:15:00').toISOString(),
    },
    {
        id: 'sale-sep19-7',
        customerName: 'Atilla',
        customerPhone: '+91 9952709466',
        amount: 3500,
        paymentMethod: 'Card',
        therapyType: 'Swedish',
        therapistId: '4', // Tanya
        roomId: '6', // Couple
        date: '2025-09-16',
        startTime: new Date('2025-09-19T12:10:00').toISOString(),
        endTime: new Date('2025-09-19T12:51:00').toISOString(),
    },
    {
        id: 'sale-sep19-8',
        customerName: 'Saron',
        customerPhone: '+91 9611231136',
        amount: 2800,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '6', // Liza
        roomId: '1', // Classic
        date: '2025-09-16',
        startTime: new Date('2025-09-19T09:00:00').toISOString(), // Default Start Time
        endTime: new Date('2025-09-19T10:00:00').toISOString(),   // Default End Time
    },
    // September 15, 2025 Sales Data
    {
        id: 'sale-sep15-1',
        customerName: 'Goku',
        customerPhone: '+91 8108546157',
        amount: 2500,
        paymentMethod: 'Card',
        therapyType: 'Swedish',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-15',
        startTime: new Date('2025-09-15T12:30:00').toISOString(),
        endTime: new Date('2025-09-15T13:30:00').toISOString(),
    },
    {
        id: 'sale-sep15-2',
        customerName: 'Vishal',
        customerPhone: '+91 6361921157',
        amount: 10000,
        paymentMethod: 'UPI',
        therapyType: 'Swedish',
        therapistId: '5', // Priya
        roomId: '6', // Couple
        date: '2025-09-15',
        startTime: new Date('2025-09-15T12:40:00').toISOString(),
        endTime: new Date('2025-09-15T13:40:00').toISOString(),
    },
    {
        id: 'sale-sep15-3',
        customerName: 'Vinodkumar',
        customerPhone: '',
        amount: 0,
        paymentMethod: 'Member',
        therapyType: 'Aromatherapy',
        therapistId: '3', // Payal
        roomId: '8', // Thai
        date: '2025-09-15',
        startTime: new Date('2025-09-15T14:45:00').toISOString(),
        endTime: new Date('2025-09-15T15:45:00').toISOString(),
    },
    {
        id: 'sale-sep15-4',
        customerName: 'Shoniz',
        customerPhone: '+91 9846366115',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Balance',
        therapistId: '9', // Maria
        roomId: '6', // Couple
        date: '2025-09-15',
        startTime: new Date('2025-09-15T18:00:00').toISOString(),
        endTime: new Date('2025-09-15T19:00:00').toISOString(),
    },
    {
        id: 'sale-sep15-5',
        customerName: 'Hannah',
        customerPhone: '+91 7259743887',
        amount: 0,
        paymentMethod: 'Member',
        therapyType: 'Aromatherapy',
        therapistId: '2', // Rita
        roomId: '1', // Classic
        date: '2025-09-15',
        startTime: new Date('2025-09-15T18:40:00').toISOString(),
        endTime: new Date('2025-09-15T19:40:00').toISOString(),
    },
    {
        id: 'sale-sep15-6',
        customerName: 'Abhishek',
        customerPhone: '+91 9620964597',
        amount: 2500,
        paymentMethod: 'UPI',
        therapyType: 'Aromatherapy',
        therapistId: '5', // Priya
        roomId: '1', // Classic
        date: '2025-09-15',
        startTime: new Date('2025-09-15T20:25:00').toISOString(),
        endTime: new Date('2025-09-15T21:25:00').toISOString(),
    },
];


export const expenses: Expense[] = [
  {
    id: '1',
    description: 'Massage oils and aromatherapy supplies',
    category: 'Supplies',
    amount: 1500.50,
    date: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: '2',
    description: 'Electricity Bill',
    category: 'Utilities',
    amount: 3500,
    date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
  },
  {
    id: '3',
    description: 'Staff Salaries - August',
    category: 'Salary',
    amount: 85000,
    date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
  },
];

const attendanceData: Attendance[] = [];

// Get all unique therapist and date combinations from sales
const salesAttendance = sales.reduce((acc, sale) => {
    const key = `${sale.therapistId}-${sale.date}`;
    if (!acc.has(key)) {
        acc.set(key, {
            id: `att-${sale.therapistId}-${sale.date}`,
            staffId: sale.therapistId,
            date: sale.date,
            status: 'Present' as 'Present',
            checkInTime: '09:00', // Default check-in
        });
    }
    return acc;
}, new Map<string, Attendance>());

// Convert map to array
sales.forEach(sale => {
    const key = `${sale.therapistId}-${sale.date}`;
    if (!attendanceData.find(a => a.id === `att-${sale.therapistId}-${sale.date}`)) {
        attendanceData.push({
            id: `att-${sale.therapistId}-${sale.date}`,
            staffId: sale.therapistId,
            date: sale.date,
            status: 'Present',
            checkInTime: '09:00', // Default check-in time for simplicity
        });
    }
});


export const attendance: Attendance[] = [...new Map(attendanceData.map(item => [item.id, item])).values()];
    

    



    

    
