package com.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
    private long todayAppointments;
    private long scheduledAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long pendingBills;
    private BigDecimal totalRevenue;
    private BigDecimal collectedRevenue;
    private long activeDoctors;
    private long activePatients;
}
