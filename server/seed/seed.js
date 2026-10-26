import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { AcademicYear } from '../models/AcademicYear.js';
import { ScoringConfig } from '../models/ScoringConfig.js';
import { TeachingWorkload } from '../models/TeachingWorkload.js';
import { Publication } from '../models/Publication.js';
import { FDP } from '../models/FDP.js';
import { Consultancy } from '../models/Consultancy.js';
import { Patent } from '../models/Patent.js';
import { AuditLog } from '../models/AuditLog.js';

dotenv.config();

export const runSeed = async (clearFirst = true) => {
  try {
    if (clearFirst) {
      console.log('[Seeder] Clearing old collections...');
      await Promise.all([
        User.deleteMany({}),
        Department.deleteMany({}),
        AcademicYear.deleteMany({}),
        ScoringConfig.deleteMany({}),
        TeachingWorkload.deleteMany({}),
        Publication.deleteMany({}),
        FDP.deleteMany({}),
        Consultancy.deleteMany({}),
        Patent.deleteMany({}),
        AuditLog.deleteMany({}),
      ]);
    }

    console.log('[Seeder] Creating Academic Years...');
    const academicYears = await AcademicYear.insertMany([
      {
        label: '2023-24',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2024-05-31'),
        isCurrent: false,
      },
      {
        label: '2024-25',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        isCurrent: false,
      },
      {
        label: '2025-26',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2026-05-31'),
        isCurrent: true,
      },
    ]);
    const currentYear = academicYears.find((y) => y.isCurrent);

    console.log('[Seeder] Initializing Scoring Configuration...');
    await ScoringConfig.create({
      isActive: true,
      weights: {
        teaching: 30,
        publications: 25,
        fdp: 10,
        consultancy: 15,
        patents: 10,
        feedback: 10,
      },
      targets: {
        teachingHours: 120,
        publicationPoints: 30,
        fdpPoints: 20,
        consultancyAmount: 100000,
        patentPoints: 15,
        feedbackScore: 5,
      },
    });

    console.log('[Seeder] Creating Departments...');
    const departments = await Department.insertMany([
      {
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science & Engineering',
      },
      {
        name: 'Electronics & Communication Engineering',
        code: 'ECE',
        description: 'Department of Electronics & Communication Engineering',
      },
      {
        name: 'Mechanical Engineering',
        code: 'MECH',
        description: 'Department of Mechanical Engineering',
      },
    ]);

    const cseDept = departments[0];
    const eceDept = departments[1];
    const mechDept = departments[2];

    console.log('[Seeder] Creating Admin and HoD Users...');
    const adminPasswordHash = await User.hashPassword('Admin@123');
    const hodPasswordHash = await User.hashPassword('Hod@123');
    const facultyPasswordHash = await User.hashPassword('Faculty@123');

    // 1 Admin
    const admin = await User.create({
      name: 'Dr. Arthur Vance (Dean Academic)',
      email: 'admin@college.edu',
      passwordHash: adminPasswordHash,
      role: 'admin',
      employeeId: 'ADM001',
      designation: 'Dean Academic & IQAC Director',
      qualification: 'Ph.D., Postdoc (MIT)',
      phone: '+91 98765 43210',
    });

    // 3 HoDs
    const hodCse = await User.create({
      name: 'Dr. Rajesh Ramanathan',
      email: 'hod.cse@college.edu',
      passwordHash: hodPasswordHash,
      role: 'hod',
      department: cseDept._id,
      employeeId: 'HOD001',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. (IIT Madras)',
      phone: '+91 98765 43211',
    });

    const hodEce = await User.create({
      name: 'Dr. Sunita Deshmukh',
      email: 'hod.ece@college.edu',
      passwordHash: hodPasswordHash,
      role: 'hod',
      department: eceDept._id,
      employeeId: 'HOD002',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. (IISc Bangalore)',
      phone: '+91 98765 43212',
    });

    const hodMech = await User.create({
      name: 'Dr. Anand Kulkarni',
      email: 'hod.mech@college.edu',
      passwordHash: hodPasswordHash,
      role: 'hod',
      department: mechDept._id,
      employeeId: 'HOD003',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. (IIT Bombay)',
      phone: '+91 98765 43213',
    });

    // Update departments with their HoD IDs
    cseDept.hod = hodCse._id;
    eceDept.hod = hodEce._id;
    mechDept.hod = hodMech._id;
    await Promise.all([cseDept.save(), eceDept.save(), mechDept.save()]);

    console.log('[Seeder] Creating 12 Faculty members...');
    const facultyData = [
      // CSE Faculty (1 to 4)
      { name: 'Dr. Priya Sharma', email: 'faculty1@college.edu', dept: cseDept._id, empId: 'CSE101', desig: 'Associate Professor', qual: 'Ph.D. (IIT Delhi)' },
      { name: 'Dr. Vikramaditya Rao', email: 'faculty2@college.edu', dept: cseDept._id, empId: 'CSE102', desig: 'Assistant Professor (Sr. Gr)', qual: 'Ph.D. (NIT Trichy)' },
      { name: 'Prof. Ananya Iyer', email: 'faculty3@college.edu', dept: cseDept._id, empId: 'CSE103', desig: 'Assistant Professor', qual: 'M.Tech (BITS Pilani)' },
      { name: 'Dr. Karthik Sundaram', email: 'faculty4@college.edu', dept: cseDept._id, empId: 'CSE104', desig: 'Associate Professor', qual: 'Ph.D. (Anna University)' },

      // ECE Faculty (5 to 8)
      { name: 'Dr. Meera Nambiar', email: 'faculty5@college.edu', dept: eceDept._id, empId: 'ECE101', desig: 'Associate Professor', qual: 'Ph.D. (IIT Kharagpur)' },
      { name: 'Prof. Rohan Sen', email: 'faculty6@college.edu', dept: eceDept._id, empId: 'ECE102', desig: 'Assistant Professor', qual: 'M.Tech (IIT Roorkee)' },
      { name: 'Dr. Divya Balasubramanian', email: 'faculty7@college.edu', dept: eceDept._id, empId: 'ECE103', desig: 'Assistant Professor (Sr. Gr)', qual: 'Ph.D. (NIT Surathkal)' },
      { name: 'Prof. Sameer Khan', email: 'faculty8@college.edu', dept: eceDept._id, empId: 'ECE104', desig: 'Assistant Professor', qual: 'M.Tech (VTU)' },

      // MECH Faculty (9 to 12)
      { name: 'Dr. Suresh Varma', email: 'faculty9@college.edu', dept: mechDept._id, empId: 'MEC101', desig: 'Professor', qual: 'Ph.D. (IIT Kanpur)' },
      { name: 'Dr. Pooja Hegde', email: 'faculty10@college.edu', dept: mechDept._id, empId: 'MEC102', desig: 'Associate Professor', qual: 'Ph.D. (NIT Calicut)' },
      { name: 'Prof. Arjun Nair', email: 'faculty11@college.edu', dept: mechDept._id, empId: 'MEC103', desig: 'Assistant Professor', qual: 'M.Tech (IIT Madras)' },
      { name: 'Dr. Neha Kulkarni', email: 'faculty12@college.edu', dept: mechDept._id, empId: 'MEC104', desig: 'Assistant Professor (Sr. Gr)', qual: 'Ph.D. (IIT Bombay)' },
    ];

    const facultyUsers = [];
    for (const f of facultyData) {
      const user = await User.create({
        name: f.name,
        email: f.email,
        passwordHash: facultyPasswordHash,
        role: 'faculty',
        department: f.dept,
        employeeId: f.empId,
        designation: f.desig,
        qualification: f.qual,
        phone: `+91 94${Math.floor(10000000 + Math.random() * 90000000)}`,
      });
      facultyUsers.push(user);
    }

    console.log('[Seeder] Generating realistic activity records across modules...');

    const statuses = ['Approved', 'Approved', 'Approved', 'Submitted', 'Draft', 'Rejected'];
    const courses = [
      { code: 'CS301', name: 'Design and Analysis of Algorithms', type: 'Theory', hours: 45, sem: 'Odd' },
      { code: 'CS302', name: 'Operating Systems Laboratory', type: 'Lab', hours: 60, sem: 'Odd' },
      { code: 'CS401', name: 'Cloud Computing & Distributed Systems', type: 'Theory', hours: 42, sem: 'Even' },
      { code: 'CS405', name: 'Deep Learning & Neural Networks', type: 'Theory', hours: 45, sem: 'Even' },
      { code: 'CS499', name: 'Capstone Engineering Project', type: 'Project', hours: 30, sem: 'Even' },
    ];

    const pubSamples = [
      { title: 'Federated Edge Learning with Differential Privacy for IoMT Networks', type: 'Journal', indexing: 'SCI', venue: 'IEEE Transactions on Industrial Informatics', if: 11.7, cit: 18 },
      { title: 'Explainable AI for Early Malignancy Detection in Histopathological Imaging', type: 'Journal', indexing: 'Scopus', venue: 'Computers in Biology and Medicine', if: 7.2, cit: 24 },
      { title: 'Resource-Constrained Transformer Models for Autonomous Drone Navigation', type: 'Conference', indexing: 'Scopus', venue: 'IEEE CVPR Workshops 2025', if: 0, cit: 9 },
      { title: 'Energy-Efficient Blockchain Consensus in Smart Grids', type: 'Journal', indexing: 'WoS', venue: 'Elsevier Sustainable Energy Technologies', if: 5.4, cit: 12 },
      { title: 'Handbook of Modern Cryptographic Protocols in Post-Quantum Computing', type: 'Book Chapter', indexing: 'Scopus', venue: 'Springer Natural Computing Series', if: 0, cit: 5 },
      { title: 'Multi-Modal Representation Learning for Low-Resource Indic Languages', type: 'Conference', indexing: 'Scopus', venue: 'ACL Findings 2025', if: 0, cit: 7 },
    ];

    const fdpSamples = [
      { title: 'AICTE ATAL FDP on Quantum Machine Learning & Cyber-Physical Systems', role: 'Attended', org: 'IIT Madras', mode: 'Offline', days: 5 },
      { title: 'National Workshop on High Performance Computing & CUDA Programming', role: 'Organized', org: 'College Center of Excellence', mode: 'Offline', days: 6 },
      { title: 'Faculty Immersion: Industry 4.0 and Generative AI Architectures', role: 'Resource Person', org: 'NASSCOM FutureSkills', mode: 'Online', days: 3 },
      { title: 'Hands-on Bootcamp: Kubernetes, Microservices & DevSecOps', role: 'Attended', org: 'IEEE Computer Society', mode: 'Online', days: 5 },
    ];

    const consultSamples = [
      { title: 'Smart Automated Quality Inspection Vision System for Automotive Parts', client: 'TVS Motor Company Ltd.', role: 'PI', amt: 250000, status: 'Completed' },
      { title: 'Edge AI Firmware for Solar Microgrid Inverter Monitoring', client: 'Schneider Electric India', role: 'Co-PI', amt: 180000, status: 'Ongoing' },
      { title: 'NLP-Driven Legal Contract Compliance & Clause Anomaly Detector', client: 'LexisNexis Solutions', role: 'PI', amt: 120000, status: 'Completed' },
    ];

    const patentSamples = [
      { title: 'An IoT-Based Non-Invasive Continuous Glucose Monitoring System', appNo: '202441018921 A', type: 'Granted', country: 'India' },
      { title: 'Adaptive Dynamic Bandwidth Allocation Framework for Low-Latency 6G RAN', appNo: '202541009382 A', type: 'Published', country: 'India' },
      { title: 'Autonomous UAV Drone Docking Station with Wireless Resonant Charging', appNo: '202541029104 A', type: 'Filed', country: 'India' },
    ];

    // Seed activity records for all 12 faculty members across all 3 academic years
    for (const faculty of facultyUsers) {
      for (const year of academicYears) {
        const isCurrent = year.isCurrent;

        // 1. Teaching Workload
        for (let i = 0; i < 3; i++) {
          const course = courses[(i + Math.floor(Math.random() * courses.length)) % courses.length];
          const st = isCurrent ? statuses[Math.floor(Math.random() * statuses.length)] : 'Approved';
          await TeachingWorkload.create({
            faculty: faculty._id,
            academicYear: year._id,
            semester: course.sem,
            courseCode: `${course.code}`,
            courseName: course.name,
            program: 'B.Tech CSE',
            type: course.type,
            hoursPerWeek: course.type === 'Lab' ? 4 : 3,
            totalHoursDelivered: course.hours + Math.floor(Math.random() * 8),
            studentsCount: 60 + Math.floor(Math.random() * 15),
            passPercentage: 88 + Math.floor(Math.random() * 11),
            feedbackScore: Number((4.1 + Math.random() * 0.8).toFixed(1)),
            status: st,
            remarks: st === 'Approved' ? 'Verified with attendance register.' : st === 'Rejected' ? 'Class delivery log incomplete.' : '',
          });
        }

        // 2. Publications
        const pubCount = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < pubCount; i++) {
          const sample = pubSamples[(i + Math.floor(Math.random() * pubSamples.length)) % pubSamples.length];
          const st = isCurrent ? statuses[Math.floor(Math.random() * statuses.length)] : 'Approved';
          await Publication.create({
            faculty: faculty._id,
            academicYear: year._id,
            title: `${sample.title} [Vol. ${year.label}]`,
            type: sample.type,
            venueName: sample.venue,
            indexing: sample.indexing,
            publishedDate: new Date(year.startDate.getTime() + Math.random() * (180 * 86400000)),
            doi: `10.1109/TII.2025.${Math.floor(100000 + Math.random() * 900000)}`,
            issnIsbn: '2169-3536',
            coAuthors: ['Dr. A. Verma', 'Prof. J. Smith'],
            impactFactor: sample.if,
            citations: sample.cit + Math.floor(Math.random() * 10),
            status: st,
            remarks: st === 'Approved' ? 'Verified in Scopus/WoS database index.' : '',
          });
        }

        // 3. FDPs
        const fdpCount = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < fdpCount; i++) {
          const sample = fdpSamples[(i + Math.floor(Math.random() * fdpSamples.length)) % fdpSamples.length];
          const st = isCurrent ? statuses[Math.floor(Math.random() * statuses.length)] : 'Approved';
          await FDP.create({
            faculty: faculty._id,
            academicYear: year._id,
            title: sample.title,
            role: sample.role,
            organizer: sample.org,
            mode: sample.mode,
            startDate: new Date(year.startDate.getTime() + 30 * 86400000),
            endDate: new Date(year.startDate.getTime() + 35 * 86400000),
            durationDays: sample.days,
            status: st,
            remarks: st === 'Approved' ? 'Certificate verified and archived.' : '',
          });
        }

        // 4. Consultancy (for ~50% of records)
        if (Math.random() > 0.4) {
          const sample = consultSamples[Math.floor(Math.random() * consultSamples.length)];
          const st = isCurrent ? statuses[Math.floor(Math.random() * statuses.length)] : 'Approved';
          await Consultancy.create({
            faculty: faculty._id,
            academicYear: year._id,
            projectTitle: sample.title,
            clientOrganization: sample.client,
            role: sample.role,
            amountEarned: sample.amt,
            startDate: new Date(year.startDate.getTime() + 20 * 86400000),
            endDate: new Date(year.startDate.getTime() + 180 * 86400000),
            projectStatus: sample.status,
            status: st,
            remarks: st === 'Approved' ? 'Institutional overheads and sanction letter verified.' : '',
          });
        }

        // 5. Patents (for ~40% of records)
        if (Math.random() > 0.5) {
          const sample = patentSamples[Math.floor(Math.random() * patentSamples.length)];
          const st = isCurrent ? statuses[Math.floor(Math.random() * statuses.length)] : 'Approved';
          await Patent.create({
            faculty: faculty._id,
            academicYear: year._id,
            title: sample.title,
            applicationNumber: sample.appNo,
            type: sample.type,
            filingDate: new Date(year.startDate.getTime() + 15 * 86400000),
            grantDate: sample.type === 'Granted' ? new Date(year.startDate.getTime() + 200 * 86400000) : null,
            coInventors: ['Dr. Rajesh Ramanathan', 'Dr. Priya Sharma'],
            country: sample.country,
            status: st,
            remarks: st === 'Approved' ? 'Official Patent Gazette entry verified.' : '',
          });
        }
      }
    }

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETE!');
    console.log('======================================================');
    console.log('Demo Credentials:');
    console.log('------------------------------------------------------');
    console.log('👑 ADMIN:     admin@college.edu       / Admin@123');
    console.log('🏢 HoD (CSE): hod.cse@college.edu     / Hod@123');
    console.log('👨‍🏫 FACULTY:   faculty1@college.edu    / Faculty@123');
    console.log('======================================================\n');

    return true;
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// If executed directly from command line
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await runSeed(true);
    await disconnectDB();
    process.exit(0);
  })();
}

