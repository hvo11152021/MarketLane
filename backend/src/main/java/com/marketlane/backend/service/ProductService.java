package com.marketlane.backend.service;

import com.marketlane.backend.dto.ProductResponseDto;
import com.marketlane.backend.mapper.ProductMapper;
import com.marketlane.backend.model.Product;
import com.marketlane.backend.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    @Autowired
    private ProductMapper productMapper;


    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public List<Product> getProductsByCategory(String category) {
        return repo.findByCategoryIgnoreCase(category);
    }

    public Product getProductById(int id){
        return repo.findById(id).orElse(null);
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImageData(imageFile.getBytes());
        // ensure availability reflects stock quantity
        product.setProductAvailable(product.getStockQuantity() > 0);
        return repo.save(product);
    }

    public Product updateProduct(int id, Product incoming, MultipartFile imageFile) throws IOException {
        Product existing = repo.findById(id).orElse(null);
        if (existing == null) return null;

        existing.setName(incoming.getName());
        existing.setDescription(incoming.getDescription());
        existing.setBrand(incoming.getBrand());
        existing.setPrice(incoming.getPrice());
        existing.setCategory(incoming.getCategory());
        existing.setReleaseDate(incoming.getReleaseDate());
        existing.setProductAvailable(incoming.isProductAvailable());
        existing.setStockQuantity(incoming.getStockQuantity());

        // set availability based on resulting stock
        existing.setProductAvailable(existing.getStockQuantity() > 0);

        if (imageFile != null && !imageFile.isEmpty()) {
            existing.setImageName(imageFile.getOriginalFilename());
            existing.setImageType(imageFile.getContentType());
            existing.setImageData(imageFile.getBytes());
        }

        return repo.save(existing);
    }


    public void deleteProduct(int id) {
        repo.deleteById(id);
    }

    public List<Product> searchProducts(String keyword) {
        return null;
        //return repo.searchProducts(keyword);
    }

    public List<ProductResponseDto> searchProducts(){
        return repo.findAll().stream().map(product -> productMapper.toProductResponseDto(product)).toList();
    }
}
