package com.hms.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

public class DoctorDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private Long userId;

        @NotBlank(message = "Name is required")
        @Size(max = 100)
        private String name;

        @NotBlank(message = "Specialization is required")
        @Size(max = 100)
        private String specialization;

        @Size(max = 100)
        private String department;

        @Size(max = 50)
        private String qualification;

        private Integer experienceYears;

        @Size(max = 15)
        private String phone;

        @Email
        private String email;

        private BigDecimal consultationFee;

        private String availableFrom;  // "09:00"
        private String availableTo;    // "17:00"
        private String availableDays;  // "MON,TUE,WED"

        private String bio;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String doctorId;
        private Long userId;
        private String name;
        private String specialization;
        private String department;
        private String qualification;
        private Integer experienceYears;
        private String phone;
        private String email;
        private BigDecimal consultationFee;
        private String availableFrom;
        private String availableTo;
        private String availableDays;
        private String bio;
        private String status;
        private String createdAt;
    }
}
