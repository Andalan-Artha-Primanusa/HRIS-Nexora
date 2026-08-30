import QrAttendanceScanner from "@/features/attendance/components/QrAttendanceScanner";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";
import "./AttendancePages.css";

const AttendanceCheckInPage = () => (
  <div className="crud-page attendance-page">
    <QrAttendanceScanner mode="check-in" />
  </div>
);

export default AttendanceCheckInPage;
