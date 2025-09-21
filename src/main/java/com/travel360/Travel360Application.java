package com.travel360;

import org.springframework.boot.SpringApplication;
import com.travel360.service.StorageProperties;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class Travel360Application {

    public static void main(String[] args) {
        SpringApplication.run(Travel360Application.class, args);
    }
}
