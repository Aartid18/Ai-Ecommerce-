package com.commerce.intelligence.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String contactPerson;
    private String email;
    private String phone;
    private String address;

    @Builder.Default
    private Integer leadTimeDays = 7;

    @Builder.Default
    private Double reliabilityScore = 95.0; // 0 - 100
}
