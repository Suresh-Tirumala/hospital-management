package com.hms.service;

import com.hms.dto.DashboardDTO;
import com.hms.model.Appointment;
import com.hms.model.Bill;
import com.hms.model.Doctor;
import com.hms.model.Patient;
import com.hms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;

    public DashboardService(PatientRepository patientRepository,
                            DoctorRepository doctorRepository,
                            AppointmentRepository appointmentRepository,
                            BillRepository billRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.billRepository = billRepository;
    }

    @Transactional(readOnly = true)
    public DashboardDTO getAdminDashboard() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()).atTime(23, 59, 59);

        BigDecimal totalRevenue = billRepository.calculateRevenueBetween(startOfMonth, endOfMonth);
        BigDecimal collectedRevenue = billRepository.calculateCollectedBetween(startOfMonth, endOfMonth);

        return DashboardDTO.builder()
                .totalPatients(patientRepository.count())
                .totalDoctors(doctorRepository.count())
                .totalAppointments(appointmentRepository.count())
                .todayAppointments(appointmentRepository.countAppointmentsBetween(startOfDay, endOfDay))
                .scheduledAppointments(appointmentRepository.countByStatus(Appointment.Status.SCHEDULED))
                .completedAppointments(appointmentRepository.countByStatus(Appointment.Status.COMPLETED))
                .cancelledAppointments(appointmentRepository.countByStatus(Appointment.Status.CANCELLED))
                .pendingBills(billRepository.countByPaymentStatus(Bill.PaymentStatus.PENDING))
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .collectedRevenue(collectedRevenue != null ? collectedRevenue : BigDecimal.ZERO)
                .activeDoctors(doctorRepository.countByStatus(Doctor.Status.ACTIVE))
                .activePatients(patientRepository.countByStatus(Patient.Status.ACTIVE))
                .build();
    }
}
