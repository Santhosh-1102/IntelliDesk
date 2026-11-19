package com.intellidesk.controller;

import com.intellidesk.dto.ticket.CategoryResponse;
import com.intellidesk.repository.TicketCategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final TicketCategoryRepository categoryRepository;

    public CategoryController(TicketCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        List<CategoryResponse> categories = categoryRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }
}
