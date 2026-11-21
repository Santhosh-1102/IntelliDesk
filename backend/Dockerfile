# Stage 1: Build Application
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B -Daether.syncContext.named.factory=noop

# Stage 2: Hardened Runtime Container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S intellidesk && adduser -S intellidesk -G intellidesk
RUN mkdir -p /app/uploads/documents && chown -R intellidesk:intellidesk /app

COPY --from=builder /app/target/intellidesk-backend-*.jar app.jar
USER intellidesk

EXPOSE 8080

# Tuned for Render Free Tier (512MB RAM limit)
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
