package com.court.service.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

@Service
public class SensitiveCryptoService {

    private static final String ALGORITHM = "AES/ECB/PKCS5Padding";
    private final SecretKeySpec keySpec;

    public SensitiveCryptoService(SecurityProperties properties) {
        this.keySpec = new SecretKeySpec(derive16Bytes(properties.dataKey()), "AES");
    }

    public String encrypt(String plainText) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            return Base64.getEncoder().encodeToString(cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to encrypt sensitive data", ex);
        }
    }

    public String decrypt(String encrypted) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decoded = Base64.getDecoder().decode(encrypted);
            return new String(cipher.doFinal(decoded), StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to decrypt sensitive data", ex);
        }
    }

    private byte[] derive16Bytes(String keyMaterial) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(keyMaterial.getBytes(StandardCharsets.UTF_8));
            return Arrays.copyOf(hash, 16);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not supported", e);
        }
    }
}
