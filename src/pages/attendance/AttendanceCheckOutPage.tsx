import QrAttendanceScanner from "@/features/attendance/components/QrAttendanceScanner";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";
import "./AttendancePages.css";

const AttendanceCheckOutPage = () => (
  <div className="crud-page attendance-page">
    <QrAttendanceScanner mode="check-out" />
  </div>
);

export default AttendanceCheckOutPage;
