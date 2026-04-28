package com.hms.repository;

import com.hms.model.Bill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    Optional<Bill> findByBillNumber(String billNumber);

    Optional<Bill> findByAppointmentId(Long appointmentId);

    Page<Bill> findByPatientId(Long patientId, Pageable pageable);

    Page<Bill> findByPaymentStatus(Bill.PaymentStatus status, Pageable pageable);

    @Query("SELECT SUM(b.totalAmount) FROM Bill b WHERE b.createdAt BETWEEN :start AND :end")
    BigDecimal calculateRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(b.paidAmount) FROM Bill b WHERE b.createdAt BETWEEN :start AND :end")
    BigDecimal calculateCollectedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByPaymentStatus(Bill.PaymentStatus status);
}
