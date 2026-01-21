// Mock users for demo
export const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@school.com',
    password: 'password', // In production, this should be hashed
    role: 'admin'
  },
  {
    id: '2',
    name: 'Teacher John',
    email: 'teacher@school.com',
    password: 'password',
    role: 'teacher'
  }
];

export const mockStudents = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@student.com',
    enrollmentNumber: 'STU001',
    class: '10A',
    section: 'A',
    rollNumber: 1,
    fatherName: 'Mr. Doe',
    motherName: 'Mrs. Doe',
    phone: '9876543210',
    status: 'active',
    dateOfBirth: '2010-05-15',
    address: 'Delhi, India'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@student.com',
    enrollmentNumber: 'STU002',
    class: '10B',
    section: 'B',
    rollNumber: 1,
    fatherName: 'Mr. Smith',
    motherName: 'Mrs. Smith',
    phone: '9876543211',
    status: 'active',
    dateOfBirth: '2010-06-20',
    address: 'Noida, India'
  },
  {
    id: '3',
    name: 'Alice Brown',
    email: 'alice@student.com',
    enrollmentNumber: 'STU003',
    class: '10A',
    section: 'A',
    rollNumber: 2,
    fatherName: 'Mr. Brown',
    motherName: 'Mrs. Brown',
    phone: '9876543212',
    status: 'active',
    dateOfBirth: '2010-07-10',
    address: 'Gurgaon, India'
  },
  {
    id: '4',
    name: 'Bob Wilson',
    email: 'bob@student.com',
    enrollmentNumber: 'STU004',
    class: '10B',
    section: 'B',
    rollNumber: 2,
    fatherName: 'Mr. Wilson',
    motherName: 'Mrs. Wilson',
    phone: '9876543213',
    status: 'active',
    dateOfBirth: '2010-08-25',
    address: 'Bangalore, India'
  },
  {
    id: '5',
    name: 'Charlie Davis',
    email: 'charlie@student.com',
    enrollmentNumber: 'STU005',
    class: '9A',
    section: 'A',
    rollNumber: 1,
    fatherName: 'Mr. Davis',
    motherName: 'Mrs. Davis',
    phone: '9876543214',
    status: 'active',
    dateOfBirth: '2011-03-12',
    address: 'Hyderabad, India'
  }
];

export const mockTeachers = [
  {
    id: 1,
    name: 'Mr. Smith',
    email: 'smith@teacher.com',
    department: 'Mathematics',
    subject: 'Mathematics',
    qualification: 'B.Tech (CSE)',
    experience: 8,
    joinDate: '2018-06-15',
    phone: '9876543210',
    address: 'Delhi, India',
    status: 'active'
  },
  {
    id: 2,
    name: 'Ms. Priya Sharma',
    email: 'priya@teacher.com',
    department: 'Science',
    subject: 'Physics',
    qualification: 'M.Sc Physics',
    experience: 6,
    joinDate: '2020-01-10',
    phone: '9876543211',
    address: 'Noida, India',
    status: 'active'
  },
  {
    id: 3,
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh@teacher.com',
    department: 'Science',
    subject: 'Chemistry',
    qualification: 'Ph.D Chemistry',
    experience: 12,
    joinDate: '2014-07-22',
    phone: '9876543212',
    address: 'Gurgaon, India',
    status: 'active'
  },
  {
    id: 4,
    name: 'Mr. Vikram Singh',
    email: 'vikram@teacher.com',
    department: 'English',
    subject: 'English',
    qualification: 'M.A English',
    experience: 5,
    joinDate: '2021-03-18',
    phone: '9876543213',
    address: 'Delhi, India',
    status: 'active'
  },
  {
    id: 5,
    name: 'Mrs. Neha Gupta',
    email: 'neha@teacher.com',
    department: 'Mathematics',
    subject: 'Mathematics',
    qualification: 'B.Ed, M.Sc',
    experience: 9,
    joinDate: '2017-05-12',
    phone: '9876543214',
    address: 'Bangalore, India',
    status: 'active'
  }
];

export const mockAdmissions = [
  {
    id: '1',
    studentName: 'Alex Johnson',
    class: '9',
    parentEmail: 'parent@email.com',
    status: 'pending',
    appliedDate: new Date()
  }
];

export const mockAttendance = [
  {
    date: new Date().toISOString(),
    studentId: '1',
    status: 'present'
  }
];

export const mockFees = [
  {
    id: 1,
    studentId: '1',
    studentName: 'John Doe',
    amount: 5000,
    type: 'tuition',
    dueDate: '2026-02-28',
    status: 'pending'
  },
  {
    id: 2,
    studentId: '2',
    studentName: 'Jane Smith',
    amount: 5000,
    type: 'transport',
    dueDate: '2026-02-28',
    status: 'paid'
  }
];

