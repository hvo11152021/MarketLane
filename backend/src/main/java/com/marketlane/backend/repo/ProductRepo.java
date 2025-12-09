package com.marketlane.backend.repo;

import com.marketlane.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepo extends JpaRepository<Product, Integer> {
	List<Product> findByCategoryIgnoreCase(String category);
}
