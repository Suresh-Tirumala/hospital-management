package com.hms.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private MedicalRecord medicalRecord;

    @Column(nullable = false, length = 150)
    private String medicineName;

    @Column(length = 50)
    private String dosage;                // e.g. "500mg"

    @Column(length = 50)
    private String frequency;             // e.g. "Twice daily"

    @Column(length = 50)
    private String duration;              // e.g. "7 days"

    @Column(length = 50)
    private String route;                 // e.g. "Oral", "IV"

    @Column(columnDefinition = "TEXT")
    private String instructions;          // e.g. "Take after meals"

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
