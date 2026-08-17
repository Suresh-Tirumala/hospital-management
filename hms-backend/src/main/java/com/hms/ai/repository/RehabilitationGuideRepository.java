package com.hms.ai.repository;

import com.hms.ai.model.RehabilitationGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RehabilitationGuideRepository extends JpaRepository<RehabilitationGuide, Long> {

    List<RehabilitationGuide> findByConditionNameContainingIgnoreCaseAndIsActiveTrue(String conditionName);

    List<RehabilitationGuide> findByCategoryAndIsActiveTrue(String category);

    List<RehabilitationGuide> findByDifficultyLevelAndIsActiveTrue(String difficultyLevel);

    @Query("SELECT g FROM RehabilitationGuide g WHERE g.conditionName LIKE %:keyword% AND g.isActive = true")
    List<RehabilitationGuide> searchByCondition(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT g.category FROM RehabilitationGuide g WHERE g.isActive = true")
    List<String> findAllCategories();
}