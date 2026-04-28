package com.hms.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class MedicalRecordDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "Appointment ID is required")
        private Long appointmentId;

        private String chiefComplaint;
        private String diagnosis;
        private String symptoms;
        private String examFindings;
        private String labResults;
        private String treatment;
        private String doctorNotes;
        private String followUpInstructions;
        private String nextFollowUpDate;

        private List<PrescriptionItem> prescriptions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionItem {
        @NotBlank(message = "Medicine name is required")
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String route;
        private String instructions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String recordId;
        private Long appointmentId;
        private String appointmentDate;
        private Long patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;
        private String chiefComplaint;
        private String diagnosis;
        private String symptoms;
        private String examFindings;
        private String labResults;
        private String treatment;
        private String doctorNotes;
        private String followUpInstructions;
        private String nextFollowUpDate;
        private List<PrescriptionResponse> prescriptions;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionResponse {
        private Long id;
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String route;
        private String instructions;
    }
}
