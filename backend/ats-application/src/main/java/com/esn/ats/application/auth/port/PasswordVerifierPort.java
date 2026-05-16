package com.esn.ats.application.auth.port;

public interface PasswordVerifierPort {

    boolean matches(String rawPassword, String email);
}
