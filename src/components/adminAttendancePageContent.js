import { AdminContext } from "../pages/adminPage";
import SmartTable from "./table";
import { useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
export const AdminAttendancePage = () => {
  const { socket } = useContext(AdminContext);
  const queryClient = useQueryClient();

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => queryClient.getQueryData(['attendance']) || [],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  useEffect(() => {
    if (!socket) return;

    const handleAttendanceUpdate = (data) => {
      queryClient.setQueryData(['attendance'], data);
    };

    socket.on('attendance-update', handleAttendanceUpdate);

    return () => {
      socket.off('attendance-update', handleAttendanceUpdate);
    };
  }, [socket, queryClient]);

 const forceStop = (studentId) => {
  if (!socket) return;

  const allAttendance = queryClient.getQueryData(['attendance']) || [];
  const studentRecord = allAttendance.find(record => record.studentId === studentId);

  if (!studentRecord) {
    console.warn(`No attendance record found for studentId: ${studentId}`);
    return;
  }

  socket.emit('admin-stop-exam', { 
    studentId,
    examId: studentRecord.examId 
  });

  socket.once('student-stopped', ({ studentId: stoppedId }) => {
    console.log('Student exam stopped:', stoppedId);

    queryClient.setQueryData(['attendance'], (prev = []) =>
      prev.filter(s => s.studentId !== stoppedId)
    );
  });
};

  return (
    <div className="p-4">
      <h3 className="mb-3">Live Attendance Overview</h3>
      <SmartTable
        actions={{ forceStop: (regno) => forceStop(regno) }}
        actionParams={'studentId'}
        contents={attendance}
      />
    </div>
  );
}
