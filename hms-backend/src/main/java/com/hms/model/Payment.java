package com.hms.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String transactionId;          // e.g. HMS-TXN-00001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Bill bill;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(length = 50)
    private String referenceNumber;         // card last 4, cheque no, etc.

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 50)
    private String receivedBy;              // staff username

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime paymentDate;

    public enum PaymentMethod {
        CASH, CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, INSURANCE, CHEQUE
    }
}
