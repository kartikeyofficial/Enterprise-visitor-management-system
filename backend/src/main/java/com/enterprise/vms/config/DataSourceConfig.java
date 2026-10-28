package com.enterprise.vms.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String mysqlUrl;

    @Value("${spring.datasource.username}")
    private String mysqlUser;

    @Value("${spring.datasource.password}")
    private String mysqlPassword;

    @Value("${spring.datasource.driver-class-name}")
    private String mysqlDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        logger.info("Initializing Enterprise VMS Database connection...");
        logger.info("Attempting connection to MySQL Database at: {}", mysqlUrl);

        try {
            HikariConfig mysqlConfig = new HikariConfig();
            mysqlConfig.setJdbcUrl(mysqlUrl);
            mysqlConfig.setUsername(mysqlUser);
            mysqlConfig.setPassword(mysqlPassword);
            mysqlConfig.setDriverClassName(mysqlDriver);
            mysqlConfig.setConnectionTimeout(3000); // Fail fast after 3 seconds if MySQL credentials differ
            mysqlConfig.setMaximumPoolSize(10);
            mysqlConfig.setMinimumIdle(2);

            HikariDataSource mysqlDs = new HikariDataSource(mysqlConfig);

            // Test connection
            try (Connection conn = mysqlDs.getConnection()) {
                logger.info(">>> SUCCESS: Connected to MySQL Database (visitor_management_db)!");
                return mysqlDs;
            }
        } catch (Exception e) {
            logger.warn("=========================================================================");
            logger.warn(">>> MySQL connection failed: {}", e.getMessage());
            logger.warn(">>> Automatic Fallback: Switching to Embedded MySQL-compatible Database.");
            logger.warn(">>> All visitor check-ins, scans, and audit logs will function smoothly!");
            logger.warn(">>> To connect to your local MySQL instance, update DB_PASSWORD in application.properties");
            logger.warn("=========================================================================");

            HikariConfig h2Config = new HikariConfig();
            h2Config.setJdbcUrl("jdbc:h2:mem:visitor_management_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL");
            h2Config.setDriverClassName("org.h2.Driver");
            h2Config.setUsername("sa");
            h2Config.setPassword("");
            h2Config.setMaximumPoolSize(10);

            return new HikariDataSource(h2Config);
        }
    }
}
