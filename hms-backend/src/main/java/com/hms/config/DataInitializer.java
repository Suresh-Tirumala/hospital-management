package com.hms.config;

import com.hms.model.*;
import com.hms.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DoctorRepository doctorRepository,
                           PatientRepository patientRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already has data, skipping initialization");
            return;
        }

        log.info("Initializing sample data...");

        // Create Admin
        User admin = userRepository.save(User.builder()
                .firstName("System").lastName("Admin")
                .email("admin@hms.com").username("admin")
                .password(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN).phone("9000000001")
                .enabled(true).accountNonLocked(true).build());

        // Create Receptionist
        User receptionist = userRepository.save(User.builder()
                .firstName("Sarah").lastName("Wilson")
                .email("sarah@hms.com").username("receptionist")
                .password(passwordEncoder.encode("recep123"))
                .role(User.Role.RECEPTIONIST).phone("9000000002")
                .enabled(true).accountNonLocked(true).build());

        // Create Doctor Users
        User docUser1 = userRepository.save(User.builder()
                .firstName("Dr. Rajesh").lastName("Sharma")
                .email("rajesh@hms.com").username("dr.rajesh")
                .password(passwordEncoder.encode("doctor123"))
                .role(User.Role.DOCTOR).phone("9000000010")
                .enabled(true).accountNonLocked(true).build());

        User docUser2 = userRepository.save(User.builder()
                .firstName("Dr. Priya").lastName("Patel")
                .email("priya@hms.com").username("dr.priya")
                .password(passwordEncoder.encode("doctor123"))
                .role(User.Role.DOCTOR).phone("9000000011")
                .enabled(true).accountNonLocked(true).build());

        User docUser3 = userRepository.save(User.builder()
                .firstName("Dr. Amit").lastName("Kumar")
                .email("amit@hms.com").username("dr.amit")
                .password(passwordEncoder.encode("doctor123"))
                .role(User.Role.DOCTOR).phone("9000000012")
                .enabled(true).accountNonLocked(true).build());

        // Create Patient Users
        User patUser1 = userRepository.save(User.builder()
                .firstName("Rahul").lastName("Verma")
                .email("rahul@gmail.com").username("rahul")
                .password(passwordEncoder.encode("patient123"))
                .role(User.Role.PATIENT).phone("9100000001")
                .enabled(true).accountNonLocked(true).build());

        User patUser2 = userRepository.save(User.builder()
                .firstName("Anita").lastName("Desai")
                .email("anita@gmail.com").username("anita")
                .password(passwordEncoder.encode("patient123"))
                .role(User.Role.PATIENT).phone("9100000002")
                .enabled(true).accountNonLocked(true).build());

        // Create Doctors
        doctorRepository.save(Doctor.builder()
                .user(docUser1).doctorId("HMS-DOC-00001")
                .name("Dr. Rajesh Sharma").specialization("Cardiology")
                .department("Cardiology").qualification("MD, DM Cardiology")
                .experienceYears(15).phone("9000000010").email("rajesh@hms.com")
                .consultationFee(new BigDecimal("1000"))
                .availableFrom(LocalTime.of(9, 0)).availableTo(LocalTime.of(17, 0))
                .availableDays("MON,TUE,WED,THU,FRI")
                .bio("Senior Cardiologist with 15 years of experience")
                .status(Doctor.Status.ACTIVE).build());

        doctorRepository.save(Doctor.builder()
                .user(docUser2).doctorId("HMS-DOC-00002")
                .name("Dr. Priya Patel").specialization("Dermatology")
                .department("Dermatology").qualification("MD Dermatology")
                .experienceYears(10).phone("9000000011").email("priya@hms.com")
                .consultationFee(new BigDecimal("800"))
                .availableFrom(LocalTime.of(10, 0)).availableTo(LocalTime.of(18, 0))
                .availableDays("MON,TUE,WED,THU,FRI,SAT")
                .bio("Specialist in skin disorders and cosmetic dermatology")
                .status(Doctor.Status.ACTIVE).build());

        doctorRepository.save(Doctor.builder()
                .user(docUser3).doctorId("HMS-DOC-00003")
                .name("Dr. Amit Kumar").specialization("Orthopedics")
                .department("Orthopedics").qualification("MS Orthopedics")
                .experienceYears(12).phone("9000000012").email("amit@hms.com")
                .consultationFee(new BigDecimal("900"))
                .availableFrom(LocalTime.of(8, 0)).availableTo(LocalTime.of(16, 0))
                .availableDays("MON,TUE,WED,THU,FRI")
                .bio("Expert in joint replacement and sports injuries")
                .status(Doctor.Status.ACTIVE).build());

        // Create Patients
        patientRepository.save(Patient.builder()
                .user(patUser1).patientId("HMS-PAT-00001")
                .name("Rahul Verma").dateOfBirth(LocalDate.of(1990, 5, 15))
                .gender(Patient.Gender.MALE).phone("9100000001").email("rahul@gmail.com")
                .address("123 MG Road, Mumbai").bloodGroup("O+")
                .allergies("Penicillin").chronicConditions("None")
                .emergencyContact("9100000099 - Sita Verma")
                .status(Patient.Status.ACTIVE).build());

        patientRepository.save(Patient.builder()
                .user(patUser2).patientId("HMS-PAT-00002")
                .name("Anita Desai").dateOfBirth(LocalDate.of(1985, 8, 22))
                .gender(Patient.Gender.FEMALE).phone("9100000002").email("anita@gmail.com")
                .address("456 Park Street, Delhi").bloodGroup("A+")
                .allergies("None").chronicConditions("Diabetes Type 2")
                .emergencyContact("9100000098 - Vikram Desai")
                .status(Patient.Status.ACTIVE).build());

        log.info("Sample data initialized successfully!");
        log.info("=== Login Credentials ===");
        log.info("Admin:        admin / admin123");
        log.info("Receptionist: receptionist / recep123");
        log.info("Doctor:       dr.rajesh / doctor123");
        log.info("Patient:      rahul / patient123");
    }
}
