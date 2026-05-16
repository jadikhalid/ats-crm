package com.esn.ats.infrastructure.config;

import com.esn.ats.infrastructure.ai.openai.OpenAiProperties;
import com.esn.ats.infrastructure.security.JwtProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableJpaRepositories(basePackages = "com.esn.ats.infrastructure.persistence.repository")
@EnableConfigurationProperties({JwtProperties.class, OpenAiProperties.class})
public class InfrastructureConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