export const mockAttendanceRecords = [
  {
    id: 1,
    studentId: '1',
    studentName: 'John Doe',
    rollNo: '1',
    class: '10A',
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  },
  {
    id: 2,
    studentId: '2',
    studentName: 'Jane Smith',
    rollNo: '2',
    class: '10B',
    date: new Date().toISOString().split('T')[0],
    status: 'absent'
  },
  {
    id: 3,
    studentId: '3',
    studentName: 'Alice Brown',
    rollNo: '3',
    class: '10A',
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  },
  {
    id: 4,
    studentId: '4',
    studentName: 'Bob Wilson',
    rollNo: '4',
    class: '10B',
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  },
  {
    id: 5,
    studentId: '5',
    studentName: 'Charlie Davis',
    rollNo: '5',
    class: '9A',
    date: new Date().toISOString().split('T')[0],
    status: 'absent'
  }
];

export const mockExams = [
  {
    id: 1,
    name: 'Term 1 Final',
    date: '2026-03-15',
    subject: 'Mathematics',
    class: '10A',
    maxMarks: 100,
    totalStudents: 45,
    durationMinutes: 120,
    examType: 'Final',
    status: 'completed'
  },
  {
    id: 2,
    name: 'Mid Term Test',
    date: '2026-02-20',
    subject: 'Science',
    class: '10B',
    maxMarks: 50,
    totalStudents: 45,
    durationMinutes: 60,
    examType: 'Mid Term',
    status: 'completed'
  },
  {
    id: 3,
    name: 'Unit Test 1',
    date: '2026-02-10',
    subject: 'English',
    class: '9A',
    maxMarks: 25,
    totalStudents: 40,
    durationMinutes: 45,
    examType: 'Unit Test',
    status: 'completed'
  },
  {
    id: 4,
    name: 'Pre-Final Practice',
    date: '2026-03-01',
    subject: 'History',
    class: '10A',
    maxMarks: 80,
    totalStudents: 45,
    durationMinutes: 90,
    examType: 'Practice',
    status: 'upcoming'
  }
];

export const mockTestScores = [
  {
    id: 1,
    examId: 1,
    studentId: '1',
    studentName: 'John Doe',
    subject: 'Mathematics',
    score: 85,
    maxMarks: 100,
    percentage: 85,
    grade: 'A',
    remarks: 'Excellent performance'
  },
  {
    id: 2,
    examId: 1,
    studentId: '2',
    studentName: 'Jane Smith',
    subject: 'Mathematics',
    score: 92,
    maxMarks: 100,
    percentage: 92,
    grade: 'A+',
    remarks: 'Outstanding'
  },
  {
    id: 3,
    examId: 2,
    studentId: '3',
    studentName: 'Alice Brown',
    subject: 'Science',
    score: 38,
    maxMarks: 50,
    percentage: 76,
    grade: 'B',
    remarks: 'Good attempt'
  },
  {
    id: 4,
    examId: 2,
    studentId: '4',
    studentName: 'Bob Wilson',
    subject: 'Science',
    score: 45,
    maxMarks: 50,
    percentage: 90,
    grade: 'A',
    remarks: 'Excellent'
  }
];

export const mockBooks = [
  {
    id: 1,
    title: 'Mathematics Fundamentals',
    author: 'R.S. Aggarwal',
    isbn: '978-8190641623',
    status: 'available'
  },
  {
    id: 2,
    title: 'Science Guide',
    author: 'Pradeep Publications',
    isbn: '978-8173737695',
    status: 'issued'
  },
  {
    id: 3,
    title: 'English Literature',
    author: 'T. S. Eliot',
    isbn: '978-0156031240',
    status: 'available'
  }
];

export const mockRoutes = [
  {
    id: 1,
    name: 'Route A - North District',
    routeNumber: 'A-001',
    driver: 'Raj Kumar',
    vehicle: 'DL-01-AA-1234',
    students: 35,
    status: 'Active'
  },
  {
    id: 2,
    name: 'Route B - South District',
    routeNumber: 'B-002',
    driver: 'Anil Singh',
    vehicle: 'DL-01-AB-5678',
    students: 28,
    status: 'Active'
  }
];

export const mockEmployees = [
  {
    id: 1,
    name: 'Mr. Ram Kumar',
    position: 'Principal',
    department: 'Administration',
    email: 'principal@school.com',
    salary: 80000,
    status: 'Active'
  },
  {
    id: 2,
    name: 'Ms. Priya Singh',
    position: 'Vice Principal',
    department: 'Administration',
    email: 'vprincipal@school.com',
    salary: 65000,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Mr. Amit Sharma',
    position: 'Teacher',
    department: 'Science',
    email: 'amit@school.com',
    salary: 35000,
    status: 'Active'
  }
];

export const mockData = {
  students: mockStudents,
  teachers: mockTeachers,
  admissions: mockAdmissions,
  attendance: mockAttendanceRecords,
  fees: mockFees,
  exams: mockExams,
  testScores: mockTestScores,
  books: mockBooks,
  routes: mockRoutes,
  employees: mockEmployees,
  users: mockUsers
};
