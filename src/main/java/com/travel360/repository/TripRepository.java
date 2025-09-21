package com.travel360.repository;

import com.travel360.model.Profile;
import com.travel360.model.Trip;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, UUID> {
    List<Trip> findAllByOrderByCreatedAtDesc();
    List<Trip> findByCreatedBy(Profile createdBy);

    @EntityGraph(attributePaths = {"photos"})
    Optional<Trip> findWithPhotosById(UUID id);
}
