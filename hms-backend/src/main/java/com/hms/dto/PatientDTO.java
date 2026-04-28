package com.hms.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PatientDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private Long userId;

        @NotBlank(message = "Name is required")
        @Size(max = 100)
        private String name;

        @NotBlank(message = "Date of birth is required")
        private String dateOfBirth;     // "1990-01-15"

        @NotBlank(message = "Gender is required")
        private String gender;          // MALE, FEMALE, OTHER

        @Size(max = 15)
        private String phone;

        @Email
        private String email;

        @Size(max = 255)
        private String address;

        @Size(max = 10)
        private String bloodGroup;

        private String allergies;
        private String chronicConditions;
        private String emergencyContact;
        private String insuranceProvider;
        private String insurancePolicyNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String patientId;
        private Long userId;
        private String name;
        private String dateOfBirth;
        private String gender;
        private String phone;
        private String email;
        private String address;
        private String bloodGroup;
        private String allergies;
        private String chronicConditions;
        private String emergencyContact;
        private String insuranceProvider;
        private String insurancePolicyNumber;
        private String status;
        private String createdAt;
    }
}
