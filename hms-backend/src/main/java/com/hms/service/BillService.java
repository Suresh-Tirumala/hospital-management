package com.hms.service;

import com.hms.dto.BillDTO;
import com.hms.exception.BadRequestException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.model.*;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.BillRepository;
import com.hms.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class BillService {

    private static final Logger log = LoggerFactory.getLogger(BillService.class);
    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final AtomicLong billCounter = new AtomicLong(0);
    private final AtomicLong txnCounter = new AtomicLong(0);

    public BillService(BillRepository billRepository,
                       AppointmentRepository appointmentRepository,
                       PaymentRepository paymentRepository) {
        this.billRepository = billRepository;
        this.appointmentRepository = appointmentRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public BillDTO.Response createBill(BillDTO.CreateRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        if (billRepository.findByAppointmentId(appointment.getId()).isPresent()) {
            throw new BadRequestException("Bill already exists for this appointment");
        }

        BigDecimal consultationCharge = request.getConsultationCharge() != null ?
                request.getConsultationCharge() : appointment.getDoctor().getConsultationFee();
        BigDecimal treatmentCharge = request.getTreatmentCharge() != null ? request.getTreatmentCharge() : BigDecimal.ZERO;
        BigDecimal medicationCharge = request.getMedicationCharge() != null ? request.getMedicationCharge() : BigDecimal.ZERO;
        BigDecimal labTestCharge = request.getLabTestCharge() != null ? request.getLabTestCharge() : BigDecimal.ZERO;
        BigDecimal otherCharges = request.getOtherCharges() != null ? request.getOtherCharges() : BigDecimal.ZERO;
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal tax = request.getTax() != null ? request.getTax() : BigDecimal.ZERO;

        BigDecimal totalAmount = consultationCharge
                .add(treatmentCharge)
                .add(medicationCharge)
                .add(labTestCharge)
                .add(otherCharges)
                .add(tax)
                .subtract(discount);

        String billNumber = generateBillNumber();

        Bill bill = Bill.builder()
                .billNumber(billNumber)
                .appointment(appointment)
                .patient(appointment.getPatient())
                .consultationCharge(consultationCharge)
                .treatmentCharge(treatmentCharge)
                .medicationCharge(medicationCharge)
                .labTestCharge(labTestCharge)
                .otherCharges(otherCharges)
                .discount(discount)
                .tax(tax)
                .totalAmount(totalAmount)
                .paidAmount(BigDecimal.ZERO)
                .paymentStatus(Bill.PaymentStatus.PENDING)
                .notes(request.getNotes())
                .build();

        bill = billRepository.save(bill);
        log.info("Bill created: {} for appointment {} - Total: {}",
                billNumber, appointment.getAppointmentId(), totalAmount);
        return toResponse(bill);
    }

    @Transactional(readOnly = true)
    public Page<BillDTO.Response> getAllBills(Pageable pageable) {
        return billRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public BillDTO.Response getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        return toResponse(bill);
    }

    @Transactional(readOnly = true)
    public Page<BillDTO.Response> getBillsByPatient(Long patientId, Pageable pageable) {
        return billRepository.findByPatientId(patientId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<BillDTO.Response> getBillsByStatus(String status, Pageable pageable) {
        Bill.PaymentStatus paymentStatus = Bill.PaymentStatus.valueOf(status.toUpperCase());
        return billRepository.findByPaymentStatus(paymentStatus, pageable).map(this::toResponse);
    }

    @Transactional
    public BillDTO.Response addPayment(Long billId, BillDTO.PaymentRequest request, String receivedBy) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", billId));

        if (bill.getPaymentStatus() == Bill.PaymentStatus.PAID) {
            throw new BadRequestException("Bill is already fully paid");
        }

        BigDecimal remainingAmount = bill.getTotalAmount().subtract(bill.getPaidAmount());
        if (request.getAmount().compareTo(remainingAmount) > 0) {
            throw new BadRequestException("Payment amount exceeds remaining balance of " + remainingAmount);
        }

        Payment.PaymentMethod paymentMethod;
        try {
            paymentMethod = Payment.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment method: " + request.getPaymentMethod());
        }

        String transactionId = generateTransactionId();

        Payment payment = Payment.builder()
                .transactionId(transactionId)
                .bill(bill)
                .amount(request.getAmount())
                .paymentMethod(paymentMethod)
                .referenceNumber(request.getReferenceNumber())
                .notes(request.getNotes())
                .receivedBy(receivedBy)
                .build();

        paymentRepository.save(payment);

        // Update bill paid amount and status
        BigDecimal newPaidAmount = bill.getPaidAmount().add(request.getAmount());
        bill.setPaidAmount(newPaidAmount);

        if (newPaidAmount.compareTo(bill.getTotalAmount()) >= 0) {
            bill.setPaymentStatus(Bill.PaymentStatus.PAID);
        } else {
            bill.setPaymentStatus(Bill.PaymentStatus.PARTIAL);
        }

        bill = billRepository.save(bill);
        log.info("Payment {} of {} added to bill {}", transactionId, request.getAmount(), bill.getBillNumber());
        return toResponse(bill);
    }

    private String generateBillNumber() {
        long count = billRepository.count() + billCounter.incrementAndGet();
        return String.format("HMS-BILL-%05d", count);
    }

    private String generateTransactionId() {
        long count = paymentRepository.count() + txnCounter.incrementAndGet();
        return String.format("HMS-TXN-%05d", count);
    }

    private BillDTO.Response toResponse(Bill bill) {
        List<BillDTO.PaymentResponse> payments = new ArrayList<>();
        if (bill.getPayments() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            payments = bill.getPayments().stream()
                    .map(p -> BillDTO.PaymentResponse.builder()
                            .id(p.getId())
                            .transactionId(p.getTransactionId())
                            .amount(p.getAmount())
                            .paymentMethod(p.getPaymentMethod().name())
                            .referenceNumber(p.getReferenceNumber())
                            .notes(p.getNotes())
                            .receivedBy(p.getReceivedBy())
                            .paymentDate(p.getPaymentDate() != null ? p.getPaymentDate().format(formatter) : null)
                            .build())
                    .collect(Collectors.toList());
        }

        return BillDTO.Response.builder()
                .id(bill.getId())
                .billNumber(bill.getBillNumber())
                .appointmentId(bill.getAppointment().getId())
                .patientId(bill.getPatient().getId())
                .patientName(bill.getPatient().getName())
                .consultationCharge(bill.getConsultationCharge())
                .treatmentCharge(bill.getTreatmentCharge())
                .medicationCharge(bill.getMedicationCharge())
                .labTestCharge(bill.getLabTestCharge())
                .otherCharges(bill.getOtherCharges())
                .discount(bill.getDiscount())
                .tax(bill.getTax())
                .totalAmount(bill.getTotalAmount())
                .paidAmount(bill.getPaidAmount())
                .paymentStatus(bill.getPaymentStatus().name())
                .notes(bill.getNotes())
                .payments(payments)
                .createdAt(bill.getCreatedAt() != null ? bill.getCreatedAt().toString() : null)
                .build();
    }
}
