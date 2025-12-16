package com.marketlane.backend.mapper;

import com.marketlane.backend.dto.ProductRequestDto;
import com.marketlane.backend.dto.ProductResponseDto;
import com.marketlane.backend.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {
    public Product toProduct(ProductRequestDto productRequestDto) {
        Product product = new Product();
        product.setName(productRequestDto.getName());
        product.setDescription(productRequestDto.getDescription());
        product.setBrand(productRequestDto.getBrand());
        product.setPrice(productRequestDto.getPrice());
        product.setCategory(productRequestDto.getCategory());
        product.setReleaseDate(productRequestDto.getReleaseDate());
        product.setProductAvailable(productRequestDto.getProductAvailable());
        product.setStockQuantity(productRequestDto.getStockQuantity());
        product.setImageName(productRequestDto.getImageName());
        product.setImageType(productRequestDto.getImageType());
        product.setImageData(productRequestDto.getImageData());
        return product;
    }
    public ProductResponseDto toProductResponseDto(Product product) {
        ProductResponseDto productResponseDto = new ProductResponseDto();
        productResponseDto.setId(product.getId());
        productResponseDto.setName(product.getName());
        productResponseDto.setDescription(product.getDescription());
        productResponseDto.setBrand(product.getBrand());
        productResponseDto.setPrice(product.getPrice());
        productResponseDto.setCategory(product.getCategory());
        productResponseDto.setReleaseDate(product.getReleaseDate());
        productResponseDto.setProductAvailable(product.getProductAvailable());
        productResponseDto.setStockQuantity(product.getStockQuantity());
        productResponseDto.setImageName(product.getImageName());
        productResponseDto.setImageType(product.getImageType());
        productResponseDto.setImageData(product.getImageData());
        return productResponseDto;
    }
}
