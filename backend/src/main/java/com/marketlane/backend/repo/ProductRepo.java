package com.marketlane.backend.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.marketlane.backend.model.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product, Integer> {
	List<Product> findByCategoryIgnoreCase(String category);
}
