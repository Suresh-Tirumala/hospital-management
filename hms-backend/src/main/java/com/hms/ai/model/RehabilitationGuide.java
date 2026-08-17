package com.hms.ai.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_rehabilitation_guides")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RehabilitationGuide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String conditionName;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 100)
    private String exerciseName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column
    @Builder.Default
    private Integer sets = 3;

    @Column
    @Builder.Default
    private Integer reps = 10;

    @Column
    private Integer durationSeconds;

    @Column(length = 50)
    @Builder.Default
    private String difficultyLevel = "MODERATE";

    @Column(columnDefinition = "TEXT")
    private String precautions;

    @Column
    @Builder.Default
    private Boolean videoAvailable = false;

    @Column
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;
}