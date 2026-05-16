package com.esn.ats.api.security;

import com.esn.ats.api.security.props.EntraOAuth2RoleMappingProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties(EntraOAuth2RoleMappingProperties.class)
@ConditionalOnProperty(name = "app.security.auth-mode", havingValue = "oauth2-resource-server")
@RequiredArgsConstructor
public class EntraResourceServerSecurityConfiguration {

    private final CorsConfigurationSource corsConfigurationSource;
    private final EntraJwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter;

    private static final String[] PUBLIC_PATHS = {
            "/actuator/health",
            "/actuator/info",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };

    @Bean
    JwtAuthenticationConverter entraJwtAuthenticationConverter() {
        JwtAuthenticationConverter c = new JwtAuthenticationConverter();
        c.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        c.setPrincipalClaimName("sub");
        return c;
    }

    @Bean
    SecurityFilterChain entraResourceServer(HttpSecurity http, JwtAuthenticationConverter entraJwtAuthenticationConverter)
            throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth -> auth.requestMatchers(PUBLIC_PATHS)
                                .permitAll()
                                .requestMatchers(HttpMethod.OPTIONS, "/**")
                                .permitAll()
                                .requestMatchers("/v1/admin/**")
                                .hasRole("ADMIN")
                                .requestMatchers("/v1/agent/**")
                                .hasAnyRole("AGENT", "ADMIN")
                                .requestMatchers("/v1/client/**")
                                .hasAnyRole("CLIENT", "ADMIN")
                                .anyRequest()
                                .authenticated())
                .oauth2ResourceServer(
                        oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(entraJwtAuthenticationConverter)));

        return http.build();
    }
}
