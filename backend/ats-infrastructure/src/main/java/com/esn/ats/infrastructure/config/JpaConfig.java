package com.esn.ats.infrastructure.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@EntityScan(basePackages = "com.esn.ats.infrastructure.persistence.entity")
public class JpaConfig {
}
