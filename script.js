// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const error = document.getElementById('error');

            if (username === 'admin' && password === 'admin') {
                localStorage.setItem('loggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                error.textContent = 'Invalid username or password';
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('loggedIn');
            window.location.href = 'login.html';
        });
    }

    // Check if user is logged in
    if (window.location.pathname.includes('dashboard.html') ||
        window.location.pathname.includes('add-student.html') ||
        window.location.pathname.includes('update-student.html') ||
        window.location.pathname.includes('mark-attendance.html') ||
        window.location.pathname.includes('check-attendance.html')) {
        if (localStorage.getItem('loggedIn') !== 'true') {
            window.location.href = 'login.html';
        }
    }

    // Add Student functionality
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('studentName').value;
            const id = document.getElementById('studentId').value;
            const email = document.getElementById('studentEmail').value;
            const studentClass = document.getElementById('studentClass').value;
            const message = document.getElementById('message');

            let students = JSON.parse(localStorage.getItem('students')) || [];
            if (students.find(student => student.id === id)) {
                message.textContent = 'Student ID already exists';
                return;
            }

            students.push({ name, id, email, class: studentClass });
            localStorage.setItem('students', JSON.stringify(students));
            message.textContent = 'Student added successfully';
            addStudentForm.reset();
            updateDashboardStats();
        });
    }

    // Update Student functionality
    const updateStudentForm = document.getElementById('updateStudentForm');
    if (updateStudentForm) {
        updateStudentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('updateStudentId').value;
            const name = document.getElementById('updateStudentName').value;
            const email = document.getElementById('updateStudentEmail').value;
            const studentClass = document.getElementById('updateStudentClass').value;
            const message = document.getElementById('message');

            let students = JSON.parse(localStorage.getItem('students')) || [];
            const studentIndex = students.findIndex(student => student.id === id);
            if (studentIndex === -1) {
                message.textContent = 'Student not found';
                return;
            }

            students[studentIndex] = { name, id, email, class: studentClass };
            localStorage.setItem('students', JSON.stringify(students));
            message.textContent = 'Student updated successfully';
            updateStudentForm.reset();
        });
    }

    // Mark Attendance functionality
    const markAttendanceForm = document.getElementById('markAttendanceForm');
    if (markAttendanceForm) {
        loadStudentsForAttendance();
        markAttendanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const date = document.getElementById('attendanceDate').value;
            const message = document.getElementById('message');

            let attendance = JSON.parse(localStorage.getItem('attendance')) || {};
            if (!attendance[date]) {
                attendance[date] = {};
            }

            const checkboxes = document.querySelectorAll('#studentList input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const studentId = checkbox.id.replace('student-', '');
                attendance[date][studentId] = checkbox.checked ? 'present' : 'absent';
            });

            localStorage.setItem('attendance', JSON.stringify(attendance));
            message.textContent = 'Attendance marked successfully';
            updateDashboardStats();
        });
    }

    // Check Attendance functionality
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            const date = document.getElementById('filterDate').value;
            const studentId = document.getElementById('filterStudent').value;
            displayAttendanceRecords(date, studentId);
        });
        displayAttendanceRecords(); // Display all records initially
    }

    // Update dashboard stats
    function updateDashboardStats() {
        const totalStudentsEl = document.getElementById('totalStudents');
        const presentTodayEl = document.getElementById('presentToday');
        const absentTodayEl = document.getElementById('absentToday');
        if (totalStudentsEl && presentTodayEl && absentTodayEl) {
            const students = JSON.parse(localStorage.getItem('students')) || [];
            const today = new Date().toISOString().split('T')[0];
            const attendance = JSON.parse(localStorage.getItem('attendance')) || {};
            const todayAttendance = attendance[today] || {};
            const presentCount = Object.values(todayAttendance).filter(status => status === 'present').length;
            const absentCount = Object.values(todayAttendance).filter(status => status === 'absent').length;

            totalStudentsEl.textContent = students.length;
            presentTodayEl.textContent = presentCount;
            absentTodayEl.textContent = absentCount;
        }
    }

    // Load students for attendance marking
    function loadStudentsForAttendance() {
        const studentList = document.getElementById('studentList');
        if (studentList) {
            const students = JSON.parse(localStorage.getItem('students')) || [];
            studentList.innerHTML = '';
            students.forEach(student => {
                const div = document.createElement('div');
                div.className = 'student-item';
                div.innerHTML = `
                    <label for="student-${student.id}">${student.name} (${student.id})</label>
                    <input type="checkbox" id="student-${student.id}">
                `;
                studentList.appendChild(div);
            });
        }
    }

    // Display attendance records
    function displayAttendanceRecords(date = '', studentId = '') {
        const attendanceRecords = document.getElementById('attendanceRecords');
        if (attendanceRecords) {
            const attendance = JSON.parse(localStorage.getItem('attendance')) || {};
            const students = JSON.parse(localStorage.getItem('students')) || [];
            attendanceRecords.innerHTML = '';

            Object.keys(attendance).forEach(attendanceDate => {
                if (date && attendanceDate !== date) return;
                Object.keys(attendance[attendanceDate]).forEach(id => {
                    if (studentId && id !== studentId) return;
                    const student = students.find(s => s.id === id);
                    if (student) {
                        const div = document.createElement('div');
                        div.className = 'record';
                        div.innerHTML = `
                            <span>${student.name} (${id})</span>
                            <span>${attendanceDate}</span>
                            <span>${attendance[attendanceDate][id]}</span>
                        `;
                        attendanceRecords.appendChild(div);
                    }
                });
            });
        }
    }

    // Initialize dashboard stats on page load
    updateDashboardStats();
});
