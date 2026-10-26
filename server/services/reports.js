import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

/**
 * Generate a PDF report buffer for a faculty member in NAAC/NBA format
 */
export const generateFacultyPdf = async (faculty, academicYear, records, scoreData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Primary header
      doc
        .rect(40, 40, doc.page.width - 80, 70)
        .fill('#5B6CFF')
        .fillColor('#FFFFFF')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('FACULTY PERFORMANCE & ACADEMIC AUDIT REPORT', 55, 55)
        .fontSize(11)
        .font('Helvetica')
        .text(`Academic Year: ${academicYear?.label || 'All'} | NAAC / NBA Accreditation Summary`, 55, 80);

      doc.moveDown(3);
      doc.y = 125;

      // Faculty Info Block
      doc.fillColor('#1B2140').fontSize(14).font('Helvetica-Bold').text('Faculty Profile');
      doc.strokeColor('#ECEEF7').lineWidth(1).moveTo(40, doc.y + 4).lineTo(doc.page.width - 40, doc.y + 4).stroke();
      doc.moveDown(0.8);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${faculty.name} (${faculty.employeeId || 'N/A'})`, { continued: true });
      doc.text(`        Department: ${faculty.department?.name || 'N/A'}`);
      doc.text(`Designation: ${faculty.designation || 'Faculty'}`, { continued: true });
      doc.text(`        Qualification: ${faculty.qualification || 'N/A'}`);
      doc.text(`Email: ${faculty.email}`, { continued: true });
      doc.text(`        Date of Joining: ${faculty.dateOfJoining ? new Date(faculty.dateOfJoining).toLocaleDateString() : 'N/A'}`);

      doc.moveDown(1.5);

      // Score Summary Block
      if (scoreData) {
        doc.fillColor('#1B2140').fontSize(14).font('Helvetica-Bold').text('Consolidated Performance Index (0 - 100)');
        doc.strokeColor('#ECEEF7').lineWidth(1).moveTo(40, doc.y + 4).lineTo(doc.page.width - 40, doc.y + 4).stroke();
        doc.moveDown(0.8);

        doc.fillColor('#5B6CFF').fontSize(22).font('Helvetica-Bold').text(`${scoreData.performanceIndex} / 100`, { continued: true });
        doc.fillColor('#4A5170').fontSize(12).font('Helvetica').text(`   Grade: ${scoreData.grade}`);
        doc.moveDown(0.5);

        doc.fillColor('#1B2140').fontSize(9).font('Helvetica-Bold');
        doc.text('Category Breakdown:');
        doc.font('Helvetica').fillColor('#4A5170');
        const cats = scoreData.categories;
        doc.text(`• Teaching Workload: ${cats.teaching?.score}% (Delivered: ${cats.teaching?.raw} hrs / Target: ${cats.teaching?.target} hrs)`);
        doc.text(`• Research & Publications: ${cats.publications?.score}% (Points: ${cats.publications?.raw} / Target: ${cats.publications?.target})`);
        doc.text(`• FDP & Training: ${cats.fdp?.score}% (Points: ${cats.fdp?.raw} / Target: ${cats.fdp?.target})`);
        doc.text(`• Consultancy Projects: ${cats.consultancy?.score}% (Earned: ₹${cats.consultancy?.raw?.toLocaleString() || 0} / Target: ₹${cats.consultancy?.target?.toLocaleString()})`);
        doc.text(`• Patents & IP: ${cats.patents?.score}% (Points: ${cats.patents?.raw} / Target: ${cats.patents?.target})`);
        doc.text(`• Student Feedback: ${cats.feedback?.score}% (Avg Score: ${cats.feedback?.raw} / 5.0)`);
      }

      doc.moveDown(1.5);

      // Section: Publications
      doc.fillColor('#1B2140').fontSize(13).font('Helvetica-Bold').text(`Approved Publications (${records.publications?.length || 0})`);
      doc.strokeColor('#ECEEF7').lineWidth(1).moveTo(40, doc.y + 4).lineTo(doc.page.width - 40, doc.y + 4).stroke();
      doc.moveDown(0.8);

      if (!records.publications?.length) {
        doc.fillColor('#8A91AD').fontSize(9).font('Helvetica-Oblique').text('No approved publications recorded.');
      } else {
        records.publications.forEach((p, idx) => {
          doc.fillColor('#1B2140').fontSize(9).font('Helvetica-Bold').text(`${idx + 1}. ${p.title}`);
          doc.fillColor('#4A5170').font('Helvetica').text(`    Type: ${p.type} | Indexing: ${p.indexing} | Venue: ${p.venueName} | DOI: ${p.doi || 'N/A'}`);
          doc.moveDown(0.3);
        });
      }

      doc.moveDown(1);

      // Section: Teaching Workload
      doc.fillColor('#1B2140').fontSize(13).font('Helvetica-Bold').text(`Teaching Engagements (${records.teaching?.length || 0})`);
      doc.strokeColor('#ECEEF7').lineWidth(1).moveTo(40, doc.y + 4).lineTo(doc.page.width - 40, doc.y + 4).stroke();
      doc.moveDown(0.8);

      if (!records.teaching?.length) {
        doc.fillColor('#8A91AD').fontSize(9).font('Helvetica-Oblique').text('No approved teaching records found.');
      } else {
        records.teaching.forEach((t, idx) => {
          doc.fillColor('#1B2140').fontSize(9).font('Helvetica-Bold').text(`${idx + 1}. [${t.courseCode}] ${t.courseName} (${t.type})`);
          doc.fillColor('#4A5170').font('Helvetica').text(`    Semester: ${t.semester} | Delivered: ${t.totalHoursDelivered} hrs | Pass %: ${t.passPercentage}% | Feedback: ${t.feedbackScore}/5`);
          doc.moveDown(0.3);
        });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      doc.fontSize(8).fillColor('#8A91AD').text(
        `Generated by Faculty Performance & Academic Activity Dashboard on ${new Date().toLocaleDateString()}`,
        40,
        doc.page.height - 30,
        { align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate Excel workbook for a faculty member in NAAC/NBA tabular format
 */
export const generateFacultyExcel = async (faculty, academicYear, records, scoreData) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Faculty Dashboard System';
  workbook.created = new Date();

  // Sheet 1: Summary & Performance Index
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Parameter', key: 'param', width: 32 },
    { header: 'Value', key: 'value', width: 45 },
  ];
  summarySheet.addRow({ param: 'Faculty Name', value: faculty.name });
  summarySheet.addRow({ param: 'Employee ID', value: faculty.employeeId || 'N/A' });
  summarySheet.addRow({ param: 'Department', value: faculty.department?.name || 'N/A' });
  summarySheet.addRow({ param: 'Designation', value: faculty.designation });
  summarySheet.addRow({ param: 'Academic Year', value: academicYear?.label || 'All' });
  summarySheet.addRow({ param: 'Performance Index (0-100)', value: scoreData?.performanceIndex || 'N/A' });
  summarySheet.addRow({ param: 'Grade', value: scoreData?.grade || 'N/A' });

  // Sheet 2: Publications
  const pubSheet = workbook.addWorksheet('Publications');
  pubSheet.columns = [
    { header: 'Title', key: 'title', width: 40 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Indexing', key: 'indexing', width: 15 },
    { header: 'Venue / Journal', key: 'venueName', width: 30 },
    { header: 'Impact Factor', key: 'impactFactor', width: 14 },
    { header: 'Citations', key: 'citations', width: 12 },
    { header: 'DOI', key: 'doi', width: 25 },
    { header: 'Status', key: 'status', width: 12 },
  ];
  records.publications?.forEach((p) => {
    pubSheet.addRow({
      title: p.title,
      type: p.type,
      indexing: p.indexing,
      venueName: p.venueName,
      impactFactor: p.impactFactor || 0,
      citations: p.citations || 0,
      doi: p.doi || '',
      status: p.status,
    });
  });

  // Sheet 3: Teaching Workload
  const teachSheet = workbook.addWorksheet('Teaching Workload');
  teachSheet.columns = [
    { header: 'Course Code', key: 'courseCode', width: 15 },
    { header: 'Course Name', key: 'courseName', width: 35 },
    { header: 'Semester', key: 'semester', width: 12 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Hours/Week', key: 'hoursPerWeek', width: 14 },
    { header: 'Total Delivered', key: 'totalHoursDelivered', width: 16 },
    { header: 'Pass %', key: 'passPercentage', width: 12 },
    { header: 'Feedback (0-5)', key: 'feedbackScore', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
  ];
  records.teaching?.forEach((t) => {
    teachSheet.addRow({
      courseCode: t.courseCode,
      courseName: t.courseName,
      semester: t.semester,
      type: t.type,
      hoursPerWeek: t.hoursPerWeek,
      totalHoursDelivered: t.totalHoursDelivered,
      passPercentage: t.passPercentage,
      feedbackScore: t.feedbackScore,
      status: t.status,
    });
  });

  // Sheet 4: FDPs
  const fdpSheet = workbook.addWorksheet('FDPs & Workshops');
  fdpSheet.columns = [
    { header: 'Title', key: 'title', width: 35 },
    { header: 'Role', key: 'role', width: 16 },
    { header: 'Organizer', key: 'organizer', width: 30 },
    { header: 'Mode', key: 'mode', width: 12 },
    { header: 'Duration (Days)', key: 'durationDays', width: 16 },
    { header: 'Status', key: 'status', width: 12 },
  ];
  records.fdp?.forEach((f) => {
    fdpSheet.addRow({
      title: f.title,
      role: f.role,
      organizer: f.organizer,
      mode: f.mode,
      durationDays: f.durationDays,
      status: f.status,
    });
  });

  // Sheet 5: Consultancy
  const consultSheet = workbook.addWorksheet('Consultancy');
  consultSheet.columns = [
    { header: 'Project Title', key: 'projectTitle', width: 35 },
    { header: 'Client Organization', key: 'clientOrganization', width: 30 },
    { header: 'Role', key: 'role', width: 12 },
    { header: 'Amount (INR)', key: 'amountEarned', width: 16 },
    { header: 'Project Status', key: 'projectStatus', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
  ];
  records.consultancy?.forEach((c) => {
    consultSheet.addRow({
      projectTitle: c.projectTitle,
      clientOrganization: c.clientOrganization,
      role: c.role,
      amountEarned: c.amountEarned,
      projectStatus: c.projectStatus,
      status: c.status,
    });
  });

  // Sheet 6: Patents
  const patentSheet = workbook.addWorksheet('Patents');
  patentSheet.columns = [
    { header: 'Patent Title', key: 'title', width: 35 },
    { header: 'Application No.', key: 'applicationNumber', width: 20 },
    { header: 'Stage', key: 'type', width: 14 },
    { header: 'Country', key: 'country', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
  ];
  records.patents?.forEach((p) => {
    patentSheet.addRow({
      title: p.title,
      applicationNumber: p.applicationNumber,
      type: p.type,
      country: p.country,
      status: p.status,
    });
  });

  return await workbook.xlsx.writeBuffer();
};

/**
 * Generate Excel workbook for an entire Department
 */
export const generateDepartmentExcel = async (department, academicYear, facultyScores) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Department Performance');

  sheet.columns = [
    { header: 'Rank', key: 'rank', width: 8 },
    { header: 'Faculty Name', key: 'name', width: 28 },
    { header: 'Designation', key: 'designation', width: 22 },
    { header: 'Performance Index', key: 'index', width: 18 },
    { header: 'Grade', key: 'grade', width: 16 },
    { header: 'Teaching %', key: 'teaching', width: 14 },
    { header: 'Publications %', key: 'publications', width: 16 },
    { header: 'FDP %', key: 'fdp', width: 12 },
    { header: 'Consultancy %', key: 'consultancy', width: 16 },
    { header: 'Patents %', key: 'patents', width: 12 },
  ];

  facultyScores.forEach((item, index) => {
    sheet.addRow({
      rank: index + 1,
      name: item.faculty.name,
      designation: item.faculty.designation,
      index: item.score.performanceIndex,
      grade: item.score.grade,
      teaching: item.score.categories.teaching.score,
      publications: item.score.categories.publications.score,
      fdp: item.score.categories.fdp.score,
      consultancy: item.score.categories.consultancy.score,
      patents: item.score.categories.patents.score,
    });
  });

  return await workbook.xlsx.writeBuffer();
};
